# Pseudocode

Language-neutral pseudocode for every analysis, so the analysis can be reimplemented without
reading Python or R. Each block states what the step does and why, not how a particular language
expresses it. The code that implements each block is in `notebooks/`.

**107 analyses.**

## (unlabelled block, table 7)

```
1. Name the workbook. DATA is the only line to change when a later dated release supersedes this one; the workbook must sit in the same folder as this notebook.
2. Read the five analysis sheets: the physician registry, the person-week panel, the cleaned episode file, the weekly two-system file and the recoded individual-level file.
3. Sort the person-week panel by physician and week index, then derive the panel structure the notebook needs and the workbook does not carry as columns: an indicator for a gap immediately before each filed week, the sequence number of each filed week within a physician's own record, and a forward-filled episode identifier that carries an episode label across its continuation week.
4. Build the weekly two-system series. Weekly incidence is computed on the at-risk denominator throughout; the stored rate columns follow the filed person-week denominator and are not read.
5. Fix the ISO week calendar and the epidemic-phase windows, and hard-code the Moving Epidemic Method thresholds, which are a-priori inputs estimated from ten historical sentinel seasons that this release does not carry.
6. Define the shared helpers: causal three-week moving average, exact binomial interval, standardized mean difference, and the Efron bootstrap optimism correction that refits the model inside every replicate. A small collector holds the quantity each block reproduces, so the verification table can be assembled from the notebook's own run.
```

## (unlabelled block, table 8)

```
1. Set DATA to the workbook filename. The workbook must sit in the same folder as this notebook; if a later dated release supersedes this one, DATA is the single line to change.
2. Read the physician sheet, the person-week sheet, the episode sheet and the weekly system sheet with readxl.
3. Sort the person-week panel by physician identifier and then by week index, so that the counting-process intervals are in time order within each physician.
4. Derive, within each physician's own record: whether the week is that physician's first observed week, and whether a reporting gap immediately precedes the week.
5. Print the panel structure checks that every later block depends on: number of filed person-weeks, number of physicians, at-risk person-weeks, symptomatic weeks, continuation weeks (symptomatic but not a new onset), incident episodes, and the episode count in each of the four agent clusters.
6. Compute the season incidence on the AT-RISK denominator as 1000 times new episodes divided by at-risk person-weeks. The stored weekly rate columns follow the filed denominator instead and are never read.
```

## A01 — Cohort accrual and follow-up

```
1. Count registered physicians in the registry sheet.
2. Split them on whether at least one weekly report was filed: reporters form the analysis cohort, the remainder are never-reporters.
3. From the person-week panel count filed person-weeks, person-weeks at risk of a new episode, symptomatic person-weeks and incident episodes.
4. Continuation weeks are symptomatic weeks that are not incident onsets; they are the weeks removed from the at-risk denominator.
5. Report each count with its percentage of the relevant total.
```

## A02 — Weekly participation series and plateau

```
1. Take the weekly count of physicians filing any report, in ISO week order.
2. The enrolment ramp is the first eight weeks of that series.
3. The plateau is week nine onward; report its median and range, and separately the median over all thirty-three weeks so the two are not conflated.
4. Locate the peak week and the closing week.
5. Fit an ordinary least-squares line to the reporter count from the peak week to the end of the season and report its slope in reporters per week.
```

## A03 — Reporting-frequency distribution and grid fill

```
1. For each reporting physician take the number of weeks reported.
2. Report its median, mean and range, and the count reporting all thirty-three weeks and twenty-five to thirty-two weeks.
3. Realised grid fill is filed person-weeks divided by a complete grid. Compute it twice: against the reporter grid (reporters x weeks) and against the registry grid (all registrants x weeks).
```

## A04 — Reporting persistence and engagement strata membership

```
1. Classify each reporting physician by the number of weeks reported into three engagement strata using fixed cut-points: least engaged up to five weeks, moderately engaged six to twenty-three weeks, most engaged twenty-four or more.
2. Report stratum sizes, and also the count reaching twenty-four and twenty-five weeks, since both appear as persistence descriptors.
3. Attach each stratum's at-risk person-weeks and episode count, which the stratum-specific incidence block then uses.
```

## A05 — Geographic distribution of the reporting cohort

```
1. Take each reporting physician's province from the person-week panel.
2. Count provinces represented out of the eighty-one in the country.
3. Rank provinces by physician count and report the three largest centres with their shares, and the combined share those three hold.
4. Provinces contributing fewer than five physicians are pooled for reporting.
```

## A06 — Baseline numeric variables of the reporting cohort

```
1. For age and household size in the reporting cohort report median, interquartile range, range and mean.
2. Test each against normality with the Shapiro-Wilk test, which is what justifies the median-based presentation and the rank-based comparisons used later.
3. Report the count with a school-age child at home.
```

## A07 — Demographic and professional characteristics

```
1. Over the reporting cohort tabulate sex, institution type and job title as counts and percentages of the valid responses for each item.
2. Report the derived professional indicators separately: university-hospital affiliation, academic title, general practitioner, resident, and whether the physician performs face-to-face patient examination.
```

## A08 — Household, exposure and behavioural characteristics

```
1. Tabulate the household and behavioural items over the reporting cohort, each against its own valid-response denominator rather than a single cohort total, because the household-composition items were shown only to physicians reporting more than one household member.
2. Items: household size, a school-age child at home, a household member at risk of influenza complications, tobacco use, public-transport commuting time, respiratory allergy, physical activity, and frequent contact with children, adults and older people.
3. This block has no single scalar target; it produces a table of item-specific proportions.
```

## A09 — Clinical, vaccination and ILI-history characteristics

```
1. Collapse the self-reported annual influenza-like-illness frequency item to its four ordered levels and tabulate it over the reporting cohort, then over the model sample that excludes physicians who declined the health-condition item.
2. Report current-season and prior-season vaccination, prior-season illness and prior-season care-seeking.
3. Report how many physicians declined the health-condition question. Those responses stay missing; they are not imputed to zero, which is what fixes the individual-model sample at 242.
```

## A10 — Occupational characteristics of patient-facing physicians

```
1. Restrict to physicians who perform face-to-face patient examination.
2. Tabulate high-risk unit, primary patient group, aerosol-generating procedure share, mask use and monthly on-call shifts as counts and percentages, and daily patient volume as a median with interquartile range.
3. Report how many of the patient-facing physicians have a daily patient-volume value, which fixes the complete-case occupational analysis set.
```

## A11 — Episode burden, cumulative incidence and recurrence

```
1. Cumulative season attack rate is the share of reporting physicians with at least one incident episode.
2. Recurrence is the share with two or more; also report the maximum episode count in any one physician.
3. Report symptom-free reporters, that is reporters with no episode, and keep them distinct from the never-reporters, who filed nothing at all.
```

## A12 — Agent-cluster distribution of incident episodes

```
1. Tabulate the cleaned incident episodes by the physician's self-assigned agent cluster: A viral-systemic (the influenza-like proxy), B viral-local, C bacterial, D indeterminate.
2. Report counts and percentages of all incident episodes. The A-cluster share is the participatory positivity used in every system-level comparison.
```

## A13 — Clinical course of influenza-like (A-cluster) episodes

```
1. Restrict to A-cluster episodes.
2. Report the median and interquartile range of the maximum reported symptom duration in days.
3. Report the count with any work absence, and the count whose weekly form records an actual diagnostic test rather than an intention to test.
4. Presenteeism is the count who reported illness but could not interrupt work; report it against A-cluster episodes and against all incident episodes.
```

## A14 — Attributed source of infection by clinical role

```
1. The source-of-infection question allows more than one answer, so flags are counted, not episodes: total flags can exceed the number of episodes.
2. Aggregate the weekly source flags to the episode through the forward-filled episode identifier, restricted to A-cluster episodes.
3. Report flags per category and the flag total, then the same counts split by whether the physician performs face-to-face examination, expressed per hundred episodes in each role so the two roles are comparable.
```

## A15 — Season incidence rate per 100 at-risk person-weeks

```
1. The numerator is incident episodes; the denominator is person-weeks at risk of a new episode, that is filed person-weeks less continuation weeks.
2. Express the crude rate per hundred at-risk person-weeks and attach an exact Poisson interval.
3. Report the filed-person-week rate alongside, and the number of weeks in which the two denominators differ, so that the choice of denominator is visible.
```

## A16 — Weekly surveillance indicator panel

```
1. Assemble the weekly panel: participatory reporters, at-risk person-weeks, incident episodes, A-cluster episodes, participatory positivity, sentinel consultations, sentinel positives and sentinel positivity.
2. Describe the participatory denominator, that is all cleaned incident episodes in the week, and the sentinel specimen count.
3. Apply the sparse-week rule: flag weeks whose participatory denominator falls below ten. Flagging is disclosure only; no week is ever excluded.
```

## A17 — Count-versus-rate trend check on the weekly series

