# Collection instrument — Google Apps Script

The weekly reporting cycle described in the paper was operated by a Google Apps Script bound to the
Google Sheets workbook that Google Forms writes its responses to. This directory holds that script.
It is here so that the collection side of the study can be read and audited alongside the analysis
side, which is what the rest of the repository covers.

The script does three things: it enrols a physician once, it sends every enrolled physician their own
pre-filled link to the weekly form each Saturday morning, and it retries across the following days
when the platform's daily mail quota runs out before the cohort is covered.

## What is not here

No live endpoint, mailbox or workbook identifier is committed. Everything of that kind is read at run
time from Script Properties, which are held with the script project:

| Property | Meaning |
|---|---|
| `FORM_URL` | Weekly form URL, up to but excluding the question mark |
| `FORM_ID_ENTRY` | `entry.` id of the participant-ID question in that form |
| `RESPONSE_SHEET_NAME` | Name of the sheet the form writes to |
| `ADMIN_EMAIL` | Address that receives operational alerts |
| `SYSTEM_ACTIVE` | `true` while the season is collecting, `false` once it closes |
| `DEBUG_MODE` | `true` to simulate sends without delivering mail |

The form URL and the entry id are withheld together for one reason: a Google Form endpoint accepts
submissions from anyone who holds it, so publishing the pair would let a reader inject responses into
the study's own instrument. The workbook itself is never referenced by id; the script is container
bound and reaches it through `getActiveSpreadsheet()`.

## Identifiers and re-identification

Participant identifiers are drawn at random, by `mintParticipantId_()`, and are **not derived from
the email address or from any other participant attribute**. There is no hash, no keyed digest and no
salt to protect, so the generation rule can be published — as it is, in full, in this directory —
without giving anyone a way to move from an identifier back to a person.

That is a design choice rather than an incidental one. An identifier computed from an identifier is
only as strong as the space it is computed over. Physician email addresses in a single country form a
small and highly guessable space, so an unsalted digest of an address can be inverted by enumeration
in minutes by anyone holding the algorithm. Publishing the code would then amount to publishing a
re-identification method. A random identifier carries no information about the person it names, which
is what makes both the code and the identifier column safe to release.

Two constraints follow from this and are enforced elsewhere in the repository:

- The link between an identifier and an email address exists only in the private response workbook,
  which is not distributed. See the data-availability statement in the root `README.md`.
- The run log written by `Logging.gs` records row numbers and identifiers, never addresses. The log
  sheet lives in the same workbook as the responses but is read and exported far more casually, so it
  is kept free of direct identifiers by construction.

## Files

| File | Contents |
|---|---|
| `appsscript.json` | Manifest. Pins the time zone, which the weekly boundary depends on |
| `Config.gs` | Script properties, column names, send states, operating parameters |
| `Logging.gs` | Buffered run log and the two-channel operational alert |
| `Registry.gs` | Response-sheet access, the week boundary, identifier minting, address checks |
| `Mailer.gs` | The weekly and end-of-season message templates, and delivery |
| `Pipeline.gs` | Enrolment, the weekly batch, and the retry chain |
| `Admin.gs` | Trigger installation, setup verification, backfill, closing announcement |

## Operating it

1. Set the script properties listed above, with `SYSTEM_ACTIVE` false and `DEBUG_MODE` true.
2. Run `verifySetup()` and read its report. It confirms the time zone, resolves every column, counts
   the rows lacking an identifier, and lists the installed triggers, without sending anything.
3. Run `setupTriggers()` once. This installs the form-submit handler and the Saturday 09:00 batch.
4. Run `backfillIdentifiers()` if the sheet already holds rows that predate the script.
5. Set `DEBUG_MODE` false and `SYSTEM_ACTIVE` true to begin the season.
6. At the end of the season set `SYSTEM_ACTIVE` false, then run `sendClosingAnnouncement()`. It is
   resumable: run it again the next day if the quota stops it partway.

## Notes on the design

**The week boundary.** A row is due if it has not been sent since the most recent Saturday at 00:00.
That single definition is what makes the batch safe to run more than once in a week: a Sunday rerun
after a Saturday failure picks up exactly the rows that were missed, and never doubles up on the rest.

**The retry chain.** `runRetryBatch` is a different handler from `runEmailBatch` on purpose. The
chain clears its own triggers by handler name before scheduling the next link, and a shared name
would take the recurring weekly trigger with it — after which the season would stop silently.

**Quota and time.** The daily quota is read once per run and tracked locally, with a small reserve
left so that an alert can still be delivered. Both the quota and a four-and-a-half-minute budget are
checked before each send rather than after, so that rows the run cannot reach are marked `PENDING`
instead of being passed over without a trace. Writes are staged in memory and committed one column at
a time; a run over a hundred rows would otherwise spend most of the six-minute execution limit on
individual cell writes.

**State.** The `Send State` column holds a machine-readable code and nothing else. The human-facing
explanation is in `Send Note`, so that editing a note by hand cannot change what the batch decides to
do with a row.

**Opt-out.** The `Opt Out` column is checked before every send. Marking it is the operator's action
on receipt of a request; the unsubscribe link in each message is a `mailto:` and is not processed
automatically.

## Licence

MIT, as for the rest of the code in this repository.
