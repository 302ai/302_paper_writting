'use client';

import * as React from 'react';
import { NextUIProvider } from '@nextui-org/system';
import { useRouter } from 'next/navigation';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProviderProps } from 'next-themes/dist/types';

import LanguageProvider from '@/providers/language-provider';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <NextUIProvider
      className="h-full"
      navigate={router.push}
    >
      <NextThemesProvider {...themeProps}>
        <LanguageProvider
          loadingComponent={
            <div className="flex h-screen items-center justify-center">
              <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900" />
            </div>
          }
        >
          {children}
        </LanguageProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}