```
1. Correlate the weekly incident-episode count with the week index.
2. Correlate the weekly incidence rate on the at-risk denominator with the week index.
3. The two answer different questions: the count rises with the growing panel, the rate does not. Report both so the rising count is not read as an incidence trend.
4. Report the same correlation on the filed-person-week rate for comparison.
```

## A18 — Dashboard reach and summary counters

```
1. The dashboard reach counters — unique visitors and page views — are service-reported figures held outside the analysis workbook, so they are entered here as declared inputs and labelled as such.
2. Report them beside the registered-physician count from the workbook, which is the one counter this notebook can verify.
```

## A19 — Person-week panel structure and counting-process construction

```
1. Verify the counting-process construction: every filed week is one row with a half-open interval on the total-time clock, so start equals week index minus one and stop equals week index.
2. Confirm that the event indicator equals the incident-episode indicator and sums to the episode total.
3. Describe the panel: weeks per physician, physicians with at least one gap, the number and length of contiguous runs, and registration staggering measured as the distribution of first observed weeks.
4. Confirm that at-risk equals filed less continuation weeks, and that the derived gap indicator agrees with the stored one.
```

## A19 — Person-week panel structure and counting-process construction

```
1. Set DATA to the workbook filename. The workbook must sit in the same folder as this notebook; if a later dated release supersedes this one, DATA is the single line to change.
2. Read the physician sheet, the person-week sheet, the episode sheet and the weekly system sheet with readxl.
3. Sort the person-week panel by physician identifier and then by week index, so that the counting-process intervals are in time order within each physician.
4. Derive, within each physician's own record: whether the week is that physician's first observed week, and whether a reporting gap immediately precedes the week.
5. Print the panel structure checks that every later block depends on: number of filed person-weeks, number of physicians, at-risk person-weeks, symptomatic weeks, continuation weeks (symptomatic but not a new onset), incident episodes, and the episode count in each of the four agent clusters.
6. Compute the season incidence on the AT-RISK denominator as 1000 times new episodes divided by at-risk person-weeks. The stored weekly rate columns follow the filed denominator instead and are never read.
```

## A20 — Vaccinated person-week partition under the two-week interval

```
1. Vaccination enters the incidence models as a TIME-VARYING indicator: a person-week counts as protected only from two weeks after the vaccination week.
2. Partition the person-weeks of vaccinated physicians into three exclusive parts: weeks preceding the vaccination week, weeks inside the two-week interval, and protected weeks.
3. Verify the three parts sum to the vaccinated person-week total, and express the protected weeks as a share of the whole panel, which is the exposed person-time share the power calculations use.
```

## A20 — Vaccinated person-week partition under the two-week interval

```
1. Restrict to person-weeks contributed by physicians who reported a current-season vaccination week.
2. Partition those weeks into three mutually exclusive and exhaustive groups: weeks at or after two weeks from the reported vaccination week (protected person-time, the exposed state); weeks inside the two-week interval, that is, at or after the vaccination week but not yet two weeks past it; and weeks preceding the vaccination week.
3. Check that the three parts sum to the total, print each count, express the interval weeks as a share of the vaccinated total, and express protected weeks as a share of the whole panel — this last share is the input to the minimum-detectable-effect calculation.
```

## A20 — Vaccinated person-week partition under the two-week interval

```
1. For the interval sensitivity, rebuild the time-varying exposure indicator with the delay between the reported vaccination week and the start of protected time set to zero, one, two, three and four weeks in turn. Two weeks is the definition of record; the rest show whether the contrast depends on that choice.
2. At each delay report the number of exposed person-weeks and refit both the A-cluster and the all-ILI contrasts with the specification unchanged.
3. For the panel-definition comparison, refit the primary model on the full filed panel of 4,729 weeks (the definition of record) and then on at-risk weeks only, 4,626. The at-risk restriction removes the 103 continuation weeks, which carry no onset but do carry exposure and covariate time.
4. Print both fits and their frailty variances so the reader can see what the restriction costs.
```

## A21 — Vaccination uptake model

```
1. The outcome is current-season influenza vaccination. The sample is reporting physicians with a health-condition response: 242, of whom 90 were vaccinated.
2. The adjustment set is pre-specified on epidemiological grounds: prior-season vaccination, age in ten-year units, sex, university affiliation, face-to-face patient care, any health condition conferring complication risk, household school-age children and susceptibility in four ordered levels. No variable is selected on the data.
3. Fit the logistic model and report odds ratios with Wald intervals and p-values.
```

## A21 — Vaccination uptake model

```
1. Restrict to reporting physicians who answered the item on health conditions conferring a risk of influenza complications. Six physicians declined that item; those responses stay MISSING rather than being imputed to no, which fixes the analysis sample at 242 physicians.
2. Fit a binary logistic model for current-season vaccination on the pre-specified eight-term set: prior-season vaccination, age in ten-year units, sex, university affiliation, face-to-face patient examination, any health condition, any household school-age child, and susceptibility in four ordered levels. No variable selection.
3. Report odds ratios with Wald intervals and p-values, and the sample and event counts.
4. Compute the apparent area under the receiver operating characteristic curve.
5. Correct that area for optimism by the Efron bootstrap: draw one thousand samples with replacement from the analysis frame, refit the model in each replicate, and take the difference between the replicate's area on its own bootstrap sample and its area when applied to the original sample. The mean difference is the optimism; subtract it from the apparent value.
6. Assess calibration with the Hosmer-Lemeshow statistic over deciles of predicted risk on eight degrees of freedom, and with the bootstrap-corrected calibration slope, the apparent value of which is one by construction.
```

## A22 — Vaccination-uptake calibration and discrimination

```
1. Take the apparent area under the curve on the fitting sample.
2. Correct it for optimism with the Efron bootstrap, refitting the model in every one of the thousand replicates.
3. Assess calibration with the Hosmer-Lemeshow test on deciles of fitted risk and with the calibration slope, that is the coefficient from regressing the outcome on the linear predictor.
```

## A22 — Vaccination-uptake calibration and discrimination

```
1. Restrict to reporting physicians who answered the item on health conditions conferring a risk of influenza complications. Six physicians declined that item; those responses stay MISSING rather than being imputed to no, which fixes the analysis sample at 242 physicians.
2. Fit a binary logistic model for current-season vaccination on the pre-specified eight-term set: prior-season vaccination, age in ten-year units, sex, university affiliation, face-to-face patient examination, any health condition, any household school-age child, and susceptibility in four ordered levels. No variable selection.
3. Report odds ratios with Wald intervals and p-values, and the sample and event counts.
4. Compute the apparent area under the receiver operating characteristic curve.
5. Correct that area for optimism by the Efron bootstrap: draw one thousand samples with replacement from the analysis frame, refit the model in each replicate, and take the difference between the replicate's area on its own bootstrap sample and its area when applied to the original sample. The mean difference is the optimism; subtract it from the apparent value.
6. Assess calibration with the Hosmer-Lemeshow statistic over deciles of predicted risk on eight degrees of freedom, and with the bootstrap-corrected calibration slope, the apparent value of which is one by construction.
```

## A23 — Susceptibility (annual ILI frequency) model

```
1. The outcome is the self-reported annual influenza-like-illness frequency, collapsed to FOUR ordered levels. It is never treated as five levels.
2. Fit an ordinal proportional-odds logistic regression on the 242 physicians with a health-condition response.
3. The pre-specified adjustment set is age, sex, any health condition, household school-age children, household size, respiratory allergy, current tobacco use and face-to-face patient care.
4. Report cumulative odds ratios with intervals, and the estimated cut-points.
```

## A23 — Susceptibility (annual ILI frequency) model

```
1. Use the same 242-physician frame. The outcome is self-reported annual influenza-like-illness frequency in FOUR ordered levels, distributed 8 / 153 / 67 / 14. It is never treated as five levels.
2. Fit a proportional-odds ordinal logistic model on the pre-specified set: age in ten-year units, sex, any health condition, any household school-age child, household size, respiratory allergy, current smoking, and face-to-face patient examination. Report cumulative odds ratios with Wald intervals.
3. Test the proportional-odds assumption by a likelihood-ratio comparison against the unconstrained multinomial model on the same predictors, which relaxes the constraint that one set of coefficients applies across all cut-points. Degrees of freedom are the difference in fitted parameters.
4. Report model fit as McFadden's pseudo R-squared against the intercept-only ordinal model, and discrimination as the ordinal concordance over all discordant pairs of the linear predictor.
5. Test the hypothesis jointly across age, household school-age children, health condition and current smoking. Report the likelihood-ratio form against the model with those four terms removed, and the Wald form alongside, because the two do not have to agree numerically.
```

## A24 — Proportional-odds assumption test

