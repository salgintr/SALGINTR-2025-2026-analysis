# Detector specification

The aberration-detection ensemble used in the SALGINTR 2025/26 analysis. This file is the detector
specification referred to in the thesis: it records the six detectors, their statistics and alarm
thresholds, and the three implementation choices that change which weeks are flagged.

## Why these detectors

The ensemble is implemented directly from the published detector definitions rather than through a
historical-baseline surveillance package, because the available series is a single season and those
packages estimate the expected count from several prior seasons. The Farrington Flexible algorithm
was excluded for that reason: it was ruled out by design rather than tried and rejected.

## The six detectors

All six run on the causal three-week moving average of each series, with a seven-week rolling
baseline and a seven-week warm-up.

| Detector | Statistic | Alarm threshold |
|---|---|---|
| EARS C1 | standardised deviate against the prior seven weeks | statistic > 3 |
| EARS C2 | as C1, baseline ending two weeks before the current week | statistic > 3 |
| EARS C3 | cumulative positive C2 excess over three weeks, inheriting C2's guard band | statistic > 2 |
| Negative-binomial CUSUM | log-likelihood ratio on weekly counts, dispersion by method of moments, accumulator reset after an alarm | series-specific decision interval, Monte-Carlo calibrated |
| EWMA | exponentially weighted average, smoothing constant 0.4, control limit re-arming to the baseline mean after an alarm | Z > baseline mean + 3 standard deviations of Z |
| Empirical 95th percentile | current value against the prior ten weeks | value above the 95th percentile |

## Consensus rule

A week is flagged when **at least one** detector alarms. This one-detector rule is the locked
specification of record. A two-detector consensus variant is reported separately as a labelled
further analysis.

## Three implementation choices that change the alarm set

These three are load-bearing and easy to get wrong, so they are stated here as well as in the code.

1. **EARS C3 inherits C2's two-week guard band.** C3 accumulates C2 excesses, so it takes C2's
   baseline convention with it. Applying C3 to an unguarded baseline produces a different alarm set.

2. **The CUSUM decision interval is calibrated per series, not shared.** A series carrying a median
   of 15 events a week and one carrying about 115 tests a week do not give the same false-alarm rate
   at the same interval. The intervals are Monte-Carlo calibrated separately: **h = 1.40** for the
   participatory stream and **h = 2.52** for the sentinel stream. The dispersion parameter is
   estimated by the method of moments.

3. **The EWMA control limit re-arms to the baseline mean after an alarm.** Without re-arming the
   statistic latches and reports consecutive weeks as separate alarms. The EWMA is seeded from the
   mean of the first seven weeks.

The CUSUM accumulator is likewise returned to zero after an alarm and re-arms for the following
week. That reset is not a formality: comparing reset against no reset, across the decision intervals
used on both streams, changes the alarm set in most of the combinations examined.

## Warm-up is a constraint, not a result

No detector can raise an alarm before its seven-week baseline window has filled. Any statement about
specificity in the opening weeks of a season has to be read against the number of weeks in which an
alarm was actually possible.

## Seeds

The Monte-Carlo calibration of the CUSUM decision intervals runs from **seed 7**, the same seed used
for the moving-block and cluster bootstraps (block length four weeks, non-circular).
