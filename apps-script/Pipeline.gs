/**
 * The collection pipeline: enrolment, the weekly send, and the retry chain.
 *
 * Two entry points are driven by triggers. onFormSubmit runs when a physician
 * registers. runEmailBatch runs every Saturday morning. runRetryBatch is the
 * one-shot continuation used when a run cannot finish, and is deliberately a
 * different handler name from the weekly job: a chain that deleted its triggers
 * by handler name would otherwise delete the recurring weekly trigger along
 * with its own, and the season would stop after the first interrupted run.
 */

// ---------------------------------------------------------------------------
// Enrolment
// ---------------------------------------------------------------------------

function onFormSubmit(e) {
  const cfg = config_();
  if (!cfg.systemActive) {
    log_('Registration ignored: the system is marked inactive.');
    flushLog_();
    return;
  }
  if (!e || !e.range) {
    log_('onFormSubmit called without an event; nothing to do.');
    flushLog_();
    return;
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_WAIT_MS)) {
    log_('Registration deferred: another run holds the lock.');
    flushLog_();
    return;
  }

  try {
    const registry = openRegistry_(cfg);
    const col = registry.col;
    const rowNumber = e.range.getRow();
    const rows = readRows_(registry);
    const row = rows[rowNumber - 2];
    if (!row) throw new Error('Submitted row ' + rowNumber + ' is not readable.');

    if (row[col.participantId - 1]) {
      log_('Row ' + rowNumber + ' already carries a participant ID; skipping.');
      return;
    }

    const address = normaliseEmail_(row[col.email - 1]);
    if (!address) {
      setCell_(registry, rowNumber, col.sendState, STATE.invalid);
      setCell_(registry, rowNumber, col.sendNote, 'Geçersiz e-posta adresi');
      log_('Row ' + rowNumber + ' rejected: the address is not usable.');
      return;
    }
    if (registeredAddresses_(rows, col, rowNumber)[address]) {
      setCell_(registry, rowNumber, col.sendState, STATE.invalid);
      setCell_(registry, rowNumber, col.sendNote, 'Mükerrer kayıt');
      log_('Row ' + rowNumber + ' rejected: this address is already enrolled.');
      return;
    }

    const participantId = mintParticipantId_();
    const link = prefilledLink_(cfg, participantId);
    setCell_(registry, rowNumber, col.participantId, participantId);
    setCell_(registry, rowNumber, col.prefilledLink, link);
    setCell_(registry, rowNumber, col.sendFailures, 0);

    // Registering inside the send window means the week's invitation has either
    // gone out already or is about to; send it now rather than making this
    // physician wait a further six days for the next Saturday.
    if (SEND_WINDOW.indexOf(new Date().getDay()) !== -1) {
      const outcome = sendMessage_(cfg, address, weeklyTemplate_(cfg, link, true));
      recordOutcome_(registry, rowNumber, row, outcome);
      log_('Row ' + rowNumber + ' enrolled and sent its first invitation.');
    } else {
      setCell_(registry, rowNumber, col.sendState, STATE.pending);
      setCell_(registry, rowNumber, col.sendNote, 'Cumartesi bekleniyor');
      log_('Row ' + rowNumber + ' enrolled outside the send window; it waits for Saturday.');
    }
  } catch (err) {
    log_('Enrolment failed.', { error: String(err), stack: err && err.stack });
  } finally {
    lock.releaseLock();
    flushLog_();
  }
}

// ---------------------------------------------------------------------------
// The weekly send and its retries
// ---------------------------------------------------------------------------

function runEmailBatch() { sendDueBatch_(false); }
function runRetryBatch() { sendDueBatch_(true); }