```
1. The proportional-odds model constrains each covariate to one coefficient shared across all cut-points. The unconstrained alternative is a multinomial model, which lets every coefficient vary by level.
2. Fit both on the same sample and compare them with a likelihood-ratio test. The degrees of freedom are the number of extra parameters the multinomial model spends.
3. A non-significant test means the shared-coefficient constraint is not contradicted by these data.
```

## A24 — Proportional-odds assumption test

```
1. Use the same 242-physician frame. The outcome is self-reported annual influenza-like-illness frequency in FOUR ordered levels, distributed 8 / 153 / 67 / 14. It is never treated as five levels.
2. Fit a proportional-odds ordinal logistic model on the pre-specified set: age in ten-year units, sex, any health condition, any household school-age child, household size, respiratory allergy, current smoking, and face-to-face patient examination. Report cumulative odds ratios with Wald intervals.
3. Test the proportional-odds assumption by a likelihood-ratio comparison against the unconstrained multinomial model on the same predictors, which relaxes the constraint that one set of coefficients applies across all cut-points. Degrees of freedom are the difference in fitted parameters.
4. Report model fit as McFadden's pseudo R-squared against the intercept-only ordinal model, and discrimination as the ordinal concordance over all discordant pairs of the linear predictor.
5. Test the hypothesis jointly across age, household school-age children, health condition and current smoking. Report the likelihood-ratio form against the model with those four terms removed, and the Wald form alongside, because the two do not have to agree numerically.
```

## A25 — Susceptibility model fit and joint hypothesis test

```
1. McFadden's pseudo R-squared compares the fitted log-likelihood with that of an intercept-only ordinal model.
2. Ordinal concordance is the probability that a randomly chosen higher-level physician has a higher predicted latent score than a randomly chosen lower-level one, computed over all discordant pairs.
3. The hypothesis is a JOINT statement about the covariate block, so test it with a Wald test on the household, health-condition, contact and behavioural terms simultaneously rather than reading individual p-values.
```

## A25 — Susceptibility model fit and joint hypothesis test

```
1. Use the same 242-physician frame. The outcome is self-reported annual influenza-like-illness frequency in FOUR ordered levels, distributed 8 / 153 / 67 / 14. It is never treated as five levels.
2. Fit a proportional-odds ordinal logistic model on the pre-specified set: age in ten-year units, sex, any health condition, any household school-age child, household size, respiratory allergy, current smoking, and face-to-face patient examination. Report cumulative odds ratios with Wald intervals.
3. Test the proportional-odds assumption by a likelihood-ratio comparison against the unconstrained multinomial model on the same predictors, which relaxes the constraint that one set of coefficients applies across all cut-points. Degrees of freedom are the difference in fitted parameters.
4. Report model fit as McFadden's pseudo R-squared against the intercept-only ordinal model, and discrimination as the ordinal concordance over all discordant pairs of the linear predictor.
5. Test the hypothesis jointly across age, household school-age children, health condition and current smoking. Report the likelihood-ratio form against the model with those four terms removed, and the Wald form alongside, because the two do not have to agree numerically.
```

## A26 — Prior-season care-seeking model

```
1. The population is physicians who reported an influenza-like illness in the previous season, since only they could have sought care for one. Among reporting physicians that is 201; 195 of those answered the health-condition question.
2. The outcome is whether care was sought at a health facility.
3. The pre-specified adjustment set is age, sex, any health condition, susceptibility, prior-season vaccination, current tobacco use and respiratory allergy.
```

## A26 — Prior-season care-seeking model

```
1. Eligibility is reporting an influenza-like illness in the prior season; the outcome is whether that illness led to a presentation at a health facility. NOTE that eligibility and outcome derive from the same question on the registration questionnaire, so the outcome logically implies eligibility: nobody can have presented for a prior-season illness they did not report having. The eligible set is therefore not an independent restriction, and the model estimates who among those reporting an illness sought care.
2. Of 201 eligible physicians, 195 answered the health-condition item and enter the model; 53 sought care.
3. Fit a binary logistic model on the pre-specified set: age in ten-year units, sex, any health condition, susceptibility in four ordered levels, prior-season vaccination, current smoking and respiratory allergy. No variable selection.
4. Report odds ratios with intervals and p-values, the apparent area under the curve, the Efron bootstrap optimism correction and corrected calibration slope, the Hosmer-Lemeshow statistic, and the joint test across age, susceptibility, smoking, allergy and prior-season vaccination in both the likelihood-ratio and Wald forms.
```

## A27 — Care-seeking calibration, discrimination and joint test

```
1. Apparent area under the curve, then Efron optimism correction with a thousand refitted replicates.
2. Hosmer-Lemeshow test on groups of fitted risk.
3. Joint Wald test on the block of terms the hypothesis names, rather than reading any single coefficient as the answer.
```

## A27 — Care-seeking calibration, discrimination and joint test

```
1. Eligibility is reporting an influenza-like illness in the prior season; the outcome is whether that illness led to a presentation at a health facility. NOTE that eligibility and outcome derive from the same question on the registration questionnaire, so the outcome logically implies eligibility: nobody can have presented for a prior-season illness they did not report having. The eligible set is therefore not an independent restriction, and the model estimates who among those reporting an illness sought care.
2. Of 201 eligible physicians, 195 answered the health-condition item and enter the model; 53 sought care.
3. Fit a binary logistic model on the pre-specified set: age in ten-year units, sex, any health condition, susceptibility in four ordered levels, prior-season vaccination, current smoking and respiratory allergy. No variable selection.
4. Report odds ratios with intervals and p-values, the apparent area under the curve, the Efron bootstrap optimism correction and corrected calibration slope, the Hosmer-Lemeshow statistic, and the joint test across age, susceptibility, smoking, allergy and prior-season vaccination in both the likelihood-ratio and Wald forms.
```

## A28 — Primary ILI incidence model (shared gamma-frailty Andersen-Gill)

```
1. Take the FULL filed person-week panel: 4,729 counting-process intervals from 248 physicians, 497 incident episodes. The at-risk restriction is not applied here; the panel-definition contrast is a separate sensitivity block.
2. Form the recurrent-event outcome as a counting-process survival object on the total-time clock: interval start, interval stop, and an event indicator that is one in the week an episode begins.
3. Fit a shared gamma-frailty Andersen-Gill model with a per-physician frailty term, Efron handling of ties, and the pre-specified covariate set fixed on epidemiological grounds: time-varying current-season vaccination, age in ten-year units, any household school-age child, and self-reported susceptibility in four ordered levels entered as a linear score. No variable selection of any kind is performed.
4. Print the model summary, then the four hazard ratios with Wald 95 per cent intervals and p-values, and the estimated frailty variance.
5. Confirm the frailty variance and the four hazard ratios against the values of record.
```

## A28 — Primary ILI incidence model (shared gamma-frailty Andersen-Gill)

```
1. For the interval sensitivity, rebuild the time-varying exposure indicator with the delay between the reported vaccination week and the start of protected time set to zero, one, two, three and four weeks in turn. Two weeks is the definition of record; the rest show whether the contrast depends on that choice.
2. At each delay report the number of exposed person-weeks and refit both the A-cluster and the all-ILI contrasts with the specification unchanged.
3. For the panel-definition comparison, refit the primary model on the full filed panel of 4,729 weeks (the definition of record) and then on at-risk weeks only, 4,626. The at-risk restriction removes the 103 continuation weeks, which carry no onset but do carry exposure and covariate time.
4. Print both fits and their frailty variances so the reader can see what the restriction costs.
```

## A29 — Frailty variance interval and likelihood-ratio test

```
1. Refit the primary specification at a grid of fixed frailty variances, holding the variance at each grid value rather than letting it be estimated. Record the integrated (marginal) log-likelihood at each value.
2. Locate the maximum of the profile and report twice the drop from the maximum at each grid point.
3. Invert the profile at a drop of one half of the 95th percentile of the chi-square distribution on one degree of freedom to obtain the two interval bounds by root-finding.
4. Compute the likelihood-ratio statistic for the frailty term two ways, and print both, because they answer different questions: (a) the difference between the overall likelihood-ratio statistic of the frailty model and that of the frailty-free model on the same covariates, and (b) twice the difference between the integrated log-likelihood at the fitted variance and the partial log-likelihood of the frailty-free fit.
5. Report the p-value with the one-sided boundary correction appropriate to a variance tested at zero: half the nominal chi-square tail on one degree of freedom.
```

## A32 — Vaccine effectiveness, all-ILI and by agent cluster

```
1. Keep the M5 structure and specification unchanged; only the outcome changes. Vaccine effectiveness is one minus the hazard ratio on the time-varying protected-time indicator, expressed as a percentage, with the interval obtained by transforming the two hazard-ratio bounds.
2. Fit the same shared gamma-frailty Andersen-Gill model in turn to: all incident episodes (the pre-specified primary contrast); A-cluster episodes only, the viral-systemic influenza-like presentation (the agent-restricted secondary contrast); B-cluster episodes, the viral-local presentation, which serves as the negative control because an influenza vaccine should not act on it; and C- and D-cluster episodes for completeness.
3. For each outcome print the number of events, the hazard ratio with its interval and standard error on the log scale, the p-value, the effectiveness with its interval, and the frailty variance.
4. Read the B-cluster row as the negative control: an interval covering one is the expected result and supports the A-cluster contrast being agent-specific rather than a general artefact of who gets vaccinated.
```

