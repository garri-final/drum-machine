import type { CategoryDef, CategoryId } from '../types';

export const categories: Record<CategoryId, CategoryDef> = {
  'PO-12': { id: 'PO-12', name: 'PO-12', color: '#FF5100', pitchShiftEnabled: false }, // Orange (drums - no pitch shift)
  'PO-14': { id: 'PO-14', name: 'PO-14', color: '#0066FF', pitchShiftEnabled: true }, // Blue (melodic - pitch shift)
  'PO-16': { id: 'PO-16', name: 'PO-16', color: '#8B00FF', pitchShiftEnabled: true }, // Purple (melodic - pitch shift)
  'PO-20': { id: 'PO-20', name: 'PO-20', color: '#00FF66', pitchShiftEnabled: true }, // Green (melodic - pitch shift)
  'PO-28': { id: 'PO-28', name: 'PO-28', color: '#FF00CC', pitchShiftEnabled: true }, // Pink (melodic - pitch shift)
  'PO-32': { id: 'PO-32', name: 'PO-32', color: '#FFFF00', pitchShiftEnabled: true }, // Yellow (melodic - pitch shift)
  'PO-33': { id: 'PO-33', name: 'PO-33', color: '#FF0000', pitchShiftEnabled: true }, // Red (melodic - pitch shift)
  'PO-35': { id: 'PO-35', name: 'PO-35', color: '#FF00FF', pitchShiftEnabled: true }, // Magenta (melodic - pitch shift)
  'PO-127': { id: 'PO-127', name: 'PO-127', color: '#00FFFF', pitchShiftEnabled: true }, // Cyan (melodic - pitch shift) - moved to last
};

export const categoryIds: CategoryId[] = [
  'PO-12', 'PO-14', 'PO-16', 'PO-20', 'PO-28', 'PO-32', 'PO-33', 'PO-35', 'PO-127'
];

// Visible categories (excluding PO-32)
export const visibleCategoryIds: CategoryId[] = [
  'PO-12', 'PO-14', 'PO-16', 'PO-20', 'PO-28', 'PO-33', 'PO-35', 'PO-127'
];
