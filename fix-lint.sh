#!/bin/bash

# Fix react/no-unescaped-entities - replace ' with &apos; or use proper quotes
sed -i '' "s/don't/don\&apos;t/g" src/app/\(auth\)/login/page.tsx
sed -i '' "s/can't/can\&apos;t/g" src/app/app/integrations/page.tsx
sed -i '' "s/Let's/Let\&apos;s/g" src/app/app/onboarding/page.tsx
sed -i '' "s/you're/you\&apos;re/g" src/app/app/projects/\[projectId\]/ai/page.tsx
sed -i '' "s/We'll/We\&apos;ll/g" src/app/security/page.tsx
sed -i '' "s/won't/won\&apos;t/g" src/components/copilot/collections-interface.tsx
sed -i '' "s/doesn't/doesn\&apos;t/g" src/components/copilot/simulator-interface.tsx

echo "Fixed react/no-unescaped-entities"
