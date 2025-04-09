import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import MainLayout from '../../components/Layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      console.log("Attempting login/registration for:", email);
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isLogin) {
        const userData = { email: email, name: 'Test User' };
        const userRole = 'admin';
        login(userData, userRole);
        navigate('/dashboard');
      } else {
        const userData = { email: email, name: 'New User' };
        const userRole = 'user';
        login(userData, userRole);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Authentication failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    console.log("Simulating Google Auth...");
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const userData = { email: 'googleuser@example.com', name: 'Google User' };
      const userRole = 'user';
      login(userData, userRole);
      navigate('/dashboard');
    } catch (error) {
      console.error("Google Auth failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyAuth = async () => {
    setLoading(true);
    console.log("Simulating Passkey Auth...");
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const userData = { email: 'passkeyuser@example.com', name: 'Passkey User' };
      const userRole = 'admin';
      login(userData, userRole);
      navigate('/dashboard');
    } catch (error) {
      console.error("Passkey Auth failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>

          <div className={styles.authTabs}>
            <button 
              className={`${styles.authTab} ${isLogin ? styles.activeTab : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Conectare
            </button>
            <button 
              className={`${styles.authTab} ${!isLogin ? styles.activeTab : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Înregistrare
            </button>
          </div>

          <form className={styles.authForm} onSubmit={handleFormSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                autoComplete="email"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password">Parolă</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>

            {!isLogin && (
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirmă parola</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            {isLogin && (
              <div className={styles.forgotPassword}>
                <a href="#">Ați uitat parola?</a>
              </div>
            )}

            <button 
              type="submit" 
              className={styles.authButton}
              disabled={loading}
            >
              {loading ? 'Se procesează...' : isLogin ? 'Conectare' : 'Înregistrare'}
            </button>
          </form>

          <div className={styles.authDivider}>
            <span>sau</span>
          </div>

          <div className={styles.authAlternatives}>
            <button 
              className={styles.googleButton}
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuă cu Google
            </button>
            
            <button 
              className={styles.passkeyButton}
              onClick={handlePasskeyAuth}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12,1L3,5v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12V5L12,1zm0,4.68c1.25,0,2.25,1.01,2.25,2.25C14.25,9.19,13.24,10.2,12,10.2s-2.25-1.01-2.25-2.27C9.75,6.69,10.75,5.68,12,5.68z M17,16H7v-1.5c0-1.67,3.33-2.5,5-2.5s5,0.83,5,2.5V16z" />
              </svg>
              Folosește Passkey
            </button>
          </div>

          <div className={styles.authFooter}>
            {isLogin ? (
              <p>Nu aveți cont? <button className={styles.authToggle} onClick={() => setIsLogin(false)}>Înregistrați-vă</button></p>
            ) : (
              <p>Aveți deja cont? <button className={styles.authToggle} onClick={() => setIsLogin(true)}>Conectați-vă</button></p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login; 