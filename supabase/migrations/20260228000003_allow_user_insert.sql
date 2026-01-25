-- Allow users to insert their own profile
-- This is necessary for the onboarding flow if the Service Role bypass is not active
CREATE POLICY "Users can insert own profile" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);
