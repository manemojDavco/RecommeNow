-- Follow-up to migration-partners.sql: pin the trigger function's search_path.
-- Resolves the Supabase linter warning "Function Search Path Mutable" on
-- public.lock_partner_attribution. Safe to run on the already-created function.
alter function public.lock_partner_attribution() set search_path = '';
