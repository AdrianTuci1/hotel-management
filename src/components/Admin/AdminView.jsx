import React, { useState } from 'react';
import styles from './AdminView.module.css';

const AdminView = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [staffEmails, setStaffEmails] = useState({
    receptioner: ['ana.popescu@hotel.com', 'ion.ionescu@hotel.com'],
    camerista: ['elena.popa@hotel.com', 'ioana.marinescu@hotel.com'],
    manager: ['maria.manager@hotel.com'],
  });

  const tabs = [
    { id: 'roles', label: 'Roluri și Permisiuni', icon: '👥' },
    { id: 'reservations', label: 'Gestionare Rezervări', icon: '🔒' },
    { id: 'attractions', label: 'Atracții', icon: '🎡' },
    { id: 'services', label: 'Servicii', icon: '🛍️' },
  ];

  const handleAddEmail = (role, email) => {
    if (!email) return;
    setStaffEmails(prev => ({
      ...prev,
      [role]: [...(prev[role] || []), email]
    }));
  };

  const handleRemoveEmail = (role, emailToRemove) => {
    setStaffEmails(prev => ({
      ...prev,
      [role]: prev[role].filter(email => email !== emailToRemove)
    }));
  };

  const renderStaffProfile = (email) => {
    // Aici vom simula datele profilului
    const mockProfile = {
      name: email.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      role: email.split('@')[1].split('.')[0],
      status: 'Activ',
      joinDate: '01.01.2024',
      phone: '+40 712 345 678',
      schedule: 'Full-time'
    };

    return (
      <div className={styles.profileModal}>
        <div className={styles.profileHeader}>
          <h3>Profil Staff</h3>
          <button className={styles.closeButton} onClick={() => setSelectedProfile(null)}>✕</button>
        </div>
        <div className={styles.profileContent}>
          <div className={styles.profileInfo}>
            <p><strong>Nume:</strong> {mockProfile.name}</p>
            <p><strong>Rol:</strong> {mockProfile.role}</p>
            <p><strong>Status:</strong> <span className={styles.active}>{mockProfile.status}</span></p>
            <p><strong>Data angajării:</strong> {mockProfile.joinDate}</p>
            <p><strong>Telefon:</strong> {mockProfile.phone}</p>
            <p><strong>Program:</strong> {mockProfile.schedule}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'roles':
        return (
          <div className={styles.section}>
            <h2>Gestionare Roluri și Permisiuni</h2>
            <div className={styles.rolesGrid}>
              <div className={styles.roleCard}>
                <h3>Administrator</h3>
                <div className={styles.permissions}>
                  <label className={styles.checkbox}>
                    <input type="checkbox" defaultChecked /> Acces complet
                  </label>
                  <label className={styles.checkbox}>
                    <input type="checkbox" defaultChecked /> Gestionare utilizatori
                  </label>
                  <label className={styles.checkbox}>
                    <input type="checkbox" defaultChecked /> Gestionare sistem
                  </label>
                </div>
              </div>

              <div className={styles.roleCard}>
                <h3>Manager</h3>
                <div className={styles.permissions}>
                  <label className={styles.checkbox}>
                    <input type="checkbox" defaultChecked /> Gestionare rezervări
                  </label>
                  <label className={styles.checkbox}>
                    <input type="checkbox" defaultChecked /> Gestionare angajați
                  </label>
                  <label className={styles.checkbox}>
                    <input type="checkbox" defaultChecked /> Rapoarte
                  </label>
                </div>
                <div className={styles.emailSection}>
                  <h4>Staff Manager</h4>
                  <div className={styles.emailList}>
                    {staffEmails.manager.map((email, index) => (
                      <div key={index} className={styles.emailItem}>
                        <span>{email}</span>
                        <button 
                          className={styles.viewProfileButton}
                          onClick={() => setSelectedProfile(email)}
                        >
                          👤
                        </button>
                        <button 
                          className={styles.removeEmailButton}
                          onClick={() => handleRemoveEmail('manager', email)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className={styles.addEmailForm}>
                    <input
                      type="email"
                      placeholder="Adaugă email manager"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddEmail('manager', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.roleCard}>
                <h3>Receptioner</h3>
                <div className={styles.permissions}>
                  <label className={styles.checkbox}>
                    <input type="checkbox" defaultChecked /> Gestionare rezervări
                  </label>
                  <label className={styles.checkbox}>
                    <input type="checkbox" defaultChecked /> Acces la istoric
                  </label>
                  <label className={styles.checkbox}>
                    <input type="checkbox" /> Gestionare angajați
                  </label>
                </div>
                <div className={styles.emailSection}>
                  <h4>Staff Receptioneri</h4>
                  <div className={styles.emailList}>
                    {staffEmails.receptioner.map((email, index) => (
                      <div key={index} className={styles.emailItem}>
                        <span>{email}</span>
                        <button 
                          className={styles.viewProfileButton}
                          onClick={() => setSelectedProfile(email)}
                        >
                          👤
                        </button>
                        <button 
                          className={styles.removeEmailButton}
                          onClick={() => handleRemoveEmail('receptioner', email)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className={styles.addEmailForm}>
                    <input
                      type="email"
                      placeholder="Adaugă email receptioner"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddEmail('receptioner', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.roleCard}>
                <h3>Cameristă</h3>
                <div className={styles.permissions}>
                  <label className={styles.checkbox}>
                    <input type="checkbox" defaultChecked /> Gestionare camere
                  </label>
                  <label className={styles.checkbox}>
                    <input type="checkbox" defaultChecked /> Acces la program
                  </label>
                  <label className={styles.checkbox}>
                    <input type="checkbox" defaultChecked /> Raportare starea camerelor
                  </label>
                </div>
                <div className={styles.emailSection}>
                  <h4>Staff Cameriste</h4>
                  <div className={styles.emailList}>
                    {staffEmails.camerista.map((email, index) => (
                      <div key={index} className={styles.emailItem}>
                        <span>{email}</span>
                        <button 
                          className={styles.viewProfileButton}
                          onClick={() => setSelectedProfile(email)}
                        >
                          👤
                        </button>
                        <button 
                          className={styles.removeEmailButton}
                          onClick={() => handleRemoveEmail('camerista', email)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className={styles.addEmailForm}>
                    <input
                      type="email"
                      placeholder="Adaugă email cameristă"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddEmail('camerista', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reservations':
        return (
          <div className={styles.section}>
            <h2>Gestionare Rezervări</h2>
            <div className={styles.reservationsSettings}>
              <div className={styles.settingCard}>
                <h3>Setări Generale</h3>
                <div className={styles.setting}>
                  <label>Perioada minimă de rezervare (zile)</label>
                  <input type="number" min="1" defaultValue="1" />
                </div>
                <div className={styles.setting}>
                  <label>Perioada maximă de rezervare (zile)</label>
                  <input type="number" min="1" defaultValue="30" />
                </div>
                <div className={styles.setting}>
                  <label>Depozit necesar (%)</label>
                  <input type="number" min="0" max="100" defaultValue="20" />
                </div>
              </div>
              <div className={styles.settingCard}>
                <h3>Restricții</h3>
                <label className={styles.checkbox}>
                  <input type="checkbox" defaultChecked /> Permite rezervări online
                </label>
                <label className={styles.checkbox}>
                  <input type="checkbox" defaultChecked /> Necesită verificare manuală
                </label>
                <label className={styles.checkbox}>
                  <input type="checkbox" /> Permite rezervări în weekend
                </label>
              </div>
            </div>
          </div>
        );

      case 'attractions':
        return (
          <div className={styles.section}>
            <h2>Gestionare Atracții</h2>
            <div className={styles.attractionsList}>
              <div className={styles.attractionCard}>
                <div className={styles.attractionHeader}>
                  <h3>Piscină</h3>
                  <div className={styles.attractionActions}>
                    <button className={styles.editButton}>✏️</button>
                    <button className={styles.deleteButton}>🗑️</button>
                  </div>
                </div>
                <div className={styles.attractionDetails}>
                  <p>Status: <span className={styles.active}>Activ</span></p>
                  <p>Program: 08:00 - 22:00</p>
                  <p>Preț: 50 RON/zi</p>
                </div>
              </div>
              <div className={styles.attractionCard}>
                <div className={styles.attractionHeader}>
                  <h3>Spa</h3>
                  <div className={styles.attractionActions}>
                    <button className={styles.editButton}>✏️</button>
                    <button className={styles.deleteButton}>🗑️</button>
                  </div>
                </div>
                <div className={styles.attractionDetails}>
                  <p>Status: <span className={styles.inactive}>Inactiv</span></p>
                  <p>Program: 10:00 - 20:00</p>
                  <p>Preț: 100 RON/zi</p>
                </div>
              </div>
              <button className={styles.addButton}>+ Adaugă atracție nouă</button>
            </div>
          </div>
        );

      case 'services':
        return (
          <div className={styles.section}>
            <h2>Gestionare Servicii</h2>
            <div className={styles.servicesList}>
              <div className={styles.serviceCard}>
                <div className={styles.serviceHeader}>
                  <h3>Room Service</h3>
                  <div className={styles.serviceActions}>
                    <button className={styles.editButton}>✏️</button>
                    <button className={styles.deleteButton}>🗑️</button>
                  </div>
                </div>
                <div className={styles.serviceDetails}>
                  <p>Status: <span className={styles.active}>Activ</span></p>
                  <p>Program: 24/7</p>
                  <p>Taxă serviciu: 10%</p>
                </div>
              </div>
              <div className={styles.serviceCard}>
                <div className={styles.serviceHeader}>
                  <h3>Lavandărie</h3>
                  <div className={styles.serviceActions}>
                    <button className={styles.editButton}>✏️</button>
                    <button className={styles.deleteButton}>🗑️</button>
                  </div>
                </div>
                <div className={styles.serviceDetails}>
                  <p>Status: <span className={styles.active}>Activ</span></p>
                  <p>Program: 08:00 - 18:00</p>
                  <p>Preț minim: 50 RON</p>
                </div>
              </div>
              <button className={styles.addButton}>+ Adaugă serviciu nou</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const [selectedProfile, setSelectedProfile] = useState(null);

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h2>Administrare Sistem</h2>
      </div>
      
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {renderContent()}
      </div>

      {selectedProfile && (
        <div className={styles.modalOverlay}>
          {renderStaffProfile(selectedProfile)}
        </div>
      )}
    </div>
  );
};

export default AdminView; 