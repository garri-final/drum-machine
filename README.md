# Drum Machine

A desktop-first web drum machine built with Vite + React + TypeScript and Web Audio API.

## Features

- **16 sound pads** (4×4 grid) with keyboard mapping
- **16-step, 16-track sequencer** with polyphony
- **Real-time editing** while transport is running
- **Play/Stop transport** with BPM control (60-200)
- **Visual playhead** and per-pad activity lights
- **Clean, minimal UI** prepared for future image swap
- **Feature-flagged Tone.js integration** for pitch shift

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## Sample Files

The app expects 16 sample files in `public/samples/`:
- `pad01.wav` through `pad16.wav`

Placeholder silent WAV files are already created. Replace them with your own drum samples.

## Keyboard Mapping

- **Row 1 (bottom)**: Z X C V
- **Row 2**: A S D F  
- **Row 3**: Q W E R
- **Row 4 (top)**: 1 2 3 4

## Controls

- **BPM Edit Button**: Toggle BPM editing mode
- **BPM Knob**: Adjust BPM in steps of 10 (60-200)
- **Play Button**: Start/resume sequencer
- **Stop Button**: Stop and reset to step 1

## Usage

1. **Loading**: Wait for "Loading samples..." to complete
2. **Sequencer**: Click cells in the 16×16 grid to toggle hits
3. **Playback**: Click Play to start the sequencer loop
4. **Real-time editing**: While playing, click pads to toggle hits on current step
5. **BPM control**: Enable BPM Edit mode, then use the knob to adjust tempo

## Architecture

- **Audio Engine**: Web Audio API with lookahead scheduler
- **State Management**: Zustand store for sequencer state
- **UI Components**: Modular React components with TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Effects**: Optional Tone.js integration (feature-flagged)

## File Structure

```
src/
  audio/           # Audio engine and scheduling
  data/            # Sample definitions and mappings
  state/           # Zustand store for sequencer state
  ui/              # React components
  types.ts         # TypeScript type definitions
```

## Adding Custom Samples

1. Replace files in `public/samples/` with your own WAV files
2. Update sample names in `src/data/samples.ts` if needed
3. Ensure files are named `pad01.wav` through `pad16.wav`

## Tone.js Integration

To enable pitch shift effects:
1. Set `enablePitchShift = true` in `src/audio/pitchShift.ts`
2. The pitch shift knob will appear in the controls grid
3. Adjust semitones from -12 to +12