## A33 — A-versus-B cluster contrast (ratio of hazard ratios)

```
1. The A-cluster contrast estimates vaccine effectiveness against influenza-like episodes; the B-cluster contrast is a negative control with no influenza interpretation.
2. The ratio of the two hazard ratios asks whether vaccination acts differentially on the influenza-like cluster. Its logarithm is the difference of the two log hazard ratios.
3. The two estimates come from the same physicians, so their covariance is not zero; treating them as independent gives a conservative delta-method interval, which is what is reported.
4. The two cluster-specific hazard ratios and their standard errors are the estimates of record produced by the frailty models in the R notebook and are entered here as inputs.
```

## A33 — A-versus-B cluster contrast (ratio of hazard ratios)

```
1. Take the two log hazard ratios for the protected-time indicator from the A-cluster and B-cluster fits, together with their standard errors.
2. Form the ratio of hazard ratios by subtracting the two log hazard ratios and exponentiating.
3. Obtain the standard error of the difference by the delta method for two independent estimates, that is the square root of the sum of the two squared standard errors, and build a Wald interval on the log scale before exponentiating.
4. Report the ratio, its interval and its p-value. A ratio below one with an interval excluding one says the vaccine association is stronger for the influenza-like cluster than for the negative-control cluster.
```

## A34 — Exposed-event accounting for the vaccine contrast

```
1. For every incident episode determine whether its onset week fell under vaccine protection, that is two or more weeks after the physician's vaccination week.
2. Cross-tabulate episodes by agent cluster and exposure state.
3. Report the exposed-event count in each cluster. The A-cluster exposed count is the quantity that governs the precision of the vaccine-effectiveness estimate, so it is reported with the estimate everywhere.
```

## A34 — Exposed-event accounting for the vaccine contrast

```
1. For each outcome definition, cross-tabulate events by the state of the time-varying exposure indicator in the week the event occurred.
2. Print, for each outcome, how many of its events fell in protected person-time and the total, since the exposed-event count — not the number of physicians and not the number of person-weeks — is what determines the precision of the vaccine contrast.
```

## A38 — Occupational exposure model

```
1. Restrict the panel to the 112 physicians providing face-to-face patient examination with a daily patient-volume value.
2. Reduce to complete cases on the occupational and adjustment terms, which leaves 110 physicians, 1,724 at-risk person-weeks and 199 incident episodes.
3. Fit the same shared gamma-frailty Andersen-Gill structure with the four occupational main effects added to the pre-specified adjustment set: daily patient volume, aerosol-generating procedure share, monthly on-call shifts, consistent mask use, plus age in ten-year units, household school-age children and four-level susceptibility.
4. Fit MAIN EFFECTS ONLY. No interaction terms are estimable and none are fitted: tabulate mask use against aerosol-procedure share at physician level to show that one cell holds a single physician, which is why an interaction cannot be supported.
5. Report the seven hazard ratios with intervals, the frailty variance, and the joint four-degree-of-freedom Wald test across the four occupational terms.
```

## A39 — Joint test of the four occupational terms

```
1. The occupational hypothesis is a joint statement about four exposures — daily patient volume, monthly on-call shifts, mask use and aerosol-generating procedure share — so it is tested as a block on four degrees of freedom.
2. MAIN EFFECTS ONLY. No interaction term is fitted: one mask-by-aerosol cell holds a single physician, so no interaction is estimable.
3. Fit the count model on the occupational subgroup and take the Wald statistic for the four occupational coefficients jointly from the fitted covariance matrix.
4. The corresponding test on the frailty survival model is reported in the R notebook; both are reported so that the joint conclusion does not rest on one estimator.
```

## A39 — Joint test of the four occupational terms

```
1. Restrict the panel to the 112 physicians providing face-to-face patient examination with a daily patient-volume value.
2. Reduce to complete cases on the occupational and adjustment terms, which leaves 110 physicians, 1,724 at-risk person-weeks and 199 incident episodes.
3. Fit the same shared gamma-frailty Andersen-Gill structure with the four occupational main effects added to the pre-specified adjustment set: daily patient volume, aerosol-generating procedure share, monthly on-call shifts, consistent mask use, plus age in ten-year units, household school-age children and four-level susceptibility.
4. Fit MAIN EFFECTS ONLY. No interaction terms are estimable and none are fitted: tabulate mask use against aerosol-procedure share at physician level to show that one cell holds a single physician, which is why an interaction cannot be supported.
5. Report the seven hazard ratios with intervals, the frailty variance, and the joint four-degree-of-freedom Wald test across the four occupational terms.
```

## A40 — Recurrence count model in the occupational subgroup

```
1. Model each physician's episode count with negative-binomial regression and a log at-risk-week offset, on the same occupational specification, main effects only.
2. Report incidence-rate ratios for every term, and the dispersion parameter with its standard error; the size parameter is its reciprocal.
3. Fit the Poisson model on the same specification for comparison, and compare them with a likelihood-ratio test, which is the formal statement that overdispersion is present.
```

## A40 — Recurrence count model in the occupational subgroup

```
1. Collapse the complete-case occupational panel to one row per physician, summing incident episodes and at-risk weeks and carrying the physician-level covariates.
2. Fit a negative-binomial regression of the episode count on the same specification with the logarithm of at-risk weeks as an offset, so the coefficients are incidence-rate ratios per at-risk week.
3. Report the incidence-rate ratios with intervals, the negative-binomial size parameter with its standard error, and the implied overdispersion as the reciprocal of the size.
4. Fit the corresponding Poisson model and print the likelihood-ratio statistic against it, to show that the extra dispersion parameter is doing work.
```

## A41 — Season-level agreement of the two positivity series

```
1. The participatory positivity is A-cluster episodes over all incident episodes, pooled across the season. The sentinel positivity is influenza-positive specimens over influenza-like-illness consultations, pooled the same way.
2. Attach an exact binomial interval to each pooled proportion.
3. The season-level difference is the participatory proportion minus the sentinel proportion, in percentage points. It is a pooled quantity and is not the same as the mean of the weekly differences, which the limits-of-agreement block reports.
```

## A42 — Measurement reliability and the attenuation ceiling

```
1. Each weekly positivity is a proportion measured on a finite denominator, so its observed variance is signal variance plus binomial sampling error.
2. Estimate the binomial error variance as the mean over weeks of p(1-p)/n, and take reliability as the signal share of the observed variance. The complement is the noise share.
3. The attenuation ceiling on the correlation between the two series is the geometric mean of the two reliabilities. It is computed on the RAW weekly series, never on the smoothed ones, because smoothing changes the error variance.
```

## A43 — Phase-stratified concordance of the two positivity series

```
1. Smooth both series with a causal three-week moving average covering weeks t-2 to t. Partial windows at the season's opening are retained rather than dropped; retaining them is part of the specification because it changes the full-season coefficient.
2. Within each Moving Epidemic Method phase, and over the pre-specified early-warning window and the full season, compute the Pearson and Spearman correlation between the two smoothed series.
3. Compute the same Pearson correlations on the raw weekly series and report them beside the smoothed ones. The smoothed coefficients are the estimates of record; the raw ones are reported so the effect of smoothing is visible.
4. Attach a moving-block bootstrap interval to the early-warning estimate.
5. Recompute the post-epidemic coefficient with the flagged closing week omitted, as a disclosure of that week's influence.
```

## A46 — Lead-lag cross-correlation profile

```
1. Fix the sign convention: the participatory series is entered first, so a positive lag means the participatory series LEADS the sentinel.
2. For each lag from minus four to plus four weeks, pair the two smoothed series at that lag and compute the Pearson correlation on the overlapping weeks only.
3. Report the whole profile and locate its point maximum. The point maximum is not by itself an identified lead time; the bootstrap block settles identifiability.
```

## A47 — Peak-lag identifiability under the lag-preserving bootstrap

```
1. The quantity resampled is the whole lag procedure, not the correlation at one lag, so the bootstrap must preserve which sentinel week each participatory week is paired with.
2. Therefore: form the lagged pairs FIRST, one pair series per lag, then resample PAIRS within each lag in non-circular blocks of four weeks. Non-circularity is load-bearing — a circular-wrap variant moves the modal lag.
3. In each replicate recompute the whole profile and record which lag attains the maximum. The bootstrap distribution of that argmax is the answer.
4. Report the modal lag, its share, the share at lag zero and the 95% interval, and repeat across several seeds so that seed sensitivity is visible rather than hidden.
```

