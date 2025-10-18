import { useSequencerStore } from '../state/useSequencerStore';
import { categories, visibleCategoryIds } from '../data/categories';
import type { CategoryId } from '../types';

export const CategoryTabs = () => {
  const { activeCategory, setActiveCategory, mutedCategories, toggleCategoryMute } = useSequencerStore();

  const tabStyle = (categoryId: CategoryId, isActive: boolean, isMuted: boolean): React.CSSProperties => {
    const category = categories[categoryId];
    const baseColor = category.color;
    
    return {
      position: 'relative',
      width: '104px',
      height: '48px',
      borderRadius: '10px',
      border: isActive ? `2px solid ${baseColor}` : '2px solid #08080A',
      backgroundImage: 'linear-gradient(rgb(34, 33, 38), rgb(33, 32, 37))',
      boxShadow: 'rgba(255, 255, 255, 0.03) 3px 2px 2px 0px inset, rgba(255, 255, 255, 0.13) 1px 1px 1px 0px inset',
      cursor: 'pointer',
      fontFamily: 'IBM Plex Mono, monospace',
      fontWeight: 500,
      fontSize: '14px',
      color: isMuted ? 'rgba(255, 255, 255, 0.5)' : 'white',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '8px', 
      justifyContent: 'center',
      marginTop: '16px',
      flexWrap: 'wrap'
    }}>
      {visibleCategoryIds.map(categoryId => {
        const isActive = activeCategory === categoryId;
        const isMuted = mutedCategories.has(categoryId);
        
        return (
          <button
            key={categoryId}
            style={tabStyle(categoryId, isActive, isMuted)}
            onClick={() => setActiveCategory(categoryId)}
            onDoubleClick={() => toggleCategoryMute(categoryId)}
          >
            {categories[categoryId].name}
          </button>
        );
      })}
    </div>
  );
};
