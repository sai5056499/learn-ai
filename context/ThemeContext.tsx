


import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Theme, themes, defaultTheme } from '../styles/themes';

interface ThemeContextType {
    theme: Theme;
    setTheme: (themeName: string) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        const savedThemeName = localStorage.getItem('learnai-theme');
        return themes.find(t => t.name === savedThemeName) || defaultTheme;
    });

    useEffect(() => {
        const root = document.documentElement;
        
        // Add a class to the body for theme-specific CSS rule targeting
        const newThemeClass = theme.name.toLowerCase().replace(/\s+/g, '-');
        document.body.className = newThemeClass;

        for (const [key, value] of Object.entries(theme.properties)) {
            root.style.setProperty(key, value);
        }
        localStorage.setItem('learnai-theme', theme.name);
    }, [theme]);

    const setTheme = (themeName: string) => {
        const newTheme = themes.find(t => t.name === themeName);
        if (newTheme) {
            setThemeState(newTheme);
        }
    };
    
    const isDark = useMemo(() => {
        const darkThemes = ['cyber dark', 'glassmorphism'];
        return darkThemes.includes(theme.name.toLowerCase());
    }, [theme]);

    const value = useMemo(() => ({ theme, setTheme, isDark }), [theme, isDark]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};