## A49 — Timing landmarks within the wave

```
1. Restrict attention to the wave, that is the pre-epidemic and epidemic weeks, so that a late off-season excursion in the participatory series cannot be read as the wave peak.
2. In each smoothed series locate the peak week within the epidemic window.
3. The half-maximum week is the first week in the epidemic window at which the smoothed series reaches half its within-window maximum.
4. Report the peak-to-peak difference in weeks and note that it is a landmark comparison, not an estimated lead time.
```

## A50 — Bland-Altman limits of agreement

```
1. Take the weekly difference between the two positivity series, participatory minus sentinel, on the raw weekly values.
2. The mean difference is the bias and the limits of agreement are that mean plus and minus 1.96 standard deviations of the differences.
3. Report the mean weekly difference and the pooled season-level difference side by side; they are different quantities and are not interchangeable.
```

## A51 — Calibration regression of one series on the other

```
1. Regress the sentinel positivity on the participatory positivity by ordinary least squares, so that the slope answers how many percentage points of sentinel positivity accompany one percentage point of participatory positivity.
2. Fit the same regression on the smoothed and on the raw series.
3. A slope far from one indicates the two series are not on a common scale; report the intercept with it.
```

## A52 — MEM epidemic-phase and intensity thresholds

```
1. The Moving Epidemic Method onset and intensity thresholds are fixed a-priori inputs estimated from ten historical sentinel seasons that this data release does not carry. They are stated as constants and are NOT derived from the season under analysis.
2. Compute the combined weekly positivity to which the onset threshold applies, and report every week that reaches it.
3. State the resulting phase calendar and confirm the phase week counts, which every phase-stratified analysis then uses without re-deriving them.
```

## A53 — Epidemic-week discrimination (AUC)

```
1. The label is membership of the Moving Epidemic Method epidemic window: nine of the thirty-three weeks.
2. Score four candidate indicators against that label: the smoothed and raw participatory positivity, the all-episode incidence rate on the AT-RISK denominator, and the smoothed sentinel positivity.
3. Attach a bootstrap interval by resampling weeks.
4. The sentinel row is a construction check, not external validation: the epidemic window was itself defined by thresholding the sentinel series, so its value is near-tautological and is labelled as such.
5. The incidence row is computed on the at-risk denominator and on the smoothed series; report the filed-denominator value beside it so the two are not confused.
```

## A54 — Calendar-window discrimination check

```
1. Because the epidemic window is defined from the sentinel series, score the same sentinel indicator against a window that takes no sentinel input: a calendar window fixed on the northern-hemisphere influenza season.
2. Report the AUC against that calendar window beside the value against the Moving Epidemic Method window, so the circularity is visible where the number is read.
3. Also shift the locked epidemic window by one week in each direction, which shows how sensitive the near-tautological value is to the window's exact placement.
```

## A55 — Six-detector aberration panel under the locked specification

```
1. Six detectors run on each of the two series: three EARS control charts, a
   negative-binomial CUSUM, an exponentially weighted moving average and a
   nonparametric percentile threshold. Farrington Flexible is not part of the bank: it
   requires several years of historical baseline and one season of data cannot supply
   it.
2. Both series enter the detection block as causal three-week moving averages, weeks
   t-2 to t. The rationale is the participatory denominator: fourteen to seventeen
   incident episodes in a typical week, so a single episode moves the A-cluster share
   by about six percentage points and the raw weekly series is dominated by sampling
   noise rather than by epidemic signal. Averaging over three weeks reduces that noise
   without looking ahead, which a detector intended for prospective use may not do.
3. EARS C1 standardizes the current value against the mean and standard deviation of
   the seven preceding weeks and alarms when the statistic exceeds three.
4. EARS C2 is the same statistic on a baseline shifted back: its seven baseline weeks
   END TWO WEEKS BEFORE the week being tested. The two intervening weeks form a guard
   band, so a rise already under way does not inflate the baseline it is judged
   against. C2 alarms when its statistic exceeds three.
5. EARS C3 accumulates, over the week being tested and the two weeks before it, the
   part of the C2 statistic that lies ABOVE ONE standard deviation, counting only
   positive excess, and alarms when that three-week sum exceeds two. C3 INHERITS C2'S
   TWO-WEEK GUARD BAND: the statistic it accumulates is the guarded one. Without the
   guard band the detector alarms at the wrong weeks in both series.
6. The count detector is a negative-binomial likelihood-ratio CUSUM on the weekly
   COUNTS of each stream — incident A-cluster episodes on the participatory side,
   positive specimens on the sentinel side — not on the smoothed share. Its in-control
   mean is the mean of the seven preceding counts, its dispersion a method-of-moments
   estimate on the same window, and its out-of-control mean twice the in-control mean.
   The statistic accumulates the negative-binomial log-likelihood ratio of the two
   means, is floored at zero, and RESETS THE ACCUMULATOR TO ZERO after an alarm, so one
   excursion raises one alarm.
7. The CUSUM decision intervals are MONTE-CARLO CALIBRATED and SERIES-SPECIFIC: each
   was fixed by simulation from that series' own fitted in-control negative binomial so
   that both streams carry a common false-alarm rate. Because the two count series
   differ in level and dispersion, one shared interval would not do this; the
   participatory interval is 1.40 and the sentinel interval 2.52, and they are not
   interchangeable.
8. The exponentially weighted moving average carries a smoothing weight of 0.4 and
   alarms when its statistic exceeds the baseline mean by three standard deviations of
   the statistic, that deviation being the seven-week baseline deviation scaled by the
   square root of the weight divided by two minus the weight. THE CONTROL LIMIT
   RE-ARMS TO THE BASELINE MEAN AFTER AN ALARM: on alarming, the statistic is set back
   to the baseline mean. Because the statistic carries its own history forward, an
   unre-armed chart stays above the limit and alarms in consecutive weeks after a
   single excursion; the re-arm is what makes one excursion raise one alarm.
9. The percentile detector alarms when the current value exceeds the ninety-fifth
   percentile of the PRIOR TEN WEEKS, a window that slides with the week being tested
   and does not expand over the season to date, so the reference distribution stays
   local to the recent past.
10. Every detector observes a seven-week warm-up in which no alarm can be raised, so
    the season's first seven weeks cannot alarm under any detector.
11. The consensus rule of record is at least one detector of six. A stricter rule of at
    least two is carried alongside and reported separately. Report the per-detector
    matrix, the per-detector alarm weeks and the consensus alarm weeks for both series.
```

## A56 — Alarm concordance by epidemic phase

```
1. Treat the sentinel consensus alarm as the reference and the participatory consensus alarm as the test, week by week.
2. Within each window compute agreement, Cohen's kappa, sensitivity, positive predictive value and the phi coefficient.
3. Report the same statistics over the full season, the early-warning window and the epidemic phase, and separately over the full season with the flagged closing week omitted, since the sparse-week rule flags that week.
4. The early-warning window of record is the nineteen weeks of the pre-epidemic and epidemic phases together, 2025-W40 to 2026-W06, which is the window fixed with the epidemic calendar. The thirteen weeks of the 2025 calendar portion, 2025-W40 to 2025-W52, are a narrower window scored alongside it and labelled as such; the two windows carry different numbers of sentinel alarms and are not interchangeable.
5. Report every window under the consensus rule of record and again under the stricter rule of at least two detectors of six.
```

## A60 — Sparse-week flagging rule

```
1. The participatory denominator in a week is all cleaned incident episodes filed that week.
2. Flag a week when that denominator falls below ten, roughly two-thirds of the thirty-three-week median.
3. Flagging is DISCLOSURE ONLY. No flagged week is excluded from any analysis and no reported coefficient changes because a week is flagged.
4. Report which weeks are flagged and which epidemic phase each falls in, so it is visible that the flagged weeks cluster at the season's opening and close.
```

## A61 — Baseline comparison of reporters and never-reporters

```
1. Compare the 248 physicians who filed at least one weekly report against the 56 who registered and filed none, over the sixteen baseline characteristics reported in the thesis table.
2. For each characteristic compute the standardized mean difference using the pooled standard deviation, with the binary form for proportions and the continuous form for means.
3. The health-condition row rests on 242 reporters, because the six physicians who declined that question stay missing rather than being imputed to zero.
4. Test proportions with Fisher's exact test and continuous variables with the Mann-Whitney U test.
5. Count how many characteristics exceed absolute differences of 0.10 and 0.25, and report them ordered by magnitude.
```

## A62 — Reporting-propensity model

