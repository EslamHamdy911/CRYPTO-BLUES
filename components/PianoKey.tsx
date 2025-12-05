import React from 'react';
import { Note } from '../types';

interface PianoKeyProps {
  noteData: Note;
  isActive: boolean;
  onMouseDown: (note: Note) => void;
  onMouseUp: (note: Note) => void;
}

export const PianoKey: React.FC<PianoKeyProps> = ({ noteData, isActive, onMouseDown, onMouseUp }) => {
  const isWhite = noteData.type === 'white';
  
  // Dynamic styles for active state
  const activeStyle = isActive
    ? isWhite 
      ? 'bg-cyan-200 shadow-[0_0_30px_#06b6d4,inset_0_0_20px_#06b6d4] translate-y-1' 
      : 'bg-fuchsia-400 shadow-[0_0_30px_#d946ef,inset_0_0_20px_#d946ef] translate-y-1'
    : isWhite 
      ? 'bg-white/90 shadow-[inset_0_-5px_10px_rgba(0,0,0,0.3)] hover:bg-white' 
      : 'bg-black shadow-[inset_0_-2px_5px_rgba(255,255,255,0.2)] border border-gray-800';

  const baseClasses = `
    relative transition-all duration-75 ease-out rounded-b-lg cursor-pointer
    flex items-end justify-center pb-2 select-none
    ${isWhite ? 'w-12 h-48 z-10 text-black' : 'w-8 h-32 -mx-4 z-20 text-white'}
    ${activeStyle}
  `;

  return (
    <div
      className={baseClasses}
      onMouseDown={() => onMouseDown(noteData)}
      onMouseUp={() => onMouseUp(noteData)}
      onTouchStart={(e) => { e.preventDefault(); onMouseDown(noteData); }}
      onTouchEnd={(e) => { e.preventDefault(); onMouseUp(noteData); }}
    >
      <span className="text-xs font-bold opacity-50 uppercase">{noteData.key}</span>
    </div>
  );
};
