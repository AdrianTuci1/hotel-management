import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBed, FaSwimmingPool, FaMapMarkerAlt, FaUserCog, FaSignInAlt } from 'react-icons/fa';
import styles from './Navbar.module.css';

const mainNavItems = [
  { id: 'home', path: '/', label: 'Acasa', icon: FaHome },
  { id: 'rooms', path: '/rooms', label: 'Camere', icon: FaBed },
  { id: 'facilities', path: '/facilities', label: 'Facilitati', icon: FaSwimmingPool },
  { id: 'attractions', path: '/attractions', label: 'Atractii', icon: FaMapMarkerAlt },
];

const specialNavItems = [
  { id: 'special', path: '/dashboard', label: 'Special', icon: FaUserCog, iconOnly: true },
  { id: 'login', path: '/login', label: 'Log In', icon: FaSignInAlt, iconOnly: true },
];

const Navbar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Set active menu based on current path
    const currentPath = location.pathname;
    const allNavItems = [...mainNavItems, ...specialNavItems];
    const active = allNavItems.find(item => 
      currentPath === item.path || 
      (currentPath !== '/' && item.path !== '/' && currentPath.startsWith(item.path))
    );
    setActiveItem(active ? active.id : 'home');

    // Add scroll event listener
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.navContainer}>
        <ul className={styles.navList}>
          {mainNavItems.map((item) => (
            <li key={item.id} className={styles.navItem}>
              <Link 
                to={item.path} 
                className={`${styles.navLink} ${activeItem === item.id ? styles.active : ''}`}
              >
                <item.icon className={styles.navIcon} />
                {activeItem === item.id && !item.iconOnly && 
                  <span className={styles.navLabel}>{item.label}</span>
                }
              </Link>
            </li>
          ))}
          
          <li className={styles.separator}></li>
          
          {specialNavItems.map((item) => (
            <li key={item.id} className={`${styles.navItem} ${styles.specialNavItem}`}>
              <Link 
                to={item.path} 
                className={`${styles.navLink} ${activeItem === item.id ? styles.active : ''}`}
              >
                <item.icon className={styles.navIcon} />
                {activeItem === item.id && !item.iconOnly && 
                  <span className={styles.navLabel}>{item.label}</span>
                }
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 