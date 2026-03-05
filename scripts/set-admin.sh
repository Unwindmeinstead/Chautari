#!/bin/bash
SUB_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | head -n 1 | cut -d'=' -f2)
SUB_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY" .env.local | head -n 1 | cut -d'=' -f2)

echo "URL: $SUB_URL"
echo "Target: tika.ghimirey1@gmail.com"

# Fetch all users (pagination might be needed if there are many, but usually it's fine for small sets)
USERS_JSON=$(curl -s -X GET "${SUB_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUB_KEY}" \
  -H "Authorization: Bearer ${SUB_KEY}")

# Find the ID for the email
USER_ID=$(echo "$USERS_JSON" | grep -B 20 "tika.ghimirey1@gmail.com" | grep -m 1 '"id":' | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
  echo "User not found in Auth."
  # Print some emails to debug
  echo "Emails found:"
  echo "$USERS_JSON" | grep '"email":' | cut -d'"' -f4
  exit 1
fi

echo "Found User ID: $USER_ID"

# Update profile
echo "Updating role..."
RES=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "${SUB_URL}/rest/v1/profiles?id=eq.${USER_ID}" \
  -H "apikey: ${SUB_KEY}" \
  -H "Authorization: Bearer ${SUB_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"role": "switchmycare_admin"}')

if [ "$RES" == "204" ] || [ "$RES" == "200" ]; then
  echo "Success! Role updated to switchmycare_admin."
else
  echo "Failed to update role. HTTP Code: $RES"
fi
