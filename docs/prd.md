# Gamified Environmental Education Platform Requirements Document

## 1. Website Name
Gamified Environmental Education Platform

## 2. Website Description
A web-based learning system that combines environmental education with gamification elements including quizzes, games, points, and challenges. The platform aims to engage students in sustainability topics such as pollution, waste management, and renewable energy through interactive and enjoyable learning experiences, while promoting eco-friendly habits.\n
## 3. Website Functionalities

### 3.1 Module1: User Registration and Login
- Users can register by selecting their role (Student/Teacher/Admin) during registration
- Registration requires email ID (used as username), password, and role selection
- Role-based registration: system creates user account according to selected role (Student/Teacher/Admin)
- Secure login system with email, password, and role selection
- Role-based login: users must select their role before logging in
- System authenticates and redirects users to role-specific dashboards:\n  - Student login → Student Dashboard
  - Teacher login → Teacher Dashboard
  - Admin login → Admin Dashboard
- Secure password storage and session management

### 3.2 Module 2: Learning / Quiz Module
- Display educational lessons on environmental topics: pollution, recycling, climate change, renewable energy, etc.
- Interactive quizzes with multiple-choice questions (MCQs), puzzles\n- Students earn eco-points for correct answers
- Track quiz completion and scores
- Student dashboard includes3-4 fully functional quizzes with questions ready to play
\n### 3.3 Module 3: Game / Challenge Module
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
- Add and edit information in learning modules
- Create, edit, and manage quizzes and games for students
- Add new quizzes and lessons
- Edit existing quizzes and games
- Conduct games and quizzes for students
- View class leaderboard of students
- Generate performance reports and results of students
- View and approve eco-actions submitted by students
- Monitor student activity, scores, and progress
- No option to play games or take quizzes (teacher role is for management and evaluation only)

### 3.6 Module 6: Real-Life Action Tracker
- Students log real-world environmental activities (planting trees, using reusable bottles, etc.)
- Upload images or descriptions of eco-actions
- Admin/teacher verification of submitted activities
- Bonus eco-points awarded upon approval
- Encourage real environmental action beyond digital learning

### 3.7 Admin Dashboard
- Manage user accounts, specifically student accounts
- Maintain database integrity\n- Generate reports of students' performance and activities
- View system reports and feedback
- Maintain and update content, quizzes, and lessons
- Manage class leaderboards
- Approve real-life eco-actions submitted by students
- No option to play quizzes, games, view leaderboard as a participant, or access learning modules as a student (admin role is for system management only)

## 4. User Roles and Interactions

### 4.1 Student\n- Register with email ID and select Student role
- Login with email, password, and Student role selection → redirected to Student Dashboard
- Take quizzes and earn eco-points (3-4 quizzes available with questions)\n- Play fully functional games and complete challenges
- View leaderboard and personal ranking
- Submit real-life eco-actions for verification
- Track progress and view earned badges
- View learning modules\n
### 4.2 Teacher
- Register with email ID and select Teacher role
- Login with email, password, and Teacher role selection → redirected to Teacher Dashboard
- Add and edit information in learning modules
- Create, edit, and manage quizzes, games, and lessons
- Conduct games and quizzes for students
- View class leaderboard of students
- Generate results and performance reports of students
- View and approve eco-actions submitted by students
- Monitor student performance, quiz results, and game results
- No access to play games or take quizzes\n\n### 4.3 Admin
- Register with email ID and select Admin role
- Login with email, password, and Admin role selection → redirected to Admin Dashboard
- Manage student user accounts
- Maintain database integrity
- Generate reports of students' performance and activities
- Handle system reports and feedback
- Maintain and update content, quizzes, and lessons
- Manage class leaderboards
- Approve real-life eco-actions\n- No option to play quizzes, games, view leaderboard as a participant, or access learning modules as a student\n
### 4.4 External Verifier (Optional)
- Validate real-life eco-actions submitted by students
- Provide additional verification layer for eco-activities
\n## 5. User Interfaces

### 5.1 Login / Registration Page
- Role selection dropdown (Student/Teacher/Admin) on registration page
- Email ID field (used as username)
- Password field
- Role selection dropdown before login
- System creates account based on selected role during registration
- System redirects to appropriate dashboard based on role selected during login

### 5.2 Student Dashboard
- Overview of platform features\n- Eco-points summary
- Quick access to quizzes, games, and leaderboard
- View learning modules
- Submit eco-actions
- Track personal progress and badges
\n### 5.3 Teacher Dashboard
- Add and edit learning module information
- Create, edit, and manage quizzes and games\n- View class leaderboard
- Generate student results and performance reports
- View eco-actions submitted by students
- Approve or reject eco-actions
- Monitor student activity and progress

### 5.4 Admin Dashboard
- Manage student user accounts
- Maintain database integrity tools
- Generate reports of students' performance and activities
- View system reports and feedback
- Maintain content, quizzes, and lessons\n- Manage class leaderboards
- Approve eco-actions
\n### 5.5 Quiz Page
- Display environmental quiz questions
- Multiple-choice options
- Submit answers and view results
- Eco-points earned display
- Student dashboard includes 3-4 quizzes with questions ready to play

### 5.6 Game / Challenge Page
- Fully functional interactive learning games and missions
- Challenge instructions and objectives
- Progress tracking\n- Badge awards upon completion
- Games managed by teachers
\n### 5.7 Leaderboard Page
- Display top students ranked by eco-points
- Personal ranking display
- Filter by class or overall\n\n### 5.8 Activity Submission Page
- Students upload real-life eco-actions
- Image upload and description fields
- Submission history and status tracking
\n### 5.9 About / Help Page
- Explanation of project purpose
- Usage instructions for students, teachers, and admins
- Contact information

## 6. Technical Requirements

### 6.1 Frontend
- HTML, CSS, JavaScript\n- Responsive design for various screen sizes
\n### 6.2 Backend
- Python with Flask framework
- RESTful API design
- Session management and authentication
- Role-based access control and dashboard routing

### 6.3 Database
- MySQL database\n- Tables for users (with email as username and role field), quizzes, games, eco-points, badges, activities, leaderboard\n- Secure database connection\n
### 6.4 Authentication
- Email and password-based authentication
- Role-based access control (Student/Teacher/Admin)
- Role-based dashboard redirection upon login
- Secure password storage

## 7. Design Style\n- Primary color scheme: Lavender theme with complementary soft purples, whites, and light greens to reflect environmental focus
- Visual details: Rounded corners for cards and buttons, subtle shadows for depth, nature-inspired icons (leaves, trees, water drops)
- Layout: Card-based layout for quizzes and games, clean list view for leaderboards, grid layout for dashboard widgets
- Typography: Clean, readable fonts suitable for educational content
- Interactive elements: Smooth hover effects, animated badges and point notifications

## 8. Reference Diagram
Use case diagram provided by user: Screenshot2025-10-30 153656.png showing relationships between Admin, Teacher, Student, and External Verifier with the Gamified Environmental Education Platform system.