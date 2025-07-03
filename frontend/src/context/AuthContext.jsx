import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/auth';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user);
      
      if (location.pathname === '/login' || location.pathname === '/signup') {
        navigate('/');
      }
    }
    setLoading(false);
  }, [location, navigate]);

  const login = async (credentials) => {
    try {
      setError('');
      const user = await loginUser(credentials);
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      throw err;
    }
  };

  const signup = async (userData) => {
      try {
          setError('');
          await registerUser(userData);
          navigate('/login', { state: { success: true } });
      } catch (err) {
          setError(err.message);
          throw err;
      }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    error,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};