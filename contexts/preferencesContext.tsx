import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/authContext";
import { getUserPreferences, saveUserPreferences } from "@/services/preferencesService";
import { formatCurrency, DEFAULT_CURRENCY, DEFAULT_LOCALE } from "@/utils/currency";
import { UserPreferencesType } from "@/types";

type PreferencesContextType = {
  preferences: UserPreferencesType;
  currency: string;
  locale: string;
  setCurrency: (code: string) => Promise<void>;
  format: (amountMinor: number) => string;
  refreshPreferences: () => Promise<void>;
};

const defaultPreferences: UserPreferencesType = {
  currency: DEFAULT_CURRENCY,
  locale: DEFAULT_LOCALE,
};

const PreferencesContext = createContext<PreferencesContextType>({
  preferences: defaultPreferences,
  currency: DEFAULT_CURRENCY,
  locale: DEFAULT_LOCALE,
  setCurrency: async () => {},
  format: (amountMinor: number) => formatCurrency(amountMinor),
  refreshPreferences: async () => {},
});

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferencesType>(defaultPreferences);

  const loadPreferences = useCallback(async () => {
    if (!user?.uid) {
      setPreferences(defaultPreferences);
      return;
    }
    try {
      const data = await getUserPreferences(user.uid);
      if (data) {
        setPreferences({
          currency: data.currency || DEFAULT_CURRENCY,
          locale: data.locale || DEFAULT_LOCALE,
          defaultWalletId: data.defaultWalletId,
        });
      } else {
        setPreferences(defaultPreferences);
      }
    } catch {
      // Fallback to defaults on error / offline
      setPreferences(defaultPreferences);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const setCurrency = async (code: string) => {
    const updated: UserPreferencesType = {
      ...preferences,
      currency: code,
    };
    setPreferences(updated);
    if (user?.uid) {
      await saveUserPreferences(user.uid, {
        currency: code,
        locale: preferences.locale || DEFAULT_LOCALE,
        ...(preferences.defaultWalletId ? { defaultWalletId: preferences.defaultWalletId } : {}),
      });
    }
  };

  const format = useCallback(
    (amountMinor: number) => {
      return formatCurrency(amountMinor, preferences.currency, preferences.locale);
    },
    [preferences.currency, preferences.locale],
  );

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        currency: preferences.currency,
        locale: preferences.locale,
        setCurrency,
        format,
        refreshPreferences: loadPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext);
