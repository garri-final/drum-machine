import React, { useState, useRef, useCallback, useEffect } from 'react';

interface BpmKnobProps {
  value: number;
  onChange: (value: number) => void;
  enabled: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export const BpmKnob = ({ 
  value, 
  onChange, 
  enabled, 
  min = 60, 
  max = 200, 
  step = 10 
}: BpmKnobProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const startAngleRef = useRef<number>(0);
  const startValueRef = useRef<number>(0);

  const getAngleFromValue = useCallback((val: number) => {
    const range = max - min;
    const normalized = (val - min) / range;
    return normalized * 270 - 135; // -135 to +135 degrees
  }, [min, max]);

  const getValueFromAngle = useCallback((angle: number) => {
    const normalized = (angle + 135) / 270;
    const rawValue = min + normalized * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  }, [min, max, step]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enabled) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    if (knobRef.current) {
      const rect = knobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      startAngleRef.current = angle;
      startValueRef.current = value;
    }
  }, [enabled, value]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !enabled) return;
    
    if (knobRef.current) {
      const rect = knobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      const deltaAngle = angle - startAngleRef.current;
      const newValue = getValueFromAngle(getAngleFromValue(startValueRef.current) + deltaAngle);
      
      if (newValue !== value) {
        onChange(newValue);
      }
    }
  }, [isDragging, enabled, value, onChange, getAngleFromValue, getValueFromAngle]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!enabled) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? -step : step;
    const newValue = Math.max(min, Math.min(max, value + delta));
    onChange(newValue);
  }, [enabled, value, onChange, min, max, step]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const rotation = getAngleFromValue(value);

  return (
    <div
      ref={knobRef}
      className={`
        w-12 h-12 rounded-full border-2 border-gray-600 
        flex items-center justify-center cursor-pointer
        transition-all duration-100
        ${enabled ? 'hover:border-gray-400' : 'opacity-50 cursor-not-allowed'}
        ${isDragging ? 'scale-105' : ''}
      `}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      style={{
        transform: `rotate(${rotation}deg)`,
        background: `conic-gradient(from -135deg, #3b82f6 0deg, #3b82f6 ${rotation + 135}deg, #374151 ${rotation + 135}deg, #374151 270deg)`
      }}
    >
      <div className="w-1 h-6 bg-white rounded-full" />
    </div>
  );
};
