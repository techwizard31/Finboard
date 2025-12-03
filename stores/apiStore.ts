import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { RateLimit } from '@/types/api.types';

interface ApiStore {
  apiKeys: Record<string, string>;
  rateLimits: Record<string, RateLimit>;
  
  setApiKey: (provider: string, key: string) => void;
  getApiKey: (provider: string) => string | undefined;
  updateRateLimit: (provider: string, rateLimit: RateLimit) => void;
  checkRateLimit: (provider: string) => boolean;
}

export const useApiStore = create<ApiStore>()(
  persist(
    (set, get) => ({
      apiKeys: {},
      rateLimits: {},

      setApiKey: (provider, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),

      getApiKey: (provider) => {
        return get().apiKeys[provider];
      },

      updateRateLimit: (provider, rateLimit) =>
        set((state) => ({
          rateLimits: { ...state.rateLimits, [provider]: rateLimit },
        })),

      checkRateLimit: (provider) => {
        const rateLimit = get().rateLimits[provider];
        if (!rateLimit) return true;

        const now = new Date();
        const resetTime = new Date(rateLimit.resetTime);

        if (now > resetTime) {
          return true;
        }

        return (
          rateLimit.currentMinute < rateLimit.requestsPerMinute &&
          rateLimit.currentDay < rateLimit.requestsPerDay
        );
      },
    }),
    {
      name: 'finboard-api',
      storage: createJSONStorage(() => localStorage),
    }
  )
);