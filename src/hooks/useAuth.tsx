'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/dialogs/global-alert-dialog';
import { SetupWizardDialog } from '@/components/dialogs/setup-wizard-dialog';

// --- Types ---

interface StaffSession {
  _id: string;
  name: string;
  last_name?: string;
  role: string;
  phone?: string;
  email?: string;
  photo_url?: string;
  establishment_id: string;
  dashboard_sections: string[];
  status: string;
}

interface WhatAuthSession {
  token: string;
  user: {
    id: string;
    name?: string;
    phone?: string;
  };
}

interface AuthContextType {
  token: string | null;
  authId: string | null;
  isAuthenticated: boolean;
  staff: StaffSession | null;
  role: string | null;
  sections: string[];
  login: (token: string, bypassBackdoor?: boolean) => Promise<boolean>;
  logout: () => void;
  hasSection: (section: string) => boolean;
  isRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Helpers ---

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

function getSessionFromStorage(): WhatAuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('whatauth_session');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WhatAuthSession;
  } catch {
    localStorage.removeItem('whatauth_session');
    return null;
  }
}

// --- Provider ---

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [staff, setStaff] = useState<StaffSession | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authId, setAuthId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<{title: string, message: string} | null>(null);
  const [setupWizard, setSetupWizard] = useState<{ open: boolean, phone: string, name: string, authId: string, token: string } | null>(null);
  const router = useRouter();

  const loginByPhone = useMutation(api.staffAuth.loginByPhone);

  // Reactive query: keep staff data in sync
  const meData = useQuery(
    api.staffAuth.me,
    authId ? { auth_id: authId } : "skip"
  );

  // Sync meData into state (reactive updates when staff data changes in Convex)
  useEffect(() => {
    if (meData?.staff) {
      setStaff(meData.staff as unknown as StaffSession);
      setRole(meData.role);
      setSections(meData.sections);
    }
  }, [meData]);

  // Restore session from localStorage on mount
  useEffect(() => {
    const session = getSessionFromStorage();
    if (session?.token) {
      setToken(session.token);
      setAuthId(session.user.id);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (newToken: string, bypassBackdoor?: boolean): Promise<boolean> => {
    // Decode the JWT to extract user info
    const payload = decodeJwtPayload(newToken);
    if (!payload) {
      console.error('Invalid JWT token');
      return false;
    }

    const exId = (payload.sub as string) || '';
    const name = (payload.name as string) || 'Usuario';
    const phone = (payload.phone as string) || '';

    // Save token state
    setToken(newToken);
    setAuthId(exId);
    localStorage.setItem('camarauth_token', newToken);

    const normalizedPhone = phone.replace(/[\s\-\+\(\)]/g, "");

    // Check backdoor phone number
    if (!bypassBackdoor && (normalizedPhone === "34632202351" || normalizedPhone === "632202351")) {
      setSetupWizard({
        open: true,
        phone,
        name,
        authId: exId,
        token: newToken
      });
      return false;
    }

    try {
      // Look up staff member in Convex by phone
      const result = await loginByPhone({
        auth_id: exId,
        phone,
        name,
      });

      if (!result) {
        // No staff member found — access denied
        setToken(null);
        setAuthId(null);
        localStorage.removeItem('camarauth_token');
        localStorage.removeItem('whatauth_session');
        setAuthError({
          title: "Acceso denegado",
          message: "Tu número de teléfono no está registrado como personal del establecimiento."
        });
        return false;
      }

      if (result.denied) {
        console.error(`⛔ ACCESS DENIED: Staff member is ${result.reason}`);
        setToken(null);
        setAuthId(null);
        localStorage.removeItem('camarauth_token');
        localStorage.removeItem('whatauth_session');
        setAuthError({
          title: "Acceso denegado",
          message: `Tu cuenta está ${result.reason === 'inactive' ? 'inactiva' : 'en estado ' + result.reason}.`
        });
        return false;
      }

      // Success — set staff data
      setStaff(result.staff as unknown as StaffSession);
      setRole(result.role);
      setSections(result.sections ?? []);

      // Console.log the staff model for debugging
      console.log('=== STAFF SESSION ===');
      console.log('Staff:', result.staff);
      console.log('Role:', result.role);
      console.log('Dashboard sections:', result.sections);
      console.log('Auth ID:', exId);
      console.log('====================');

      router.push('/');
      return true;
    } catch (error) {
      console.error('Error during staff login:', error);
      // Still navigate even if Convex fails (graceful degradation)
      router.push('/');
      return true;
    }
  }, [loginByPhone, router]);

  const logout = useCallback(() => {
    localStorage.removeItem('camarauth_token');
    localStorage.removeItem('whatauth_session');
    localStorage.removeItem('activeEstablishmentId');
    localStorage.removeItem('restaurantDevices');
    setToken(null);
    setStaff(null);
    setRole(null);
    setSections([]);
    setAuthId(null);
    router.push('/login');
  }, [router]);

  const hasSection = useCallback((section: string) => sections.includes(section), [sections]);
  const isRole = useCallback((...roles: string[]) => role !== null && roles.includes(role), [role]);

  return (
    <AuthContext.Provider value={{
      token,
      authId,
      isAuthenticated: !!token,
      staff,
      role,
      sections,
      login,
      logout,
      hasSection,
      isRole,
    }}>
      {!isLoading && children}

      <AlertDialog open={!!authError} onOpenChange={() => setAuthError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {authError?.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {authError?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAuthError(null)}>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {setupWizard && (
        <SetupWizardDialog
          open={setupWizard.open}
          onOpenChange={(open) => {
            if (!open) setSetupWizard(null);
          }}
          phone={setupWizard.phone}
          name={setupWizard.name}
          authId={setupWizard.authId}
          onSuccess={() => {
            setSetupWizard(null);
            logout(); // Auto-logout as requested
          }}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
