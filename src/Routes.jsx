import Home from './Components/Hero';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Unauthorized from './components/Unauthorized';
import About from './components/About';
import NotFound from './components/NotFound';
import UserNavbar from './Components/UserNavbar';

const routes = [
  {
    path: '/',
    component: Home,
    role: 'public', // accessible to everyone
  },
  {
    path: '/signIn',
    component: SignIn,
    role: 'public', // accessible to everyone
  },
  {
    path: '/signUp',
    component: SignUp,
    role: 'public', // accessible to everyone
  },
  {
    path: '/userNavbar',
    component: UserNavbar,
    role: 'user', // accessible to authenticated users only
  },
  {
    path: '/dashboard',
    component: UserDashboard,
    role: 'user', // accessible to authenticated users only
  },
  {
    path: '/admin-dashboard',
    component: AdminDashboard,
    role: 'admin', // accessible to admin users only
  },
  {
    path: '/unauthorized',
    component: Unauthorized,
    role: 'public', // accessible to everyone
  },
  {
    path: '*',
    component: NotFound,
    role: 'public', // fallback for unknown routes
  },
];

export default routes;
