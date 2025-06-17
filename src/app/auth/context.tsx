'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../../types/user';
import { Role } from '../../constants/roles';

interface AuthContextType {
  user: User | null;
  login: (email: string, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const dummyUsers: Record<Role, User> = {
  [Role.ADMIN]: {
    id: '0',
    name: 'Dummy Admin',
    email: 'admin@dummy.com',
    role: Role.ADMIN,
  },
  [Role.YONETICI]: {
    id: '1',
    name: 'Dummy Yönetici',
    email: 'yonetici@dummy.com',
    role: Role.YONETICI,
  },
  [Role.USTA]: {
    id: '2',
    name: 'Dummy Usta',
    email: 'usta@dummy.com',
    role: Role.USTA,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, role: Role) => {
    if (!email.trim()) {
      // Email boşsa dummy user ata
      setUser(dummyUsers[role]);
    } else {
      // Email doluysa gerçek kullanıcı
      const loggedInUser: User = {
        id: 'random-id',
        name: 'Batarya Ustası',
        email,
        role,
      };
      setUser(loggedInUser);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
