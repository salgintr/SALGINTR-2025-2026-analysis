# SALGINTR 2025/26 analysis code

Analysis code, pseudocode and computational specifications for the SALGINTR study — a
physician-based digital participatory surveillance system for influenza-like illness in Türkiye,
covering the 2025/26 season, ISO weeks 40/2025 to 20/2026 (33 weeks).

This repository accompanies a doctoral thesis at Middle East Technical University. It contains the
code that produced the reported analyses and the codebook that defines every variable those analyses
use. **It does not contain the data** — see [Data availability](#data-availability).

## Associated publication

This repository accompanies the following proof-of-concept study:

> Ontaş E, Güçlü H, Aydın Son Y. (2026). SALGINTR: development and early evaluation of a low-cost cloud-based digital participatory surveillance system for influenza-like illness among physicians in Türkiye — a proof of concept. *BMC Infectious Diseases*.  
> https://doi.org/10.1186/s12879-026-14153-1

## What is here

| Path | Contents |
|---|---|
| `notebooks/` | The two analysis notebooks, one per language, with outputs embedded as executed |
| `pseudocode/` | Language-neutral pseudocode for each analysis, for reimplementation in any language |
| `codebook/` | Every variable used in the analyses: label, type, permitted values, derivation rule |
| `specs/` | The locked analysis protocol, the detector specification and the seed register |
| `environment/` | Version-pinned environment files for Python and R |
| `docs/` | Repository documentation, including how the notebooks map to the thesis supplement |

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

## Reproducibility

Random seeds are fixed for every resampling procedure and recorded in `specs/seeds.md`. Bootstraps
use 2,000 replicates. The environment files pin the package versions the reported results were
produced under.

## Data availability

The analysis dataset is **not** distributed with this repository.

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

## Contact

For questions about the repository, analysis code, data access, or reproducibility, please contact:
> **eray.ontas@metu.edu.tr**

## Licence

The code will be released under the MIT Licence, and the codebook and written documentation will be released under the Creative Commons Attribution 4.0 International (CC BY 4.0) licence.
