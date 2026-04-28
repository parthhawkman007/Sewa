import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { continueWithGoogle as continueWithGoogleService, loginUser, signupUser } from '../services/authService';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'smart-resource-auth';
const ROLE_STORAGE_KEY = 'smart-resource-role';

function normalizeRole(role) {
  if (role === 'citizen') return 'user';
  return role || 'user';
}

function normalizeUser(user) {
  if (!user) return null;
  const normalizedRole = normalizeRole(user.role);
  const roleIds = {
    user: 'USR-101',
    volunteer: 'VOL-201',
    ngo: 'NGO-301',
  };
  return {
    ...user,
    id: user.id || roleIds[normalizedRole],
    role: normalizedRole,
    trustScore: normalizedRole === 'user' ? user.trustScore || 94 : user.trustScore,
  };
}

const demoProfiles = {
  user: {
    name: 'Aarav Sharma',
    role: 'user',
    email: 'aarav@civicgrid.org',
    location: 'East Corridor',
    trustScore: 94,
  },
  volunteer: {
    name: 'Maya Patel',
    role: 'volunteer',
    email: 'maya@communitylink.org',
    skills: ['First Aid', 'Logistics', 'Field Ops'],
    maxDistance: 15,
  },
  ngo: {
    name: 'Nina Joseph',
    role: 'ngo',
    email: 'nina@hopeworks.org',
    organization: 'HopeWorks Foundation',
    organizationType: 'NGO Admin',
  },
};

export function AuthProvider({ children }) {
  const [selectedRole, setSelectedRole] = useState(() => normalizeRole(localStorage.getItem(ROLE_STORAGE_KEY)));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? normalizeUser(JSON.parse(stored)) : null;
  });

  const [authLoading, setAuthLoading] = useState(false);

  const login = async ({ role, name, email }) => {
    setAuthLoading(true);
    const normalizedRole = normalizeRole(role);
    const profile = await loginUser({ role: normalizedRole, name, email });
    setUser(normalizeUser(profile));
    setSelectedRole(normalizedRole);
    setAuthLoading(false);
  };

  const signup = async ({ role, name, email, organization }) => {
    setAuthLoading(true);
    const normalizedRole = normalizeRole(role);
    const profile = await signupUser({ role: normalizedRole, name, email, organization });
    setUser(normalizeUser(profile));
    setSelectedRole(normalizedRole);
    setAuthLoading(false);
  };
  const continueWithGoogle = async ({ role }) => {
    setAuthLoading(true);
    const normalizedRole = normalizeRole(role);
    const profile = await continueWithGoogleService({ role: normalizedRole });
    setUser(normalizeUser(profile));
    setSelectedRole(normalizedRole);
    setAuthLoading(false);
  };
  const logout = () => setUser(null);

  useEffect(() => {
    localStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
  }, [selectedRole]);

  useEffect(() => {
    if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(AUTH_STORAGE_KEY);
  }, [user]);

  const value = useMemo(
    () => ({ selectedRole, setSelectedRole, user, login, signup, continueWithGoogle, logout, roles: demoProfiles, authLoading }),
    [selectedRole, user, authLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
