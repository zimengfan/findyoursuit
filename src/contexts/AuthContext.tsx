import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  subscription_tier: 'free' | 'monthly' | 'seasonal' | 'yearly';
  monthly_usage: number;
  last_reset: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  canUseService: () => boolean;
  incrementUsage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'mock_users';
const SESSION_KEY = 'mock_session';

export function getUsers(): Record<string, any> {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
}

function setUsers(users: Record<string, any>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}
function setSession(userId: string | null) {
  if (userId) localStorage.setItem(SESSION_KEY, userId);
  else localStorage.removeItem(SESSION_KEY);
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, load session from localStorage
  useEffect(() => {
    setLoading(true);
    const users = getUsers();
    const sessionId = getSession();
    if (sessionId && users[sessionId]) {
      let u = users[sessionId];
      // Reset usage if month changed
      if (u.last_reset !== getToday().slice(0, 7)) {
        u.monthly_usage = 0;
        u.last_reset = getToday().slice(0, 7);
        users[sessionId] = u;
        setUsers(users);
      }
      setUser(u);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const users = getUsers();
    if (Object.values(users).some((u: any) => u.email === email)) {
      setLoading(false);
      throw new Error('Email already registered');
    }
    const id = Math.random().toString(36).slice(2);
    const newUser: User = {
      id,
      email,
      subscription_tier: 'free',
      monthly_usage: 0,
      last_reset: getToday().slice(0, 7),
      isAdmin: email === 'admin@admin.com' && password === 'iamadmin',
    };
    users[id] = { ...newUser, password };
    setUsers(users);
    setSession(id);
    setUser(newUser);
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    // Special admin login
    if (email === 'admin@admin.com' && password === 'iamadmin') {
      const adminUser: User = {
        id: 'admin',
        email,
        subscription_tier: 'yearly',
        monthly_usage: 0,
        last_reset: getToday().slice(0, 7),
        isAdmin: true,
      };
      setSession('admin');
      setUser(adminUser);
      setLoading(false);
      return;
    }
    const users = getUsers();
    const found = Object.values(users).find((u: any) => u.email === email && u.password === password);
    if (!found) {
      setLoading(false);
      throw new Error('Invalid email or password');
    }
    setSession(found.id);
    setUser({ ...found, password: undefined });
    setLoading(false);
  };

  const signOut = async () => {
    setSession(null);
    setUser(null);
  };

  const getUsageLimit = () => {
    if (!user) return 1;
    return user.subscription_tier === 'free' ? 5 : 50;
  };

  const canUseService = () => {
    if (!user) return true;
    return user.monthly_usage < getUsageLimit();
  };

  const incrementUsage = async () => {
    if (!user) return;
    if (user.isAdmin) return; // Admin has unlimited usage
    const users = getUsers();
    const u = { ...users[user.id] };
    u.monthly_usage = (u.monthly_usage || 0) + 1;
    users[user.id] = u;
    setUsers(users);
    setUser({ ...user, monthly_usage: u.monthly_usage });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, canUseService, incrementUsage }}>
      {children}
    </AuthContext.Provider>
  );
}; 