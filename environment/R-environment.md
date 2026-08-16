# R environment for the SALGINTR analysis
#
# Reported results were produced under R 4.5.3 with the versions below.
# Install with:  Rscript environment/install.R

R version: 4.5.3

| Package  | Version | Used for |
|----------|---------|----------|
| survival | 3.8.9   | Shared gamma-frailty Andersen–Gill recurrent-event models; the vaccine contrast |
| MASS     | 7.3.66  | Negative-binomial count models; ordinal models |
| lme4     | 2.0.6   | Random-intercept logistic models, adaptive Gauss–Hermite quadrature |
| geepack  | 1.3.13  | Generalised estimating equations as a marginal cross-check |
| nloptr   | 2.2.1   | Optimiser backing lme4's bobyqa fits |
| Matrix   | 1.7.5   | Sparse-matrix support required by lme4 |
