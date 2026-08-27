# How this repository maps to the thesis

The thesis supplement and this repository carry the same material in two forms. The supplement is the
archival record inside the thesis; this repository is the runnable version.

| Thesis | Repository |
|---|---|
| Supplement S1 — study questionnaire | not included; the instrument is reproduced in the thesis |
| Methods 2.2 — data collection and the weekly cycle | `apps-script/` and `pseudocode/COLLECTION-PIPELINE.md` |
| Supplement S2 — codebook | `codebook/codebook.csv` and `codebook/CODEBOOK.md` |
| Supplement S3 — statistical methods, code and pseudocode | `notebooks/`, `pseudocode/` and `specs/` |
| Methods 2.10 — software and reproducibility | `environment/` and `specs/seeds.md` |
| Results 3.6 — system-level analyses | the aberration and concordance sections of the Python notebook |

## The two notebooks

`SALGINTR_S3_Python.ipynb` — the cohort description, the logistic and ordinal models, the
system-level concordance analysis, the aberration-detection ensemble and the specification curve.

`SALGINTR_S3_R.ipynb` — the shared gamma-frailty Andersen–Gill recurrent-event models including the
vaccine contrast, the random-intercept logistic models fitted by adaptive Gauss–Hermite quadrature,
the generalised estimating equations used as a marginal cross-check, and the negative-binomial count
models. These are in R because the fitting routines have no equivalent implementation in Python.

The split is by fitting routine, not by topic, so a single thesis section may draw on both notebooks.

## Running them

Both notebooks read the analysis dataset from the working directory by its dated filename. Place the
dataset beside the notebook and run the cells in order; neither notebook needs a network connection
and neither writes outside its own directory. The dataset itself is not distributed — see the
data-availability statement in the README.

Figure generation is out of scope: the notebooks produce the numbers that the thesis figures are drawn
from, and the drawing code is not part of this repository.
