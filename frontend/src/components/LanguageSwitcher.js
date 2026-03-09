import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <div className="relative inline-block">
      <select
        value={i18n.language || 'en'}
        onChange={(e) => changeLanguage(e.target.value)}
        className="text-sm px-3 py-1.5 rounded-md border border-border bg-white hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer appearance-none pr-8"
        style={{ paddingRight: '2rem' }}
      >
        <option value="en">EN</option>
        <option value="pl">PL</option>
      </select>
      <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
};

export default LanguageSwitcher;