function sendDueBatch_(isRetry) {
  const cfg = config_();
  if (!cfg.systemActive) {
    log_('Batch skipped: the system is marked inactive.');
    flushLog_();
    return;
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_WAIT_MS)) {
    log_('Batch skipped: another run holds the lock.');
    flushLog_();
    return;
  }

  const startedAt = new Date();
  const dayOfWeek = startedAt.getDay();
  const weekStart = startOfWeek_(startedAt);
  let pendingRemain = false;

  try {
    log_('Batch started.', {
      day: dayOfWeek, retry: isRetry, weekStart: weekStart.toISOString(), debug: cfg.debugMode
    });

    const registry = openRegistry_(cfg);
    const col = registry.col;
    const rows = readRows_(registry);
    if (rows.length === 0) {
      log_('No data rows; nothing to send.');
      return;
    }

    // The quota is read once. Calling it per row costs a service round trip and
    // tells us nothing we cannot track locally.
    let budget = cfg.debugMode
      ? rows.length
      : Math.max(0, MailApp.getRemainingDailyQuota() - QUOTA_RESERVE);
    log_('Send budget for this run: ' + budget + '.');

    const changed = {};
    let due = 0, sent = 0, deferred = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;
      const participantId = row[col.participantId - 1];
      const address = normaliseEmail_(row[col.email - 1]);
      const state = row[col.sendState - 1];
      const lastSend = row[col.lastSendAt - 1] ? new Date(row[col.lastSendAt - 1]) : null;
      const failures = Number(row[col.sendFailures - 1]) || 0;

      if (isTruthy_(row[col.optOut - 1])) {
        stage_(changed, col.sendState, i, STATE.optedOut);
        continue;
      }
      if (state === STATE.sent && lastSend && lastSend >= weekStart) continue;
      if (failures >= MAX_SEND_FAILURES) {
        stage_(changed, col.sendState, i, STATE.failed);
        stage_(changed, col.sendNote, i, 'Ardışık ' + failures + ' başarısız deneme; devre dışı');
        continue;
      }
      if (!participantId || !address) {
        stage_(changed, col.sendState, i, STATE.invalid);
        stage_(changed, col.sendNote, i, 'Eksik kimlik veya kullanılamayan adres');
        continue;
      }

      due++;

      // Stop on either constraint before attempting the send, so that the rows
      // left over are marked pending rather than silently passed over.
      if (budget <= 0 || new Date() - startedAt > RUN_BUDGET_MS) {
        pendingRemain = true;
        deferred++;
        stage_(changed, col.sendState, i, STATE.pending);
        stage_(changed, col.sendNote, i, budget <= 0 ? 'Kota doldu' : 'Süre sınırı');
        continue;
      }

      const link = row[col.prefilledLink - 1] || prefilledLink_(cfg, participantId);
      if (!row[col.prefilledLink - 1]) stage_(changed, col.prefilledLink, i, link);

      const outcome = sendMessage_(cfg, address, weeklyTemplate_(cfg, link, false));
      budget--;
      if (outcome.ok) {
        sent++;
        stage_(changed, col.sendState, i, outcome.simulated ? STATE.simulated : STATE.sent);
        stage_(changed, col.lastSendAt, i, new Date());
        stage_(changed, col.sendNote, i, '');
        stage_(changed, col.sendFailures, i, 0);
      } else {
        stage_(changed, col.sendState, i, STATE.pending);
        stage_(changed, col.sendFailures, i, failures + 1);
        stage_(changed, col.sendNote, i, outcome.error);
        log_('Delivery failed for row ' + rowNumber + '.', { attempt: failures + 1 });
      }
    }

    commit_(registry, rows, changed);
    log_('Batch finished.', { due: due, sent: sent, deferred: deferred });

    if (due > 0 && sent === 0) {
      alert_(cfg,
        'SALGINTR: the weekly batch sent nothing',
        'The run on ' + startedAt.toISOString() + ' found ' + due + ' physicians due a message ' +
        'and delivered none. The likely cause is an exhausted daily quota. Check the run log ' +
        'and the Apps Script quota panel.');
    }
  } catch (err) {
    log_('Batch failed.', { error: String(err), stack: err && err.stack });
    pendingRemain = true;
  } finally {
    // Reschedule from one place, whatever happened above: an interrupted run
    // that left rows pending is exactly the case that must not lose its chain.
    try {
      rescheduleRetry_(cfg, dayOfWeek, pendingRemain);
    } catch (err) {
      log_('Could not reschedule the retry.', { error: String(err) });
    }
    lock.releaseLock();
    flushLog_();
  }
}

/**
 * Points the chain at the next day in the window, or ends it. Existing retry
 * triggers are cleared first, so the chain never forks and a fired one-shot
 * does not accumulate.
 */
function rescheduleRetry_(cfg, dayOfWeek, pendingRemain) {
  deleteTriggers_(RETRY_HANDLER);
  if (!pendingRemain) return;

  const nextDay = nextRetryDay_(dayOfWeek);
  if (nextDay === null) {
    alert_(cfg,
      'SALGINTR: the retry chain is exhausted',
      'Messages were still outstanding at the end of the Saturday to Tuesday window. ' +
      'The rows are marked PENDING in the response sheet and need manual attention.');
    return;
  }

  const when = new Date();
  when.setDate(when.getDate() + ((nextDay - when.getDay() + 7) % 7 || 7));
  when.setHours(RETRY_HOUR, 0, 0, 0);
  ScriptApp.newTrigger(RETRY_HANDLER).timeBased().at(when).create();
  log_('Retry scheduled for ' + when.toISOString() + '.');
}

// ---------------------------------------------------------------------------
// Writing back
// ---------------------------------------------------------------------------

/** Stages one cell change against the in-memory copy of the sheet. */
function stage_(changed, colIndex, rowOffset, value) {
  if (!changed[colIndex]) changed[colIndex] = {};
  changed[colIndex][rowOffset] = value;
}

/**
 * Applies every staged change with one write per touched column. A run over a
 * hundred rows would otherwise spend most of its execution budget on individual
 * setValue calls.
 */
function commit_(registry, rows, changed) {
  Object.keys(changed).forEach(function (colIndex) {
    const index = Number(colIndex);
    const column = rows.map(function (row) { return [row[index - 1]]; });
    Object.keys(changed[colIndex]).forEach(function (offset) {
      column[Number(offset)][0] = changed[colIndex][offset];
    });
    registry.sheet.getRange(2, index, column.length, 1).setValues(column);
  });
}

/** Single-cell write, for the enrolment path where only one row is in play. */
function setCell_(registry, rowNumber, colIndex, value) {
  registry.sheet.getRange(rowNumber, colIndex).setValue(value);
}

function recordOutcome_(registry, rowNumber, row, outcome) {
  const col = registry.col;
  if (outcome.ok) {
    setCell_(registry, rowNumber, col.sendState, outcome.simulated ? STATE.simulated : STATE.sent);
    setCell_(registry, rowNumber, col.lastSendAt, new Date());
    setCell_(registry, rowNumber, col.sendNote, '');
  } else {
    setCell_(registry, rowNumber, col.sendState, STATE.pending);
    setCell_(registry, rowNumber, col.sendFailures, (Number(row[col.sendFailures - 1]) || 0) + 1);
    setCell_(registry, rowNumber, col.sendNote, outcome.error);
  }
}

function isTruthy_(value) {
  if (value === true) return true;
  const text = String(value || '').trim().toLowerCase();
  return text === 'true' || text === 'evet' || text === 'yes' || text === 'x';
}
