-- Fix foreign key constraint for messages table
-- Remove the existing foreign key that references users table
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- Add foreign key that references auth.users instead
ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Also fix conversations table foreign keys to reference auth.users
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_sender_id_fkey;
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_recipient_id_fkey;

ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE;