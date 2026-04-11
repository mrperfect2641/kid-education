import type { ReactNode } from 'react';
import RoleGuard from './components/common/RoleGuard';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Learn from './pages/Learn';
import Quizzes from './pages/Quizzes';
import QuizTake from './pages/QuizTake';
import Challenges from './pages/Challenges';
import GenericChallenge from './pages/GenericChallenge';
import SortWasteGame from './pages/games/SortWasteGame';
import SaveTreesGame from './pages/games/SaveTreesGame';
import CleanOceanGame from './pages/games/CleanOceanGame';
import Leaderboard from './pages/Leaderboard';
import EcoActions from './pages/EcoActions';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
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
    element: (
      <RoleGuard allowedRoles={['student', 'admin']}>
        <Home />
      </RoleGuard>
    ),
    visible: false,
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false,
  },
  {
    name: 'Admin Login',
    path: '/admin-login',
    element: <AdminLogin />,
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
    element: (
      <RoleGuard allowedRoles={['student', 'admin']}>
        <Learn />
      </RoleGuard>
    ),
    visible: false,
  },
  {
    name: 'Quizzes',
    path: '/quizzes',
    element: (
      <RoleGuard allowedRoles={['student', 'admin']}>
        <Quizzes />
      </RoleGuard>
    ),
    visible: false,
  },
  {
    name: 'Quiz',
    path: '/quiz/:id',
    element: (
      <RoleGuard allowedRoles={['student', 'admin']}>
        <QuizTake />
      </RoleGuard>
    ),
    visible: false,
  },
  {
    name: 'Challenges',
    path: '/challenges',
    element: (
      <RoleGuard allowedRoles={['student', 'admin']}>
        <Challenges />
      </RoleGuard>
    ),
    visible: false,
  },
  {
    name: 'Challenge',
    path: '/challenge/:id',
    element: (
      <RoleGuard allowedRoles={['student', 'admin']}>
        <GenericChallenge />
      </RoleGuard>
    ),
    visible: false,
  },
  {
    name: 'Sort Waste Game',
    path: '/game/sort-waste',
    element: (
      <RoleGuard allowedRoles={['student', 'admin']}>
        <SortWasteGame />
      </RoleGuard>
    ),
    visible: false,
  },
  {
    name: 'Save Trees Game',
    path: '/game/save-trees',
    element: (
      <RoleGuard allowedRoles={['student', 'admin']}>
        <SaveTreesGame />
      </RoleGuard>
    ),
    visible: false,
  },
  {
    name: 'Clean Ocean Game',
    path: '/game/clean-ocean',
    element: (
      <RoleGuard allowedRoles={['student', 'admin']}>
        <CleanOceanGame />
      </RoleGuard>
    ),
    visible: false,
  },
  {
    name: 'Leaderboard',
    path: '/leaderboard',
    element: (
      <RoleGuard allowedRoles={['student', 'admin']}>
        <Leaderboard />
      </RoleGuard>
    ),
    visible: false,
  },
  {
    name: 'Eco Actions',
    path: '/eco-actions',
    element: (
      <RoleGuard allowedRoles={['student', 'admin']}>
        <EcoActions />
      </RoleGuard>
    ),
    visible: false,
  },
  {
    name: 'Teacher Dashboard',
    path: '/teacher',
    element: (
      <RoleGuard allowedRoles={['teacher', 'admin']}>
        <TeacherDashboard />
      </RoleGuard>
    ),
    visible: false,
  },
  {
    name: 'Admin Dashboard',
    path: '/admin',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <AdminDashboard />
      </RoleGuard>
    ),
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
