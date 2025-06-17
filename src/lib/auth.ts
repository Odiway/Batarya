// src/lib/auth.ts

import { User } from '../types/user';
import { Role } from '../constants/roles';

let loggedInUser: User | null = null;

// Giriş yapmayı simüle eder (örnek)
export function login(email: string, role: Role): User {
  loggedInUser = {
    id: '1',
    name: 'Test Kullanıcı',
    email,
    role,
  };
  return loggedInUser;
}

// Oturumu kapatır
export function logout() {
  loggedInUser = null;
}

// Oturumdaki kullanıcıyı döner
export function getCurrentUser(): User | null {
  return loggedInUser;
}
//Daha sonra gerçek backend ile değiştireceğiz
