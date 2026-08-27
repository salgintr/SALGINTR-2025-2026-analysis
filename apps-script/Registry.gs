/**
 * Access to the response sheet.
 *
 * Everything the rest of the script knows about the sheet passes through here:
 * where the columns are, what a row means, and where the current week begins.
 */

/**
 * Resolves the managed columns by header name, creating any that are absent.
 *
 * The index of a new column is computed once, before it is written, rather than
 * from getLastColumn() after an insert. getLastColumn() reports the last column
 * that has content, so an empty column just inserted does not count towards it
 * and reading it back would return the position of the previous last column —
 * which is how a header ends up overwriting a form question.
 */
function openRegistry_(cfg) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(cfg.sheetName);
  if (!sheet) throw new Error('Response sheet not found: ' + cfg.sheetName);

  let headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];

  MANAGED_COLUMNS.forEach(function (name) {
    if (headers.indexOf(name) !== -1) return;
    const target = headers.length + 1;
    sheet.getRange(1, target).setValue(name).setFontWeight('bold');
    headers = sheet.getRange(1, 1, 1, target).getValues()[0];
    log_('Created the "' + name + '" column at position ' + target + '.');
  });

  const index = {};
  Object.keys(COL).forEach(function (key) {
    index[key] = headers.indexOf(COL[key]) + 1;
  });

  // The email column comes from the registration form, so its absence is a
  // configuration error rather than something to repair silently.
  if (index.email === 0) {
    throw new Error('Required column not found: ' + COL.email);
  }

  return { sheet: sheet, col: index, headers: headers };
}

/** Reads every data row in one call. Returns an empty array for an empty sheet. */
function readRows_(registry) {
  const lastRow = registry.sheet.getLastRow();
  if (lastRow < 2) return [];
  return registry.sheet
    .getRange(2, 1, lastRow - 1, registry.headers.length)
    .getValues();
}

/**
 * Start of the current reporting week: the most recent Saturday at 00:00, in
 * the script's own time zone, which the manifest pins to Europe/Istanbul.
 *
 * This one boundary is what makes the batch job safe to run more than once in a
 * week. A row is due if it has not been sent since this instant, so a rerun on
 * Sunday after a Saturday failure picks up exactly the rows that were missed.
 */
function startOfWeek_(now) {
  const start = new Date(now.getTime());
  start.setDate(start.getDate() - ((start.getDay() + 1) % 7));
  start.setHours(0, 0, 0, 0);
  return start;
}

/** The next day in the Saturday to Tuesday retry chain, or null at its end. */
function nextRetryDay_(dayOfWeek) {
  const position = SEND_WINDOW.indexOf(dayOfWeek);
  if (position === -1 || position === SEND_WINDOW.length - 1) return null;
  return SEND_WINDOW[position + 1];
}

/**
 * Mints a participant identifier.
 *
 * The identifier is drawn at random and is not derived from the email address
 * or from any other attribute of the participant. That is deliberate: an
 * identifier computed from an identifier — a hash of an email address, say —
 * can be inverted by enumerating a plausible address space, so publishing the
 * generation rule would then be publishing a re-identification method. A random
 * identifier carries no information about the person it names, and the rule can
 * be described openly, as it is here.
 */
function mintParticipantId_() {
  return 'HEKIM-' + Utilities.getUuid().replace(/-/g, '').slice(0, 9).toUpperCase();
}

const EMAIL_PATTERN_ = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Normalises an address for comparison, or returns null if it is unusable. */
function normaliseEmail_(raw) {
  if (!raw) return null;
  const value = String(raw).trim().toLowerCase();
  return EMAIL_PATTERN_.test(value) ? value : null;
}

/** The set of addresses already registered, so a repeat sign-up is not enrolled twice. */
function registeredAddresses_(rows, col, exceptRowNumber) {
  const seen = {};
  for (let i = 0; i < rows.length; i++) {
    if (i + 2 === exceptRowNumber) continue;
    if (!rows[i][col.participantId - 1]) continue;
    const address = normaliseEmail_(rows[i][col.email - 1]);
    if (address) seen[address] = true;
  }
  return seen;
}
