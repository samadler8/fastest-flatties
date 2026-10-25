"use client";

import { MessageSquare, MapPin } from "lucide-react";

export default function RouteDocViewer({
  markdown,
  activeFeatureId,
  onSelectFeature,
}: {
  markdown: string;
  activeFeatureId: string | null;
  onSelectFeature: (id: string) => void;
}) {
  const renderInteractiveText = (text: string) => {
    const lines = text.split("\n");

    return lines.map((line, idx) => {
      const match = line.match(/\[(.*?)\]\(#(.*?)\)/);

      if (match) {
        const [full, linkText, featureId] = match;
        const isActive = activeFeatureId === featureId;
        const parts = line.split(full);

        return (
          <p key={idx} className="my-2 leading-relaxed">
            {parts[0]}
            <button
              onClick={() => onSelectFeature(featureId)}
              className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 border transition-all ${
                isActive
                  ? "bg-flatiron-gold text-sandstone-950 border-flatiron-gold shadow-lg scale-105"
                  : "bg-sandstone-900 text-flatiron-ochre border-sandstone-700 hover:border-flatiron-red hover:text-sandstone-100"
              }`}
            >
              <MapPin size={12} /> {linkText}
            </button>
            {parts[1]}
          </p>
        );
      }

      if (line.startsWith("# ")) {
        return <h1 key={idx} className="text-2xl font-serif font-bold text-sandstone-100 mt-6 mb-3 border-b border-sandstone-800 pb-1">{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-lg font-serif font-bold text-flatiron-ochre mt-4 mb-2">{line.replace("## ", "")}</h2>;
      }

      return <p key={idx} className="my-2 text-sandstone-200 text-sm leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="bg-sandstone-900 border-2 border-sandstone-800 p-8 shadow-2xl font-serif space-y-4">
      <div className="flex items-center justify-between border-b border-sandstone-800 pb-3">
        <span className="font-mono text-xs text-flatiron-ochre uppercase tracking-widest flex items-center gap-2">
          <MessageSquare size={14} /> Official Route Specification & Rules Document
        </span>
        <span className="font-mono text-[10px] text-sandstone-400">
          [ Click embedded links to focus map ]
        </span>
      </div>

      <div className="prose prose-invert max-w-none font-serif">
        {renderInteractiveText(markdown)}
      </div>
    </div>
  );
}