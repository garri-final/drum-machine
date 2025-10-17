import { getAudioContext, getCurrentTime } from './audioContext';
import { playSample } from './playSample';
import { SampleDef } from '../types';

export class SequencerScheduler {
  private intervalId: number | null = null;
  private nextNoteTime: number = 0;
  private currentStep: number = 0;
  private bpm: number = 120;
  private scheduleAheadTime: number = 0.1; // 100ms lookahead
  private lookaheadInterval: number = 25; // 25ms scheduling interval
  private samples: SampleDef[] = [];
  private grid: boolean[][] = [];
  private onStepChange: (step: number) => void = () => {};
  private onPadTrigger: (padIndex: number) => void = () => {};

  constructor() {
    this.initializeGrid();
  }

  private initializeGrid(): void {
    this.grid = Array(16).fill(null).map(() => Array(16).fill(false));
  }

  public setSamples(samples: SampleDef[]): void {
    this.samples = samples;
  }

  public setGrid(grid: boolean[][]): void {
    this.grid = grid;
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
      this.currentStep = (this.currentStep + 1) % 16;
      this.onStepChange(this.currentStep);
    }
  }

  private scheduleStep(time: number, step: number): void {
    // Schedule all pads that are active on this step
    for (let padIndex = 0; padIndex < 16; padIndex++) {
      if (this.grid[padIndex] && this.grid[padIndex][step]) {
        const sample = this.samples[padIndex];
        if (sample && sample.buffer) {
          // Create and schedule the audio source
          const audioContext = getAudioContext();
          const source = audioContext.createBufferSource();
          const gainNode = audioContext.createGain();
          
          source.buffer = sample.buffer;
          gainNode.gain.value = 1.0;
          
          source.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          source.start(time);
          this.onPadTrigger(padIndex);
        }
      }
    }
  }

  private getStepDuration(): number {
    // 16th note duration in seconds
    return 60 / this.bpm / 4;
  }

  public triggerPad(padIndex: number): void {
    const sample = this.samples[padIndex];
    if (sample && sample.buffer) {
      playSample(sample.buffer, 1.0);
      this.onPadTrigger(padIndex);
    }
  }

  public destroy(): void {
    this.stop();
  }
}
