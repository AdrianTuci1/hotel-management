import React, { useState } from 'react';
import { useAssistantStore } from '../../store/assistantStore';
import styles from './AssistantsView.module.css';

const AssistantsView = () => {
  const { assistants, toggleAssistant, updateAssistantConfig } = useAssistantStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showConfig, setShowConfig] = useState({
    booking: false,
    whatsapp: false,
    reporting: false
  });

  const handleToggle = (assistantId) => {
    toggleAssistant(assistantId);
  };

  const handleConfigUpdate = (assistantId, config) => {
    updateAssistantConfig(assistantId, config);
  };

  const handleApiKeyUpdate = (assistantId, apiKey) => {
    updateAssistantConfig(assistantId, { apiKey });
  };

  const toggleConfig = (assistantId) => {
    setShowConfig(prev => ({
      ...prev,
      [assistantId]: !prev[assistantId]
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Asistenti Inteligenti</h2>
        <p>Configurati si monitorizati asistentii pentru gestionarea hotelului</p>
      </div>

      <div className={styles.assistantsList}>
        {/* Asistent Booking */}
        <div className={styles.assistantCard}>
          <div className={styles.assistantHeader}>
            <div className={styles.assistantInfo}>
              <span className={styles.assistantIcon}>📅</span>
              <div>
                <h3>Asistent Booking</h3>
                <p>Gestioneaza rezervarile si comunicarea cu clientii</p>
                <div className={styles.statusContainer}>
                  <span className={`${styles.statusIndicator} ${assistants.reservation.isActive ? styles.connected : styles.disconnected}`}></span>
                  <span className={styles.statusText}>{assistants.reservation.isActive ? 'Conectat' : 'Deconectat'}</span>
                </div>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button 
                className={styles.configToggle}
                onClick={() => toggleConfig('booking')}
              >
                {showConfig.booking ? 'Ascunde Configuratie' : 'Configuratie'}
              </button>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={assistants.reservation.isActive}
                  onChange={() => handleToggle('reservation')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          {showConfig.booking && (
            <div className={styles.assistantConfig}>
              <div className={styles.configSection}>
                <div className={styles.configItem}>
                  <label>API Key Booking.com</label>
                  <div className={styles.apiKeyInput}>
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={assistants.reservation.config.apiKey || ''}
                      onChange={(e) => handleApiKeyUpdate('reservation', e.target.value)}
                      placeholder="Introduceti API key-ul"
                    />
                    <button 
                      className={styles.toggleVisibility}
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <div className={styles.configItem}>
                  <div className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      id="autoConfirm"
                      checked={assistants.reservation.config.autoConfirm}
                      onChange={(e) => handleConfigUpdate('reservation', { autoConfirm: e.target.checked })}
                    />
                    <label htmlFor="autoConfirm">Auto-confirmare rezervari</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.assistantMetrics}>
            <h4>Statistici</h4>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Rezervari procesate azi</span>
                <span className={styles.metricValue}>12</span>
                <span className={`${styles.metricTrend} ${styles.positive}`}>+2 fata de ieri</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Timp mediu raspuns</span>
                <span className={styles.metricValue}>2m</span>
                <span className={`${styles.metricTrend} ${styles.negative}`}>+30s fata de ieri</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Grad ocupare</span>
                <span className={styles.metricValue}>75%</span>
                <span className={`${styles.metricTrend} ${styles.positive}`}>+5% fata de ieri</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Satisfactie clienti</span>
                <span className={styles.metricValue}>4.8/5</span>
                <span className={`${styles.metricTrend} ${styles.positive}`}>+0.2 fata de ieri</span>
              </div>
            </div>
          </div>
        </div>

        {/* Asistent WhatsApp */}
        <div className={styles.assistantCard}>
          <div className={styles.assistantHeader}>
            <div className={styles.assistantInfo}>
              <span className={styles.assistantIcon}>💬</span>
              <div>
                <h3>Asistent WhatsApp</h3>
                <p>Gestioneaza comunicarea directa cu clientii</p>
                <div className={styles.statusContainer}>
                  <span className={`${styles.statusIndicator} ${assistants.whatsapp?.isActive ? styles.connected : styles.disconnected}`}></span>
                  <span className={styles.statusText}>{assistants.whatsapp?.isActive ? 'Conectat' : 'Deconectat'}</span>
                </div>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button 
                className={styles.configToggle}
                onClick={() => toggleConfig('whatsapp')}
              >
                {showConfig.whatsapp ? 'Ascunde Configuratie' : 'Configuratie'}
              </button>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={assistants.whatsapp?.isActive || false}
                  onChange={() => handleToggle('whatsapp')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          {showConfig.whatsapp && (
            <div className={styles.assistantConfig}>
              <div className={styles.configSection}>
                <div className={styles.configItem}>
                  <label>API Key WhatsApp Business</label>
                  <div className={styles.apiKeyInput}>
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={assistants.whatsapp?.config?.apiKey || ''}
                      onChange={(e) => handleApiKeyUpdate('whatsapp', e.target.value)}
                      placeholder="Introduceti API key-ul"
                    />
                    <button 
                      className={styles.toggleVisibility}
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <div className={styles.configItem}>
                  <div className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      id="autoReply"
                      checked={assistants.whatsapp?.config?.autoReply || false}
                      onChange={(e) => handleConfigUpdate('whatsapp', { autoReply: e.target.checked })}
                    />
                    <label htmlFor="autoReply">Raspunsuri automate</label>
                  </div>
                </div>
                <div className={styles.configItem}>
                  <label>Program de raspuns</label>
                  <div className={styles.timeRange}>
                    <input
                      type="time"
                      value={assistants.whatsapp?.config?.startTime || '08:00'}
                      onChange={(e) => handleConfigUpdate('whatsapp', { startTime: e.target.value })}
                    />
                    <span>pana</span>
                    <input
                      type="time"
                      value={assistants.whatsapp?.config?.endTime || '22:00'}
                      onChange={(e) => handleConfigUpdate('whatsapp', { endTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.assistantMetrics}>
            <h4>Statistici</h4>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Mesaje procesate azi</span>
                <span className={styles.metricValue}>45</span>
                <span className={`${styles.metricTrend} ${styles.positive}`}>+8 fata de ieri</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Clienti activi</span>
                <span className={styles.metricValue}>28</span>
                <span className={`${styles.metricTrend} ${styles.positive}`}>+3 fata de ieri</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Timp mediu raspuns</span>
                <span className={styles.metricValue}>1.5m</span>
                <span className={`${styles.metricTrend} ${styles.positive}`}>-30s fata de ieri</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Satisfactie clienti</span>
                <span className={styles.metricValue}>4.9/5</span>
                <span className={`${styles.metricTrend} ${styles.positive}`}>+0.1 fata de ieri</span>
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
                <p>Analizeaza datele si optimizeaza preturile</p>
                <div className={styles.statusContainer}>
                  <span className={`${styles.statusIndicator} ${assistants.reporting.isActive ? styles.connected : styles.disconnected}`}></span>
                  <span className={styles.statusText}>{assistants.reporting.isActive ? 'Conectat' : 'Deconectat'}</span>
                </div>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button 
                className={styles.configToggle}
                onClick={() => toggleConfig('reporting')}
              >
                {showConfig.reporting ? 'Ascunde Configuratie' : 'Configuratie'}
              </button>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={assistants.reporting.isActive}
                  onChange={() => handleToggle('reporting')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          {showConfig.reporting && (
            <div className={styles.assistantConfig}>
              <div className={styles.configSection}>
                <div className={styles.configItem}>
                  <div className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      id="priceAdjustment"
                      checked={assistants.reporting.config.priceAdjustment.enabled}
                      onChange={(e) => handleConfigUpdate('reporting', {
                        priceAdjustment: { ...assistants.reporting.config.priceAdjustment, enabled: e.target.checked }
                      })}
                    />
                    <label htmlFor="priceAdjustment">Ajustare automata preturi</label>
                  </div>
                </div>
                <div className={styles.configItem}>
                  <label>Modificare maxima pret (%)</label>
                  <input
                    type="number"
                    value={assistants.reporting.config.priceAdjustment.maxChange}
                    onChange={(e) => handleConfigUpdate('reporting', {
                      priceAdjustment: { ...assistants.reporting.config.priceAdjustment, maxChange: Number(e.target.value) }
                    })}
                    min="0"
                    max="100"
                    className={styles.numberInput}
                  />
                </div>
                <div className={styles.configItem}>
                  <label>Frecventa ajustare</label>
                  <select
                    value={assistants.reporting.config.priceAdjustment.frequency || 'daily'}
                    onChange={(e) => handleConfigUpdate('reporting', {
                      priceAdjustment: { ...assistants.reporting.config.priceAdjustment, frequency: e.target.value }
                    })}
                    className={styles.selectInput}
                  >
                    <option value="hourly">Orar</option>
                    <option value="daily">Zilnic</option>
                    <option value="weekly">Saptamanal</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className={styles.assistantMetrics}>
            <h4>Statistici</h4>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Grad ocupare curent</span>
                <span className={styles.metricValue}>75%</span>
                <span className={`${styles.metricTrend} ${styles.positive}`}>+5% fata de ieri</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Ajustari pret azi</span>
                <span className={styles.metricValue}>3</span>
                <span className={`${styles.metricTrend} ${styles.neutral}`}>0 fata de ieri</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Venit estimat</span>
                <span className={styles.metricValue}>€12,500</span>
                <span className={`${styles.metricTrend} ${styles.positive}`}>+€500 fata de ieri</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Pret mediu/noapte</span>
                <span className={styles.metricValue}>€125</span>
                <span className={`${styles.metricTrend} ${styles.positive}`}>+€5 fata de ieri</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantsView; 