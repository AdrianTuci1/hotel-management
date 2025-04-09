import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    role: null,
    token: null, // Optional: Store JWT or similar token
  });
  const [loading, setLoading] = useState(true); // Loading state for initial check

  useEffect(() => {
    // Check localStorage on initial load
    const storedAuth = localStorage.getItem('authState');
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        // Optional: Add token validation logic here if applicable
        setAuthState(parsedAuth);
      } catch (error) {
        console.error("Failed to parse auth state from localStorage", error);
        localStorage.removeItem('authState'); // Clear invalid state
      }
    }
    setLoading(false); // Finished loading initial state
  }, []);

  const login = (userData, userRole, token = null) => {
    const newAuthState = {
      isAuthenticated: true,
      user: userData,
      role: userRole,
      token: token,
    };
    setAuthState(newAuthState);
    localStorage.setItem('authState', JSON.stringify(newAuthState));
  };

  const logout = () => {
    const newAuthState = {
      isAuthenticated: false,
      user: null,
      role: null,
      token: null,
    };
    setAuthState(newAuthState);
    localStorage.removeItem('authState');
  };

  // Provide loading state to prevent premature rendering/redirects
  const value = { ...authState, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 