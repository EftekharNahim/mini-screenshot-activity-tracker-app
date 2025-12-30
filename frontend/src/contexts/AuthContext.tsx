import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthContextType, UserType, Company, Employee } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Company | Employee | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const token = localStorage.getItem('authToken');
    const type = localStorage.getItem('userType') as UserType | null;
    const userData = localStorage.getItem('userData');

    if (token && type && userData) {
      setUserType(type);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (token: string, type: UserType, userData: Company | Employee) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userType', type);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUserType(type);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    setUserType(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, userType, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};