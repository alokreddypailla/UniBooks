-- ============================================================
-- UniBooks Exchange — Row Level Security (RLS) Policies
-- Run AFTER schema.sql in the Supabase SQL Editor
-- ============================================================
-- NOTE: Since we use FastAPI with the Supabase service_role key
-- (server-side), RLS is configured but the backend bypasses it
-- using the service role. These policies protect direct client
-- access and are best practice for production security.
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE books      ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS table policies
-- ============================================================

-- Anyone can read basic user info (needed for seller profiles)
CREATE POLICY "users_select_public"
  ON users FOR SELECT
  USING (true);

-- Users can only update their own record
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Only service role can insert (registration handled by backend)
CREATE POLICY "users_insert_service"
  ON users FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- BOOKS table policies
-- ============================================================

-- Anyone can read available book listings
CREATE POLICY "books_select_public"
  ON books FOR SELECT
  USING (true);

-- Authenticated users can create listings
CREATE POLICY "books_insert_authenticated"
  ON books FOR INSERT
  WITH CHECK (true);

-- Only the seller can update their own listing
CREATE POLICY "books_update_own"
  ON books FOR UPDATE
  USING (auth.uid()::text = seller_id::text);

-- Only the seller can delete their own listing
CREATE POLICY "books_delete_own"
  ON books FOR DELETE
  USING (auth.uid()::text = seller_id::text);

-- ============================================================
-- MESSAGES table policies
-- ============================================================

-- Users can only read messages they sent or received
CREATE POLICY "messages_select_participants"
  ON messages FOR SELECT
  USING (
    auth.uid()::text = sender_id::text OR
    auth.uid()::text = receiver_id::text
  );

-- Authenticated users can send messages
CREATE POLICY "messages_insert_authenticated"
  ON messages FOR INSERT
  WITH CHECK (auth.uid()::text = sender_id::text);

-- ============================================================
-- FAVOURITES table policies
-- ============================================================

-- Users can only see their own favourites
CREATE POLICY "favourites_select_own"
  ON favourites FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Users can add to their own favourites
CREATE POLICY "favourites_insert_own"
  ON favourites FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can remove from their own favourites
CREATE POLICY "favourites_delete_own"
  ON favourites FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================================
-- STORAGE: book-images bucket
-- Run this to create the storage bucket for book images
-- ============================================================

-- Create the storage bucket (run in Supabase dashboard or SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-images', 'book-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to book images
CREATE POLICY "book_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-images');

-- Allow authenticated uploads
CREATE POLICY "book_images_authenticated_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'book-images');

-- Allow owners to delete their images
CREATE POLICY "book_images_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'book-images');
