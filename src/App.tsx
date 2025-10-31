import { useState, useEffect, useRef } from 'react';
import { NUM_STEPS, NUM_TRACKS } from './types';
import { SequencerScheduler } from './audio/scheduler';
import { useSequencerStore } from './state/useSequencerStore';
import { CategoryTabs } from './ui/CategoryTabs';
import { SkeletonLoader } from './ui/SkeletonLoader';
// import { SequencerGrid } from './ui/SequencerGrid';
import { categories } from './data/categories';
import { samples } from './data/samples';
import type { CategoryId, StepIndex, PadIndex } from './types';

function App() {
  const { 
    bpm, 
    isPlaying, 
    currentStep, 
    grids, 
    activeCategory, 
    mutedCategories,
    soloedTracks,
    setBpm, 
    setPlaying, 
    setCurrentStep, 
    toggleGridCell,
    setSoloTrack,
    clearTrack,
    setActiveCategory,
    toggleCategoryMute
  } = useSequencerStore();
  
  const [knobRotation, setKnobRotation] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  // const [loadedSamples, setLoadedSamples] = useState<Record<CategoryId, AudioBuffer[]>>({} as Record<CategoryId, AudioBuffer[]>);
  const [isLoading, setIsLoading] = useState(true);
  const schedulerRef = useRef<SequencerScheduler | null>(null);

  // Initialize audio context and load samples for all categories
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create audio context
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);

        // Load samples for all categories
        const categoryIds: CategoryId[] = ['PO-12', 'PO-14', 'PO-16', 'PO-20', 'PO-28', 'PO-32', 'PO-33', 'PO-35', 'PO-127'];
        const loadedSamplesByCategory: Record<CategoryId, AudioBuffer[]> = {} as Record<CategoryId, AudioBuffer[]>;
        
        for (const categoryId of categoryIds) {
          const categorySamples = samples[categoryId];
          const samplePromises = categorySamples.map(async (sample) => {
            const response = await fetch(sample.url);
            const arrayBuffer = await response.arrayBuffer();
            return ctx.decodeAudioData(arrayBuffer);
          });
          
          loadedSamplesByCategory[categoryId] = await Promise.all(samplePromises);
        }
        
        // setLoadedSamples(loadedSamplesByCategory);
        
        // Initialize scheduler with loaded samples
        const scheduler = new SequencerScheduler();
        schedulerRef.current = scheduler;
        
        // Set up scheduler callbacks
        scheduler.setCallbacks(
          (step: number) => setCurrentStep(step as StepIndex),
          (padIndex: number) => console.log(`Pad ${padIndex + 1} triggered`)
        );
        
        // Convert AudioBuffers to SampleDef format for scheduler
        const sampleDefs: Record<CategoryId, any[]> = {} as Record<CategoryId, any[]>;
        categoryIds.forEach(categoryId => {
          sampleDefs[categoryId] = loadedSamplesByCategory[categoryId].map((buffer, index) => ({
            ...samples[categoryId][index],
            buffer
          }));
        });
        
        scheduler.setSamples(sampleDefs);
        scheduler.setGrids(grids);
        scheduler.setBpm(bpm);
        
        setIsLoading(false);
        console.log('Audio initialized and samples loaded for all categories');
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



  // Play a sample from active category (unused but kept for reference)
  /*
  const playSample = (sampleIndex: number) => {
    if (!audioContext) {
      console.log('Audio context not ready');
      return;
    }

    try {
      const categorySamples = loadedSamples[activeCategory];
      const categoryDef = categories[activeCategory];
      
      if (categorySamples && categorySamples[sampleIndex]) {
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        
        source.buffer = categorySamples[sampleIndex];
        gainNode.gain.value = 0.8;
        
        // Apply BPM-based pitch shifting for melodic categories
        const playbackRate = categoryDef.pitchShiftEnabled ? bpm / 120 : 1.0;
        source.playbackRate.value = playbackRate;
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        source.start();
        console.log(`Playing ${activeCategory} sample ${sampleIndex + 1} at ${playbackRate}x speed`);
      } else {
        console.log(`Sample ${sampleIndex + 1} not loaded for ${activeCategory}`);
      }
    } catch (error) {
      console.error('Error playing sample:', error);
    }
  };
  */

  // Update scheduler when grids change
  useEffect(() => {
    if (schedulerRef.current) {
      schedulerRef.current.setGrids(grids);
    }
  }, [grids]);

  // Update scheduler when mute/solo state changes
  useEffect(() => {
    if (schedulerRef.current) {
      schedulerRef.current.setMutedCategories(mutedCategories);
      schedulerRef.current.setSoloedTracks(soloedTracks);
    }
  }, [mutedCategories, soloedTracks]);

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
      // Make sure scheduler has the latest grids before starting
      schedulerRef.current.setGrids(grids);
      schedulerRef.current.setMutedCategories(mutedCategories);
      schedulerRef.current.setSoloedTracks(soloedTracks);
      schedulerRef.current.start();
    } else {
      schedulerRef.current.stop();
      setCurrentStep(0);
    }
  }, [isPlaying, grids, mutedCategories, soloedTracks]);

  // Get current active grid and color
  const activeGrid = grids[activeCategory];
  const activeColor = categories[activeCategory].color;

  // Updated pad styles with dynamic color
  const padStyle = (selected: boolean, active: boolean, color: string): React.CSSProperties => {
    const isMuted = mutedCategories.has(activeCategory);
    const base: React.CSSProperties = {
      position: 'relative',
      width: 48,
      height: 48,
      borderRadius: '10px',
      border: active ? '2px solid #fcfcfc' : '2px solid #08080A',
      backgroundImage: selected
        ? `linear-gradient(${color}, ${color}), linear-gradient(rgb(34, 33, 38), rgb(33, 32, 37))`
        : 'linear-gradient(rgb(34, 33, 38), rgb(33, 32, 37))',
      boxShadow: selected
        ? 'rgba(255, 255, 255, 0.2) 2px 3px 2px 0px inset, rgba(255, 255, 255, 0.23) 1px 1px 1px 0px inset'
        : '3px 2px 2px 0 rgb(255 255 255 / 3%) inset, 1px 1px 1px 0 rgb(255 255 255 / 13%) inset',
      overflow: 'hidden',
      cursor: 'pointer',
      opacity: isMuted && !active ? 0.5 : 1.0, // Keep current step fully visible even when muted
      transition: 'opacity 0.2s ease',
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
    textTransform: 'uppercase',
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
    setPlaying(!isPlaying);
  };

  // Handle stop button
  const handleStop = () => {
    setPlaying(false);
    setCurrentStep(0);
  };


  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0B', color: 'white' }} className="md:p-8">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Mobile Layout Only */}
        <div className="block md:hidden">
          {/* Mobile Controls Row */}
          <div style={{ 
            display: 'flex', 
            gap: '6px', 
            alignItems: 'center', 
            padding: '12px 18px',
            marginBottom: '6px'
          }}>
            {/* Play/Pause Toggle Button */}
            <button 
              style={{
                position: 'relative',
                width: 64,
                height: 64,
                borderRadius: '10px',
                border: '2px solid #08080A',
                backgroundImage: 'linear-gradient(rgb(34, 33, 38), rgb(33, 32, 37))',
                boxShadow: '3px 2px 2px 0 rgb(255 255 255 / 3%) inset, 1px 1px 1px 0 rgb(255 255 255 / 13%) inset',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={handlePlay}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                  <rect x="4" y="2" width="3" height="12"/>
                  <rect x="9" y="2" width="3" height="12"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                  <path d="M3 2l10 6-10 6V2z"/>
                </svg>
              )}
            </button>

            {/* BPM Display - Full Width */}
            <div style={{ 
              position: 'relative',
              flex: 1,
              height: 64,
              borderRadius: '10px',
              border: '2px solid #08080A',
              backgroundImage: 'linear-gradient(90deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.7) 100%), linear-gradient(rgb(34, 33, 38) 0%, rgb(33, 32, 37) 100%)',
              boxShadow: 'rgba(255, 255, 255, 0.1) -2px -1px 6px 0px inset, rgba(255, 255, 255, 0.12) 2px 2px 9px 0px inset',
              overflow: 'hidden',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              padding: '8px'
            }}>
              <div style={{ 
                fontFamily: 'DS-Digital, monospace', 
                fontStyle: 'italic', 
                fontSize: '44px', 
                color: 'white', 
                opacity: 1.0 
              }}>
                {bpm} BPM
              </div>
            </div>

            {/* BPM Knob */}
            <div 
              style={{ 
                position: 'relative',
                width: 64,
                height: 64,
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
                top: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '8px', 
                height: '8px', 
                backgroundColor: 'white', 
                borderRadius: '100px' 
              }} />
            </div>
          </div>

          {/* Mobile Category Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '6px', 
            padding: '0px 18px',
            marginBottom: '12px',
            overflowX: 'auto'
          }}>
            {Object.entries(categories).map(([categoryId, category]) => {
              const isActive = activeCategory === categoryId;
              const isMuted = mutedCategories.has(categoryId as CategoryId);
              
              return (
                <button
                  key={categoryId}
                  style={{
                    position: 'relative',
                    width: '84px',
                    height: '42px',
                    borderRadius: '8px',
                    border: isActive ? `2px solid ${category.color}` : '2px solid #08080A',
                    backgroundImage: 'linear-gradient(rgb(34, 33, 38), rgb(33, 32, 37))',
                    boxShadow: 'rgba(255, 255, 255, 0.03) 3px 2px 2px 0px inset, rgba(255, 255, 255, 0.13) 1px 1px 1px 0px inset',
                    cursor: 'pointer',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontWeight: 500,
                    fontSize: '13px',
                    color: isMuted ? 'rgba(255, 255, 255, 0.5)' : 'white',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  onClick={() => setActiveCategory(categoryId as CategoryId)}
                  onDoubleClick={() => toggleCategoryMute(categoryId as CategoryId)}
                >
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Mobile Sequencer Grid */}
          <div style={{ 
            padding: '12px 18px 12px 3px',
            marginBottom: '2rem'
          }}>
            {/* Solo Dots Row (Top) */}
            <div style={{ 
              display: 'flex', 
              gap: '6px', 
              marginBottom: '6px',
              paddingLeft: '15px'
            }}>
              {Array.from({ length: 8 }, (_, pad) => (
                <button
                  key={`mobile-solo-${pad}`}
                  style={{
                    flex: 1,
                    height: '6px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => {
                    const currentSolo = soloedTracks[activeCategory];
                    const newSolo = currentSolo === pad ? null : pad;
                    setSoloTrack(activeCategory, newSolo as PadIndex | null);
                  }}
                >
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: soloedTracks[activeCategory] === pad ? activeColor : 'rgba(255, 255, 255, 0.12)'
                  }} />
                </button>
              ))}
            </div>

            {/* Main Mobile Grid */}
            <div style={{ 
              display: 'flex', 
              gap: '3px'
            }}>
              {/* Step Numbers (Left) */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px',
                marginRight: '3px'
              }}>
              {Array.from({ length: NUM_STEPS }, (_, step) => (
                <div key={`mobile-step-${step}`} style={{
                  width: '12px',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontWeight: 500,
                  fontSize: '11px',
                  color: (step + 1) % 4 === 1 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)',
                  transform: 'rotate(270deg)',
                  transformOrigin: 'center'
                }}>
                  {step + 1}
                </div>
              ))}
              </div>

              {/* Grid Cells */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px',
                flex: 1
              }}>
                {Array.from({ length: NUM_STEPS }, (_, step) => (
                  <div key={`mobile-row-${step}`} style={{ 
                    display: 'flex', 
                    gap: '6px'
                  }}>
                    {Array.from({ length: 8 }, (_, pad) => (
                      <button
                        key={`mobile-${pad}-${step}`}
                        style={{
                          flex: 1,
                          aspectRatio: '1',
                          borderRadius: '6px',
                          border: step === currentStep ? '2px solid #fcfcfc' : '2px solid #08080A',
                          backgroundImage: Boolean(activeGrid[pad] && activeGrid[pad][step])
                            ? `linear-gradient(${activeColor}, ${activeColor}), linear-gradient(rgb(34, 33, 38), rgb(33, 32, 37))`
                            : 'linear-gradient(rgb(34, 33, 38), rgb(33, 32, 37))',
                          boxShadow: Boolean(activeGrid[pad] && activeGrid[pad][step])
                            ? 'rgba(255, 255, 255, 0.2) 2px 3px 2px 0px inset, rgba(255, 255, 255, 0.23) 1px 1px 1px 0px inset'
                            : '3px 2px 2px 0 rgb(255 255 255 / 3%) inset, 1px 1px 1px 0 rgb(255 255 255 / 13%) inset',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => {
                          toggleGridCell(pad as PadIndex, step as StepIndex);
                          // Trigger immediate audio playback
                          if (schedulerRef.current) {
                            schedulerRef.current.triggerPad(pad, activeCategory);
                          }
                        }}
                        aria-pressed={activeGrid[pad] && activeGrid[pad][step] ? 'true' : 'false'}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Clear Buttons Row (Bottom) */}
            <div style={{ 
              display: 'flex', 
              gap: '6px', 
              marginTop: '6px',
              paddingLeft: '18px'
            }}>
              {Array.from({ length: 8 }, (_, pad) => {
                // Only show clear button if this track has at least one active pad
                const hasActivePads = activeGrid[pad] && activeGrid[pad].some(step => step);
                
                return (
                  <button
                    key={`mobile-clear-${pad}`}
                    style={{
                      flex: 1,
                      height: '8px',
                      border: 'none',
                      background: 'transparent',
                      cursor: hasActivePads ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => hasActivePads && clearTrack(activeCategory, pad as PadIndex)}
                  >
                    {hasActivePads && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ 
                        opacity: 0.2,
                        transition: 'opacity 0.2s ease'
                      }}>
                        <g clipPath="url(#clip0_7_5911)">
                          <path d="M0.713867 0.714279L9.2853 9.28571M9.2853 0.714279L0.713867 9.28571" stroke="white" strokeWidth="1.5"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_7_5911">
                            <rect width="10" height="10" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop Layout Only */}
        <div className="hidden md:block">
        {/* Desktop Controls Row */}
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

        {/* Desktop Column Numbers Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${NUM_STEPS}, 48px)`, 
          gap: '8px',
          justifyContent: 'center',
          marginBottom: '8px',
          paddingTop: '10px'
        }}>
          {Array.from({ length: NUM_STEPS }, (_, step) => (
            <div key={step} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '24px',
              fontFamily: 'IBM Plex Mono, monospace',
              fontWeight: 500,
              fontSize: '14px',
              color: (step + 1) % 4 === 1 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}>
              {step + 1}
            </div>
          ))}
        </div>

        {/* Desktop Sequencer Grid with Side Columns */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          {/* Left Column - Solo Buttons */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            marginRight: '8px'
          }}>
            {Array.from({ length: NUM_TRACKS }, (_, pad) => (
              <button
                key={`solo-${pad}`}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => {
                  const currentSolo = soloedTracks[activeCategory];
                  const newSolo = currentSolo === pad ? null : pad;
                  setSoloTrack(activeCategory, newSolo as PadIndex | null);
                }}
              >
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: soloedTracks[activeCategory] === pad ? activeColor : 'rgba(255, 255, 255, 0.12)'
                }} />
              </button>
            ))}
          </div>

          {/* Main Sequencer Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${NUM_STEPS}, 48px)`, 
            gap: '8px'
          }}>
            {Array.from({ length: NUM_STEPS }, (_, step) => (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Array.from({ length: NUM_TRACKS }, (_, pad) => (
                  <button
                    key={`${pad}-${step}`}
                    style={padStyle(Boolean(activeGrid[pad] && activeGrid[pad][step]), step === currentStep, activeColor)}
                    onClick={() => {
                      toggleGridCell(pad as PadIndex, step as StepIndex);
                      // Trigger immediate audio playback
                      if (schedulerRef.current) {
                        schedulerRef.current.triggerPad(pad, activeCategory);
                      }
                    }}
                    aria-pressed={activeGrid[pad] && activeGrid[pad][step] ? 'true' : 'false'}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Right Column - Clear Buttons */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            marginLeft: '8px'
          }}>
            {Array.from({ length: NUM_TRACKS }, (_, pad) => {
              // Only show clear button if this track has at least one active pad
              const hasActivePads = activeGrid[pad] && activeGrid[pad].some(step => step);
              
              if (!hasActivePads) {
                return <div key={`clear-${pad}`} style={{ width: '48px', height: '48px' }} />;
              }
              
              return (
                <button
                  key={`clear-${pad}`}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => clearTrack(activeCategory, pad as PadIndex)}
                  onMouseEnter={(e) => {
                    const svg = e.currentTarget.querySelector('svg');
                    if (svg) svg.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    const svg = e.currentTarget.querySelector('svg');
                    if (svg) svg.style.opacity = '0.2';
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="white" style={{ 
                    opacity: 0.2,
                    transition: 'opacity 0.2s ease'
                  }}>
                    <path d="M9.5 2.5L2.5 9.5M2.5 2.5L9.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Category Tabs */}
        <CategoryTabs />

        {/* Test buttons removed per requirements */}
        </div>
      </div>
    </div>
  );
}

export default App;
