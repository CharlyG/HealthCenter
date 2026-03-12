#!/bin/bash

# Design System Compliance Checker
# Automated checking for design system rules compliance

echo "╔═══════════════════════════════════════════════════╗"
echo "║   Design System Compliance Checker v1.0           ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run a check
run_check() {
  local check_name=$1
  local check_command=$2
  
  echo -n "Checking: $check_name... "
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  
  if eval "$check_command" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    return 0
  else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    return 1
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. TOKEN USAGE CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check 1: No hardcoded hex colors
run_check "No hardcoded hex colors" \
  "! grep -r --include='*.tsx' --include='*.ts' --exclude-dir=node_modules --exclude-dir=.next '#[0-9a-fA-F]\{3,8\}' src/ | grep -v '//' | grep -v '/\*'"

# Check 2: No hardcoded RGB colors
run_check "No hardcoded RGB colors" \
  "! grep -r --include='*.tsx' --include='*.ts' --exclude-dir=node_modules --exclude-dir=.next 'rgb(' src/ | grep -v '//' | grep -v '/\*'"

# Check 3: No direct foundation imports
run_check "No direct foundation imports" \
  "! grep -r --include='*.tsx' --include='*.ts' --exclude-dir=node_modules 'from.*foundations/tokens' src/"

# Check 4: Semantic tokens are imported
SEMANTIC_IMPORT_COUNT=$(grep -r --include='*.tsx' --include='*.ts' --exclude-dir=node_modules "from.*semantic/tokens" src/ | wc -l)
run_check "Semantic tokens imported (found $SEMANTIC_IMPORT_COUNT)" \
  "[ $SEMANTIC_IMPORT_COUNT -gt 0 ]"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. COMPONENT PATTERN CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check 5: Healthcare components use React.memo
HC_TOTAL=$(find src/app/components/design-system/healthcare -name '*.tsx' 2>/dev/null | wc -l)
HC_MEMO=$(grep -r --include='*.tsx' 'React.memo' src/app/components/design-system/healthcare 2>/dev/null | wc -l)
run_check "Healthcare components use React.memo ($HC_MEMO/$HC_TOTAL)" \
  "[ $HC_MEMO -eq $HC_TOTAL ]"

# Check 6: Components have displayName
HC_DISPLAYNAME=$(grep -r --include='*.tsx' '.displayName' src/app/components/design-system/healthcare 2>/dev/null | wc -l)
run_check "Components have displayName ($HC_DISPLAYNAME/$HC_TOTAL)" \
  "[ $HC_DISPLAYNAME -eq $HC_TOTAL ]"

# Check 7: Components export types
HC_EXPORT_TYPES=$(grep -r --include='*.tsx' 'export.*interface.*Data' src/app/components/design-system/healthcare 2>/dev/null | wc -l)
run_check "Components export data types ($HC_EXPORT_TYPES found)" \
  "[ $HC_EXPORT_TYPES -gt 0 ]"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. PAGE PATTERN CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check 8: ListPageShell usage
LISTPAGESHELL_COUNT=$(grep -r --include='*.tsx' 'ListPageShell' src/app/pages 2>/dev/null | wc -l)
run_check "ListPageShell pattern used ($LISTPAGESHELL_COUNT pages)" \
  "[ $LISTPAGESHELL_COUNT -gt 0 ]"

# Check 9: Pagination usage
PAGINATION_COUNT=$(grep -r --include='*.tsx' 'Paginated' src/app/pages 2>/dev/null | wc -l)
run_check "Pagination implemented ($PAGINATION_COUNT occurrences)" \
  "[ $PAGINATION_COUNT -gt 0 ]"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. DATA LOADING CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check 10: dataGateway usage
DATAGATEWAY_COUNT=$(grep -r --include='*.tsx' 'dataGateway' src/app/pages 2>/dev/null | wc -l)
run_check "dataGateway pattern used ($DATAGATEWAY_COUNT occurrences)" \
  "[ $DATAGATEWAY_COUNT -gt 0 ]"

# Check 11: Server-side pagination
SERVERPAGINATION_COUNT=$(grep -r --include='*.tsx' 'Paginated' src/app/lib 2>/dev/null | wc -l)
run_check "Server-side pagination functions ($SERVERPAGINATION_COUNT)" \
  "[ $SERVERPAGINATION_COUNT -gt 0 ]"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

COMPLIANCE_PERCENT=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo "Total Checks: $TOTAL_CHECKS"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed: ${RED}$FAILED_CHECKS${NC}"
echo "Compliance: $COMPLIANCE_PERCENT%"

echo ""

if [ $COMPLIANCE_PERCENT -ge 90 ]; then
  echo -e "${GREEN}✅ EXCELLENT! Design system compliance is at $COMPLIANCE_PERCENT%${NC}"
  exit 0
elif [ $COMPLIANCE_PERCENT -ge 75 ]; then
  echo -e "${YELLOW}⚠️  GOOD! Design system compliance is at $COMPLIANCE_PERCENT% (target: 90%)${NC}"
  exit 0
else
  echo -e "${RED}❌ NEEDS WORK! Design system compliance is at $COMPLIANCE_PERCENT% (target: 90%)${NC}"
  exit 1
fi
