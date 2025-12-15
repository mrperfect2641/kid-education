# Gamified Environmental Education Platform Requirements Document

## 1. Website Name
Gamified Environmental Education Platform

## 2. Website Description
A web-based learning system that combines environmental education with gamification elements including quizzes, games, points, and challenges. The platform aims to engage students in sustainability topics such as pollution, waste management, and renewable energy through interactive and enjoyable learning experiences, while promoting eco-friendly habits.\n
## 3. Website Functionalities

### 3.1 Module1: User Registration and Login
- Students, teachers, and admins can register with role selection (Student/Teacher/Admin)
- Registration requires email ID (used as username), password, and role selection
- Secure login system with email and password authentication
- Role-based login: users select their role before logging in
- Separate dashboards for students, teachers, and admins based on selected role

### 3.2 Module 2: Learning / Quiz Module
- Display educational lessons on environmental topics: pollution, recycling, climate change, renewable energy, etc.
- Interactive quizzes with multiple-choice questions (MCQs), puzzles\n- Students earn eco-points for correct answers
- Track quiz completion and scores
- Student dashboard includes3-4 fully functional quizzes with questions ready to play

### 3.3 Module 3: Game / Challenge Module
- Fun mini-tasks and challenges:'Sort the waste,' 'Save the trees,' 'Clean the ocean'\n- Fully working interactive games using HTML and JavaScript
- Games are added and managed by teachers
- Progress tracking for each game/challenge
- Award badges upon completion of challenges
- Student dashboard includes fully functional games\n
### 3.4 Module 4: Leaderboard & Rewards Module
- Display top-performing students ranked by eco-points
- Award badges and certificates for milestones (e.g., 'Green Hero,' 'Eco Star')
- Encourage healthy competition among students
- View personal ranking and achievements
\n### 3.5 Module 5: Teacher Dashboard
- Monitor student activity, scores, and progress
- Create, edit, and manage quizzes and games
- Add/edit quizzes and lessons
- Conduct games and quizzes for students
- View results of students' games and quizzes
- Review and approve eco-activities submitted by students
- Generate performance reports\n- No option to play games or take quizzes (teacher role is for management and evaluation only)

### 3.6 Module 6: Real-Life Action Tracker
- Students log real-world environmental activities (planting trees, using reusable bottles, etc.)
- Upload images or descriptions of eco-actions
- Admin/teacher verification of submitted activities
- Bonus eco-points awarded upon approval
- Encourage real environmental action beyond digital learning

### 3.7 Admin Dashboard
- Manage user accounts (students, teachers, admins)
- Maintain and update content, quizzes, and lessons
- Generate reports of students' performance and activities
- Handle reports and feedback\n- Maintain database integrity
- Manage class leaderboards
- No option to play quizzes, games, view leaderboard, or access learning modules (admin role is for system management only)

## 4. User Roles and Interactions

### 4.1 Student\n- Register and login with email ID and student role
- Take quizzes and earn eco-points (3-4 quizzes available with questions)\n- Play fully functional games and complete challenges
- View leaderboard and personal ranking
- Submit real-life eco-actions for verification
- Track progress and view earned badges
- View learning modules\n
### 4.2 Teacher
- Register and login with email ID and teacher role
- Create, edit, and manage quizzes, games, and lessons
- Conduct games and quizzes for students
- View student performance, quiz results, and game results
- Approve or reject real-life eco-actions submitted by students
- Evaluate student performance\n- Manage class leaderboard
- Generate student reports

### 4.3 Admin
- Register and login with email ID and admin role
- Manage all user accounts (students, teachers, admins)
- Maintain content, quizzes, and lessons\n- Generate reports of students' performance and activities
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
- Email ID field (used as username)
- Password field
- Role selection before login
\n### 5.2 Home / Dashboard\n- Overview of platform features\n- Eco-points summary
- Quick access to quizzes, games, and leaderboard
- Role-specific dashboard content

### 5.3 Quiz Page
- Display environmental quiz questions
- Multiple-choice options\n- Submit answers and view results
- Eco-points earned display
- Student dashboard includes 3-4 quizzes with questions ready to play

### 5.4 Game / Challenge Page
- Fully functional interactive learning games and missions
- Challenge instructions and objectives
- Progress tracking\n- Badge awards upon completion
- Games managed by teachers

### 5.5 Leaderboard Page
- Display top students ranked by eco-points
- Personal ranking display
- Filter by class or overall\n\n### 5.6 Teacher Dashboard
- Create, edit, and manage quizzes, games, and lessons
- Conduct games and quizzes for students
- View student performance reports, quiz results, and game results
- Approve eco-actions\n- Add/edit educational content
- No option to play games or take quizzes\n
### 5.7 Admin Dashboard
- Manage users and accounts
- Maintain content and quizzes
- Generate reports of students' performance and activities
- View system reports\n- Database management tools
- No option to play quizzes, games, view leaderboard, or access learning modules

### 5.8 Activity Submission Page
- Students upload real-life eco-actions
- Image upload and description fields
- Submission history and status tracking
\n### 5.9 About / Help Page
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

### 6.3 Database
- MySQL database\n- Tables for users (with email as username), quizzes, games, eco-points, badges, activities, leaderboard\n- Secure database connection

### 6.4 Authentication
- Email and password-based authentication
- Role-based access control (Student/Teacher/Admin)
- Secure password storage

## 7. Design Style
- Primary color scheme: Lavender theme with complementary soft purples, whites, and light greens to reflect environmental focus
- Visual details: Rounded corners for cards and buttons, subtle shadows for depth, nature-inspired icons (leaves, trees, water drops)
- Layout: Card-based layout for quizzes and games, clean list view for leaderboards, grid layout for dashboard widgets
- Typography: Clean, readable fonts suitable for educational content
- Interactive elements: Smooth hover effects, animated badges and point notifications

## 8. Reference Diagram
Use case diagram provided by user: Screenshot2025-10-30 153656.png showing relationships between Admin, Teacher, Student, and External Verifier with the Gamified Environmental Education Platform system.