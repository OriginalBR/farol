"use client";

import React from "react";

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
}

export default function AudioVisualizer({
  isPlaying,
  barCount = 14,
}: AudioVisualizerProps) {
  const delays = [
    "0.1s", "0.3s", "0.2s", "0.5s", "0.15s", "0.4s", "0.25s",
    "0.35s", "0.1s", "0.45s", "0.2s", "0.3s", "0.15s", "0.4s"
  ];

  return (
    <div className="flex items-center justify-center gap-1 h-8 px-3 py-1 rounded-full bg-[#16202C] border border-[#26333F]">
      <span className="text-[10px] font-mono-tech text-[var(--accent)] mr-1 tracking-wider">
        VOX // SYNTH
      </span>
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          className={`w-1 rounded-full bg-[var(--accent)] transition-all duration-300 ${
            isPlaying ? "audio-bar opacity-90 shadow-[0_0_6px_var(--accent-glow)]" : "h-1.5 opacity-30"
          }`}
          style={
            isPlaying
              ? {
                  animationDelay: delays[i % delays.length],
                  animationDuration: `${0.6 + (i % 4) * 0.15}s`,
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}
