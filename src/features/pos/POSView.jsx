import React, { useState } from "react";
import styles from "./POSView.module.css";
import { useCalendarStore } from "../../store/calendarStore";

const POSView = () => {
  const [activeTab, setActiveTab] = useState("rooms"); // "rooms" or "services"
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const rooms = useCalendarStore((state) => state.rooms);

  // Sample services and beverages data (to be moved to a store or API)
  const services = [
    { id: 1, name: "Room Service", price: 50 },
    { id: 2, name: "Spa Access", price: 100 },
    { id: 3, name: "Parking (per day)", price: 30 },
  ];

  const beverages = [
    { id: 4, name: "Apă plată", price: 8 },
    { id: 5, name: "Apă minerală", price: 8 },
    { id: 6, name: "Coca Cola", price: 10 },
    { id: 7, name: "Fanta", price: 10 },
    { id: 8, name: "Espresso", price: 12 },
    { id: 9, name: "Cappuccino", price: 15 },
  ];

  const handleAddItem = (item) => {
    setSelectedItems((prev) => [...prev, { ...item, quantity: 1 }]);
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handlePrintReceipt = () => {
    // TODO: Implement receipt printing logic
    console.log("Printing receipt for:", {
      room: selectedRoom,
      items: selectedItems,
      total: calculateTotal(),
    });
    // Reset after printing
    setSelectedItems([]);
    setSelectedRoom(null);
  };

  return (
    <div className={styles.posContainer}>
      <h2>🛒 Punct de Vânzare (POS)</h2>
      
      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tabButton} ${activeTab === "rooms" ? styles.active : ""}`}
          onClick={() => setActiveTab("rooms")}
        >
          Camere
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "services" ? styles.active : ""}`}
          onClick={() => setActiveTab("services")}
        >
          Servicii & Băuturi
        </button>
      </div>

      <div className={styles.posContent}>
        {/* Left Panel - Selection */}
        <div className={styles.selectionPanel}>
          {activeTab === "rooms" ? (
            <>
              <h3>Selectează Camera</h3>
              <div className={styles.roomGrid}>
                {rooms.map((room) => (
                  <button
                    key={room.number}
                    className={`${styles.roomButton} ${
                      selectedRoom?.number === room.number ? styles.selected : ""
                    }`}
                    onClick={() => setSelectedRoom(room)}
                  >
                    Camera {room.number}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={styles.servicesSection}>
                <h3>Servicii</h3>
                <div className={styles.itemGrid}>
                  {services.map((service) => (
                    <button
                      key={service.id}
                      className={styles.itemButton}
                      onClick={() => handleAddItem(service)}
                    >
                      {service.name}
                      <span>{service.price} RON</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className={styles.beveragesSection}>
                <h3>Băuturi</h3>
                <div className={styles.itemGrid}>
                  {beverages.map((beverage) => (
                    <button
                      key={beverage.id}
                      className={styles.itemButton}
                      onClick={() => handleAddItem(beverage)}
                    >
                      {beverage.name}
                      <span>{beverage.price} RON</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Panel - Cart */}
        <div className={styles.cartPanel}>
          <h3>Bon Fiscal</h3>
          
          {selectedRoom && (
            <div className={styles.selectedRoom}>
              Camera selectată: {selectedRoom.number}
            </div>
          )}

          <div className={styles.cartItems}>
            {selectedItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <span className={styles.itemName}>{item.name}</span>
                <div className={styles.itemControls}>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <span className={styles.itemPrice}>
                  {item.price * item.quantity} RON
                </span>
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveItem(item.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className={styles.cartTotal}>
            <span>Total:</span>
            <span>{calculateTotal()} RON</span>
          </div>

          <button
            className={styles.printButton}
            onClick={handlePrintReceipt}
            disabled={selectedItems.length === 0}
          >
            Printează Bon Fiscal
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSView;