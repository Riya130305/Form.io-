#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Testing Share Form Flow ===${NC}\n"

# Step 1: Admin Login
echo -e "${BLUE}[1] Admin Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/admin/login \
  -H "Content-Type: application/json" \
  -d '{"data":{"email":"admin@example.com","password":"Admin@1234"}}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"x-jwt-token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "Failed to get admin token"
  exit 1
fi

# Step 2: Save a test form
echo -e "\n${BLUE}[2] Saving Test Form...${NC}"
SAVE_RESPONSE=$(curl -s -X POST http://localhost:3001/form \
  -H "Content-Type: application/json" \
  -H "x-jwt-token: $TOKEN" \
  -d '{
    "title":"Test Share Form",
    "name":"testshareform-'$(date +%s)'",
    "path":"testshareform-'$(date +%s)'",
    "type":"form",
    "display":"form",
    "components":[
      {
        "type":"textfield",
        "key":"testField",
        "label":"Test Field"
      }
    ]
  }')

FORM_ID=$(echo "$SAVE_RESPONSE" | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)
FORM_PATH=$(echo "$SAVE_RESPONSE" | grep -o '"path":"[^"]*' | cut -d'"' -f4 | head -1)

echo "Form ID: $FORM_ID"
echo "Form Path: $FORM_PATH"

if [ -z "$FORM_ID" ]; then
  echo "Failed to save form"
  echo "Response: $SAVE_RESPONSE"
  exit 1
fi

# Step 3: Fetch the form to verify it can be retrieved
echo -e "\n${BLUE}[3] Fetching Form by ID...${NC}"
FETCH_RESPONSE=$(curl -s -X GET http://localhost:3001/form/$FORM_ID)

FETCHED_TITLE=$(echo "$FETCH_RESPONSE" | grep -o '"title":"[^"]*' | cut -d'"' -f4)
echo "Fetched Title: $FETCHED_TITLE"

if [ "$FETCHED_TITLE" != "Test Share Form" ]; then
  echo "Warning: Fetched title doesn't match"
  echo "Full Response: $FETCH_RESPONSE"
fi

echo -e "\n${GREEN}✅ Form share flow test completed!${NC}"
echo "Form ID for testing: $FORM_ID"
