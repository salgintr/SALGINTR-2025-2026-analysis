# SALGINTR 2025/26 analysis code

Analysis code, pseudocode and computational specifications for the SALGINTR study — a
physician-based digital participatory surveillance system for influenza-like illness in Türkiye,
covering the 2025/26 season, ISO weeks 40/2025 to 20/2026 (33 weeks).

This repository accompanies a doctoral thesis at Middle East Technical University. It contains the
code that produced the reported analyses and the codebook that defines every variable those analyses
use. **It does not contain the data** — see [Data availability](#data-availability).

## Associated publication

> Ontaş E, Güçlü H, Aydın Son Y. (2026). SALGINTR: development and early evaluation of a low-cost cloud-based digital participatory surveillance system for influenza-like illness among physicians in Türkiye — a proof of concept. *BMC Infectious Diseases*, 26, 1506.  
> https://doi.org/10.1186/s12879-026-14153-1

## What is here

| Path | Contents |
|---|---|
| `notebooks/` | The two analysis notebooks, one per language, with outputs embedded as executed, and the verbatim run log of each |
| `codebook/` | All 263 variables the analyses consume, across the five dataset sheets: label, type, permitted values, derivation rule, and which analyses use each one |
| `specs/` | The analysis inventory, one row per analysis, and the canonical value of every quantity the manuscript reports more than once |
| `pseudocode/` | The collection-pipeline pseudocode |
| `figures/` | The directed acyclic graphs behind the identification strategy for each hypothesis |
| `environment/` | Version-pinned environment files for Python and R, and the note recording how the notebooks were run |
| `docs/` | The shipped figures checked against the notebook output, the items of both questionnaires, and a bilingual methods companion |

## Analyses

The notebooks cover the analyses in five groups: the cohort and its representativeness;
individual-level determinants of reported illness; person-week recurrent-event models including the
vaccine contrast; system-level concordance between the participatory stream and national sentinel
surveillance, including the aberration-detection ensemble; and the internal-validity analyses of
reporting behaviour and panel structure.

`SALGINTR_S3_Python.ipynb` carries the descriptive analyses, the logistic and ordinal models, the
system-level concordance work and the aberration-detection ensemble. `SALGINTR_S3_R.ipynb` carries
the shared-frailty recurrent-event models, the mixed-effects models and the generalised estimating
equations, which are fitted with R packages that have no equivalent implementation in Python.

Figure generation is deliberately outside the scope of these notebooks: they produce the numbers, and
the thesis figures are drawn separately.

## Pseudocode

`pseudocode/COLLECTION-PIPELINE.md` describes the weekly collection cycle in language-neutral form:
enrolment, the Saturday send of each physician's own pre-filled link, the retry chain that carries an
interrupted send across the following days, and the operator procedures around it. The two
questionnaires it drives are itemised in `docs/questionnaire_items.csv`. The script that implemented
the cycle is not distributed: it carries the live form endpoint, the response workbook and the
study's mailbox addresses, and a Google Form endpoint accepts submissions from anyone holding it.

Participant identifiers were drawn at random and are not derived from the email address or from any
other participant attribute, which is why the generation rule can be stated openly in that file. An
identifier computed from an identifier — a digest of an address, say — would be invertible by
enumeration over a small and guessable address space, and describing the rule would then amount to
describing a re-identification method.
The pseudocode of record for each analysis is in the thesis supplement;
`specs/analysis_inventory.csv` names the supplement section carrying it for every analysis, in its
`current_supplement_pseudocode` column.

## Aberration detection

The detection ensemble is implemented directly from the published detector definitions rather than
through a historical-baseline surveillance package, because the available series is a single season
and those packages require multi-year baselines. Six detectors run on the causal three-week moving
average of each series with a seven-week rolling baseline and a seven-week warm-up:

| Detector | Statistic | Alarm threshold |
|---|---|---|
| EARS C1 | standardised deviate against the prior seven weeks | statistic > 3 |
| EARS C2 | as C1, baseline ending two weeks before the current week | statistic > 3 |
| EARS C3 | cumulative positive C2 excess over three weeks, inheriting C2's guard band | statistic > 2 |
| Negative-binomial CUSUM | log-likelihood ratio on weekly counts, dispersion by method of moments, accumulator reset after an alarm | series-specific decision interval, Monte-Carlo calibrated |
| EWMA | exponentially weighted average, smoothing constant 0.4, control limit re-arming to the baseline mean after an alarm | Z > baseline mean + 3 standard deviations of Z |
| Empirical 95th percentile | current value against the prior ten weeks | value above the 95th percentile |

A week is flagged when at least one detector alarms; a two-detector consensus variant is reported
separately. The Farrington Flexible algorithm was excluded for the reason above.

Three details are load-bearing and easy to get wrong, so they are stated explicitly here as well as
in the code: EARS C3 inherits C2's two-week guard band; the CUSUM decision interval is calibrated
separately for each series rather than shared; and the EWMA control limit re-arms after an alarm,
without which the statistic latches and reports consecutive weeks as separate alarms.

## Reproducibility

Every resampling procedure sets its seed in the cell that uses it, and bootstraps use 2,000
replicates. `environment/ENVIRONMENT.md` pins the package versions the reported results were produced
under and records the one quantity that still moves between runs. `specs/canonical_specifications.csv`
fixes the value of each quantity the manuscript reports in more than one place, so that the
Results and the Discussion cannot drift apart.

## Data availability

The analysis dataset is **not** distributed with this repository, and the `.gitignore` is written to
prevent it being added inadvertently.

The cohort is a small professional panel of physicians in a single country. Even with direct
identifiers removed, the combination of specialty, institution type, region, household composition
and weekly reporting pattern is potentially re-identifying for individual participants, and
participants consented on the basis that individual-level records would not be published. Aggregated
weekly series and all reported estimates are in the thesis and its supplement.

Individual-level data may be made available for scientific reuse on reasonable request, subject to a
data-sharing agreement and approval by the relevant institutional ethics committee. Requests should
be directed to the corresponding author.

Because the codebook defines every variable the code consumes, the analysis code can be read,
audited and adapted without the data in hand.

## Citing this repository

See `CITATION.cff`. The archived release carries a DOI; cite that DOI for a specific version and this
repository for the code in general.

## Licence

Code is released under the MIT Licence (`LICENSE`). The codebook and written documentation are
released under CC BY 4.0 (`LICENSE-docs`), so they may be reused with attribution.