```
1. The outcome is whether a registrant filed at least one weekly report. The sample is every registrant with a health-condition response: 298 of the 304, of whom 242 are reporters.
2. The adjustment set is the pre-specified baseline set of eight terms: age in ten-year units, sex, face-to-face patient care, university affiliation, any health condition conferring complication risk, susceptibility in four ordered levels, household school-age children and prior-season vaccination. It is fixed on epidemiological grounds; no variable is selected on the data.
3. Fit the logistic model, report coefficients as odds ratios, and take the apparent area under the curve on the fitting sample.
4. Correct for optimism with the Efron bootstrap: one thousand replicates, seed 20260707, REFITTING the model in every replicate and scoring each refit on both the replicate and the original sample.
5. Report the fitted propensity distribution, which the weighting block then uses.
```

## A63 — Stabilized reporting weights, Kish effective sample and design effect

```
1. The stabilized weight for a reporter is the marginal reporting probability divided by that physician's fitted propensity. Stabilization is what keeps the weights centred near one.
2. Weights are formed for reporters only, since they are the physicians who contribute person-time.
3. Report the weight range, mean and standard deviation.
4. The Kish effective sample size is the squared sum of the weights over the sum of their squares; the design effect is the nominal sample divided by it.
```

## A65 — Association of reporting propensity with the episode rate

```
1. If reporting propensity were associated with the episode rate, weighting would move the incidence estimate. Test that association directly.
2. Regress each reporter's episode count on the fitted propensity with a log at-risk week offset, Poisson family and robust variance, and report the rate ratio per unit of propensity.
3. Split reporters into propensity tertiles and report the crude rate per hundred at-risk person-weeks in each.
4. Correlate the stabilized weight with the episode count.
```

## A66 — Engagement-stratum exposure profile comparison

```
1. Compare the most engaged stratum (twenty-four or more weeks reported) with the least engaged (up to five weeks) on exposure-relevant characteristics.
2. Institution type is a five-level categorical variable and is tested with a chi-square test on the contingency table.
3. Face-to-face patient care and on-call duty are binary and are tested with a chi-square test with continuity correction.
4. Public-transport commuting time is ordinal and is tested with the Mann-Whitney U test.
```

## A67 — Reporting-intensity gradient in incidence

```
1. Aggregate the panel to one row per reporting physician: episode count and at-risk person-weeks.
2. Model the episode count with Poisson regression, a log at-risk-week offset and robust sandwich variance, so that overdispersion does not distort the interval.
3. The exposure of interest is the number of weeks reported, entered in units of ten weeks. The pre-specified adjustment set is age, household school-age children and susceptibility in four levels.
4. Report the adjusted incidence-rate ratio per ten additional reported weeks, and the unadjusted estimate beside it.
```

## A67 — Reporting-intensity gradient in incidence

```
1. Collapse the panel to one row per physician: incident episodes, at-risk weeks, and the number of weeks the physician reported, which equals the number of panel rows that physician contributes.
2. Fit a Poisson regression of the episode count on weeks reported per ten additional weeks, with age in ten-year units, household school-age children and four-level susceptibility, and the logarithm of at-risk weeks as an offset so coefficients read as incidence-rate ratios.
3. Because episode counts are clustered within physician and the Poisson variance assumption is not relied on, compute the sandwich (robust) variance directly from the model matrix, the fitted means and the response residuals, and build Wald intervals from it.
4. Report the adjusted gradient and the unadjusted gradient alongside.
5. A rate ratio below one means physicians who reported MORE weeks recorded FEWER episodes per at-risk week, which is the direction that matters for the validity limb: episode capture is denser among intermittent reporters.
```

## A68 — Stratum-specific incidence rates

```
1. Within each engagement stratum sum episodes and at-risk person-weeks.
2. Report the crude rate per hundred at-risk person-weeks with an exact Poisson interval derived from the chi-square distribution.
3. The gradient runs against intuition: the most engaged stratum has the LOWEST rate, which is what the gradient model quantifies.
```

## A68 — Stratum-specific incidence rates

```
1. Stratify physicians by how many weeks they reported into three engagement strata: most engaged, twenty-four weeks or more; moderately engaged, six to twenty-three weeks; least engaged, five weeks or fewer.
2. Within each stratum sum incident episodes and at-risk person-weeks and form the crude rate per one hundred at-risk person-weeks.
3. Attach exact Poisson intervals from the chi-square relation for a count, so the least engaged stratum with twelve episodes gets an honestly wide interval rather than a normal approximation.
4. Print the strata side by side with the season total, which must equal the incidence of record.
```

## A70 — Informative observation, forward direction

```
1. Build the forward risk set: every filed person-week that HAS a possible successor week in the season, that is, all 4,729 weeks less the 157 filed in the final week, which have no following week and so cannot contribute to the outcome. This leaves 4,572 person-weeks from 248 physicians.
2. Define the outcome as whether the same physician filed a report in the following week, by looking up that physician-week combination in the panel.
3. Cross-tabulate the outcome by whether the index week was symptomatic and report the two raw continuation percentages.
4. Report the crude pooled odds ratio ONLY to explain why it is not the quantity of record: it ignores that reporting persistence is a physician trait, so it mixes the within-physician contrast with the between-physician differences in overall diligence.
5. The estimate of record is the conditional one. Fit a mixed-effects logistic model with a per-physician random intercept and no other terms, using 30-node adaptive Gauss-Hermite quadrature, and report the conditional odds ratio with its interval, its p-value, and the random-intercept standard deviation.
```

## A71 — Post-gap episode coding, backward direction

```
1. Build the backward risk set: at-risk person-weeks that HAVE a preceding week in that physician's own record, that is, at-risk weeks less each physician's first observed week, for which no prior week exists and so no gap can be defined. This leaves 4,378 person-weeks from 232 physicians with 449 events.
2. The exposure is whether a reporting gap falls immediately before the week; the outcome is whether a symptomatic week is coded as a new onset rather than a continuation.
3. Cross-tabulate and report the two raw percentages coded incident.
4. Fit the same mixed-effects logistic model with a per-physician random intercept by 30-node adaptive Gauss-Hermite quadrature; report the conditional odds ratio with its Wald interval, its p-value, the profile-likelihood interval, and the random-intercept standard deviation.
5. Fit the marginal, population-averaged model by generalized estimating equations with an exchangeable working correlation clustered on physician, and report it alongside — the two answer different questions and the conditional estimate is the one of record.
```

## A73 — Episodes attributable to the coding rule

```
1. The episode-coding rule treats a symptomatic week as a NEW episode when the preceding week in the physician's own record was not filed, because continuity cannot be established across a gap.
2. Enumerate incident onsets that fall in a week preceded by a gap, and among those, the ones where the last week actually filed before the gap was itself symptomatic. Those are the onsets the rule creates: continuity would have been plausible.
3. Report that count against all incident episodes, and separately the subset where the gap was a single week, where the attribution is strongest.
```

## A73 — Episodes attributable to the coding rule

```
1. Under the linkage rule a symptomatic week is coded as a continuation only if the immediately preceding week was also filed and symptomatic. A gap therefore breaks the link, and an ongoing illness that spans an unfiled week is counted as a new onset.
2. Enumerate the onsets to which this can apply: onsets that follow a reporting gap AND whose last filed week before the gap was symptomatic. These are the onsets the rule creates, because linkage across the gap would have merged them into the earlier illness.
3. Report that count and its share of the 497 onsets, then the subset with a gap of exactly one week, which is the most plausible single continuing illness.
4. Print the distribution of gap length before those onsets so the reader can see how the count is composed.
```

## A75 — Differential ascertainment by agent cluster

```
1. If more engaged physicians ascertained episodes differently, the CLUSTER MIX of their episodes would differ, not just the episode count.
2. Cross-tabulate incident episodes by engagement stratum and agent cluster and test the composition with a chi-square test.
3. Report the A-cluster share within each stratum, which is the quantity the system-level analysis depends on.
4. Refit the reporting-intensity gradient on the B-cluster episodes alone, as a negative control: B-cluster episodes have no influenza interpretation, so a gradient there indicates a reporting artefact rather than an incidence difference.
```

## A76 — Panel effective sample size and design effect

```
1. Person-weeks within a physician are correlated, so the nominal 4,729 rows carry less information than 4,729 independent observations.
2. Estimate the intracluster correlation of the event indicator with the one-way analysis-of-variance estimator on the observed panel.
3. The design effect is one plus the mean cluster size minus one, times the intracluster correlation; the effective sample is the nominal panel divided by it.
4. Report the ACHIEVED value from these data, and separately the planning value that follows from the intracluster correlation assumed at the design stage. The two are different quantities and the planning one is labelled as such.
```

## A30 — Descriptive covariate screen for the incidence model

```
1. This block exists to describe the covariate space, NOT to choose covariates. The adjustment set of the primary model was fixed in advance on epidemiological grounds and is not revised in light of anything printed here.
2. Fit each candidate covariate on its own in an Andersen-Gill model with a physician-clustered robust variance, and print the hazard ratio with its interval and p-value.
3. Then fit the multivariable descriptive model, whose complete-case sample of 4,668 person-weeks reflects the six declined health-condition responses being kept missing rather than imputed.
4. Report the social-contact score row explicitly: it is not in the primary adjustment set and its interval covers one.
```

