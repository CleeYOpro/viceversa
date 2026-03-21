import React from 'react';
import { MemberRole } from '../types';

interface RoleGuardProps {
  requiredRole: MemberRole;
  userRole: MemberRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const roleLevels: Record<MemberRole, number> = {
  admin: 3,
  caregiver: 2,
  aide: 1,
};

export const RoleGuard: React.FC<RoleGuardProps> = ({ requiredRole, userRole, children, fallback = null }) => {
  if (roleLevels[userRole] >= roleLevels[requiredRole]) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
};
