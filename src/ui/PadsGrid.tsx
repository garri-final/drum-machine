import React, { useState, useEffect } from 'react';
import { PadIndex } from '../types';
import { samples } from '../data/samples';

interface PadsGridProps {
  onPadTrigger: (padIndex: PadIndex) => void;
  onPadToggle: (padIndex: PadIndex) => void;
  isPlaying: boolean;
  currentStep: number;
  activePads: Set<PadIndex>;
}

export const PadsGrid = ({ 
  onPadTrigger, 
  onPadToggle, 
  isPlaying, 
  currentStep,
  activePads 
}: PadsGridProps) => {
  const [keyboardMap] = useState(() => {
    const map = new Map<string, PadIndex>();
    samples.forEach((sample, index) => {
      map.set(sample.key.toLowerCase(), index as PadIndex);
      map.set(sample.key.toUpperCase(), index as PadIndex);
    });
    return map;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const padIndex = keyboardMap.get(e.key);
      if (padIndex !== undefined) {
        e.preventDefault();
        onPadTrigger(padIndex);
        if (isPlaying) {
          onPadToggle(padIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardMap, onPadTrigger, onPadToggle, isPlaying]);

  const handlePadClick = (padIndex: PadIndex) => {
    onPadTrigger(padIndex);
    if (isPlaying) {
      onPadToggle(padIndex);
    }
  };

  // Create 4x4 grid layout (bottom-left is pad 1, top-right is pad 16)
  const padLayout = [
    [12, 13, 14, 15], // Row 4 (top) - keys 1 2 3 4
    [8, 9, 10, 11],   // Row 3 - keys Q W E R
    [4, 5, 6, 7],     // Row 2 - keys A S D F
    [0, 1, 2, 3],     // Row 1 (bottom) - keys Z X C V
  ];

  return (
    <div className="space-y-4">
      {/* Keyboard legend */}
      <div className="text-white text-xs text-center">
        <div>1 2 3 4 | Q W E R | A S D F | Z X C V</div>
      </div>
      
      {/* Pads grid */}
      <div className="grid grid-cols-4 gap-2 w-80 mx-auto">
        {padLayout.map((row, rowIndex) => 
          row.map((padIndex) => (
            <div key={padIndex} className="flex flex-col items-center space-y-1">
              {/* Pad */}
              <button
                id={`pad-${padIndex + 1}`}
                data-pad={padIndex + 1}
                className={`
                  w-16 h-16 rounded-lg border-2 transition-all duration-100
                  ${activePads.has(padIndex) 
                    ? 'bg-yellow-400 border-yellow-300 shadow-lg shadow-yellow-400/50' 
                    : 'bg-yellow-500 border-yellow-400 hover:bg-yellow-400 hover:border-yellow-300'
                  }
                  active:scale-95
                `}
                onMouseDown={() => handlePadClick(padIndex)}
                style={{
                  '--pad-bg': 'none' // Prepare for future image swap
                } as React.CSSProperties}
              >
                <div className="pad-surface w-full h-full rounded-md" />
              </button>
              
              {/* LED */}
              <div 
                className={`
                  w-2 h-2 rounded-full transition-all duration-150
                  ${activePads.has(padIndex) 
                    ? 'bg-green-400 shadow-lg shadow-green-400/50' 
                    : 'bg-gray-600'
                  }
                `}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
