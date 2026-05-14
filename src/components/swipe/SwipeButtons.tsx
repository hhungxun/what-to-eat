"use client";

import { X, Heart } from "lucide-react";

interface SwipeButtonsProps {
  onNo: () => void;
  onYes: () => void;
}

export function SwipeButtons({ onNo, onYes }: SwipeButtonsProps) {
  return (
    <div className="flex justify-center gap-10 py-6">
      <button
        onClick={onNo}
        className="w-16 h-16 rounded-full bg-surface shadow-lg border-2 border-red-200 flex items-center justify-center text-red-400 active:scale-95 transition-transform"
        aria-label="No"
      >
        <X size={28} strokeWidth={2.5} />
      </button>
      <button
        onClick={onYes}
        className="w-16 h-16 rounded-full bg-brand shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform"
        aria-label="Yes"
      >
        <Heart size={26} strokeWidth={2.5} fill="white" />
      </button>
    </div>
  );
}
