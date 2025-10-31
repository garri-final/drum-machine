import React from 'react';

// Reusable skeleton primitives with pulse animation
const SkeletonBox: React.FC<{
  width: number | string;
  height: number | string;
  borderRadius?: number | string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ width, height, borderRadius = 10, className = '', style = {} }) => (
  <div
    className={`skeleton-pulse ${className}`}
    style={{
      width,
      height,
      borderRadius,
      border: '2px solid #08080A',
      backgroundImage: 'linear-gradient(rgb(34, 33, 38), rgb(33, 32, 37))',
      boxShadow: '3px 2px 2px 0 rgb(255 255 255 / 3%) inset, 1px 1px 1px 0 rgb(255 255 255 / 13%) inset',
      boxSizing: 'border-box', // Match Tailwind's global reset
      ...style
    }}
  />
);

const SkeletonCircle: React.FC<{
  size: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ size, className = '', style = {} }) => (
  <div
    className={`skeleton-pulse ${className}`}
    style={{
      width: size,
      height: size,
      borderRadius: '1000px',
      border: '2px solid #08080A',
      backgroundImage: 'linear-gradient(rgb(34, 33, 38), rgb(33, 32, 37))',
      boxShadow: '3px 2px 2px 0 rgb(255 255 255 / 3%) inset, 1px 1px 1px 0 rgb(255 255 255 / 13%) inset',
      boxSizing: 'border-box', // Match Tailwind's global reset
      ...style
    }}
  />
);

const SkeletonDot: React.FC<{
  size: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ size, className = '', style = {} }) => (
  <div
    className={`skeleton-pulse ${className}`}
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      ...style
    }}
  />
);

// Desktop Skeleton Layout
const DesktopSkeleton = () => (
  <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
    {/* Desktop Controls Row */}
    <div style={{ 
      display: 'flex', 
      gap: '8px', 
      alignItems: 'center', 
      marginBottom: '8px',
      width: 'fit-content',
      margin: '0 auto 8px auto'
    }}>
      {/* Play Button */}
      <SkeletonBox width={104} height={104} />
      
      {/* Stop Button */}
      <SkeletonBox width={104} height={104} />
      
      {/* BPM Display */}
      <SkeletonBox 
        width={552} 
        height={104}
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.7) 100%), linear-gradient(rgb(34, 33, 38) 0%, rgb(33, 32, 37) 100%)',
          boxShadow: 'rgba(255, 255, 255, 0.1) -2px -1px 6px 0px inset, rgba(255, 255, 255, 0.12) 2px 2px 9px 0px inset'
        }}
      />
      
      {/* BPM Knob */}
      <SkeletonCircle size={104} />
    </div>

    {/* Desktop Column Numbers Row */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(16, 48px)', 
      gap: '8px',
      justifyContent: 'center',
      marginBottom: '8px',
      paddingTop: '10px'
    }}>
      {Array.from({ length: 16 }, (_, step) => (
        <div key={step} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '24px',
          fontFamily: 'IBM Plex Mono, monospace',
          fontWeight: 500,
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.2)',
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
        {Array.from({ length: 8 }, (_, pad) => (
          <div
            key={`solo-${pad}`}
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SkeletonDot size={6} />
          </div>
        ))}
      </div>

      {/* Main Sequencer Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(16, 48px)', 
        gap: '8px'
      }}>
        {Array.from({ length: 16 }, (_, step) => (
          <div key={step} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.from({ length: 8 }, (_, pad) => (
              <SkeletonBox
                key={`${pad}-${step}`}
                width={48}
                height={48}
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
        {Array.from({ length: 8 }, (_, pad) => (
          <div
            key={`clear-${pad}`}
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SkeletonDot size={12} />
          </div>
        ))}
      </div>
    </div>

    {/* Desktop Category Tabs */}
    <div style={{ 
      display: 'flex', 
      gap: '8px', 
      justifyContent: 'center',
      marginTop: '16px',
      flexWrap: 'wrap'
    }}>
      {Array.from({ length: 9 }, (_, index) => (
        <SkeletonBox 
          key={`tab-${index}`}
          width={104} 
          height={48}
        />
      ))}
    </div>
  </div>
);

// Mobile Skeleton Layout
const MobileSkeleton = () => (
  <div>
    {/* Mobile Controls Row */}
    <div style={{ 
      display: 'flex', 
      gap: '6px', 
      alignItems: 'center', 
      padding: '12px 18px',
      marginBottom: '6px'
    }}>
      {/* Play/Pause Toggle Button */}
      <SkeletonBox width={64} height={64} />

      {/* BPM Display - Full Width */}
      <SkeletonBox 
        width="100%" 
        height={64}
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.7) 100%), linear-gradient(rgb(34, 33, 38) 0%, rgb(33, 32, 37) 100%)',
          boxShadow: 'rgba(255, 255, 255, 0.1) -2px -1px 6px 0px inset, rgba(255, 255, 255, 0.12) 2px 2px 9px 0px inset'
        }}
      />

      {/* BPM Knob */}
      <SkeletonCircle size={64} />
    </div>

    {/* Mobile Category Tabs */}
    <div style={{ 
      display: 'flex', 
      gap: '6px', 
      padding: '0px 18px',
      marginBottom: '12px',
      overflowX: 'auto'
    }}>
      {Array.from({ length: 9 }, (_, index) => (
        <SkeletonBox 
          key={`mobile-tab-${index}`}
          width={84} 
          height={42}
          style={{ flexShrink: 0 }}
        />
      ))}
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
          <div
            key={`mobile-solo-${pad}`}
            style={{
              flex: 1,
              height: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SkeletonDot size={6} />
          </div>
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
          {Array.from({ length: 16 }, (_, step) => (
            <div key={`mobile-step-${step}`} style={{
              width: '12px',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'IBM Plex Mono, monospace',
              fontWeight: 500,
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.2)',
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
          {Array.from({ length: 16 }, (_, step) => (
            <div key={`mobile-row-${step}`} style={{ 
              display: 'flex', 
              gap: '6px'
            }}>
              {Array.from({ length: 8 }, (_, pad) => (
                <SkeletonBox
                  key={`mobile-${pad}-${step}`}
                  width="100%"
                  height="100%"
                  style={{
                    aspectRatio: '1',
                    borderRadius: '6px'
                  }}
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
        {Array.from({ length: 8 }, (_, pad) => (
          <div
            key={`mobile-clear-${pad}`}
            style={{
              flex: 1,
              height: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SkeletonDot size={10} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Main Skeleton Loader Component
export const SkeletonLoader = () => (
  <>
    <style>{`
      @keyframes skeleton-pulse {
        0%, 100% {
          opacity: 0.5;
        }
        50% {
          opacity: 0.7;
        }
      }
      
      .skeleton-pulse {
        animation: skeleton-pulse 1.5s ease-in-out infinite;
      }
    `}</style>
    
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0B', color: 'white' }} className="md:p-8">
      {/* Mobile Layout Only */}
      <div className="block md:hidden">
        <MobileSkeleton />
      </div>

      {/* Desktop Layout Only */}
      <div className="hidden md:block">
        <DesktopSkeleton />
      </div>
    </div>
  </>
);
