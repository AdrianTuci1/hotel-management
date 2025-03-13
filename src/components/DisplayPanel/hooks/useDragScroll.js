import { useState, useRef, useEffect } from 'react';

export function useDragScroll() {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const tableWrapperRef = useRef(null);
  const dragStartTimeRef = useRef(0);

  const handleMouseDown = (e) => {
    if (e.button === 0) { // doar click stânga
      setIsDragging(true);
      dragStartTimeRef.current = Date.now();
      setDragStart({
        x: e.clientX + tableWrapperRef.current.scrollLeft,
        y: e.clientY + tableWrapperRef.current.scrollTop
      });
      setScrollPosition({
        x: tableWrapperRef.current.scrollLeft,
        y: tableWrapperRef.current.scrollTop
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const dx = dragStart.x - e.clientX;
    const dy = dragStart.y - e.clientY;

    if (tableWrapperRef.current) {
      tableWrapperRef.current.scrollLeft = dx;
      tableWrapperRef.current.scrollTop = dy;
    }

    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };
  }, []);

  return {
    isDragging,
    tableWrapperRef,
    handleMouseDown,
    handleMouseMove,
    dragStartTimeRef
  };
} 