## A31 — Estimator-family comparison for the incidence model

```
1. The primary incidence estimate comes from one recurrent-event family. Refit the SAME pre-specified specification under several defensible families and read across them, so that no substantive claim rests on one estimator's assumptions.
2. Families fitted here: Andersen-Gill on the counting-process panel without a frailty term, offset Poisson at the physician level with robust variance, and negative-binomial at the physician level with the same offset.
3. The Prentice-Williams-Peterson stratification and the shared gamma-frailty fit are estimated in the R notebook; they belong to the same comparison and are read alongside these.
4. Report the four pre-specified effects under each family, not a single headline number.
```

## A31 — Estimator-family comparison for the incidence model

```
1. Hold the specification fixed and vary only the estimator, so that any movement in the four effects is attributable to the estimator family and not to a change of model.
2. The six families are: the shared gamma-frailty Andersen-Gill model of record; Andersen-Gill with a physician-clustered robust variance instead of a frailty; the Prentice-Williams-Peterson model, stratified by episode order on the total-time clock with the order capped at the fourth episode; a Poisson regression at physician level with a log at-risk-week offset; a negative-binomial regression with the same offset; and a Cox model on the first episode only, which discards recurrences.
3. For the two count families the time-varying vaccination indicator cannot be carried week by week, so it enters as the physician's share of protected weeks. Note this: the vaccine column is not strictly comparable across the six rows, while age, household children and susceptibility are.
4. Print the four effects for each family and the range across families.
5. Report the Prentice-Williams-Peterson row in detail, because conditioning on episode order removes the between-physician contrast that the frailty model retains and so attenuates the household-children and susceptibility effects.
```

## A35 — Minimum detectable vaccine effect and achieved power

```
1. Under Schoenfeld's formula the standard error of a log hazard ratio is one over the square root of the event count times the exposed share times one minus the exposed share. The exposed share here is the protected person-time share.
2. THREE DISTINCT QUANTITIES follow and must not be confused: the all-ILI DESIGN boundary on all 497 events; the A-cluster DESIGN boundary on the 91 A-cluster events, which is the boundary of record for the vaccine contrast; the effect implied by the A-cluster fit's OWN observed standard error, which is not a design boundary at all.
3. A detectable effect at 80% power uses the sum of the two-sided critical value and the one-sided power quantile, not the critical value alone.
4. Also report the power the study had at an assumed true effect, computed from the observed standard error.
```

## A35 — Minimum detectable vaccine effect and achieved power

```
1. Fix the exposure allocation at the achieved share of protected person-time from the partition block. This is a design input, not an estimate.
2. Under Schoenfeld's approximation the standard error of the log hazard ratio is one over the square root of the number of events times the exposure share times one minus that share. At two-sided five per cent significance and eighty per cent power the smallest detectable log hazard ratio is minus the sum of the two normal quantiles times that standard error.
3. Compute THREE quantities that are distinct and must never be interchanged. First, the all-ILI DESIGN boundary, using the 497 all-ILI events. Second, the A-cluster DESIGN boundary, using the 91 A-cluster events — this is the boundary of record for the agent-restricted contrast. Third, the effect implied by the A-cluster fit's OWN observed standard error, which is larger than the design standard error because the frailty model spends information on the physician random effect; this third quantity is not a design boundary at all.
4. State explicitly where the observed A-cluster effectiveness sits relative to the A-cluster design boundary.
5. Compute the power the design actually had against assumed true effectiveness values, using both the design standard error and the observed one.
6. Compute the exaggeration a significant estimate would carry if the true effectiveness were thirty per cent, by simulating from the sampling distribution at that truth and keeping only the replicates that reach significance. Report the factor on the EFFECTIVENESS scale — the mean significant effectiveness divided by the true thirty per cent — and, separately, the factor on the log-hazard scale, since the two are different numbers and the effectiveness-scale factor is the one that describes what a reader of a significant estimate would take away.
7. Invert the same formula to give the number of events that eighty per cent power would require at smaller true effects.
```

## A36 — Naive ever-vaccinated comparison (two-week interval sensitivity)

```
1. The exposure coding of record makes a person-week protected only two weeks after vaccination. A naive alternative treats every person-week of a vaccinated physician as exposed, so weeks before vaccination and weeks inside the interval count as protected.
2. Refit the incidence model under the naive coding, unadjusted and adjusted, and put both beside the time-varying estimate.
3. The naive coding attributes to vaccination the person-time before the vaccine could act, so it inflates apparent effectiveness. Report all three to make that visible.
```

## A36 — Naive ever-vaccinated comparison (two-week interval sensitivity)

```
1. Replace the time-varying protected-time indicator with a fixed ever-vaccinated indicator that treats a physician as exposed for the whole season, including the weeks before vaccination. This is the coding the time-varying definition is designed to avoid, and it is fitted only to show what that avoidance is worth.
2. Fit it unadjusted and adjusted, keeping the frailty and the rest of the specification unchanged, for all-ILI and for the A-cluster.
3. Print the crude rates on the at-risk denominator by ever-vaccinated status, and within vaccinated physicians the rate in protected against pre-protection weeks.
4. Also fit the first-episode-only version of both codings, since restricting to the first episode is where the two codings separate most.
5. Add the physician-level attack-rate contrast under the same fixed exposure, since a naive comparison is often made on that scale rather than on person-time.
6. State the direction of the bias: attributing pre-vaccination person-time to the exposed state moves the all-ILI estimate away from the time-varying result of record, and the physician-level attack-rate contrast moves it further still, because it drops the within-physician timing information entirely.
```

## A37 — Vaccinated-versus-unvaccinated covariate balance

```
1. Vaccination was not randomised, so the vaccinated and unvaccinated groups may differ on the covariates the model adjusts for.
2. Compare the two groups over the pre-specified adjustment set and the main baseline characteristics, as proportions or means with standardized mean differences.
3. Any imbalance the model adjusts for is handled; an imbalance on a variable the model does not carry is a residual-confounding concern and is named as such.
```

## A37 — Vaccinated-versus-unvaccinated covariate balance

```
1. Compare the pre-specified baseline covariates between physicians who reported a current-season vaccination and those who did not, at physician level over the reporting cohort.
2. Print the mean or proportion in each group with the group denominators, and the standardized mean difference, computed with the pooled standard deviation so binary and continuous variables are on one scale.
3. This is a balance description, not a test-based screen. It shows which pre-specified adjustments carry weight in the vaccine contrast — particularly the health-condition item and household school-age children.
```

## A44 — Detrended and first-difference concordance checks

```
1. Both series rise and fall over the season, so part of their correlation may be a shared trend rather than week-to-week co-movement.
2. Remove a linear trend from each series within the window under test and correlate the residuals.
3. Separately correlate the first differences, which is the strictest form of the question: do the two series move together from one week to the next?
4. Report both beside the level correlation. A first-difference coefficient much smaller than the level coefficient means the agreement is largely in the trend.
```

## A45 — Complete-window smoothing sensitivity

```
1. The causal three-week average retains partial windows in the season's first two weeks, where fewer than three weeks are available. That retention is part of the specification.
2. Refit the full-season correlation using complete three-week windows only, which drops those two weeks.
3. Report both, since dropping partial windows moves the coefficient materially and the reader must see which convention produced which number.
```

## A48 — Pairing-broken resampling comparison

```
1. An alternative bootstrap resamples the week INDEX first and only then forms the lagged pairs. This looks similar but destroys the pairing that the lag procedure is about: after resampling, a week's neighbour at lag L is no longer the week that was actually L weeks away.
2. Run it and report the result, then state plainly that the concentration it produces at lag zero is an artefact of the procedure and not a finding.
3. The lag-preserving procedure — pairs formed first, then pairs resampled — is the procedure of record.
```

## A57 — CUSUM reset-rule equivalence check

```
1. THE RULE OF RECORD IS THE RESET: the negative-binomial CUSUM zeroes its accumulator
   after an alarm, so one excursion above the decision interval raises one alarm. This
   block exists to show what that clause is worth, by scoring the alternatives beside it.
2. The alternatives are the persistent accumulator, which keeps the statistic running and
   alarms in every week it stays above the interval, and the first-upcrossing rule, which
   keeps it running but alarms only in the week it first crosses. If two alarms never fall
   in consecutive weeks the three rules can coincide; if the accumulator stays above the
   interval for several weeks they do not.
3. Compare the alarm sets under all three rules across a grid of decision intervals around
   each series' own calibrated value, on both series.
4. Report whether the sets are identical in every combination, and whether any alarm falls
   in consecutive weeks, since that is the condition under which the rules can agree. THE
   RESET IS LOAD-BEARING AT THE CALIBRATED INTERVALS: the accumulated log-likelihood ratio
   stays above the interval for several weeks on both count series, so the persistent
   accumulator raises many more alarms than the reset rule does and the rules are not
   interchangeable.
```

