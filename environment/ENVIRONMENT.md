# Computational environment

Both notebooks were run end to end in this environment and completed with exit status 0.
The runlogs shipped alongside them (`SALGINTR_S3_Python_runlog.txt`, `SALGINTR_S3_R_runlog.txt`)
are the verbatim output of those runs.

## Python

```
python 3.11.15
numpy==2.4.6
pandas==2.3.3
scipy==1.17.1
statsmodels==0.14.6
scikit-learn==1.9.0
lifelines==0.30.3
openpyxl==3.1.5
```

Install with `pip install -r requirements.txt`.

## R

```
R 4.5.3
survival==3.8.9
MASS==7.3.66
geepack==1.3.13
lme4==2.0.6
nnet==7.3.20
pROC==1.19.0.1
readxl==1.5.0
```

Install with `install.packages(c("survival","MASS","geepack","lme4","nnet","pROC","readxl"))`.

## Data

The dataset is not distributed in this repository. The notebooks are shipped with their
outputs embedded, so every printed result can be read without executing anything and without
the data file.

To re-execute them, place `SALGINTR_Unified_Dataset.xlsx` in the same folder as the notebook.
No other input is required and no network access is used. The file has five sheets:
`01_Physicians` (304 registrants), `02_PersonWeeks` (4,729 filed person-weeks),
`03_Episodes` (497 episodes), `04_WeeklySystem` (33 weeks) and `05_RecodedIndividual`
(248 reporters); the variable-by-variable documentation is in `codebook/`.

## Determinism

Every resampling procedure sets its seed in the cell that uses it. The one quantity that
still moves between runs is the optimism estimate of the uptake model's discrimination,
because it is a bootstrap mean: the reported optimism-corrected area under the curve is
0.8092 and a rerun reproduces 0.8100. Point estimates and intervals are unaffected.
