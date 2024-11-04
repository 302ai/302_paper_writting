import '@/styles/globals.css';
import { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Toaster } from 'react-hot-toast';

import { Providers } from './providers';

export const maxDuration = 600;

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      lang="zh"
    >
      <head />
      <body className="h-fit min-h-fit bg-[#f5f5f5]">
        <div className="end-3 hidden" />
        <Providers themeProps={{ attribute: 'class', defaultTheme: 'light' }}>
          <Toaster />
          {children}
        </Providers>
        <Script
          id="show-customer-chat"
          strategy="afterInteractive"
        >
          {`
              window.onload = function () {
              const width = document.body.clientWidth;
              if (width <= 768) {
                return;
              }
              const script = document.createElement("script");
              script.src =
                "https://assets.salesmartly.com/js/project_177_61_1649762323.js";
              document.body.appendChild(script);
            };
          `}
        </Script>
      </body>
    </html>
  );
}
