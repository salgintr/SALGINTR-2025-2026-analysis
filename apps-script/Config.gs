/**
 * Configuration.
 *
 * Nothing that identifies a live form, spreadsheet or mailbox is stored in this
 * file. Every such value is read from Script Properties, which are held with the
 * script project and are not part of this repository. Set them once from the
 * Apps Script editor under Project Settings > Script Properties, or by running
 * seedScriptProperties_() below after editing it locally.
 *
 * Required properties:
 *   FORM_URL             weekly form URL, up to but excluding the question mark
 *   FORM_ID_ENTRY        entry id of the participant-ID question, e.g. entry.000000
 *   RESPONSE_SHEET_NAME  name of the sheet the form writes to
 *   ADMIN_EMAIL          address that receives operational alerts
 *   SYSTEM_ACTIVE        "true" while the season is collecting, "false" when closed
 *   DEBUG_MODE           "true" to simulate sends without delivering mail
 */

/** Reads a required property and fails loudly if it is unset. */
function prop_(key) {
  const value = PropertiesService.getScriptProperties().getProperty(key);
  if (value === null || value === '') {
    throw new Error('Missing script property: ' + key);
  }
  return value;
}

/** Reads a boolean property, defaulting when unset. */
function flag_(key, fallback) {
  const value = PropertiesService.getScriptProperties().getProperty(key);
  if (value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

function config_() {
  return {
    formUrl: prop_('FORM_URL'),
    idEntry: prop_('FORM_ID_ENTRY'),
    sheetName: prop_('RESPONSE_SHEET_NAME'),
    adminEmail: prop_('ADMIN_EMAIL'),
    systemActive: flag_('SYSTEM_ACTIVE', false),
    debugMode: flag_('DEBUG_MODE', true)
  };
}

/** Builds a participant's personal pre-filled link to the weekly form. */
function prefilledLink_(cfg, participantId) {
  return cfg.formUrl + '?usp=pp_url&' + cfg.idEntry + '=' + encodeURIComponent(participantId);
}

// ---------------------------------------------------------------------------
// Column headers. These are matched by name, never by position, so that adding
// a question to the form cannot silently move the columns the script writes to.
// ---------------------------------------------------------------------------

const COL = {
  timestamp:    'Zaman damgası',
  email:        'E-posta Adresi',
  participantId:'Katılımcı ID',
  prefilledLink:'Prefilled Link',
  sendState:    'Send State',
  lastSendAt:   'Last Send At',
  sendFailures: 'Send Failures',
  optOut:       'Opt Out',
  sendNote:     'Send Note'
};

/** Columns the script creates if they are absent. */
const MANAGED_COLUMNS = [
  COL.participantId, COL.prefilledLink, COL.sendState,
  COL.lastSendAt, COL.sendFailures, COL.optOut, COL.sendNote
];

/**
 * Machine-readable send states. The human-facing explanation lives in the
 * separate note column, so that editing a note by hand cannot change what the
 * batch job decides to do with a row.
 */
const STATE = {
  sent:      'SENT',
  pending:   'PENDING',
  failed:    'FAILED',
  invalid:   'INVALID',
  optedOut:  'OPTED_OUT',
  simulated: 'SIMULATED'
};

// ---------------------------------------------------------------------------
// Operating parameters.
// ---------------------------------------------------------------------------

/** The send window, in JavaScript day numbers: Saturday, Sunday, Monday, Tuesday. */
const SEND_WINDOW = [6, 0, 1, 2];

/** Hour at which a retry run is scheduled. */
const RETRY_HOUR = 9;

/** Give up on an address after this many consecutive delivery failures. */
const MAX_SEND_FAILURES = 3;

/** Stop and reschedule this far into a run, short of the six-minute platform limit. */
const RUN_BUDGET_MS = 4.5 * 60 * 1000;

/** Leave this much quota unspent so that an alert can still be delivered. */
const QUOTA_RESERVE = 2;

const RETRY_HANDLER = 'runRetryBatch';
const WEEKLY_HANDLER = 'runEmailBatch';
const SUBMIT_HANDLER = 'onFormSubmit';
const LOG_SHEET_NAME = 'Run Log';
const MAX_LOG_ROWS = 5000;
const LOCK_WAIT_MS = 30 * 1000;

/**
 * One-off helper: fill in your own values, run once, then blank them again.
 * Deliberately left empty in the repository.
 */
function seedScriptProperties_() {
  PropertiesService.getScriptProperties().setProperties({
    FORM_URL: '',
    FORM_ID_ENTRY: '',
    RESPONSE_SHEET_NAME: '',
    ADMIN_EMAIL: '',
    SYSTEM_ACTIVE: 'false',
    DEBUG_MODE: 'true'
  }, false);
}
