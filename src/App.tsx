import { useState, useEffect, useRef } from 'react';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [grid, setGrid] = useState(() => 
    Array(16).fill(null).map(() => Array(16).fill(false))
  );
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [samples, setSamples] = useState<AudioBuffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<number | null>(null);

  // Initialize audio context and load samples
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create audio context
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);

        // Load sample files
        const samplePromises = Array.from({ length: 16 }, async (_, i) => {
          const response = await fetch(`/samples/pad${String(i + 1).padStart(2, '0')}.wav`);
          const arrayBuffer = await response.arrayBuffer();
          return ctx.decodeAudioData(arrayBuffer);
        });

        const loadedSamples = await Promise.all(samplePromises);
        setSamples(loadedSamples);
        setIsLoading(false);
        console.log('Audio initialized and samples loaded');
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        setIsLoading(false);
      }
    };

    initAudio();
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

  // Sequencer loop with audio
  useEffect(() => {
    if (!isPlaying || !audioContext) return;

    const playStep = () => {
      // Play all active samples for current step
      for (let pad = 0; pad < 16; pad++) {
        if (grid[pad] && grid[pad][currentStep]) {
          playSample(pad);
        }
      }
      
      // Move to next step
      setCurrentStep(prev => (prev + 1) % 16);
    };

    // Start the sequencer
    const interval = setInterval(playStep, 60000 / bpm / 4);
    intervalRef.current = interval;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bpm, currentStep, grid, audioContext, samples]);

  const toggleGridCell = (pad: number, step: number) => {
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[pad] = [...newGrid[pad]];
      newGrid[pad][step] = !newGrid[pad][step];
      return newGrid;
    });
  };

  // Handle play button with audio context initialization
  const handlePlay = async () => {
    if (audioContext && audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    setIsPlaying(!isPlaying);
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
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem' }}>Drum Machine</h1>
        
        {/* Sequencer Grid */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '1rem' }}>Sequencer</h2>
          
          {/* Step indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: '0.25rem', marginBottom: '1rem' }}>
            {Array.from({ length: 16 }, (_, step) => (
              <div
                key={step}
                style={{
                  height: '32px',
                  backgroundColor: step === currentStep ? '#ffffff' : '#374151',
                  border: '1px solid #6b7280',
                  borderRadius: '0.25rem'
                }}
              />
            ))}
          </div>

          {/* Sequencer grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: '0.25rem' }}>
            {Array.from({ length: 16 }, (_, step) => (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {Array.from({ length: 16 }, (_, pad) => (
                  <button
                    key={`${pad}-${step}`}
                    onClick={() => toggleGridCell(pad, step)}
                    style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: grid[pad] && grid[pad][step] ? '#facc15' : '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.125rem',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button 
            onClick={handlePlay}
            style={{ 
              backgroundColor: isPlaying ? '#ef4444' : '#22c55e', 
              color: 'white', 
              padding: '1rem 2rem', 
              border: 'none', 
              borderRadius: '0.5rem', 
              fontSize: '1rem',
              marginRight: '1rem',
              cursor: 'pointer'
            }}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </button>
          <button 
            onClick={() => {
              console.log('Testing audio...');
              console.log('Audio context:', audioContext);
              console.log('Samples loaded:', samples.length);
              if (samples.length > 0) {
                playSample(0);
              }
            }}
            style={{ 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              padding: '1rem 2rem', 
              border: 'none', 
              borderRadius: '0.5rem', 
              fontSize: '1rem',
              marginRight: '1rem',
              cursor: 'pointer'
            }}
          >
            Test Audio
          </button>
          <button 
            onClick={testAudio}
            style={{ 
              backgroundColor: '#8b5cf6', 
              color: 'white', 
              padding: '1rem 2rem', 
              border: 'none', 
              borderRadius: '0.5rem', 
              fontSize: '1rem',
              marginRight: '1rem',
              cursor: 'pointer'
            }}
          >
            Test Tone
          </button>
          <span style={{ fontSize: '1.2rem' }}>BPM: {bpm}</span>
        </div>

        {/* Pad grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
          {Array.from({ length: 16 }, (_, i) => (
            <button
              key={i}
              onClick={() => {
                console.log(`Pad ${i + 1} clicked`);
                playSample(i);
              }}
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#eab308',
                border: '2px solid #facc15',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: 'black',
                fontWeight: 'bold'
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '1rem' }}>
          Click sequencer cells to toggle hits. Current step: {currentStep + 1}
        </div>
      </div>
    </div>
  );
}

export default App;
