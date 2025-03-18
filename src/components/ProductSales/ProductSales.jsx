/**
 * ProductSales Component
 * 
 * Handles selling products to hotel guests or walk-in customers, independent of reservations.
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IconShoppingCart } from '@tabler/icons-react';
import styles from './ProductSales.module.css';

/**
 * Form for selling products to customers
 * 
 * @param {Object} props - Component props
 * @param {Array} props.products - Array of available products with name, price, quantity
 * @param {Object} props.reservation - Optional reservation data if the sale is tied to a reservation
 * @param {Function} props.onAction - Callback for form actions (complete sale)
 * @param {Function} props.onClose - Callback when form is closed/canceled
 * @returns {JSX.Element} The product sales form
 */
const ProductSales = ({ products, reservation, onAction, onClose }) => {
  const [productSaleData, setProductSaleData] = useState({
    cartItems: [],
    selectedProduct: '',
    quantity: 1,
    customerName: reservation?.customerName || '',
    totalPrice: 0
  });

  // Customer name state (only if no reservation is provided)
  const [customerName, setCustomerName] = useState(reservation?.customerName || '');

  // Handle product selection changes
  const handleProductChange = (e) => {
    setProductSaleData({ ...productSaleData, selectedProduct: e.target.value });
  };

  // Handle quantity changes
  const handleQuantityChange = (e) => {
    setProductSaleData({ ...productSaleData, quantity: parseInt(e.target.value) || 1 });
  };

  // Handle customer name change
  const handleCustomerNameChange = (e) => {
    setCustomerName(e.target.value);
  };

  // Add product to cart
  const addProductToCart = () => {
    if (!productSaleData.selectedProduct) return;
    
    // Find product in available products
    const product = products.find(p => p.id === productSaleData.selectedProduct);
    if (!product) return;
    
    const updatedCartItems = [...productSaleData.cartItems];
    const existingProduct = updatedCartItems.find(p => p.id === product.id);
    
    if (existingProduct) {
      existingProduct.quantity += productSaleData.quantity;
    } else {
      updatedCartItems.push({
        ...product,
        quantity: productSaleData.quantity
      });
    }
    
    const totalPrice = updatedCartItems.reduce((total, p) => 
      total + (p.price * p.quantity), 0);
    
    setProductSaleData({
      ...productSaleData,
      cartItems: updatedCartItems,
      selectedProduct: '',
      quantity: 1,
      totalPrice
    });
  };

  // Remove product from cart
  const removeProductFromCart = (productId) => {
    const updatedCartItems = productSaleData.cartItems.filter(p => p.id !== productId);
    const totalPrice = updatedCartItems.reduce((total, p) => 
      total + (p.price * p.quantity), 0);
    
    setProductSaleData({
      ...productSaleData,
      cartItems: updatedCartItems,
      totalPrice
    });
  };

  // Handle completing the sale
  const completeSale = () => {
    onAction('completeSale', {
      products: productSaleData.cartItems,
      totalPrice: productSaleData.totalPrice,
      reservationId: reservation?.id, // Optional - only if reservation exists
      customerName: reservation ? reservation.customerName : customerName
    });
  };

  return (
    <div className={styles.productSales}>
      <div className={styles.productSalesHeader}>
        <IconShoppingCart size={24} />
        <h3>Vânzare produse</h3>
      </div>
      
      {/* Show reservation info if provided */}
      {reservation && (
        <div className={styles.customerInfo}>
          <p><strong>Client:</strong> {reservation.customerName}</p>
          <p><strong>Rezervare:</strong> {reservation.id}</p>
        </div>
      )}
      
      {/* Only show customer name input if no reservation */}
      {!reservation && (
        <div className={styles.formGroup}>
          <label htmlFor="customerName">Nume client</label>
          <input
            type="text"
            id="customerName"
            value={customerName}
            onChange={handleCustomerNameChange}
            placeholder="Introduceți numele clientului"
          />
        </div>
      )}
      
      <div className={styles.productSalesForm}>
        <div className={styles.productSelection}>
          <div className={styles.formGroup}>
            <label htmlFor="selectedProduct">Produs</label>
            <select
              id="selectedProduct"
              value={productSaleData.selectedProduct}
              onChange={handleProductChange}
            >
              <option value="">Selectează un produs</option>
              {products && products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.price} RON
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="quantity">Cantitate</label>
            <input
              type="number"
              id="quantity"
              min="1"
              value={productSaleData.quantity}
              onChange={handleQuantityChange}
            />
          </div>
          
          <button
            onClick={addProductToCart}
            className={styles.addButton}
            disabled={!productSaleData.selectedProduct}
          >
            Adaugă
          </button>
        </div>
        
        <div className={styles.productCart}>
          <h4>Coș de cumpărături</h4>
          {productSaleData.cartItems.length === 0 ? (
            <p className={styles.emptyCart}>Niciun produs adăugat</p>
          ) : (
            <>
              <ul className={styles.productList}>
                {productSaleData.cartItems.map(product => (
                  <li key={product.id} className={styles.productItem}>
                    <div className={styles.productInfo}>
                      <span>{product.name}</span>
                      <span>{product.quantity} x {product.price} RON</span>
                    </div>
                    <button
                      onClick={() => removeProductFromCart(product.id)}
                      className={styles.removeButton}
                    >
                      Elimină
                    </button>
                  </li>
                ))}
              </ul>
              <div className={styles.totalPrice}>
                <strong>Total:</strong> {productSaleData.totalPrice} RON
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className={styles.actions}>
        <button
          onClick={completeSale}
          className={styles.primaryButton}
          disabled={productSaleData.cartItems.length === 0 || (!reservation && !customerName)}
        >
          Finalizează vânzarea
        </button>
        <button onClick={onClose} className={styles.secondaryButton}>
          Anulează
        </button>
      </div>
    </div>
  );
};

ProductSales.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      quantity: PropTypes.number
    })
  ).isRequired,
  reservation: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    customerName: PropTypes.string
  }),
  onAction: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

// Make reservation explicitly optional
ProductSales.defaultProps = {
  reservation: null
};

export default ProductSales; 