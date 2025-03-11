import React from 'react';
import { useAssistantStore } from '../../store/assistantStore';
import styles from './AssistantsView.module.css';

const AssistantsView = () => {
  const { assistants, toggleAssistant, updateAssistantConfig } = useAssistantStore();

  const handleToggle = (assistantId) => {
    toggleAssistant(assistantId);
  };

  const handleConfigUpdate = (assistantId, config) => {
    updateAssistantConfig(assistantId, config);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Asistenți Inteligenți</h2>
        <p>Configurați și monitorizați asistenții pentru gestionarea hotelului</p>
      </div>

      <div className={styles.assistantsList}>
        {/* Asistent Rezervări */}
        <div className={styles.assistantCard}>
          <div className={styles.assistantHeader}>
            <div className={styles.assistantInfo}>
              <span className={styles.assistantIcon}>📅</span>
              <div>
                <h3>Asistent Rezervări</h3>
                <p>Gestionează rezervările și comunicarea cu clienții</p>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={assistants.reservation.isActive}
                onChange={() => handleToggle('reservation')}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.assistantConfig}>
            <h4>Configurație</h4>
            <div className={styles.configItem}>
              <label>Auto-confirmare rezervări</label>
              <input
                type="checkbox"
                checked={assistants.reservation.config.autoConfirm}
                onChange={(e) => handleConfigUpdate('reservation', { autoConfirm: e.target.checked })}
              />
            </div>
            <div className={styles.configItem}>
              <label>Platforme conectate</label>
              <div className={styles.platformsList}>
                {assistants.reservation.config.platforms.map(platform => (
                  <span key={platform} className={styles.platform}>{platform}</span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.assistantMetrics}>
            <h4>Statistici</h4>
            <div className={styles.metricsList}>
              <div className={styles.metric}>
                <span>Rezervări procesate azi</span>
                <span className={styles.metricValue}>12</span>
              </div>
              <div className={styles.metric}>
                <span>Timp mediu răspuns</span>
                <span className={styles.metricValue}>2m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Asistent Raportare */}
        <div className={styles.assistantCard}>
          <div className={styles.assistantHeader}>
            <div className={styles.assistantInfo}>
              <span className={styles.assistantIcon}>📊</span>
              <div>
                <h3>Asistent Raportare</h3>
                <p>Analizează datele și optimizează prețurile</p>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={assistants.reporting.isActive}
                onChange={() => handleToggle('reporting')}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.assistantConfig}>
            <h4>Configurație</h4>
            <div className={styles.configItem}>
              <label>Ajustare automată prețuri</label>
              <input
                type="checkbox"
                checked={assistants.reporting.config.priceAdjustment.enabled}
                onChange={(e) => handleConfigUpdate('reporting', {
                  priceAdjustment: { ...assistants.reporting.config.priceAdjustment, enabled: e.target.checked }
                })}
              />
            </div>
            <div className={styles.configItem}>
              <label>Modificare maximă preț (%)</label>
              <input
                type="number"
                value={assistants.reporting.config.priceAdjustment.maxChange}
                onChange={(e) => handleConfigUpdate('reporting', {
                  priceAdjustment: { ...assistants.reporting.config.priceAdjustment, maxChange: Number(e.target.value) }
                })}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className={styles.assistantMetrics}>
            <h4>Statistici</h4>
            <div className={styles.metricsList}>
              <div className={styles.metric}>
                <span>Grad ocupare curent</span>
                <span className={styles.metricValue}>75%</span>
              </div>
              <div className={styles.metric}>
                <span>Ajustări preț azi</span>
                <span className={styles.metricValue}>3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantsView; 