import React, { useRef } from 'react';
import styles from './TimeframeView.module.css';

const TimeframeView = ({ 
  historyData, 
  selectedDate, 
  selectedTypes, 
  timeRange, 
  customRange,
  onTimeRangeChange,
  onCustomRangeChange,
  onDateChange,
  onTypeToggle
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState(null);
  const [dragEnd, setDragEnd] = React.useState(null);
  const timelineRef = useRef(null);

  const timeRanges = [
    { id: 'all', label: 'Toată ziua' },
    { id: 'morning', label: 'Dimineața (6-12)' },
    { id: 'afternoon', label: 'După-amiaza (12-18)' },
    { id: 'evening', label: 'Seara (18-24)' }
  ];

  const handleMouseDown = (e) => {
    if (e.target.closest(`.${styles.timeline}`)) return;
    setIsDragging(true);
    const rect = timelineRef.current.getBoundingClientRect();
    const start = ((e.clientX - rect.left) / rect.width) * 24;
    setDragStart(start);
    setDragEnd(start);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const current = ((e.clientX - rect.left) / rect.width) * 24;
    setDragEnd(current);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const start = Math.min(dragStart, dragEnd);
    const end = Math.max(dragStart, dragEnd);
    
    if (end - start >= 1) { // minim 1 oră
      onCustomRangeChange({ start, end });
      onTimeRangeChange('custom');
    }
  };

  const resetTimeRange = () => {
    onCustomRangeChange(null);
    onTimeRangeChange('all');
  };

  const getColorByType = (type) => {
    switch (type) {
      case 'checkout':
        return styles.checkout;
      case 'problem':
        return styles.problem;
      case 'cleaning':
        return styles.cleaning;
      case 'suggestion':
        return styles.suggestion;
      case 'service':
        return styles.service;
      case 'maintenance':
        return styles.maintenance;
      case 'report':
        return styles.report;
      default:
        return styles.default;
    }
  };

  const getTimeRangeLabel = (hour) => {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18) return 'evening';
    return 'evening'; // pentru orele 0-6
  };

  const renderTimeAxis = () => {
    const lines = [];
    for (let i = 0; i <= 24; i++) {
      // Linie pentru ora întreagă
      lines.push(
        <div
          key={`hour-${i}`}
          className={styles.timeAxisLine}
          style={{
            left: `${(i / 24) * 100}%`,
            height: '100%'
          }}
        />
      );

      // Linie pentru jumătate de oră
      if (i < 24) {
        lines.push(
          <div
            key={`half-${i}`}
            className={`${styles.timeAxisLine} ${styles.halfHour}`}
            style={{
              left: `${((i + 0.5) / 24) * 100}%`,
              height: '50%'
            }}
          />
        );
      }

      // Linie pentru sfert de oră
      if (i < 24) {
        lines.push(
          <div
            key={`quarter-${i}`}
            className={`${styles.timeAxisLine} ${styles.quarterHour}`}
            style={{
              left: `${((i + 0.25) / 24) * 100}%`,
              height: '25%'
            }}
          />
        );
        lines.push(
          <div
            key={`quarter-${i + 0.75}`}
            className={`${styles.timeAxisLine} ${styles.quarterHour}`}
            style={{
              left: `${((i + 0.75) / 24) * 100}%`,
              height: '25%'
            }}
          />
        );
      }
    }
    return lines;
  };

  const filteredEvents = historyData.filter(item => {
    const hour = parseInt(item.timestamp.split(' ')[1].split(':')[0]);
    const itemTimeRange = getTimeRangeLabel(hour);
    
    const matchesDate = item.timestamp.startsWith(selectedDate);
    const matchesTimeRange = timeRange === 'all' || 
                            (timeRange === 'custom' && hour >= customRange.start && hour <= customRange.end) ||
                            itemTimeRange === timeRange;
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.type);

    return matchesDate && matchesTimeRange && matchesType;
  });

  const legendItems = [
    { type: 'checkout', label: 'Check-in/out' },
    { type: 'problem', label: 'Probleme' },
    { type: 'cleaning', label: 'Curățenie' },
    { type: 'service', label: 'Servicii' },
    { type: 'maintenance', label: 'Mentenanță' },
    { type: 'suggestion', label: 'Sugestii' }
  ];

  return (
    <div className={styles.timeframeContainer}>
      <div className={styles.timeframeHeader}>
        <div className={styles.timeframeControls}>
          <div className={styles.timeRangeSelector}>
            {timeRanges.map(range => (
              <button
                key={range.id}
                className={`${styles.timeRangeButton} ${timeRange === range.id ? styles.active : ''}`}
                onClick={() => onTimeRangeChange(range.id)}
              >
                {range.label}
              </button>
            ))}
            {customRange && (
              <button
                className={`${styles.timeRangeButton} ${styles.resetButton}`}
                onClick={resetTimeRange}
              >
                Resetare
              </button>
            )}
          </div>
          <div className={styles.dateControls}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className={styles.dateInput}
            />
            <button onClick={() => onDateChange('2025-03-19')} className={styles.todayButton}>
              Azi
            </button>
          </div>
        </div>
        <div className={styles.timeframeLegend}>
          {legendItems.map(item => (
            <div
              key={item.type}
              className={`${styles.legendItem} ${selectedTypes.includes(item.type) ? styles.selected : ''}`}
              onClick={() => onTypeToggle(item.type)}
            >
              <span className={`${styles.legendColor} ${getColorByType(item.type)}`}></span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div 
        className={styles.timeframeView}
        ref={timelineRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className={styles.timeAxis}>
          {renderTimeAxis()}
        </div>
        <div className={styles.timeline}>
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className={styles.timelineHour}>
              {i}:00
            </div>
          ))}
        </div>
        <div className={styles.timelineEvents}>
          {filteredEvents.map((item) => {
            const hour = parseInt(item.timestamp.split(' ')[1].split(':')[0]);
            const minutes = parseInt(item.timestamp.split(' ')[1].split(':')[1]);
            const position = ((hour + minutes / 60) / 24) * 100;
            
            return (
              <div
                key={item.id}
                className={`${styles.timelineEvent} ${getColorByType(item.type)}`}
                style={{
                  left: `${position}%`,
                  width: '20px'
                }}
                title={`${item.title} - ${item.timestamp}`}
              />
            );
          })}
        </div>
        <div className={styles.timeRangeMarkers}>
          {timeRanges.map(range => (
            <div
              key={range.id}
              className={`${styles.timeRangeMarker} ${timeRange === range.id ? styles.active : ''}`}
              style={{
                left: range.id === 'morning' ? '25%' :
                       range.id === 'afternoon' ? '50%' :
                       range.id === 'evening' ? '75%' : '0%'
              }}
            />
          ))}
        </div>
        {isDragging && (
          <div 
            className={styles.dragSelection}
            style={{
              left: `${Math.min(dragStart, dragEnd) * (100/24)}%`,
              width: `${Math.abs(dragEnd - dragStart) * (100/24)}%`
            }}
          />
        )}
        {customRange && (
          <div 
            className={styles.customRange}
            style={{
              left: `${customRange.start * (100/24)}%`,
              width: `${(customRange.end - customRange.start) * (100/24)}%`
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TimeframeView; 