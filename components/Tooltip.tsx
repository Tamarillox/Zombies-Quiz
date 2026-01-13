
import React, { useState, useRef } from 'react';

interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  const handleMouseEnter = () => {
    if (!isTouchDevice) showTooltip();
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) hideTooltip();
  };

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(showTooltip, 500); // 500ms für einen langen Druck
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    hideTooltip();
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    if (isTouchDevice) e.preventDefault();
  };

  return (
    <div 
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
    >
      {children}
      {isVisible && (
        <div 
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs z-50 p-3 bg-grungeGray border border-gray-600 rounded-lg shadow-lg text-white"
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
