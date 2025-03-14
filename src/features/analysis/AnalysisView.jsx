import React from 'react';
import { useChatStore } from '../../store/chatStore';
import { IconDownload, IconCheck } from '@tabler/icons-react';
import styles from './AnalysisView.module.css';

const AnalysisView = ({ data }) => {
  const { updateDisplayData } = useChatStore();

  const handleRecommendationAction = (recommendation) => {
    // Implementăm logica pentru aplicarea recomandării
    console.log('Aplicăm recomandarea:', recommendation);
    
    // Actualizăm starea recomandării
    updateDisplayData({
      recommendations: data.recommendations.map(rec => 
        rec.id === recommendation.id 
          ? { ...rec, applied: true }
          : rec
      )
    });
  };

  const handleExport = () => {
    // Implementăm logica pentru exportul raportului
    console.log('Exportăm raportul de analiză:', data);
  };

  if (!data) return null;

  return (
    <div className={styles.analysis}>
      {/* Secțiunea de recomandări */}
      {data.recommendations && (
        <div className={styles.analysisCard}>
          <h3>Recomandări</h3>
          <div className={styles.recommendationsList}>
            {data.recommendations.map((rec, index) => (
              <div key={index} className={styles.recommendationItem}>
                <div className={styles.recommendationHeader}>
                  <h4>{rec.title}</h4>
                  {rec.applied && (
                    <span className={styles.appliedBadge}>
                      <IconCheck size={16} />
                      Aplicat
                    </span>
                  )}
                </div>
                <p>{rec.description}</p>
                {rec.action && !rec.applied && (
                  <button 
                    className={styles.applyButton}
                    onClick={() => handleRecommendationAction(rec)}
                  >
                    Aplică
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Secțiunea de grafice */}
      {data.charts && (
        <div className={styles.analysisCard}>
          <h3>Grafice</h3>
          <div className={styles.chartsContainer}>
            {/* Aici vom integra componentele de grafice */}
            <pre>{JSON.stringify(data.charts, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Secțiunea de statistici */}
      {data.stats && (
        <div className={styles.analysisCard}>
          <h3>Statistici</h3>
          <div className={styles.statsGrid}>
            {Object.entries(data.stats).map(([key, value]) => (
              <div key={key} className={styles.statItem}>
                <label>{key}</label>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buton de export */}
      <button 
        className={styles.exportButton}
        onClick={handleExport}
      >
        <IconDownload size={20} />
        Exportă raport
      </button>
    </div>
  );
};

export default AnalysisView; 