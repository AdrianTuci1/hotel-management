import React from 'react';
import styles from '../styles/InvoiceView.module.css';

const InvoiceForm = ({ 
  selectedRoom, 
  invoiceData, 
  onInvoiceDataChange,
  onBack,
  onSave,
  onGenerateInvoice,
  onCompanySearch
}) => {
  return (
    <div className={styles.invoiceForm}>
      <div className={styles.formHeader}>
        <h3>Factură - Camera {selectedRoom.number}</h3>
        <button 
          className={styles.backButton}
          onClick={onBack}
        >
          ← Înapoi la lista de camere
        </button>
      </div>

      <div className={styles.formContent}>
        {/* Date factură */}
        <div className={styles.formGroup}>
          <div className={styles.invoiceDetails}>
            <input
              type="text"
              placeholder="Număr factură"
              value={invoiceData.invoiceNumber}
              onChange={(e) => onInvoiceDataChange({
                ...invoiceData,
                invoiceNumber: e.target.value
              })}
              className={styles.input}
            />
            <input
              type="date"
              value={invoiceData.invoiceDate}
              onChange={(e) => onInvoiceDataChange({
                ...invoiceData,
                invoiceDate: e.target.value
              })}
              className={styles.input}
            />
            <select
              value={invoiceData.paymentMethod}
              onChange={(e) => onInvoiceDataChange({
                ...invoiceData,
                paymentMethod: e.target.value
              })}
              className={styles.select}
            >
              <option value="card">Card</option>
              <option value="cash">Numerar</option>
              <option value="transfer">Transfer bancar</option>
            </select>
          </div>
        </div>

        {/* Tip client */}
        <div className={styles.clientType}>
          <label>
            <input
              type="radio"
              name="clientType"
              value="pf"
              checked={invoiceData.clientType === "pf"}
              onChange={(e) => onInvoiceDataChange({
                ...invoiceData,
                clientType: e.target.value
              })}
            />
            Persoană Fizică
          </label>
          <label>
            <input
              type="radio"
              name="clientType"
              value="srl"
              checked={invoiceData.clientType === "srl"}
              onChange={(e) => onInvoiceDataChange({
                ...invoiceData,
                clientType: e.target.value
              })}
            />
            Companie (SRL/SA)
          </label>
        </div>

        {/* Date client */}
        {invoiceData.clientType === "pf" ? (
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Nume complet"
              value={invoiceData.clientName}
              onChange={(e) => onInvoiceDataChange({
                ...invoiceData,
                clientName: e.target.value
              })}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Adresă"
              value={invoiceData.address}
              onChange={(e) => onInvoiceDataChange({
                ...invoiceData,
                address: e.target.value
              })}
              className={styles.input}
            />
          </div>
        ) : (
          <div className={styles.formGroup}>
            <div className={styles.companySearch}>
              <input
                type="text"
                placeholder="CUI"
                value={invoiceData.cui}
                onChange={(e) => onInvoiceDataChange({
                  ...invoiceData,
                  cui: e.target.value
                })}
                className={styles.input}
              />
              <button 
                onClick={onCompanySearch}
                className={styles.searchButton}
              >
                Caută
              </button>
            </div>
            <input
              type="text"
              placeholder="Nume companie"
              value={invoiceData.companyName}
              onChange={(e) => onInvoiceDataChange({
                ...invoiceData,
                companyName: e.target.value
              })}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Nr. Reg. Com."
              value={invoiceData.regCom}
              onChange={(e) => onInvoiceDataChange({
                ...invoiceData,
                regCom: e.target.value
              })}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Adresă"
              value={invoiceData.address}
              onChange={(e) => onInvoiceDataChange({
                ...invoiceData,
                address: e.target.value
              })}
              className={styles.input}
            />
          </div>
        )}

        {/* Detalii plată */}
        <div className={styles.formGroup}>
          {invoiceData.paymentMethod === "card" && (
            <input
              type="text"
              placeholder="Ultimele 4 cifre card"
              value={invoiceData.cardLastDigits}
              onChange={(e) => onInvoiceDataChange({
                ...invoiceData,
                cardLastDigits: e.target.value.slice(0, 4)
              })}
              className={styles.input}
              maxLength="4"
            />
          )}
          <textarea
            placeholder="Descriere (opțional)"
            value={invoiceData.description}
            onChange={(e) => onInvoiceDataChange({
              ...invoiceData,
              description: e.target.value
            })}
            className={styles.textarea}
          />
        </div>

        {/* Butoane acțiuni */}
        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionButton} ${styles.saveButton}`}
            onClick={onSave}
          >
            Salvează Factura
          </button>
          <button
            className={`${styles.actionButton} ${styles.printButton}`}
            onClick={() => onGenerateInvoice("print")}
          >
            Printează Factură
          </button>
          <button
            className={`${styles.actionButton} ${styles.eFacturaButton}`}
            onClick={() => onGenerateInvoice("efactura")}
          >
            Trimite în e-Factura
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm; 