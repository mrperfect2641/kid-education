# Gamified Environmental Education Platform Requirements Document

## 1. Website Name
Gamified Environmental Education Platform
\n## 2. Website Description
A web-based learning system that combines environmental education with gamification elements including quizzes, games, points, and challenges. The platform aims to engage students in sustainability topics such as pollution, waste management, and renewable energy through interactive and enjoyable learning experiences, while promoting eco-friendly habits.
\n## 3. Website Functionalities

### 3.1 Module 1: User Registration and Login
- Students, teachers, and admins can register with role selection (Student/Teacher/Admin)
- Secure login system with username and password authentication
- Role-based login: users select their role before logging in
- Separate dashboards for students, teachers, and admins based on selected role
\n### 3.2 Module 2: Learning / Quiz Module
- Display educational lessons on environmental topics: pollution, recycling, climate change, renewable energy, etc.
- Interactive quizzes with multiple-choice questions (MCQs), puzzles\n- Students earn eco-points for correct answers\n- Track quiz completion and scores
\n### 3.3 Module 3: Game / Challenge Module\n- Fun mini-tasks and challenges: 'Sort the waste,' 'Save the trees,' 'Clean the ocean'
- Text-based or click-based interactive challenges using HTML and JavaScript
- Progress tracking for each game/challenge
- Award badges upon completion of challenges

### 3.4 Module 4: Leaderboard & Rewards Module
- Display top-performing students ranked by eco-points
- Award badges and certificates for milestones (e.g., 'Green Hero,' 'Eco Star')
- Encourage healthy competition among students
- View personal ranking and achievements

### 3.5 Module 5: Teacher Dashboard
- Monitor student activity, scores, and progress
- Create and manage quizzes and educational content
- Add/edit quizzes and lessons
- Review and approve eco-activities submitted by students
- Generate performance reports

### 3.6 Module 6: Real-Life Action Tracker\n- Students log real-world environmental activities (planting trees, using reusable bottles, etc.)
- Upload images or descriptions of eco-actions
- Admin/teacher verification of submitted activities
- Bonus eco-points awarded upon approval
- Encourage real environmental action beyond digital learning

### 3.7 Admin Dashboard
- Manage user accounts (students, teachers, admins)
- Maintain and update content, quizzes, and lessons
- Handle reports and feedback
- Maintain database integrity
- Manage class leaderboards

## 4. User Roles and Interactions

### 4.1 Student\n- Register and login with student role
- Take quizzes and earn eco-points
- Play games and complete challenges
- View leaderboard and personal ranking
- Submit real-life eco-actions for verification
- Track progress and view earned badges
- View learning modules\n
### 4.2 Teacher
- Register and login with teacher role
- Create and manage quizzes and lessons
- View student performance and activity reports
- Approve or reject real-life eco-actions submitted by students
- Evaluate student performance\n- Manage class leaderboard
\n### 4.3 Admin
- Register and login with admin role
- Manage all user accounts (students, teachers, admins)
- Maintain content, quizzes, and lessons
- Handle system reports and feedback
- Maintain database integrity
- Approve real-life eco-actions
- Validate submitted activities
\n### 4.4 External Verifier (Optional)
- Validate real-life eco-actions submitted by students
- Provide additional verification layer for eco-activities
\n## 5. User Interfaces

### 5.1 Login / Registration Page
- User authentication for students, teachers, and admins
- Role selection dropdown (Student/Teacher/Admin) on registration
- Role selection before login
- Username and password fields
\n### 5.2 Home / Dashboard
- Overview of platform features\n- Eco-points summary\n- Quick access to quizzes, games, and leaderboard
- Role-specific dashboard content

### 5.3 Quiz Page
- Display environmental quiz questions
- Multiple-choice options\n- Submit answers and view results
- Eco-points earned display

### 5.4 Game / Challenge Page
- Interactive learning games and missions
- Challenge instructions and objectives
- Progress tracking\n- Badge awards upon completion

### 5.5 Leaderboard Page
- Display top students ranked by eco-points
- Personal ranking display
- Filter by class or overall\n\n### 5.6 Teacher Dashboard
- Manage quizzes and lessons
- View student performance reports
- Approve eco-actions
- Add/edit educational content

### 5.7 Admin Dashboard
- Manage users and accounts
- Maintain content and quizzes
- View system reports
- Database management tools

### 5.8 Activity Submission Page
- Students upload real-life eco-actions
- Image upload and description fields
- Submission history and status tracking

### 5.9 About / Help Page
- Explanation of project purpose
- Usage instructions for students and teachers
- Contact information

## 6. Technical Requirements

### 6.1 Frontend
- HTML, CSS, JavaScript\n- Responsive design for various screen sizes
\n### 6.2 Backend
- Python with Flask framework
- RESTful API design
- Session management and authentication
\n### 6.3 Database
- MySQL database\n- Tables for users, quizzes, games, eco-points, badges, activities, leaderboard
- Secure database connection

### 6.4 Authentication
- Username and password-based authentication
- Role-based access control (Student/Teacher/Admin)
- Secure password storage

## 7. Design Style\n- Primary color scheme: Lavender theme with complementary soft purples, whites, and light greens to reflect environmental focus
- Visual details: Rounded corners for cards and buttons, subtle shadows for depth, nature-inspired icons (leaves, trees, water drops)
- Layout: Card-based layout for quizzes and games, clean list view for leaderboards, grid layout for dashboard widgets
- Typography: Clean, readable fonts suitable for educational content
- Interactive elements: Smooth hover effects, animated badges and point notifications

## 8. Reference Diagram
Use case diagram provided by user: Screenshot 2025-10-30 153656.png showing relationships between Admin, Teacher, Student, and External Verifier with the Gamified Environmental Education Platform system.