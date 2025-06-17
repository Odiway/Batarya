// src/lib/roles.ts

import { Role } from '../constants/roles';
import { User } from '../types/user';

// Kullanıcının belirtilen rolü taşıyıp taşımadığını kontrol eder
export function hasRole(user: User, role: Role): boolean {
  return user.role === role;
}

// Birden fazla rolü kabul eden kontrol fonksiyonu
export function hasAnyRole(user: User, roles: Role[]): boolean {
  return roles.includes(user.role);
}
