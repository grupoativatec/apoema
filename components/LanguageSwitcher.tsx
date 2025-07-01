// LanguageSwitcher.tsx
'use client';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { GlobeIcon, CheckIcon } from 'lucide-react';

interface Props {
  locale: 'pt' | 'en' | 'zh';
  changeLocale: (lang: 'pt' | 'en' | 'zh') => void;
}

export function LanguageSwitcher({ locale, changeLocale }: Props) {
  const languages = [
    { code: 'pt', label: 'Português', icon: '🇧🇷' },
    { code: 'en', label: 'English', icon: '🇺🇸' },
    { code: 'zh', label: '中文', icon: '🇨🇳' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <GlobeIcon className="h-4 w-4" />
          {languages.find((l) => l.code === locale)?.icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLocale(lang.code as 'pt' | 'en' | 'zh')}
            className="flex items-center gap-2"
          >
            <span>{lang.icon}</span>
            <span>{lang.label}</span>
            {locale === lang.code && <CheckIcon className="ml-auto h-4 w-4 opacity-70" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
