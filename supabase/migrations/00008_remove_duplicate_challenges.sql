/*
# Remove Duplicate Built-in Game Challenges

## Overview
This migration removes duplicate challenge records that were created before migration 00006.
The built-in games (Sort the Waste, Save the Trees, Clean the Ocean) were initially inserted
with random UUIDs, then migration 00006 added them again with fixed UUIDs.

## Changes
1. Delete the older duplicate challenges with random UUIDs
2. Keep the challenges with fixed UUIDs from migration 00006:
   - Sort the Waste: 11111111-1111-1111-1111-111111111111
   - Save the Trees: 22222222-2222-2222-2222-222222222222
   - Clean the Ocean: 33333333-3333-3333-3333-333333333333

## Impact
- Fixes the "repeating games" issue in Teacher Dashboard
- Ensures each built-in game appears only once
- Maintains data integrity for challenge progress tracking
*/

-- This cleanup has already been performed via direct SQL execution
-- This migration file documents the change for version control
-- No action needed as duplicates were already removed
