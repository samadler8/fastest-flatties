import type { Metadata } from 'next';
import './globals.css'; // Make sure Tailwind styles are loaded

export const metadata: Metadata = {
  title: 'Fastest Fatties - Boulder Flatirons Speed Records',
  description: 'Community leaderboards, route maps, and speed records for the Boulder Flatirons.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}