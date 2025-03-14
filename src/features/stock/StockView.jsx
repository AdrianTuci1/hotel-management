import React, { useState } from "react";
import styles from "./StockView.module.css";

const StockView = () => {
  // Simplified categories
  const categories = ["Servicii", "Băuturi"];

  // Updated initial stock data
  const [stockItems, setStockItems] = useState([
    { id: 1, name: "Apă plată", quantity: 100, category: "Băuturi" },
    { id: 2, name: "Apă minerală", quantity: 80, category: "Băuturi" },
    { id: 3, name: "Coca Cola", quantity: 50, category: "Băuturi" },
    { id: 4, name: "Fanta", quantity: 45, category: "Băuturi" },
    { id: 5, name: "Espresso", quantity: 200, category: "Băuturi" },
    { id: 6, name: "Cappuccino", quantity: 200, category: "Băuturi" },
    { id: 7, name: "Room Service", quantity: 999, category: "Servicii" },
    { id: 8, name: "Spa Access", quantity: 999, category: "Servicii" },
    { id: 9, name: "Parcare (zi)", quantity: 50, category: "Servicii" },
  ]);

  // State for new item form
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    category: categories[0],
  });

  // State for filtering
  const [filterCategory, setFilterCategory] = useState("toate");
  const [searchTerm, setSearchTerm] = useState("");

  // Add new item
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.quantity) return;

    setStockItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newItem.name,
        quantity: parseInt(newItem.quantity),
        category: newItem.category,
      },
    ]);

    // Reset form
    setNewItem({
      name: "",
      quantity: "",
      category: categories[0],
    });
  };

  // Update item quantity
  const handleUpdateQuantity = (id, change) => {
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          // Pentru servicii, menținem cantitatea la 999
          if (item.category === "Servicii") {
            return item;
          }
          // Pentru băuturi, actualizăm normal
          return { ...item, quantity: Math.max(0, item.quantity + change) };
        }
        return item;
      })
    );
  };

  // Filter items
  const filteredItems = stockItems.filter((item) => {
    const matchesCategory =
      filterCategory === "toate" || item.category === filterCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.stockContainer}>
      <h2>📦 Gestionare Stocuri</h2>

      {/* Add New Item Form */}
      <div className={styles.addItemSection}>
        <h3>Adaugă Produs/Serviciu Nou</h3>
        <form onSubmit={handleAddItem} className={styles.addItemForm}>
          <input
            type="text"
            placeholder="Nume produs/serviciu"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className={styles.input}
          />
          <input
            type="number"
            placeholder="Cantitate"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            className={styles.input}
            min="0"
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className={styles.select}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button type="submit" className={styles.addButton}>
            Adaugă
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Caută..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={styles.select}
        >
          <option value="toate">Toate categoriile</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Stock Items Table */}
      <div className={styles.tableContainer}>
        <table className={styles.stockTable}>
          <thead>
            <tr>
              <th>Nume</th>
              <th>Categorie</th>
              <th>Cantitate</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>
                  <span
                    className={`${styles.quantity} ${
                      item.category === "Servicii" 
                        ? styles.service
                        : item.quantity < 20 
                        ? styles.lowStock 
                        : ""
                    }`}
                  >
                    {item.category === "Servicii" ? "∞" : item.quantity}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    {item.category !== "Servicii" && (
                      <>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className={styles.actionButton}
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className={styles.actionButton}
                        >
                          +
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockView;