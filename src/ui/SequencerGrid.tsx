import React from 'react';
import { StepIndex, PadIndex } from '../types';

interface SequencerGridProps {
  grid: boolean[][];
  currentStep: StepIndex;
  onCellToggle: (pad: PadIndex, step: StepIndex) => void;
}

export const SequencerGrid = ({ grid, currentStep, onCellToggle }: SequencerGridProps) => {
  return (
    <div className="space-y-2">
      {/* Sequencer steps */}
      <div className="grid grid-cols-16 gap-1 w-full max-w-4xl mx-auto">
        {Array.from({ length: 16 }, (_, step) => (
          <div
            key={step}
            className={`
              h-8 w-8 rounded border transition-all duration-100
              ${step === currentStep 
                ? 'bg-white border-white shadow-lg shadow-white/50' 
                : 'bg-gray-700 border-gray-600'
              }
            `}
          />
        ))}
      </div>
      
      {/* Sequencer grid - 16 pads x 16 steps */}
      <div className="grid grid-cols-16 gap-1 w-full max-w-4xl mx-auto">
        {Array.from({ length: 16 }, (_, step) => (
          <div key={step} className="space-y-1">
            {Array.from({ length: 16 }, (_, pad) => (
              <button
                key={`${pad}-${step}`}
                className={`
                  w-4 h-4 rounded border transition-all duration-100
                  ${grid[pad] && grid[pad][step]
                    ? 'bg-yellow-400 border-yellow-300' 
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  }
                  ${step === currentStep ? 'ring-1 ring-white' : ''}
                `}
                onClick={() => onCellToggle(pad as PadIndex, step as StepIndex)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
