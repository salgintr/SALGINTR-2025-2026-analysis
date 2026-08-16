# Random seeds and resampling parameters

Every procedure in this analysis that draws random numbers is seeded, so a re-run reproduces the
reported value exactly rather than a value near it.

| Procedure | Seed | Replicates | Where it is used |
|---|---|---|---|
| Moving-block bootstrap | 7 | 2,000 | Confidence intervals for the between-system correlations and for the peak-lag profile; block length 4 weeks, non-circular |
| Cluster bootstrap | 7 | 2,000 | Physician-clustered intervals where a closed-form cluster-robust variance is not available |
| Efron optimism correction | 42 | 1,000 | Optimism-corrected discrimination for the uptake model; the variable-selection step is repeated inside every replicate |
| Monte-Carlo calibration of the CUSUM decision interval | 7 | 2,000 | Calibrating the negative-binomial CUSUM decision interval separately for each series |
| Resampling for the internal-validity supplements | 20260806 | 2,000 | The bounding and stratification analyses of the internal-validity supplements |
| Quantitative bias analysis | 20260707 | 2,000 | Recorded for provenance; this analysis is not presented as a robustness claim and appears in the thesis only as a qualitative limitation |

## Convergence and fitting rules

| Setting | Value |
|---|---|
| Shared gamma-frailty Andersen–Gill | R survival package, Efron handling of tied event times, full person-week panel |
| Random-intercept logistic models | 30-node adaptive Gauss–Hermite quadrature, bobyqa optimiser |
| Generalised estimating equations | exchangeable working correlation, physician as the clustering unit, used as a marginal cross-check on the conditional fits |
| Ordinal models | proportional-odds logistic, with the proportional-odds assumption tested by a score-based test rather than assumed |
| Logistic and Cox models | maximum iterations raised to 300 where the default did not converge; no model in the reported set required it |

Where a conditional and a marginal estimator are both reported for the same question, they answer
different questions rather than disagreeing, and the code labels which is which.
