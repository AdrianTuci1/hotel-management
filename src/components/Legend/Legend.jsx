import styles from './Legend.module.css';

const Legend = () => {
  const statusItems = [
    { color: '#808080', label: 'Plin' },
    { color: '#FF0000', label: 'Disponibilitate redusă' },
    { color: '#FFD700', label: 'Moderat' },
    { color: '#008000', label: 'Liber' }
  ];

  return (
    <div className={styles.legend}>
      <h3 className={styles.legendTitle}>Disponibilitate</h3>
      <div className={styles.legendItems}>
        {statusItems.map((item, index) => (
          <div key={index} className={styles.legendItem}>
            <div 
              className={styles.colorCube} 
              style={{ backgroundColor: item.color }}
            />
            <span className={styles.legendLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend; 