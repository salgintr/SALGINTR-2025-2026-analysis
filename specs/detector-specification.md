# Aberration-detection specification

The detection ensemble is implemented directly from the published detector definitions. It is not run
through a historical-baseline surveillance package, because those packages estimate the expected count
from several prior seasons and only one season is available here.

## Common settings

| Setting | Value |
|---|---|
| Input series | the causal three-week moving average of each stream, weeks t−2 to t |
| Rolling baseline | 7 weeks |
| Warm-up | 7 weeks; no alarm is possible before the baseline is fully populated |
| Consensus rule | a week is flagged when at least one of the six detectors alarms; a two-detector variant is reported separately |
| Monitored quantity | the viral fraction of syndromic illness in each stream — viral-systemic episodes as a share of incident episodes on the participatory side, positive specimens as a share of specimens tested on the sentinel side |

## Detectors

**EARS C1.** The standardised deviate of the current week against the mean and standard deviation of
the prior seven weeks. Alarms when the statistic exceeds 3.

**EARS C2.** As C1, but the baseline is the seven weeks ending two weeks before the current week. The
two-week guard band keeps the rise being tested out of the baseline it is tested against. Alarms when
the statistic exceeds 3.

**EARS C3.** The cumulative sum, over the current week and the two before it, of the positive part of
each week's C2 excess above one standard deviation. Alarms when the cumulative statistic exceeds 2.
C3 inherits C2's guard band; computing it from an unguarded deviate produces alarms in the wrong
weeks.

**Negative-binomial CUSUM.** A sequential log-likelihood-ratio statistic on weekly counts rather than
on the smoothed proportion: at each week the accumulated statistic is the previous value plus the log
ratio of the negative-binomial density under an out-of-control mean of twice the baseline to the
density under the baseline mean, floored at zero. The dispersion parameter is estimated from the
seven-week baseline by the method of moments. The accumulator resets to zero after an alarm, without
which the statistic stays above the decision interval and reports the whole epidemic as one long
alarm. The decision interval is calibrated by Monte-Carlo simulation separately for each series,
because the two series differ in count level and dispersion: 1.40 for the participatory stream and
2.52 for the sentinel stream.

**EWMA.** An exponentially weighted moving average with smoothing constant 0.4, compared against the
baseline mean plus three standard deviations of the weighted statistic. The control limit re-arms to
the baseline mean after an alarm. Without the re-arm the statistic latches above its limit and each
subsequent week is reported as a fresh alarm, which turns one signal into three.

**Empirical 95th percentile.** The current value against the 95th percentile of the prior ten weeks,
a sliding window rather than an expanding one. Alarms when the value exceeds that percentile.

## Excluded

The Farrington Flexible algorithm is excluded because it requires multi-year historical baselines to
fit its expected-count model, and a single season cannot supply them.

## Sensitivity

The whole ensemble is re-run across a factorial of monitored quantity, smoothing, baseline length,
threshold and consensus rule, and the resulting agreement coefficients are reported as a specification
curve with the primary specification identified on it. The point is that any single agreement
coefficient is one draw from that distribution.
