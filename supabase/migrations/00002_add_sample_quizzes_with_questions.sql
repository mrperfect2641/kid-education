/*
# Add Sample Quizzes with Questions

This migration adds 4 complete quizzes with questions for students to take.

## Quizzes Added
1. Climate Change Basics (5 questions)
2. Recycling 101 (5 questions)
3. Renewable Energy Quiz (5 questions)
4. Pollution Awareness (5 questions)
*/

-- Insert sample quizzes
INSERT INTO quizzes (id, topic_id, title, description, points_reward, time_limit_minutes, is_active) VALUES
('11111111-1111-1111-1111-111111111111', (SELECT id FROM topics WHERE title = 'Climate Change' LIMIT 1), 'Climate Change Basics', 'Test your knowledge about climate change and global warming', 50, 10, true),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM topics WHERE title = 'Recycling & Waste Management' LIMIT 1), 'Recycling 101', 'Learn about proper recycling and waste management', 40, 8, true),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM topics WHERE title = 'Renewable Energy' LIMIT 1), 'Renewable Energy Quiz', 'Explore clean and sustainable energy sources', 45, 10, true),
('44444444-4444-4444-4444-444444444444', (SELECT id FROM topics WHERE title = 'Pollution' LIMIT 1), 'Pollution Awareness', 'Understanding different types of pollution', 40, 8, true)
ON CONFLICT (id) DO NOTHING;

-- Climate Change Basics Questions
INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index) VALUES
('11111111-1111-1111-1111-111111111111', 'What is the primary greenhouse gas responsible for climate change?', 'multiple_choice', '["Carbon Dioxide (CO2)", "Oxygen (O2)", "Nitrogen (N2)", "Hydrogen (H2)"]', 'Carbon Dioxide (CO2)', 10, 1),
('11111111-1111-1111-1111-111111111111', 'Which of the following is a renewable energy source?', 'multiple_choice', '["Coal", "Natural Gas", "Solar Power", "Oil"]', 'Solar Power', 10, 2),
('11111111-1111-1111-1111-111111111111', 'What is the main cause of rising sea levels?', 'multiple_choice', '["Melting ice caps and glaciers", "Increased rainfall", "Ocean currents", "Underwater volcanoes"]', 'Melting ice caps and glaciers', 10, 3),
('11111111-1111-1111-1111-111111111111', 'Which activity contributes most to deforestation?', 'multiple_choice', '["Agriculture and farming", "Natural forest fires", "Wildlife migration", "Seasonal changes"]', 'Agriculture and farming', 10, 4),
('11111111-1111-1111-1111-111111111111', 'What percentage of Earth''s atmosphere is made up of greenhouse gases?', 'multiple_choice', '["Less than 1%", "About 10%", "About 25%", "More than 50%"]', 'Less than 1%', 10, 5);

-- Recycling 101 Questions
INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index) VALUES
('22222222-2222-2222-2222-222222222222', 'Which of these materials is NOT recyclable?', 'multiple_choice', '["Glass bottles", "Plastic bags", "Styrofoam", "Aluminum cans"]', 'Styrofoam', 8, 1),
('22222222-2222-2222-2222-222222222222', 'What does the recycling symbol with number 1 mean?', 'multiple_choice', '["PET plastic", "HDPE plastic", "PVC plastic", "LDPE plastic"]', 'PET plastic', 8, 2),
('22222222-2222-2222-2222-222222222222', 'How many times can aluminum be recycled?', 'multiple_choice', '["Once", "5 times", "10 times", "Infinitely"]', 'Infinitely', 8, 3),
('22222222-2222-2222-2222-222222222222', 'What should you do before recycling plastic containers?', 'multiple_choice', '["Rinse them clean", "Leave food residue", "Crush them completely", "Remove all labels"]', 'Rinse them clean', 8, 4),
('22222222-2222-2222-2222-222222222222', 'Which color bin is typically used for recyclable materials?', 'multiple_choice', '["Blue", "Green", "Black", "Red"]', 'Blue', 8, 5);

-- Renewable Energy Quiz Questions
INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index) VALUES
('33333333-3333-3333-3333-333333333333', 'Which renewable energy source uses the sun''s energy?', 'multiple_choice', '["Wind power", "Solar power", "Hydropower", "Geothermal"]', 'Solar power', 9, 1),
('33333333-3333-3333-3333-333333333333', 'What is the most widely used renewable energy source worldwide?', 'multiple_choice', '["Solar", "Wind", "Hydroelectric", "Biomass"]', 'Hydroelectric', 9, 2),
('33333333-3333-3333-3333-333333333333', 'Wind turbines convert kinetic energy into what?', 'multiple_choice', '["Heat energy", "Chemical energy", "Electrical energy", "Nuclear energy"]', 'Electrical energy', 9, 3),
('33333333-3333-3333-3333-333333333333', 'Which country is the world leader in solar energy production?', 'multiple_choice', '["United States", "China", "Germany", "India"]', 'China', 9, 4),
('33333333-3333-3333-3333-333333333333', 'What is biomass energy derived from?', 'multiple_choice', '["Organic materials", "Nuclear reactions", "Fossil fuels", "Minerals"]', 'Organic materials', 9, 5);

-- Pollution Awareness Questions
INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index) VALUES
('44444444-4444-4444-4444-444444444444', 'What is the main source of air pollution in cities?', 'multiple_choice', '["Vehicle emissions", "Ocean waves", "Plant respiration", "Animal migration"]', 'Vehicle emissions', 8, 1),
('44444444-4444-4444-4444-444444444444', 'Which type of pollution affects water bodies?', 'multiple_choice', '["Noise pollution", "Light pollution", "Water pollution", "Thermal pollution"]', 'Water pollution', 8, 2),
('44444444-4444-4444-4444-444444444444', 'What is the Great Pacific Garbage Patch?', 'multiple_choice', '["A landfill in the Pacific", "A collection of marine debris", "An island made of trash", "A recycling facility"]', 'A collection of marine debris', 8, 3),
('44444444-4444-4444-4444-444444444444', 'Which gas is primarily responsible for acid rain?', 'multiple_choice', '["Oxygen", "Sulfur dioxide", "Nitrogen", "Carbon monoxide"]', 'Sulfur dioxide', 8, 4),
('44444444-4444-4444-4444-444444444444', 'What is the best way to reduce plastic pollution?', 'multiple_choice', '["Use more plastic", "Reduce, reuse, recycle", "Burn plastic waste", "Bury plastic in soil"]', 'Reduce, reuse, recycle', 8, 5);
