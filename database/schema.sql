-- ============================================================
-- UniBooks Exchange — Database Schema
-- Database: Supabase (PostgreSQL)
-- Run this script in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: users
-- Stores registered student accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     TEXT NOT NULL,
  university    TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast email lookups (login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- TABLE: books
-- Stores book listings posted by students
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  author          TEXT NOT NULL,
  edition         TEXT,
  subject         TEXT NOT NULL,
  condition       TEXT NOT NULL CHECK (condition IN ('Like New', 'Good', 'Fair')),
  price           NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  description     TEXT,
  image_url       TEXT,
  pickup_location TEXT,
  seller_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_available    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_books_seller_id  ON books(seller_id);
CREATE INDEX IF NOT EXISTS idx_books_subject    ON books(subject);
CREATE INDEX IF NOT EXISTS idx_books_condition  ON books(condition);
CREATE INDEX IF NOT EXISTS idx_books_price      ON books(price);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_available  ON books(is_available);

-- Full-text search index on title, author, subject
CREATE INDEX IF NOT EXISTS idx_books_fts ON books
  USING GIN (to_tsvector('english', title || ' ' || author || ' ' || subject));

-- ============================================================
-- TABLE: messages
-- Stores chat messages between buyers and sellers
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id     UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_book_id     ON messages(book_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id   ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at  ON messages(created_at ASC);

-- Composite index for fetching a specific conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages(book_id, sender_id, receiver_id, created_at ASC);

-- ============================================================
-- TABLE: favourites
-- Stores books saved by users
-- ============================================================
CREATE TABLE IF NOT EXISTS favourites (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id    UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, book_id)  -- prevent duplicate favourites
);

-- Indexes for favourites queries
CREATE INDEX IF NOT EXISTS idx_favourites_user_id ON favourites(user_id);
CREATE INDEX IF NOT EXISTS idx_favourites_book_id ON favourites(book_id);

-- ============================================================
-- FUNCTION: auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
