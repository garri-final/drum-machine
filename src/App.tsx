import { useState, useEffect, useRef } from 'react';
import { NUM_STEPS, NUM_TRACKS } from './types';
import { SequencerScheduler } from './audio/scheduler';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [knobRotation, setKnobRotation] = useState(0);
  const [grid, setGrid] = useState(() => 
    Array(NUM_TRACKS).fill(null).map(() => Array(NUM_STEPS).fill(false))
  );
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [samples, setSamples] = useState<AudioBuffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const schedulerRef = useRef<SequencerScheduler | null>(null);

  // Initialize audio context and load samples
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create audio context
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);

        // Load sample files
        const samplePromises = Array.from({ length: NUM_TRACKS }, async (_, i) => {
          const response = await fetch(`/samples/pad${String(i + 1).padStart(2, '0')}.wav`);
          const arrayBuffer = await response.arrayBuffer();
          return ctx.decodeAudioData(arrayBuffer);
        });

        const loadedSamples = await Promise.all(samplePromises);
        setSamples(loadedSamples);
        
        // Initialize scheduler with loaded samples
        const scheduler = new SequencerScheduler();
        schedulerRef.current = scheduler;
        
        // Set up scheduler callbacks
        scheduler.setCallbacks(
          (step: number) => setCurrentStep(step),
          (padIndex: number) => console.log(`Pad ${padIndex + 1} triggered`)
        );
        
        // Convert AudioBuffers to SampleDef format for scheduler
        const sampleDefs = loadedSamples.map((buffer, index) => ({
          id: index as any,
          name: `Pad ${index + 1}`,
          url: `/samples/pad${String(index + 1).padStart(2, '0')}.wav`,
          key: '',
          buffer
        }));
        scheduler.setSamples(sampleDefs);
        scheduler.setGrid(grid);
        scheduler.setBpm(bpm);
        
        setIsLoading(false);
        console.log('Audio initialized and samples loaded');
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        setIsLoading(false);
      }
    };

    initAudio();
  }, []);

  // Cleanup scheduler on unmount
  useEffect(() => {
    return () => {
      if (schedulerRef.current) {
        schedulerRef.current.destroy();
      }
    };
  }, []);



  // Play a sample
  const playSample = (sampleIndex: number) => {
    if (!audioContext) {
      console.log('Audio context not ready');
      return;
    }

    try {
      // Use the actual loaded samples instead of synthetic sounds
      if (samples[sampleIndex]) {
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        
        source.buffer = samples[sampleIndex];
        gainNode.gain.value = 0.8;
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        source.start();
        console.log(`Playing loaded sample ${sampleIndex + 1}`);
      } else {
        console.log(`Sample ${sampleIndex + 1} not loaded`);
      }
    } catch (error) {
      console.error('Error playing sample:', error);
    }
  };

  // Update scheduler when grid changes
  useEffect(() => {
    if (schedulerRef.current) {
      schedulerRef.current.setGrid(grid);
    }
  }, [grid]);

  // Update scheduler BPM when BPM changes
  useEffect(() => {
    if (schedulerRef.current) {
      schedulerRef.current.setBpm(bpm);
    }
  }, [bpm]);

  // Handle play/stop with scheduler
  useEffect(() => {
    if (!schedulerRef.current) return;

    if (isPlaying) {
      schedulerRef.current.start();
    } else {
      schedulerRef.current.stop();
      setCurrentStep(0);
    }
  }, [isPlaying]);

  const toggleGridCell = (pad: number, step: number) => {
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[pad] = [...newGrid[pad]];
      newGrid[pad][step] = !newGrid[pad][step];
      return newGrid;
    });
  };

  // Updated pad styles
  const padStyle = (selected: boolean, active: boolean): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'relative',
      width: 48,
      height: 48,
      borderRadius: '10px',
      border: active ? '2px solid #fcfcfc' : '2px solid #08080A',
      backgroundImage: selected
        ? 'linear-gradient(rgb(255, 81, 0), rgb(255, 81, 0)), linear-gradient(rgb(34, 33, 38), rgb(33, 32, 37))'
        : 'linear-gradient(rgb(34, 33, 38), rgb(33, 32, 37))',
      boxShadow: selected
        ? 'rgba(255, 255, 255, 0.2) 2px 3px 2px 0px inset, rgba(255, 255, 255, 0.23) 1px 1px 1px 0px inset'
        : '3px 2px 2px 0 rgb(255 255 255 / 3%) inset, 1px 1px 1px 0 rgb(255 255 255 / 13%) inset',
      overflow: 'hidden',
      cursor: 'pointer',
    };
    return base;
  };

  // Updated button styles
  const buttonStyle: React.CSSProperties = {
    position: 'relative',
    width: 104,
    height: 104,
    borderRadius: '10px',
    border: '2px solid #08080A',
    backgroundImage: 'linear-gradient(rgb(34, 33, 38), rgb(33, 32, 37))',
    boxShadow: '3px 2px 2px 0 rgb(255 255 255 / 3%) inset, 1px 1px 1px 0 rgb(255 255 255 / 13%) inset',
    overflow: 'hidden',
    cursor: 'pointer',
  };

  const buttonTextStyle: React.CSSProperties = {
    fontFamily: 'IBM Plex Mono, monospace',
    fontWeight: 500,
    fontSize: '14px',
    color: 'white',
    whiteSpace: 'nowrap',
    lineHeight: '100%',
  };

  // Knob drag handlers with BPM increments of 10
  const handleKnobMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startBpm = bpm;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      
      // Convert mouse movement to BPM change (10 BPM per 20px movement)
      const bpmChange = Math.round(deltaX / 20) * 10;
      const newBpm = Math.max(60, Math.min(200, startBpm + bpmChange));
      
      // Calculate rotation based on BPM (60-200 range maps to -120 to +120 degrees)
      const rotation = ((newBpm - 120) / 70) * 120;
      
      setBpm(newBpm);
      setKnobRotation(rotation);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle play button with audio context initialization
  const handlePlay = async () => {
    if (audioContext && audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle stop button
  const handleStop = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  // Test audio with a simple tone
  const testAudio = () => {
    if (!audioContext) {
      console.log('No audio context');
      return;
    }

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      console.log('Test tone played');
    } catch (error) {
      console.error('Error playing test tone:', error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Drum Machine</h1>
          <div style={{ fontSize: '1.2rem' }}>Loading samples...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0B', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Controls Row - Play, Pause, BPM, Knob */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          alignItems: 'center', 
          marginBottom: '8px',
          width: 'fit-content',
          margin: '0 auto 8px auto'
        }}>
          <button style={buttonStyle} onClick={handlePlay}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              justifyContent: 'space-between', 
              width: '100%', 
              height: '100%', 
              padding: '12px 6px', 
              flexDirection: 'column', 
              boxSizing: 'border-box' 
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                <path d="M3 2l10 6-10 6V2z"/>
              </svg>
              <div style={buttonTextStyle}>Play</div>
            </div>
          </button>
          <button style={buttonStyle} onClick={handleStop}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              justifyContent: 'space-between', 
              width: '100%', 
              height: '100%', 
              padding: '12px 6px', 
              flexDirection: 'column', 
              boxSizing: 'border-box' 
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                <rect x="4" y="4" width="8" height="8"/>
              </svg>
              <div style={buttonTextStyle}>Stop</div>
            </div>
          </button>
          <div style={{ 
            position: 'relative',
            width: 552,
            height: 104,
            borderRadius: '10px',
            border: '2px solid #08080A',
            backgroundImage: 'linear-gradient(90deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.7) 100%), linear-gradient(rgb(34, 33, 38) 0%, rgb(33, 32, 37) 100%)',
            boxShadow: 'rgba(255, 255, 255, 0.1) -2px -1px 6px 0px inset, rgba(255, 255, 255, 0.12) 2px 2px 9px 0px inset',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}>
            <div style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '54px', 
              transform: 'translateY(-50%)', 
              fontFamily: 'DS-Digital, monospace', 
              fontStyle: 'italic', 
              fontSize: '94px', 
              color: 'white', 
              opacity: 0.8 
            }}>
              {bpm} BPM
            </div>
          </div>
          <div 
            style={{ 
              position: 'relative',
              width: 104,
              height: 104,
              borderRadius: '1000px',
              border: '2px solid #08080A',
              backgroundImage: 'linear-gradient(rgb(34, 33, 38), rgb(33, 32, 37))',
              boxShadow: '3px 2px 2px 0 rgb(255 255 255 / 3%) inset, 1px 1px 1px 0 rgb(255 255 255 / 13%) inset',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              transform: `rotate(${knobRotation}deg)`,
              cursor: 'grab',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
            onMouseDown={handleKnobMouseDown}
          >
            <div style={{ 
              position: 'absolute',
              top: '14px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '8px', 
              height: '8px', 
              backgroundColor: 'white', 
              borderRadius: '100px' 
            }} />
          </div>
        </div>

        {/* Sequencer Grid 16×8 - 8px gaps */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${NUM_STEPS}, 48px)`, 
            gap: '8px',
            justifyContent: 'center'
          }}>
            {Array.from({ length: NUM_STEPS }, (_, step) => (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Array.from({ length: NUM_TRACKS }, (_, pad) => (
                  <button
                    key={`${pad}-${step}`}
                    style={padStyle(Boolean(grid[pad] && grid[pad][step]), step === currentStep)}
                    onClick={() => toggleGridCell(pad, step)}
                    aria-pressed={grid[pad] && grid[pad][step] ? 'true' : 'false'}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Test buttons removed per requirements */}
      </div>
    </div>
  );
}

export default App;
