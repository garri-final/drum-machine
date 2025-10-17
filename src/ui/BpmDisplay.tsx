interface BpmDisplayProps {
  bpm: number;
}

export const BpmDisplay = ({ bpm }: BpmDisplayProps) => {
  return (
    <div className="text-white text-sm font-mono">
      {bpm} BPM
    </div>
  );
};
