// context/ThemeContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '@react-navigation/native';

import {
    LightTheme,
    DarkTheme,
    DustyTheme,
    OceanTheme,
    CloudyTheme,
    PoppyTheme,
    ClockTheme,
    Playful,
    Provocative,
    PurpleUrkle,
    PinkPanther
} from '@/assets/styles/themes';

const themes = {
    light: LightTheme,
    dark: DarkTheme,
    dusty: DustyTheme,
    cloudy: CloudyTheme,
    ocean: OceanTheme,
    poppy: PoppyTheme,
    clock: ClockTheme,
    play: Playful,
    provo: Provocative,
    pantha: PinkPanther,
    purps: PurpleUrkle
};

type ThemeName = keyof typeof themes;

type ThemeContextType = {
    theme: Theme;
    setTheme: (name: ThemeName) => void;
    currentTheme: ThemeName;
    themeOptions: ThemeName[];
};

const ThemeContext = createContext<ThemeContextType>({
    theme: LightTheme,
    setTheme: () => {},
    currentTheme: 'light',
    themeOptions: Object.keys(themes) as ThemeName[],
});

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentTheme, setCurrentTheme] = useState<ThemeName | null>(null); //

    useEffect(() => {
        AsyncStorage.getItem('theme').then((storedTheme) => {
            if (storedTheme && storedTheme in themes) {
                setCurrentTheme(storedTheme as ThemeName);
            } else {
                setCurrentTheme('light'); // default fallback
            }
        });
    }, []);

    const setTheme = (name: ThemeName) => {
        setCurrentTheme(name);
        AsyncStorage.setItem('theme', name);
    };

    if (!currentTheme) return null; //

    const theme = themes[currentTheme];

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                currentTheme,
                themeOptions: Object.keys(themes) as ThemeName[],
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};


// Use this in screens/components
export const useThemeToggle = () => useContext(ThemeContext);
export default AppThemeProvider;
