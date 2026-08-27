/**
 * Run logging.
 *
 * Two properties matter here. Log lines are buffered in memory and written in a
 * single append at the end of a run, because a per-row appendRow costs about a
 * second and a hundred of them is most of the platform's execution budget. And
 * no line may carry an email address: the log sheet lives in the same workbook
 * as the responses but is read and exported far more casually, so it holds row
 * numbers and participant identifiers only.
 */

const LOG_BUFFER_ = [];

/**
 * Records one line. Structured detail is stringified; callers are responsible
 * for keeping identifiers out of it.
 */
function log_(message, detail) {
  const stamped = [new Date(), message, detail ? JSON.stringify(detail) : ''];
  LOG_BUFFER_.push(stamped);
  console.log(message, detail || '');
}

/** Writes the buffer to the log sheet in one call and trims old lines. */
function flushLog_() {
  if (LOG_BUFFER_.length === 0) return;
  const rows = LOG_BUFFER_.splice(0, LOG_BUFFER_.length);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(LOG_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(LOG_SHEET_NAME);
      sheet.getRange(1, 1, 1, 3)
        .setValues([['Time', 'Message', 'Detail']])
        .setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 3).setValues(rows);

    const overflow = sheet.getLastRow() - 1 - MAX_LOG_ROWS;
    if (overflow > 0) sheet.deleteRows(2, overflow);
  } catch (err) {
    // The log is never allowed to take down the run it is describing.
    console.error('Could not write the run log: ' + err);
  }
}

/**
 * Raises an operational alert on two channels. Email is tried first, but the
 * most likely reason to be alerting at all is an exhausted mail quota, which
 * would also block the alert; the sheet copy is what survives that case.
 */
function alert_(cfg, subject, body) {
  log_('ALERT: ' + subject, { body: body });
  try {
    GmailApp.sendEmail(cfg.adminEmail, subject, body);
  } catch (err) {
    log_('The alert email could not be delivered; the quota is likely exhausted.');
  }
}
