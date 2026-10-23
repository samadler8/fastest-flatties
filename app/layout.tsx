import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fastest Fatties - Boulder Flatirons FKT Tracker',
  description: 'Track and discover Fastest Known Times on the Boulder Flatirons.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50">{children}</body>
    </html>
  );
}