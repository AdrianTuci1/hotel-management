import React, { useState } from 'react';
import styles from './HistoryView.module.css';
import HistoryList from './HistoryList/HistoryList';
import TimeframeView from './TimeframeView/TimeframeView';

const HistoryView = () => {
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('2025-03-19');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [timeRange, setTimeRange] = useState('all');
  const [customRange, setCustomRange] = useState(null);

  const toggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const historyData = [
    {
      id: 1,
      timestamp: '2025-03-19 10:30',
      title: 'Check-out camera 101',
      type: 'checkout',
      details: 'Camera 101 mutată în status murdar',
      user: {
        name: 'Ana Popescu',
        role: 'Receptioner',
        avatar: 'AP',
        isAI: false
      }
    },
    {
      id: 2,
      timestamp: '2025-03-19 11:15',
      title: 'Problemă raportată camera 202',
      type: 'problem',
      details: 'Aer condiționat defect',
      user: {
        name: 'AI Assistant',
        role: 'AI',
        avatar: '🤖',
        isAI: true
      }
    },
    {
      id: 3,
      timestamp: '2025-03-19 12:00',
      title: 'Curățenie camera 303',
      type: 'cleaning',
      details: 'Curățenie finalizată în 15 min',
      user: {
        name: 'Elena Popa',
        role: 'Cameristă',
        avatar: 'EP',
        isAI: false
      }
    },
    {
      id: 4,
      timestamp: '2025-03-19 13:30',
      title: 'Sugestie optimizare program',
      type: 'suggestion',
      details: 'Programul de curățenie poate fi optimizat pentru etajul 2',
      user: {
        name: 'AI Assistant',
        role: 'AI',
        avatar: '🤖',
        isAI: true
      }
    },
    {
      id: 5,
      timestamp: '2025-03-19 14:45',
      title: 'Check-in camera 205',
      type: 'checkout',
      details: 'Clientul a sosit cu 2 ore înainte de check-in. Camera era disponibilă și a fost alocată imediat.',
      user: {
        name: 'Maria Ionescu',
        role: 'Receptioner',
        avatar: 'MI',
        isAI: false
      }
    },
    {
      id: 6,
      timestamp: '2025-03-19 15:20',
      title: 'Solicitare servicii camera 402',
      type: 'service',
      details: 'Clientul a solicitat servicii de room service: 2 cafele și desert',
      user: {
        name: 'AI Assistant',
        role: 'AI',
        avatar: '🤖',
        isAI: true
      }
    },
    {
      id: 7,
      timestamp: '2025-03-19 16:00',
      title: 'Mentenanță camera 202',
      type: 'maintenance',
      details: 'Aer condiționat reparat și testat. Funcționează normal.',
      user: {
        name: 'Ion Popa',
        role: 'Tehnician',
        avatar: 'IP',
        isAI: false
      }
    },
    {
      id: 8,
      timestamp: '2025-03-19 16:30',
      title: 'Curățenie camera 101',
      type: 'cleaning',
      details: 'Curățenie completă finalizată. Toate lenjerii schimbate.',
      user: {
        name: 'Sofia Dumitrescu',
        role: 'Cameristă',
        avatar: 'SD',
        isAI: false
      }
    },
    {
      id: 9,
      timestamp: '2025-03-19 17:15',
      title: 'Raport inventar',
      type: 'report',
      details: 'Inventarul zilnic finalizat. Toate articolele prezente și în stare bună.',
      user: {
        name: 'Alexandru Marin',
        role: 'Manager',
        avatar: 'AM',
        isAI: false
      }
    },
    {
      id: 10,
      timestamp: '2025-03-19 18:00',
      title: 'Sugestie optimizare energie',
      type: 'suggestion',
      details: 'Consumul de energie poate fi redus cu 15% prin ajustarea programului de aer condiționat',
      user: {
        name: 'AI Assistant',
        role: 'AI',
        avatar: '🤖',
        isAI: true
      }
    },
    {
      id: 11,
      timestamp: '2025-03-19 19:30',
      title: 'Check-in camera 505',
      type: 'checkout',
      details: 'Check-in finalizat. Documentele verificate și copiate.',
      user: {
        name: 'Ana Popescu',
        role: 'Receptioner',
        avatar: 'AP',
        isAI: false
      }
    },
    {
      id: 12,
      timestamp: '2025-03-19 20:15',
      title: 'Solicitare asistență',
      type: 'service',
      details: 'Clientul din camera 303 a solicitat asistență pentru conectarea la WiFi',
      user: {
        name: 'AI Assistant',
        role: 'AI',
        avatar: '🤖',
        isAI: true
      }
    }
  ];

  return (
    <div className={styles.container}>
      <HistoryList
        historyData={historyData}
        search={search}
        selectedDate={selectedDate}
        selectedTypes={selectedTypes}
        timeRange={timeRange}
        customRange={customRange}
      />
      <TimeframeView
        historyData={historyData}
        selectedDate={selectedDate}
        selectedTypes={selectedTypes}
        timeRange={timeRange}
        customRange={customRange}
        onTimeRangeChange={setTimeRange}
        onCustomRangeChange={setCustomRange}
        onDateChange={setSelectedDate}
        onTypeToggle={toggleType}
      />
    </div>
  );
};

export default HistoryView;