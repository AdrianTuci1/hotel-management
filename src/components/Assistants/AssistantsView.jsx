import React, { useState } from 'react';
import { useAssistantStore } from '../../store/assistantStore';
import styles from './AssistantsView.module.css';

const PlatformIcons = {
  whatsapp: '📱',
  email: '📧',
  booking: '🏨',
};

const ConnectionModal = ({ platform, onClose, onConnect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [credentials, setCredentials] = useState({
    whatsapp: { phoneNumber: '', apiKey: '' },
    email: { email: '', password: '', server: 'imap.gmail.com' }
  });

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConnect(platform, credentials[platform]);
      onClose();
    } catch (error) {
      setError(error.message || 'A apărut o eroare la conectare. Vă rugăm încercați din nou.');
    }
    setLoading(false);
  };

  const isFormValid = () => {
    if (platform === 'whatsapp') {
      return credentials.whatsapp.phoneNumber && credentials.whatsapp.apiKey;
    }
    if (platform === 'email') {
      return credentials.email.email && credentials.email.password && credentials.email.server;
    }
    return false;
  };

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>
            <span>{PlatformIcons[platform]}</span>
            Conectare {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </h3>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.platformStatus}>
            <span className={`${styles.statusIcon} ${styles.disconnected}`} />
            <span className={styles.platformName}>Deconectat</span>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {platform === 'whatsapp' && (
            <>
              <div className={styles.formGroup}>
                <label>Număr de telefon</label>
                <input
                  type="text"
                  value={credentials.whatsapp.phoneNumber}
                  onChange={(e) => setCredentials({
                    ...credentials,
                    whatsapp: { ...credentials.whatsapp, phoneNumber: e.target.value }
                  })}
                  placeholder="+40712345678"
                />
              </div>
              <div className={styles.formGroup}>
                <label>API Key</label>
                <input
                  type="password"
                  value={credentials.whatsapp.apiKey}
                  onChange={(e) => setCredentials({
                    ...credentials,
                    whatsapp: { ...credentials.whatsapp, apiKey: e.target.value }
                  })}
                  placeholder="Introduceți API key-ul"
                />
              </div>
            </>
          )}

          {platform === 'email' && (
            <>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={credentials.email.email}
                  onChange={(e) => setCredentials({
                    ...credentials,
                    email: { ...credentials.email, email: e.target.value }
                  })}
                  placeholder="hotel@example.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Parolă</label>
                <input
                  type="password"
                  value={credentials.email.password}
                  onChange={(e) => setCredentials({
                    ...credentials,
                    email: { ...credentials.email, password: e.target.value }
                  })}
                  placeholder="Introduceți parola"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Server IMAP</label>
                <input
                  type="text"
                  value={credentials.email.server}
                  onChange={(e) => setCredentials({
                    ...credentials,
                    email: { ...credentials.email, server: e.target.value }
                  })}
                />
              </div>
            </>
          )}

          <button 
            className={styles.connectButton}
            onClick={handleConnect}
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <>
                <span className={styles.loadingSpinner} />
                Se conectează...
              </>
            ) : (
              'Conectează'
            )}
          </button>
        </div>
      </div>
    </>
  );
};

const AssistantsView = () => {
  const { assistants, toggleAssistant, updateAssistantConfig, connectPlatform } = useAssistantStore();
  const [connectionModal, setConnectionModal] = useState({ open: false, platform: null });

  const handleToggle = (assistantId) => {
    toggleAssistant(assistantId);
  };

  const handleConfigUpdate = (assistantId, config) => {
    updateAssistantConfig(assistantId, config);
  };

  const handleConnect = async (platform, credentials) => {
    try {
      await connectPlatform('reservation', platform, credentials);
    } catch (error) {
      console.error('Failed to connect platform:', error);
    }
  };

  const renderPlatform = (platform) => {
    const isConnected = assistants.reservation.config.connectedPlatforms?.includes(platform);
    return (
      <div 
        key={platform}
        className={`${styles.platform} ${isConnected ? styles.connected : styles.disconnected}`}
        onClick={() => setConnectionModal({ open: true, platform })}
      >
        <span>{PlatformIcons[platform]}</span>
        {platform}
        {!isConnected && <button className={styles.connectButton}>Conectează</button>}
      </div>
    );
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
              <label>Platforme</label>
              <div className={styles.platformsList}>
                {['whatsapp', 'email'].map(renderPlatform)}
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

      {connectionModal.open && (
        <ConnectionModal
          platform={connectionModal.platform}
          onClose={() => setConnectionModal({ open: false, platform: null })}
          onConnect={handleConnect}
        />
      )}
    </div>
  );
};

export default AssistantsView; 