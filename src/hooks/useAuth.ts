import { useEffect, useRef } from 'react';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

export function useAuth() {
  const { firebaseUser, isAdmin, loading, setUser, clearUser, setLoading } = useAuthStore();
  const mongoUser = useAuthStore((state) => state.mongoUser);
  const lastSyncedUidRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
          document.cookie = `firebaseToken=${token}; path=/; max-age=3600; SameSite=Lax${secure}`;

          if (lastSyncedUidRef.current !== user.uid) {
            let response;
            let lastError: unknown;

            // Vercel/serverless instances can briefly return 429 while the
            // auth token listener and the login page sync at the same time.
            for (let attempt = 0; attempt < 3; attempt += 1) {
              try {
                response = await axios.post(
                  '/api/auth/sync',
                  {},
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                break;
              } catch (error) {
                lastError = error;
                const isRetryable = axios.isAxiosError(error) && [429, 500, 503].includes(error.response?.status ?? 0);
                if (!isRetryable || attempt === 2) throw error;
                await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
              }
            }

            if (!response) throw lastError ?? new Error('Unable to sync authenticated user');
            lastSyncedUidRef.current = user.uid;
            setUser(user, response.data.user);
          } else {
            // Read the latest store value without making the auth listener
            // re-subscribe every time mongoUser is updated.
            setUser(user, useAuthStore.getState().mongoUser);
          }
        } catch (error) {
          console.error('Error syncing user:', error);
          // Keep any previously synced profile instead of replacing it with
          // null on a transient API/rate-limit failure.
          setUser(user, useAuthStore.getState().mongoUser);
        }
      } else {
        lastSyncedUidRef.current = null;
        clearUser();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, clearUser, setLoading]);

  const logout = async () => {
    try {
      await signOut(auth);
      document.cookie = `firebaseToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      clearUser();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    firebaseUser,
    mongoUser,
    isAdmin,
    loading,
    logout,
  };
}
