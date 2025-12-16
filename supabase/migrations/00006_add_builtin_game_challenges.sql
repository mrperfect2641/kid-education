/*
# Add Built-in Game Challenges

This migration adds the three built-in game challenges to the challenges table
so that game progress can be properly tracked and points can be awarded.

## Changes
1. Insert three challenge records for the built-in games:
   - Sort the Waste (sorting game)
   - Save the Trees (action game)
   - Clean the Ocean (action game)

## Notes
- Uses fixed UUIDs that match the game code
- Sets appropriate difficulty levels and point rewards
- All games are active by default
*/

-- Insert built-in game challenges
INSERT INTO challenges (id, title, description, challenge_type, difficulty, points_reward, instructions, is_active, created_at)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Sort the Waste',
    'Learn to properly sort waste into recyclable, compost, and trash bins',
    'sorting',
    'easy',
    20,
    'Sort 10 different waste items into the correct bins. You need to get at least 70% correct to complete the challenge and earn points.',
    true,
    now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Save the Trees',
    'Plant trees and protect the forest from deforestation',
    'action',
    'medium',
    30,
    'Plant as many trees as you can while avoiding obstacles. Reach the target score to complete the challenge.',
    true,
    now()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Clean the Ocean',
    'Remove plastic waste and pollution from the ocean',
    'action',
    'medium',
    30,
    'Clean up ocean pollution by collecting trash. Complete the challenge by reaching the target score.',
    true,
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  challenge_type = EXCLUDED.challenge_type,
  difficulty = EXCLUDED.difficulty,
  points_reward = EXCLUDED.points_reward,
  instructions = EXCLUDED.instructions,
  is_active = EXCLUDED.is_active;
