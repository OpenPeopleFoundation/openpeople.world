# Makefile – helper commands for Open People site
# Usage:
#   make update-kpi        # pull latest swl-kpi submodule and commit pointer
#   make update-kpi-hard   # same, but resets submodule to remote HEAD
#   make submodules        # init/update all submodules recursively

.PHONY: update-kpi update-kpi-hard submodules

SUBMOD_DIR := external/swl-kpi
CI_NAME := Tom Lane
CI_EMAIL := tom@openpeople.me

submodules:
	git submodule update --init --recursive

update-kpi: submodules
	@echo "→ Updating $(SUBMOD_DIR) to latest remote…"
	git -C $(SUBMOD_DIR) fetch --all
	# Try to fast-forward to the submodule's tracked branch (usually origin/main)
	git -C $(SUBMOD_DIR) checkout $$(git -C $(SUBMOD_DIR) rev-parse --abbrev-ref --symbolic-full-name @{u} | sed 's#.*/##') 2>/dev/null || git -C $(SUBMOD_DIR) checkout main || true
	git -C $(SUBMOD_DIR) pull --ff-only || true
	# Stage the new pointer if it changed
	git add $(SUBMOD_DIR)
	@if git diff --cached --quiet; then \
		echo "✓ swl-kpi already up-to-date"; \
	else \
		echo "→ Committing bumped submodule pointer…"; \
		git -c user.name="$(CI_NAME)" -c user.email="$(CI_EMAIL)" commit -m "chore: bump swl-kpi submodule to latest"; \
		git push; \
		echo "✓ Pushed submodule update"; \
	fi

update-kpi-hard: submodules
	@echo "→ Hard resetting $(SUBMOD_DIR) to remote HEAD (origin/main)…"
	git -C $(SUBMOD_DIR) fetch origin
	git -C $(SUBMOD_DIR) checkout -B main origin/main || true
	git add $(SUBMOD_DIR)
	@if git diff --cached --quiet; then \
		echo "✓ No pointer change needed"; \
	else \
		echo "→ Committing bumped submodule pointer…"; \
		git -c user.name="$(CI_NAME)" -c user.email="$(CI_EMAIL)" commit -m "chore: bump swl-kpi submodule (hard reset to origin/main)"; \
		git push; \
		echo "✓ Pushed submodule update"; \
	fi
