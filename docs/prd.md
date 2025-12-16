# Gamified Environmental Education Platform Requirements Document

## 1. Website Name
Gamified Environmental Education Platform

## 2. Website Description
A web-based learning system that combines environmental education with gamification elements including quizzes, games, points, and challenges. The platform aims to engage students in sustainability topics such as pollution, waste management, and renewable energy through interactive and enjoyable learning experiences, while promoting eco-friendly habits.\n
## 3. Website Functionalities
\n### 3.1 Module 1: User Registration and Login
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
- Student dashboard displays all quizzes added by teachers
- Quizzes dynamically appear in student dashboard when teachers add them
- Students can access and solve multiple quizzes added by teachers
\n### 3.3 Module 3: Game / Challenge Module
- Fun mini-tasks and challenges:'Sort the waste,' 'Save the trees,' 'Clean the ocean'\n- Fully working interactive games using HTML and JavaScript
- Games are added and managed by teachers
- Progress tracking for each game/challenge
- Award badges upon completion of challenges
- Student dashboard displays all games added by teachers
- Games dynamically appear in student dashboard when teachers add them
- Students can play multiple games added by teachers

### 3.4 Module 4: Leaderboard & Rewards Module
- Display top-performing students ranked by eco-points
- Award badges and certificates for milestones (e.g., 'Green Hero,' 'Eco Star')
- Encourage healthy competition among students
- View personal ranking and achievements
\n### 3.5 Module 5: Teacher Dashboard
- **Add and manage learning modules:**
  - Create new learning modules with environmental topics
  - Edit existing learning module content with text editor or input fields to write and add information
  - Add or remove information in learning modules through dedicated editing interface
  - Update module descriptions and educational materials
- **Create and manage quizzes:**
  - Add multiple new quizzes with questions and answer options
  - Option to add more quizzes at any time
  - Edit existing quizzes\n  - Delete quizzes\n  - Added quizzes automatically appear in student dashboard\n  - Students can access and solve all added quizzes from their dashboard
- **Create and manage games:**
  - Add multiple new games and challenges
  - Option to add more games at any time\n  - Edit existing games
  - Delete games
  - Added games automatically appear in student dashboard\n  - Students can play all added games from their dashboard
- Conduct quizzes and games for students
- View class leaderboard of students
- Generate performance reports and results of students
- **View eco-actions submitted by students:**
  - Access list of all eco-actions submitted by students
  - View details of each submission including images and descriptions
  - Approve or reject eco-actions
- Monitor student activity, scores, and progress
- No option to play games or take quizzes (teacher role is for management and evaluation only)

### 3.6 Module 6: Real-Life Action Tracker
- Students log real-world environmental activities (planting trees, using reusable bottles, etc.)
- Upload images or descriptions of eco-actions
- Admin/teacher verification of submitted activities
- Bonus eco-points awarded upon approval\n- Encourage real environmental action beyond digital learning
\n### 3.7 Admin Dashboard
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
- Take multiple quizzes and earn eco-points (all quizzes added by teachers are available)\n- Play multiple fully functional games and complete challenges (all games added by teachers are available)\n- View leaderboard and personal ranking
- Submit real-life eco-actions for verification
- Track progress and view earned badges
- View learning modules created and managed by teachers
\n### 4.2 Teacher
- Register with email ID and select Teacher role
- Login with email, password, and Teacher role selection → redirected to Teacher Dashboard
- **Manage learning modules:**
  - Add new learning modules\n  - Edit existing learning module information using text editor or input fields
  - Remove or update module content
- **Manage quizzes:**
  - Create multiple new quizzes with questions\n  - Add more quizzes at any time
  - Edit existing quizzes\n  - Delete quizzes\n  - Quizzes automatically appear in student dashboard upon creation
  - Students can solve all added quizzes\n- **Manage games:**\n  - Add multiple new games and challenges
  - Add more games at any time
  - Edit existing games
  - Delete games
  - Games automatically appear in student dashboard upon creation
  - Students can play all added games
