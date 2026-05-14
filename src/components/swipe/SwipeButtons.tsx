"use client";

import { X, Heart, Undo2 } from "lucide-react";

interface SwipeButtonsProps {
  onNo: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onYes: () => void;
}

export function SwipeButtons({ onNo, onUndo, canUndo, onYes }: SwipeButtonsProps) {
  return (
    <div className="flex justify-center items-center gap-8 py-6">
      <button
        onClick={onNo}
        className="w-16 h-16 rounded-full bg-surface shadow-lg border-2 border-red-200 flex items-center justify-center text-red-400 active:scale-95 transition-transform"
        aria-label="No"
      >
        <X size={28} strokeWidth={2.5} />
      </button>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="w-12 h-12 rounded-full bg-surface border-2 border-border flex items-center justify-center text-text-muted active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100"
        aria-label="Undo"
      >
        <Undo2 size={20} strokeWidth={2.5} />
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
