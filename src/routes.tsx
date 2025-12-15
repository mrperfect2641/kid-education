import type { ReactNode } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Learn from './pages/Learn';
import Quizzes from './pages/Quizzes';
import QuizTake from './pages/QuizTake';
import Challenges from './pages/Challenges';
import SortWasteGame from './pages/games/SortWasteGame';
import SaveTreesGame from './pages/games/SaveTreesGame';
import CleanOceanGame from './pages/games/CleanOceanGame';
import Leaderboard from './pages/Leaderboard';
import EcoActions from './pages/EcoActions';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />,
    visible: false,
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false,
  },
  {
    name: 'Register',
    path: '/register',
    element: <Register />,
    visible: false,
  },
  {
    name: 'Learn',
    path: '/learn',
    element: <Learn />,
    visible: false,
  },
  {
    name: 'Quizzes',
    path: '/quizzes',
    element: <Quizzes />,
    visible: false,
  },
  {
    name: 'Quiz',
    path: '/quiz/:id',
    element: <QuizTake />,
    visible: false,
  },
  {
    name: 'Challenges',
    path: '/challenges',
    element: <Challenges />,
    visible: false,
  },
  {
    name: 'Sort Waste Game',
    path: '/game/sort-waste',
    element: <SortWasteGame />,
    visible: false,
  },
  {
    name: 'Save Trees Game',
    path: '/game/save-trees',
    element: <SaveTreesGame />,
    visible: false,
  },
  {
    name: 'Clean Ocean Game',
    path: '/game/clean-ocean',
    element: <CleanOceanGame />,
    visible: false,
  },
  {
    name: 'Leaderboard',
    path: '/leaderboard',
    element: <Leaderboard />,
    visible: false,
  },
  {
    name: 'Eco Actions',
    path: '/eco-actions',
    element: <EcoActions />,
    visible: false,
  },
  {
    name: 'Teacher Dashboard',
    path: '/teacher',
    element: <TeacherDashboard />,
    visible: false,
  },
  {
    name: 'Admin Dashboard',
    path: '/admin',
    element: <AdminDashboard />,
    visible: false,
  },
  {
    name: 'Not Found',
    path: '/404',
    element: <NotFound />,
    visible: false,
  },
];

export default routes;
