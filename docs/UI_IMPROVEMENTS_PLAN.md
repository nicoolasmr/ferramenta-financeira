# 🎨 UI/UX Improvement Plan (Priority Fixes)

This document outlines immediate visual improvements requested by the Product Owner.
**Status:** Planned (To be executed in next UI Sprint).

## 1. Integrations Page: Enable All Providers
**Context:** Currently, only Stripe/Hotmart/Asaas are visible. Others are hidden under a "Coming Soon" label.
**Goal:** Remove the "Em breve" limitation and display all integrations as active (or at least clickable/configurable).

**Target Files:**
- `src/app/app/integrations/client.tsx` (Likely contains the rendering logic).
- `src/lib/integrations/providers.ts` (Definition of the list).

**Action Items:**
- [ ] Remove the "Em breve" filter/text.
- [ ] Ensure cards for Kiwify, Eduzz, Lastlink, Mercado Pago, and PagSeguro are rendered.
- [ ] Verify if they have icons/logos ready.

## 2. Remove Legacy Dashboard Hero Image
**Context:** The current dashboard preview image is considered "ugly" and outdated.
**Goal:** Remove it from the landing page/hero section.

**Target Files:**
- `public/dashboard-hero.png` (Asset).
- `src/components/landing/Hero.tsx` or similar (Usage).

**Action Items:**
- [ ] Locate usage of `dashboard-hero.png`.
- [ ] Delete the `img` tag or replace with a CSS-only container/screenshot component.
- [ ] Remove the file from `public/`.

## 3. Fix Low Contrast Buttons (Accessibility)
**Context:** The "Comece agora" button in the pricing section (`src/app/(marketing)/page.tsx`) uses `bg-indigo-600` but relies on default text color which appears black/low-contrast against purple.
**Goal:** Force white text for readability.

**Target Files:**
- `src/app/(marketing)/page.tsx` (Line ~346).

**Action Items:**
- [ ] In the Pricing Section loop, update the Button className:
  ```tsx
  className={`w-full ${plan.highlight ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
  ```
- [ ] Check `src/app/precos/page.tsx` as well to ensure consistency across pages.

## 4. Fix Pricing Section Alignment
**Context:** User reported visual misalignment in the pricing cards/table section. The "Pro" card or the table columns might be shifting.
**Goal:** Ensure visual consistency and proper grid alignment.

**Target Files:**
- `src/app/(marketing)/page.tsx`
- `src/app/precos/page.tsx`

**Action Items:**
- [ ] Review Flexbox/Grid alignment in Pricing Cards.
- [ ] Ensure Table headers align perfectly with the card columns above (if visually connected).
- [ ] Check heights of cards to ensure they are uniform (or intentionally distinct).

## 5. Overhaul Blog Article Styling (typography-prose)
**Context:** User described the blog articles as "ugly/poor". Screenshot shows lack of paragraph spacing, small font, and poor readability.
**Goal:** Implement a proper Typography plugin (`@tailwindcss/typography`) and improve the reading experience.

**Target Files:**
- `src/app/blog/[slug]/page.tsx`
- `src/components/mdx/MDXComponents.tsx`

**Action Items:**
- [ ] Verify if `prose` (Tailwind Typography) class is applied to the content container.
- [ ] Increase font size, line-height, and paragraph spacing.
- [ ] Add better styling for Headers (H1, H2, H3) and Lists.

## 6. Implement Project Creation (Critical - Currently Non-Functional)
**Context:** `CreateProjectDialog.tsx` line 47 contains `// TODO: Implement API call` - the function is a mock that just waits 1.5s and does nothing. This is why users see "Failed to create project".
**Goal:** Implement the actual server action to insert projects into the database.

**Root Cause Analysis:**
- ✅ Database schema exists (`supabase/migrations/20260122000002_projects.sql`)
- ✅ RLS policies are correct (requires 'owner' or 'admin' role)
- ❌ No server action exists to handle the insert
- ❌ Frontend calls a TODO stub instead of real API

**Target Files:**
- `src/actions/projects.ts` (CREATE THIS FILE)
- `src/components/project/CreateProjectDialog.tsx` (Line 42-56)

**Implementation Steps:**

### Step 1: Create Server Action
Create `src/actions/projects.ts`:
```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createProject(data: {
  name: string;
  environment: 'production' | 'development' | 'staging';
  region: 'gru1' | 'us-east-1';
  orgId: string;
}) {
  const supabase = await createClient();
  
  // Generate slug using database function
  const { data: slugData } = await supabase.rpc('generate_project_slug', {
    project_name: data.name,
    org_id: data.orgId
  });
  
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      name: data.name,
      slug: slugData,
      environment: data.environment,
      region: data.region,
      org_id: data.orgId,
    })
    .select()
    .single();
    
  if (error) throw error;
  
  revalidatePath('/app/projects');
  return project;
}
```

### Step 2: Update Dialog Component
In `CreateProjectDialog.tsx`, replace lines 42-56:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    await createProject({
      name: formData.name,
      environment: formData.environment,
      region: formData.region,
      orgId: organizationId!,
    });
    
    toast.success('Projeto criado com sucesso!');
    onOpenChange(false);
    setFormData({ name: '', environment: 'production', region: 'gru1' });
  } catch (error) {
    toast.error('Falha ao criar projeto');
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

### Step 3: Verify User Role
Ensure the user calling this has 'owner' or 'admin' role in the organization (RLS policy requirement from line 84-93 of the migration).
