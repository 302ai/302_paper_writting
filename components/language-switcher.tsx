'use client';
import { Button } from '@nextui-org/button';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/dropdown';
import { LanguagesIcon } from 'lucide-react';

import { useLanguageContext } from '@/providers/language-provider';
const languages = [
  { key: 'zh', label: '中文' },
  { key: 'en', label: 'English' },
  { key: 'ja', label: '日本語' },
  { key: 'de', label: 'Deutsch' },
  { key: 'fr', label: 'Français' },
  { key: 'ko', label: '한국어' },
];

export interface LanguageSwitchProps {
  className?: string;
}
export default function LanguageSwitch({ className }: LanguageSwitchProps) {
  const { t, language, setLanguage } = useLanguageContext();

  return (
    <>
      <Dropdown>
        <DropdownTrigger className={className}>
          <Button
            isIconOnly
            aria-label="Switch language"
            className="h-fit w-fit min-w-fit border-none p-1"
            variant="ghost"
          >
            <LanguagesIcon className="h-4 w-4" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          disallowEmptySelection
          aria-describedby={undefined}
          defaultSelectedKeys={[language]}
          selectedKeys={[language]}
          onAction={(key) => {
            setLanguage(key as string);
          }}
        >
          {languages.map((language) => {
            return (
              <DropdownItem key={language.key}>{language.label}</DropdownItem>
            );
          })}
        </DropdownMenu>
      </Dropdown>
    </>
  );
}