- Conduct games and quizzes for students
- View class leaderboard of students
- Generate results and performance reports of students
- **View and manage eco-actions:**
  - Access all eco-actions submitted by students
  - Review submission details
  - Approve or reject eco-actions
- Monitor student performance, quiz results, and game results
- No access to play games or take quizzes\n
### 4.3 Admin
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
- Quick access to all quizzes added by teachers
- Quick access to all games added by teachers\n- View learning modules created by teachers
- Access to leaderboard\n- Submit eco-actions\n- Track personal progress and badges
- Dynamically updated when teachers add new quizzes or games
- Display all available quizzes and games in organized sections

### 5.3 Teacher Dashboard
- **Learning Module Management Section:**
  - Add new learning modules
  - Edit existing module content with text editor or input fields for writing and adding information
  - Remove or update information in modules
- **Quiz Management Section:**
  - Create new quizzes\n  - 'Add More Quizzes' button to add additional quizzes
  - Edit existing quizzes
  - Delete quizzes
  - View list of all created quizzes
  - Counter showing total number of quizzes added
- **Game Management Section:**
  - Add new games\n  - 'Add More Games' button to add additional games
  - Edit existing games
  - Delete games\n  - View list of all created games
  - Counter showing total number of games added
- **Eco-Action Review Section:**
  - View all eco-actions submitted by students
  - Display submission details (images, descriptions, student name, submission date)
  - Approve or reject buttons for each submission
  - Filter and search options for eco-actions
- View class leaderboard\n- Generate student results and performance reports
- Monitor student activity and progress
\n### 5.4 Admin Dashboard
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
- All quizzes added by teachers are accessible
- Navigation to browse through multiple quizzes

### 5.6 Game / Challenge Page
- Fully functional interactive learning games and missions
- Challenge instructions and objectives
- Progress tracking\n- Badge awards upon completion
- All games added by teachers are accessible
- Navigation to browse through multiple games\n
### 5.7 Leaderboard Page
- Display top students ranked by eco-points
- Personal ranking display
- Filter by class or overall\n\n### 5.8 Activity Submission Page
- Students upload real-life eco-actions
- Image upload and description fields
- Submission history and status tracking
\n### 5.9 Learning Module Edit Page (Teacher)
- Text editor or rich text input fields for writing and adding module content
- Section for module title and description
- Save and preview options
- Cancel and delete options
\n### 5.10 Quiz Creation/Edit Page (Teacher)
- Form to add quiz title and description
- Add multiple questions with answer options
- 'Add More Questions' button\n- Save and preview options
- 'Add More Quizzes' button to create additional quizzes

### 5.11 Game Creation/Edit Page (Teacher)
- Form to add game title and description\n- Upload or configure game files
- Set game objectives and rules
- Save and preview options
- 'Add More Games' button to create additional games

### 5.12 About / Help Page
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
- Dynamic content loading for quizzes and games
- Support for multiple quiz and game additions

### 6.3 Database
- MySQL database\n- Tables for users (with email as username and role field), learning modules, quizzes, games, eco-points, badges, activities, leaderboard\n- Secure database connection\n- Schema supports multiple quizzes and games per teacher

### 6.4 Authentication
- Email and password-based authentication
- Role-based access control (Student/Teacher/Admin)
- Role-based dashboard redirection upon login
- Secure password storage

## 7. Design Style
- Primary color scheme: Lavender theme with complementary soft purples, whites, and light greens to reflect environmental focus
- Visual details: Rounded corners for cards and buttons, subtle shadows for depth, nature-inspired icons (leaves, trees, water drops)
- Layout: Card-based layout for quizzes and games with grid display for multiple items, clean list view for leaderboards, grid layout for dashboard widgets
- Typography: Clean, readable fonts suitable for educational content
- Interactive elements: Smooth hover effects, animated badges and point notifications, clear'Add More' buttons with plus icons

## 8. Reference Diagram
Use case diagram provided by user: Screenshot2025-10-30 153656.png showing relationships between Admin, Teacher, Student, and External Verifier with the Gamified Environmental Education Platform system.

## 9. Reference Images
- Screenshot 2025-10-30 153656.png: Use case diagram with relationships
- image.png: Error message display example for role-based login validation