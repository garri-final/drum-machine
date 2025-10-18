// React import not required with automatic JSX runtime
import { BpmKnob } from './BpmKnob';
import { BpmDisplay } from './BpmDisplay';

interface ControlsGridProps {
  bpm: number;
  bpmEditMode: boolean;
  isPlaying: boolean;
  onBpmChange: (bpm: number) => void;
  onToggleBpmEdit: () => void;
  onPlay: () => void;
  onStop: () => void;
}

export const ControlsGrid = ({
  bpm,
  bpmEditMode,
  isPlaying,
  onBpmChange,
  onToggleBpmEdit,
  onPlay,
  onStop
}: ControlsGridProps) => {
  return (
    <div className="grid grid-cols-5 gap-2 w-80 mx-auto">
      {/* Row 1 */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <button
        className={`
          w-12 h-12 rounded border-2 transition-all duration-200
          ${bpmEditMode 
            ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50' 
            : 'bg-gray-600 border-gray-500 hover:bg-gray-500'
          }
        `}
        onClick={onToggleBpmEdit}
      >
        <div className="text-white text-xs font-bold">BPM</div>
      </button>
      <div className="flex flex-col items-center space-y-1">
        <BpmKnob
          value={bpm}
          onChange={onBpmChange}
          enabled={bpmEditMode}
        />
        <BpmDisplay bpm={bpm} />
      </div>
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      
      {/* Row 2 */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      
      {/* Row 3 */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      
      {/* Row 4 */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <button
        className={`
          w-12 h-12 rounded border-2 transition-all duration-200
          ${isPlaying 
            ? 'bg-red-500 border-red-400 shadow-lg shadow-red-500/50' 
            : 'bg-gray-600 border-gray-500 hover:bg-gray-500'
          }
        `}
        onClick={onPlay}
      >
        <div className="text-white text-xs font-bold">▶</div>
      </button>
      
      {/* Row 5 */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700" /> {/* Placeholder */}
      <button
        className="w-12 h-12 bg-blue-500 border-2 border-blue-400 rounded transition-all duration-200 hover:bg-blue-400 shadow-lg shadow-blue-500/50"
        onClick={onStop}
      >
        <div className="text-white text-xs font-bold">⏹</div>
      </button>
    </div>
  );
};
