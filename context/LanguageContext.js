import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' }
];

export const LanguageProvider = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState(() => {
        // Get saved language from localStorage or default to English
        return localStorage.getItem('language') || 'en';
    });

    useEffect(() => {
        // Save language preference to localStorage
        localStorage.setItem('language', currentLanguage);
        
        // Update document direction for RTL languages
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
        
        // Update document language
        document.documentElement.lang = currentLanguage;
    }, [currentLanguage]);

    const changeLanguage = (languageCode) => {
        setCurrentLanguage(languageCode);
    };

    return (
        <LanguageContext.Provider value={{ currentLanguage, changeLanguage, languages }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}; 