/*
# Allow Teachers to Delete Topics

## Overview
This migration updates the Row Level Security (RLS) policy on the `topics` table to allow teachers to delete topics/learning modules, not just admins.

## Changes
1. Drop the existing "Admins can delete topics" policy
2. Create a new "Teachers and admins can delete topics" policy

## Rationale
According to the requirements, teachers should be able to:
- Create and manage quizzes and lessons
- Maintain and update content, quizzes, and lessons

This includes the ability to delete topics/learning modules they have created.

## Security
- Only authenticated users with 'teacher' or 'admin' role can delete topics
- Students cannot delete topics
- Non-authenticated users cannot delete topics
*/

-- Drop the old policy that only allowed admins
DROP POLICY IF EXISTS "Admins can delete topics" ON topics;

-- Create new policy that allows both teachers and admins to delete topics
CREATE POLICY "Teachers and admins can delete topics"
ON topics FOR DELETE
TO authenticated
USING (is_teacher_or_admin(auth.uid()));