## A58 — Specification curve for alarm concordance

```
1. Enumerate every defensible specification of the alarm-concordance analysis rather
   than reporting one. The enumeration is the product set carried by the aberration
   analysis: three measured quantities, three smoothing conventions, two baseline
   lengths, two standard-deviation thresholds and two consensus rules, giving
   seventy-two specifications.
2. The three measured quantities are the A-cluster share of incident episodes against
   sentinel positivity, which is the pair of record; the all-ILI weekly count of each
   system, that is every cleaned incident episode against every positive specimen; and
   a per-denominator rate, A-cluster episodes per hundred reporters against positive
   specimens per hundred consultations.
3. The three smoothing conventions are the raw weekly series, the causal three-week
   average of record and a symmetric three-week average. Each specification is built from
   the UNSMOOTHED quantity and smoothed once, so no series is smoothed twice. The partial
   windows at the season's opening and closing are RETAINED under all three conventions,
   which is the convention the panel of record is produced under; dropping them instead
   costs the participatory chart its closing-week alarm and the sentinel chart its
   2025-W52 alarm. Complete-window smoothing is scored as its own sensitivity analysis,
   not silently inside this grid.
4. In each specification run the whole six-detector bank on both series, with the
   specification's own baseline length and standard-deviation threshold in force, and
   compute Cohen's kappa between the two consensus alarm series. The negative-binomial
   CUSUM keeps its series-specific calibrated decision intervals throughout, since
   those were calibrated on the count series and not on the quantity under variation.
5. Score every specification on the full thirty-three-week season, which is the window
   of record for this curve, and on the nineteen-week early-warning window alongside.
6. Report the median, the range, the interquartile range, the share reaching
   substantial agreement at or above 0.60 and the share below 0.40, and identify the
   specifications producing the maximum and the minimum.
7. Report the median kappa separately by measured quantity, smoothing convention and
   consensus rule; locate the specification of record on the curve by its rank; and
   name every specification that scores above it, with the margin by which it does.
```

## A59 — Alarm-window influence of the sparse closing week

```
1. The final week of the season is flagged by the sparse-week rule and it carries a participatory alarm that the sentinel series does not.
2. Recompute the full-season agreement with that week omitted, and report both values.
3. This is influence disclosure, not exclusion: the value of record is the one computed on all thirty-three weeks.
4. Write the week-by-week alarm comparison for all thirty-three weeks, carrying the per-detector count, the consensus alarm under both rules and the phase of each week.
```

## A64 — IPRW re-estimation of the primary incidence model

```
1. Inverse-probability-of-reporting weighting is a SENSITIVITY ANALYSIS, not the estimation method. The estimates of record are unweighted.
2. Attach each physician's stabilized reporting weight to every one of that physician's person-weeks and refit the incidence specification with those weights.
3. Compare each weighted coefficient with its unweighted counterpart, and express the shift as a percentage of that coefficient's OWN unweighted interval width, which is the scale on which a shift is or is not material.
```

## A69 — Overdispersion sensitivity for the gradient

```
1. The reporting-intensity gradient of record is an offset Poisson fit with robust variance, which is consistent under overdispersion.
2. Refit the same specification as a negative-binomial model, which models the extra variance rather than correcting the standard errors for it.
3. Report both, plus the dispersion parameter and the formal overdispersion test. This block has no single scalar target; it is a comparison of two fits.
```

## A69 — Overdispersion sensitivity for the gradient

```
1. Refit the reporting-intensity gradient on exactly the same specification and offset as a negative-binomial regression, which estimates a dispersion parameter instead of relying on a robust variance to absorb extra-Poisson variation.
2. Report the incidence-rate ratios, the size parameter with its standard error, and the likelihood-ratio statistic against the Poisson fit.
3. This analysis has NO single scalar target of record; it is reported to show that the gradient does not depend on how dispersion is handled. Compare the gradient with the robust-variance Poisson estimate from the previous block.
```

## A72 — Risk-set sensitivity of the post-gap odds ratio

```
1. The post-gap coding comparison requires a preceding week in the physician's own record, so every physician's first observed week is outside the risk set. Several other risk sets are defensible.
2. Recompute the crude association across four risk sets: the one of record; all at-risk weeks including each first week; the risk set of record with the final season week removed; and all FILED weeks after the first observed week rather than only at-risk weeks.
3. Report the crude odds ratio in each, so the range is visible. The conditional estimate of record, which carries the physician random intercept, is fitted in the R notebook.
```

## A72 — Risk-set sensitivity of the post-gap odds ratio

```
1. Refit the post-gap conditional model across four defensible risk-set definitions, changing only which person-weeks are eligible and leaving the estimator and the specification untouched.
2. The four are: at-risk weeks with each physician's first observed week dropped, which is the definition of record; at-risk weeks with no first-week exclusion; all filed weeks with the first observed week dropped; and at-risk weeks with both the first week and continuation weeks dropped.
3. For each, report the risk-set size, the number of physicians and events, the conditional odds ratio with its interval, and the random-intercept standard deviation.
4. The reported range across definitions is the sensitivity result. It should keep the same direction and significance throughout.
```

## A74 — Bounding incidence over unfiled interior person-weeks

```
1. A physician's interior grid is every week from their first observed week to their last, whether filed or not. Unfiled interior weeks are weeks in which an episode could have occurred and gone unreported.
2. Enumerate those weeks and express them as a share of the interior grid.
3. Bound the season incidence deterministically across a stated sensitivity parameter k, the ratio of the episode rate in unfiled weeks to the observed rate: k below one means unfiled weeks were quieter, above one that they were busier.
4. Report the bound across a range of k so that the reader sees the whole band rather than one assumption.
```

## A77 — Cochran precision and prospective panel size

```
1. Under Cochran's formula the sample size for a target half-width on a proportion is the squared critical value times the proportion times its complement, over the squared half-width.
2. Invert it to state the half-width the achieved panel supports, using the effective sample rather than the nominal one, because person-weeks within a physician are correlated.
3. Report the independent-observation requirement for a five-percentage-point margin, and the number of reports that requirement implies once the design effect is applied.
4. Report the requirement under both the achieved and the planning design effect, and label which is which.
```

## A78 — Weeks required to establish the observed concordance

```
1. Under Fisher's z transformation the standard error of a transformed correlation is one over the square root of the sample size minus three.
2. Invert that at 80% power and a two-sided 5% level to state the number of weeks a season would need to establish a correlation of the observed size.
3. Report the requirement for the early-warning coefficient and for the full-season coefficient, since they differ in size and therefore in the season length they need.
```

## A79 — Events required for smaller true vaccine effects

```
1. Invert Schoenfeld's formula at 80% power to state how many events a study needs to detect a stated true effectiveness, at the exposed person-time share achieved here.
2. Report the requirement at several true effects and place the achieved A-cluster event count against them, which is the statement of what this season could and could not have detected.
```

## A79 — Events required for smaller true vaccine effects

```
1. Fix the exposure allocation at the achieved share of protected person-time from the partition block. This is a design input, not an estimate.
2. Under Schoenfeld's approximation the standard error of the log hazard ratio is one over the square root of the number of events times the exposure share times one minus that share. At two-sided five per cent significance and eighty per cent power the smallest detectable log hazard ratio is minus the sum of the two normal quantiles times that standard error.
3. Compute THREE quantities that are distinct and must never be interchanged. First, the all-ILI DESIGN boundary, using the 497 all-ILI events. Second, the A-cluster DESIGN boundary, using the 91 A-cluster events — this is the boundary of record for the agent-restricted contrast. Third, the effect implied by the A-cluster fit's OWN observed standard error, which is larger than the design standard error because the frailty model spends information on the physician random effect; this third quantity is not a design boundary at all.
4. State explicitly where the observed A-cluster effectiveness sits relative to the A-cluster design boundary.
5. Compute the power the design actually had against assumed true effectiveness values, using both the design standard error and the observed one.
6. Compute the exaggeration a significant estimate would carry if the true effectiveness were thirty per cent, by simulating from the sampling distribution at that truth and keeping only the replicates that reach significance. Report the factor on the EFFECTIVENESS scale — the mean significant effectiveness divided by the true thirty per cent — and, separately, the factor on the log-hazard scale, since the two are different numbers and the effectiveness-scale factor is the one that describes what a reader of a significant estimate would take away.
7. Invert the same formula to give the number of events that eighty per cent power would require at smaller true effects.
```

## A80 — Reliability required to observe higher correlations

```
1. The observable correlation between two error-laden series is bounded by the geometric mean of their reliabilities.
2. Hold the sentinel reliability fixed and invert that relation to find the participatory reliability a target correlation would require.
3. Report the requirement for several targets beside the reliability actually achieved, which states how much measurement improvement each target would take.
```
