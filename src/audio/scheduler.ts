import { getAudioContext, getCurrentTime } from './audioContext';
import { playSample } from './playSample';
import type { SampleDef, CategoryId } from '../types';
import { NUM_STEPS, NUM_TRACKS } from '../types';
import { categories } from '../data/categories';

export class SequencerScheduler {
  private intervalId: number | null = null;
  private nextNoteTime: number = 0;
  private currentStep: number = 0;
  private bpm: number = 120;
  private scheduleAheadTime: number = 0.1; // 100ms lookahead
  private lookaheadInterval: number = 25; // 25ms scheduling interval
  private samples: Record<CategoryId, SampleDef[]> = {} as Record<CategoryId, SampleDef[]>;
  private grids: Record<CategoryId, boolean[][]> = {} as Record<CategoryId, boolean[][]>;
  private mutedCategories: Set<CategoryId> = new Set();
  private soloedTracks: Record<CategoryId, number | null> = {} as Record<CategoryId, number | null>;
  private onStepChange: (step: number) => void = () => {};
  private onPadTrigger: (padIndex: number) => void = () => {};

  constructor() {
    // No need to initialize grids here - they'll be set via setGrids
  }

  public setSamples(samples: Record<CategoryId, SampleDef[]>): void {
    this.samples = samples;
  }

  public setGrids(grids: Record<CategoryId, boolean[][]>): void {
    this.grids = grids;
  }

  public setMutedCategories(mutedCategories: Set<CategoryId>): void {
    this.mutedCategories = mutedCategories;
  }

  public setSoloedTracks(soloedTracks: Record<CategoryId, number | null>): void {
    this.soloedTracks = soloedTracks;
  }

  public setBpm(bpm: number): void {
    this.bpm = bpm;
  }

  public setCurrentStep(step: number): void {
    this.currentStep = step;
  }

  public setCallbacks(onStepChange: (step: number) => void, onPadTrigger: (padIndex: number) => void): void {
    this.onStepChange = onStepChange;
    this.onPadTrigger = onPadTrigger;
  }

  public start(): void {
    if (this.intervalId) return;
    
    const audioContext = getAudioContext();
    this.nextNoteTime = audioContext.currentTime;
    
    this.intervalId = window.setInterval(() => {
      this.scheduler();
    }, this.lookaheadInterval);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentStep = 0;
    this.nextNoteTime = 0;
  }

  private scheduler(): void {
    const currentTime = getCurrentTime();
    
    // Schedule events within the lookahead window
    while (this.nextNoteTime < currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.nextNoteTime, this.currentStep);
      this.nextNoteTime += this.getStepDuration();
      this.currentStep = (this.currentStep + 1) % NUM_STEPS;
      this.onStepChange(this.currentStep);
    }
  }

  private scheduleStep(time: number, step: number): void {
    // Schedule all pads that are active on this step across ALL categories
    Object.keys(this.grids).forEach(categoryId => {
      const category = categoryId as CategoryId;
      
      // Skip muted categories
      if (this.mutedCategories.has(category)) {
        return;
      }
      
      const grid = this.grids[category];
      const samples = this.samples[category];
      const categoryDef = categories[category];
      const soloedTrack = this.soloedTracks[category];
      
      if (grid && samples) {
        for (let padIndex = 0; padIndex < NUM_TRACKS; padIndex++) {
          // Skip if there's a soloed track and this isn't it
          if (soloedTrack !== null && soloedTrack !== padIndex) {
            continue;
          }
          
          if (grid[padIndex] && grid[padIndex][step]) {
            const sample = samples[padIndex];
            if (sample && sample.buffer) {
              // Create and schedule the audio source
              const audioContext = getAudioContext();
              const source = audioContext.createBufferSource();
              const gainNode = audioContext.createGain();
              
              source.buffer = sample.buffer;
              gainNode.gain.value = 1.0;
              
              // Apply BPM-based pitch shifting for melodic categories
              const playbackRate = categoryDef.pitchShiftEnabled ? this.bpm / 120 : 1.0;
              source.playbackRate.value = playbackRate;
              
              source.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              source.start(time);
              this.onPadTrigger(padIndex);
            }
          }
        }
      }
    });
  }

  private getStepDuration(): number {
    // 16th note duration in seconds
    return 60 / this.bpm / 4;
  }

  public triggerPad(padIndex: number, categoryId: CategoryId): void {
    const samples = this.samples[categoryId];
    const categoryDef = categories[categoryId];
    if (samples && samples[padIndex] && samples[padIndex].buffer) {
      // Apply BPM-based pitch shifting for melodic categories
      const playbackRate = categoryDef.pitchShiftEnabled ? this.bpm / 120 : 1.0;
      playSample(samples[padIndex].buffer!, 1.0, playbackRate);
      this.onPadTrigger(padIndex);
    }
  }

  public destroy(): void {
    this.stop();
  }
}
