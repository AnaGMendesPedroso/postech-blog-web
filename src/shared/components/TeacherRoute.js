import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function TeacherRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'teacher') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default TeacherRoute;
