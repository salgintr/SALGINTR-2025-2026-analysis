# Collection pipeline

Language-neutral pseudocode for the weekly collection cycle, so the instrument can be reimplemented
on any scheduler and mail transport rather than only on the platform it ran on. Each block states
what the step does and why, not how a particular platform expresses it.

The cycle was implemented as a Google Apps Script bound to the Google Sheets workbook that Google
Forms wrote its responses to. That script is not distributed here: it carries the live form
endpoint, the response workbook and the mailbox addresses the study operated on, and a Google Form
endpoint accepts submissions from anyone holding it. The pseudocode below is the complete
description of what it did.

The cycle ran for 33 weeks, ISO 40/2025 to 20/2026.

## C00 — The cycle, in one view

```
1. A physician enrols once through the registration form. The submission handler assigns a
   participant identifier and builds a personal pre-filled link to the weekly form, keyed to that
   identifier.
2. Every Saturday at 09:00 a scheduled job opens the week's send window.
3. The job selects every enrolled physician who has not yet been sent this week's link, where the
   week begins at Saturday 00:00.
4. Each selected physician receives their pre-filled link by email, and the row is stamped with a
   send state and a timestamp. That stamp is what makes the selection in step 3 repeatable.
5. If the platform's daily send quota is exhausted before the cohort is covered, the physicians not
   reached are marked pending and the job schedules itself to resume at 09:00 the next day. The
   chain runs Saturday, Sunday, Monday, Tuesday, then stops and raises an alert.
6. Physicians respond by Tuesday 23:59. Responses land in the same workbook and join to the
   registry on the participant identifier.
7. The cycle repeats until the season closes, after which a single end-of-season message is sent.
```

## C01 — Enrolment

```
1. Stop if the system flag is off, so that a closed season cannot enrol anyone.
2. Take an exclusive lock, so that enrolment cannot interleave with a weekly batch writing to the
   same rows.
3. Resolve the columns the script owns by header name, creating any that are absent. Resolve by name
   rather than by position, so that adding a question to the form cannot move the columns silently.
4. Do nothing if the submitted row already carries a participant identifier; the submission has been
   processed before.
5. Normalise the email address and check its shape. Reject the row with an explicit state if the
   address is unusable, and reject it as a duplicate if the same address is already enrolled, so
   that one physician cannot enter the cohort twice.
6. Draw a participant identifier at random. The identifier is not derived from the address or from
   any other participant attribute, so that publishing the generation rule cannot become a way of
   moving from an identifier back to a person.
7. Store the identifier and the pre-filled link built from the form URL and that identifier.
8. If the submission falls inside the send window, Saturday through Tuesday, send the first weekly
   invitation now, because this week's batch has already run or is about to. Otherwise mark the row
   pending and leave it to the next Saturday.
```

## C02 — The weekly batch

```
1. Stop if the system flag is off. Take the exclusive lock.
2. Fix the start of the current week as the most recent Saturday at 00:00 in the study's time zone.
   This single boundary defines what "already sent this week" means and is what makes the job safe
   to run more than once in a week.
3. Read the whole response sheet into memory in one pass, and read the remaining daily send quota
   once. Both are round trips whose cost is paid per call, not per row.
4. Reserve a small part of the quota, so that an alert about an exhausted quota can still be sent.
5. For each row decide, in this order: skip it if the physician has opted out; skip it if it was
   already sent on or after the week boundary; retire it if it has failed to deliver more than the
   permitted number of times; flag it if it lacks an identifier or a usable address. Everything that
   survives is due a message this week.
6. Before each send, check the remaining quota and the elapsed run time against a budget short of
   the platform's execution limit. Check before rather than after, so that rows the run cannot
   reach are marked pending rather than passed over without a trace.
7. Send the physician their pre-filled link. On success record the sent state, the timestamp, and a
   cleared failure count; on failure record a pending state and an incremented failure count, so
   that a permanently undeliverable address retires itself instead of consuming quota every week.
8. Accumulate every state change in memory and commit it with one write per touched column, rather
   than writing each cell as it is decided.
9. If any physician was left unreached, schedule a single resumption at 09:00 the next day in the
   Saturday-to-Tuesday window. Clear any previous resumption first, so the chain cannot fork.
   Schedule from one place, whatever the outcome of the run, so that a run interrupted by an error
   does not lose its chain.
10. Tuesday is the last link. If work is still outstanding there, raise an alert rather than
    scheduling further, because the response deadline has passed.
11. If the run found physicians due a message and delivered none at all, raise an alert on both the
    mail channel and a channel that does not depend on mail, since the most likely explanation is
    the very quota exhaustion that would suppress an emailed alert.
```

## C03 — Message construction

```
1. Select a template by name. The weekly invitation and the end-of-season message differ only in
   their template, not in the sending code.
2. Render both an HTML body and a plain-text body for clients that will not display HTML, keeping
   the two in step so that no markup or markup syntax leaks into the text a reader sees.
3. Include the participant's own link in the weekly template and an unsubscribe route in both.
4. In simulation mode, record the send that would have happened and return without delivering, so
   that the selection logic can be exercised over the real sheet without contacting anyone.
```

## C04 — Operator procedures

```
1. Verification. Confirm the configured time zone, resolve every column, count rows lacking an
   identifier, report the remaining quota and the current week boundary, and list installed
   triggers. Send nothing.
2. Trigger installation. Install the submission handler and the Saturday 09:00 batch, removing only
   the handlers this script owns so that any unrelated trigger on the same project survives.
3. Backfill. Assign identifiers and pre-filled links to rows that predate the script or were written
   while it was inactive. Send nothing.
4. Closing. With the system flag off, send the end-of-season message once to every enrolled
   physician who has not opted out, marking each recipient so that a resumed run does not repeat it.
```
