import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Web App Generator API',
  description: 'AI-powered web application generation with GitHub Pages deployment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
