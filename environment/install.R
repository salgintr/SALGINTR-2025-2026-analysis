# Install the R packages this analysis needs, at the versions the reported results used.
# Run from the repository root:  Rscript environment/install.R

pkgs <- c(survival = "3.8.9", MASS = "7.3.66", lme4 = "2.0.6",
          geepack = "1.3.13", nloptr = "2.2.1", Matrix = "1.7.5")

if (!requireNamespace("remotes", quietly = TRUE)) {
  install.packages("remotes", repos = "https://cloud.r-project.org")
}

for (p in names(pkgs)) {
  want <- pkgs[[p]]
  have <- tryCatch(as.character(packageVersion(p)), error = function(e) NA_character_)
  if (is.na(have)) {
    message(sprintf("installing %s %s", p, want))
    remotes::install_version(p, version = want, repos = "https://cloud.r-project.org", upgrade = "never")
  } else if (have != want) {
    message(sprintf("%s is %s, reported results used %s — install the pinned version if results differ", p, have, want))
  } else {
    message(sprintf("%s %s already present", p, have))
  }
}

sessionInfo()
