import type { SampleDef, CategoryId } from '../types';
import { categoryIds } from './categories';

// Generate samples for all categories
export const samples: Record<CategoryId, SampleDef[]> = categoryIds.reduce((acc, categoryId) => {
  acc[categoryId] = Array.from({ length: 12 }, (_, i) => ({
    id: i as any,
    name: `Pad ${i + 1}`,
    url: `/samples/${categoryId}/pad${String(i + 1).padStart(2, '0')}.wav`,
    key: String.fromCharCode(97 + i), // a, b, c, d, e, f, g, h, i, j, k, l
    category: categoryId,
  }));
  return acc;
}, {} as Record<CategoryId, SampleDef[]>);

// Controls mapping for 5x5 grid
export const controlsMap = {
  'bpm-edit': { row: 1, col: 3, type: 'button', action: 'toggle-bpm-edit' },
  'bpm-knob': { row: 1, col: 4, type: 'knob', action: 'adjust-bpm' },
  'play': { row: 4, col: 5, type: 'button', action: 'play' },
  'stop': { row: 5, col: 5, type: 'button', action: 'stop' },
} as const;
