#!/bin/bash
# Manual script to fetch and display lift status
# Usage: bash fetch-lifts.sh

echo "Fetching lift status for St. Anton am Arlberg..."
echo "=============================================="

# Fetch from Liftie API
curl -s "https://liftie.info/api/resort/st-anton-am-arlberg" | python3 -m json.tool 2>/dev/null || curl -s "https://liftie.info/api/resort/st-anton-am-arlberg"

echo ""
echo "=============================================="
echo "If no data shown, the API may be temporarily unavailable."
echo "The website uses a CORS proxy to fetch this data."
