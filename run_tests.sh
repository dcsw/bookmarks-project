#!/usr/bin/env bash
# This script activates the virtual environment using uv and runs pytest.
# Ensure you have uv installed and a uv lockfile in the repository root.

# Run pytest via uv
uv run pytest
