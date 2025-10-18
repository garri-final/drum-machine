// React import not required with automatic JSX runtime
import type { StepIndex, PadIndex } from '../types';

interface SequencerGridProps {
  grid: boolean[][];
  currentStep: StepIndex;
  onCellToggle: (pad: PadIndex, step: StepIndex) => void;
  activeColor: string; // hex color for active pads
}

export const SequencerGrid = ({ grid, currentStep, onCellToggle, activeColor }: SequencerGridProps) => {
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
      
      {/* Sequencer grid - 12 pads x 16 steps */}
      <div className="grid grid-cols-16 gap-1 w-full max-w-4xl mx-auto">
        {Array.from({ length: 16 }, (_, step) => (
          <div key={step} className="space-y-1">
            {Array.from({ length: 12 }, (_, pad) => (
              <button
                key={`${pad}-${step}`}
                className={`
                  w-4 h-4 rounded border transition-all duration-100
                  ${grid[pad] && grid[pad][step]
                    ? 'border-white' 
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  }
                  ${step === currentStep ? 'ring-1 ring-white' : ''}
                `}
                style={{
                  backgroundImage: grid[pad] && grid[pad][step]
                    ? `linear-gradient(${activeColor}, ${activeColor}), linear-gradient(rgb(34, 33, 38), rgb(33, 32, 37))`
                    : undefined,
                  boxShadow: grid[pad] && grid[pad][step]
                    ? `rgba(255, 255, 255, 0.2) 2px 3px 2px 0px inset, rgba(255, 255, 255, 0.23) 1px 1px 1px 0px inset`
                    : undefined,
                }}
                onClick={() => onCellToggle(pad as PadIndex, step as StepIndex)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
