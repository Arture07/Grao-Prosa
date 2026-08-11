import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'pt', label: 'Português', flag: '🇧🇷', short: 'PT' },
    { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪', short: 'DE' },
  ];

  const currentLanguage = i18n.language || 'pt';

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  if (variant === 'full') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <label className="text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5 uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5 text-[#5A4033]" />
          {t('profile.language')}:
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {languages.map((lang) => {
            const isActive = currentLanguage.startsWith(lang.code);
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-2 py-1.5 text-xs font-medium border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#1A1A1A] text-[#FAF7F2] border-[#1A1A1A] font-bold shadow-xs'
                    : 'bg-white text-[#1A1A1A] border-[#1A1A1A]/20 hover:border-[#1A1A1A]/50'
                }`}
              >
                <span>{lang.flag}</span>
                <span className="truncate">{lang.short}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center bg-black/5 p-0.5 rounded-none border border-[#1A1A1A]/10 ${className}`}>
      {languages.map((lang) => {
        const isActive = currentLanguage.startsWith(lang.code);
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleLanguageChange(lang.code)}
            title={lang.label}
            className={`px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              isActive
                ? 'bg-[#1A1A1A] text-[#FAF7F2] shadow-2xs font-bold'
                : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
            }`}
          >
            <span>{lang.flag}</span>
            <span className="hidden xs:inline">{lang.short}</span>
          </button>
        );
      })}
    </div>
  );
};
