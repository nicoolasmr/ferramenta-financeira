"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import ptBR from '@/locales/pt-BR.json';
import enUS from '@/locales/en-US.json';

type Language = 'pt-BR' | 'en-US';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (path: string) => string;
}

const translations: Record<Language, any> = {
    'pt-BR': ptBR,
    'en-US': enUS,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('pt-BR');

    useEffect(() => {
        const savedLang = localStorage.getItem('revenueos-lang') as Language;
        if (savedLang && (savedLang === 'pt-BR' || savedLang === 'en-US')) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('revenueos-lang', lang);
        // In a real app, you might also update the user's profile in the DB here
    };

    const t = (path: string) => {
        const keys = path.split('.');
        let current = translations[language];
        for (const key of keys) {
            if (current[key] === undefined) return path;
            current = current[key];
        }
        return current as string;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
