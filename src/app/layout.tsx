import { Metadata } from 'next';

import './globals.css';

// PROJECT IMPORTS
import ProviderWrapper from 'store/ProviderWrapper';

export const metadata: Metadata = {
  title: 'ChemUCL',
  description: 'UCL Chemical Inventory Management System',
  icons: {
    icon: '/assets/images/ucl-logo.png',
    shortcut: '/assets/images/ucl-logo.png',
    apple: '/assets/images/ucl-logo.png'
  }
};

// ==============================|| ROOT LAYOUT ||============================== //

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProviderWrapper>{children}</ProviderWrapper>
      </body>
    </html>
  );
}
