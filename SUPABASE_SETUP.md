# Supabase Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env` and fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. In Supabase Auth, enable:
   - Email provider
   - Google provider
4. Configure redirect URLs:
   - `http://localhost:5173/`
   - your production app URL
5. In the SQL editor, run [`supabase-setup.sql`](./supabase-setup.sql).
6. In Storage, confirm the public bucket `portfolio-images` exists.
7. After your first user signs up, promote the admin manually:
   - `update public.profiles set role = 'admin' where email = 'your-admin-email@example.com';`

The app expects public portfolio reads, authenticated writes, and image uploads through Supabase Storage.
