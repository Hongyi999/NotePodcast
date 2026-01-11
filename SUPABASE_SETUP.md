# Supabase Setup Guide

To enable the backend features (User Login, Cloud Notes), you need to set up a Supabase project.

## 1. Create a Supabase Project
Go to [database.new](https://database.new) and create a new project.

## 2. Get Credentials
Once your project is ready:
1. Go to **Settings** -> **API**.
2. Copy the **Project URL**.
3. Copy the **anon public** key.

## 3. Configure Environment Variables
Create a file named `.env` (or rename `.env.example` to `.env`) in the root of your project and add your credentials:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 4. Run Database Migrations
Go to the **SQL Editor** in your Supabase dashboard and run the following SQL script to create the necessary tables and policies:

```sql
-- Create a table for notes
create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  podcast_url text not null,
  time_point numeric not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table notes enable row level security;

-- Create Policy: Users can only see their own notes
create policy "Users can view their own notes"
on notes for select
to authenticated
using (auth.uid() = user_id);

-- Create Policy: Users can insert their own notes
create policy "Users can insert their own notes"
on notes for insert
to authenticated
with check (auth.uid() = user_id);

-- Create Policy: Users can delete their own notes
create policy "Users can delete their own notes"
on notes for delete
to authenticated
using (auth.uid() = user_id);
```

## 5. Auth Configuration
1. Go to **Authentication** -> **Providers**.
2. Ensure **Email** provider is enabled.
3. (Optional) Disable "Confirm email" in **Authentication** -> **URL Configuration** if you want users to log in immediately without verifying email.

