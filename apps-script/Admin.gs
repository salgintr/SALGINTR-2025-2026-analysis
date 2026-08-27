/**
 * Operator functions. These are run by hand from the Apps Script editor; none
 * of them is attached to a trigger.
 */

/** Deletes every trigger bound to one handler, and only that handler. */
function deleteTriggers_(handlerName) {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === handlerName) {
      ScriptApp.deleteTrigger(triggers[i]);
      removed++;
    }
  }
  if (removed > 0) log_('Removed ' + removed + ' trigger(s) for ' + handlerName + '.');
}

/**
 * Installs the two standing triggers. Only the handlers this script owns are
 * touched, so a trigger installed by any other script in the same project
 * survives.
 */
function setupTriggers() {
  try {
    deleteTriggers_(SUBMIT_HANDLER);
    deleteTriggers_(WEEKLY_HANDLER);

    ScriptApp.newTrigger(SUBMIT_HANDLER)
      .forSpreadsheet(SpreadsheetApp.getActive())
      .onFormSubmit()
      .create();

    ScriptApp.newTrigger(WEEKLY_HANDLER)
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.SATURDAY)
      .atHour(9)
      .create();

    log_('Triggers installed: submit handler and Saturday 09:00 weekly batch.');
  } catch (err) {
    log_('Trigger installation failed.', { error: String(err) });
  } finally {
    flushLog_();
  }
}

/**
 * Reports whether the project is configured and consistent, without sending
 * anything. Run this after any change to the form or the sheet.
 */
function verifySetup() {
  const report = {};
  try {
    const cfg = config_();
    report.systemActive = cfg.systemActive;
    report.debugMode = cfg.debugMode;
    report.timeZone = Session.getScriptTimeZone();
    report.timeZoneExpected = report.timeZone === 'Europe/Istanbul';

    const registry = openRegistry_(cfg);
    report.columns = registry.col;
    report.missingColumns = Object.keys(COL).filter(function (k) { return registry.col[k] === 0; });

    const rows = readRows_(registry);
    report.dataRows = rows.length;
    report.withoutParticipantId = rows.filter(function (r) {
      return !r[registry.col.participantId - 1];
    }).length;
    report.remainingQuota = MailApp.getRemainingDailyQuota();
    report.weekStart = startOfWeek_(new Date()).toISOString();
    report.triggers = ScriptApp.getProjectTriggers().map(function (t) {
      return t.getHandlerFunction();
    });
  } catch (err) {
    report.error = String(err);
  }
  log_('Setup verification.', report);
  flushLog_();
  return report;
}

/**
 * Backfills participant identifiers and pre-filled links for rows that predate
 * the script or were written while it was inactive. Sends nothing.
 */
function backfillIdentifiers() {
  const cfg = config_();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_WAIT_MS)) { log_('Backfill skipped: locked.'); flushLog_(); return; }

  try {
    const registry = openRegistry_(cfg);
    const col = registry.col;
    const rows = readRows_(registry);
    const changed = {};
    let minted = 0, linked = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      let participantId = row[col.participantId - 1];
      const address = normaliseEmail_(row[col.email - 1]);
      if (!address) continue;

      if (!participantId) {
        participantId = mintParticipantId_();
        stage_(changed, col.participantId, i, participantId);
        minted++;
      }
      if (!row[col.prefilledLink - 1]) {
        stage_(changed, col.prefilledLink, i, prefilledLink_(cfg, participantId));
        linked++;
      }
    }

    commit_(registry, rows, changed);
    log_('Backfill complete.', { identifiersMinted: minted, linksCreated: linked });
  } catch (err) {
    log_('Backfill failed.', { error: String(err), stack: err && err.stack });
  } finally {
    lock.releaseLock();
    flushLog_();
  }
}

/**
 * Sends the end-of-season message once to every enrolled physician who has not
 * opted out. Respects the same quota and time budget as the weekly batch, and
 * marks what it sends so that a rerun does not repeat it.
 */
function sendClosingAnnouncement() {
  const cfg = config_();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_WAIT_MS)) { log_('Closing run skipped: locked.'); flushLog_(); return; }

  const startedAt = new Date();
  const marker = 'CLOSING_SENT';
  try {
    const registry = openRegistry_(cfg);
    const col = registry.col;
    const rows = readRows_(registry);
    const changed = {};
    let budget = cfg.debugMode
      ? rows.length
      : Math.max(0, MailApp.getRemainingDailyQuota() - QUOTA_RESERVE);
    let sent = 0, remaining = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (isTruthy_(row[col.optOut - 1])) continue;
      if (String(row[col.sendNote - 1]) === marker) continue;
      if (!row[col.participantId - 1]) continue;
      const address = normaliseEmail_(row[col.email - 1]);
      if (!address) continue;

      if (budget <= 0 || new Date() - startedAt > RUN_BUDGET_MS) { remaining++; continue; }

      const outcome = sendMessage_(cfg, address, closingTemplate_(cfg));
      budget--;
      if (outcome.ok) {
        sent++;
        stage_(changed, col.sendNote, i, marker);
        stage_(changed, col.lastSendAt, i, new Date());
      } else {
        stage_(changed, col.sendNote, i, outcome.error);
      }
    }

    commit_(registry, rows, changed);
    log_('Closing announcement run finished.', { sent: sent, remaining: remaining });
    if (remaining > 0) {
      log_('Run again tomorrow to reach the remaining ' + remaining + ' recipients.');
    }
  } catch (err) {
    log_('Closing announcement failed.', { error: String(err), stack: err && err.stack });
  } finally {
    lock.releaseLock();
    flushLog_();
  }
}
