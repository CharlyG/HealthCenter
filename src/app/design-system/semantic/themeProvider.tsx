/**
 * Theme Provider
 * Manages light/dark theme switching
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as lightTokens from './tokens';
import { darkTheme } from './darkTokens';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  tokens: typeof lightTokens;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
  storageKey = 'healthcare-theme' 
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  
  // Get system preference
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  // Resolve theme (handle 'system' option)
  const resolveTheme = (themeValue: Theme): ResolvedTheme => {
    if (themeValue === 'system') {
      return getSystemTheme();
    }
    return themeValue;
  };
  
  // Set theme and persist
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  };
  
  // Initialize theme from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme;
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setThemeState(stored);
      }
    } catch (e) {
      console.warn('Failed to load theme preference:', e);
    }
  }, [storageKey]);
  
  // Update resolved theme when theme changes
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    
    // Update document class for CSS
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  }, [theme]);
  
  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setResolvedTheme(getSystemTheme());
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  // Get current tokens
  const tokens = resolvedTheme === 'dark' ? darkTheme : lightTokens;
  
  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    tokens,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Theme toggle component
interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  
  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };
  
  const getIcon = () => {
    switch (theme) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'system': return '💻';
    }
  };
  
  const getLabel = () => {
    switch (theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
    }
  };
  
  return (
    <button
      onClick={cycleTheme}
      className={className}
      aria-label={`Current theme: ${getLabel()}. Click to change.`}
      title={`Theme: ${getLabel()}`}
      style={{
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid',
        borderColor: 'var(--border-default)',
        backgroundColor: 'var(--surface-elevated)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: 500,
      }}
    >
      <span style={{ fontSize: '18px' }}>{getIcon()}</span>
      <span>{getLabel()}</span>
    </button>
  );
}
