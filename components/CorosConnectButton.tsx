"use client";

import { Cpu } from 'lucide-react';

export default function CorosConnectButton({ athleteId }: { athleteId: string }) {
  const handleConnect = () => {
    window.location.href = `/api/auth/coros?athleteId=${encodeURIComponent(athleteId)}`;
  };

  return (
    <button
      onClick={handleConnect}
      className="inline-flex items-center gap-2 bg-sandstone-900 border-2 border-flatiron-ochre text-flatiron-ochre hover:bg-flatiron-ochre hover:text-sandstone-950 px-4 py-2 font-mono text-xs uppercase font-bold transition-all shadow-lg"
    >
      <Cpu size={14} /> [ Connect COROS Account ]
    </button>
  );
}
