import { useState } from 'react';

const useInvoiceForm = (initialData = {}) => {
  const [invoiceData, setInvoiceData] = useState({
    clientType: "pf",
    clientName: "",
    companyName: "",
    cui: "",
    regCom: "",
    address: "",
    cardLastDigits: "",
    description: "",
    items: [],
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    paymentMethod: "card",
    total: 0,
    ...initialData
  });

  const validateInvoiceData = () => {
    if (invoiceData.clientType === "pf") {
      if (!invoiceData.clientName || !invoiceData.address) {
        return "Completați numele și adresa clientului";
      }
    } else {
      if (!invoiceData.cui || !invoiceData.companyName || !invoiceData.regCom || !invoiceData.address) {
        return "Completați toate datele companiei";
      }
    }
    if (!invoiceData.invoiceNumber) {
      return "Introduceți numărul facturii";
    }
    return null;
  };

  const handleCompanySearch = async () => {
    if (invoiceData.cui) {
      // TODO: Implement API call to search company data
      console.log("Searching company data for CUI:", invoiceData.cui);
      // Simulate found data
      setInvoiceData(prev => ({
        ...prev,
        companyName: "Demo Company SRL",
        regCom: "J40/123/2020",
        address: "Str. Exemplu nr. 1, București"
      }));
    }
  };

  const handleSaveInvoice = (selectedRoom) => {
    const validationError = validateInvoiceData();
    if (validationError) {
      alert(validationError);
      return false;
    }

    const invoiceDetails = {
      ...invoiceData,
      roomNumber: selectedRoom.number,
      guest: selectedRoom.guest,
      createdAt: new Date().toISOString(),
    };

    // TODO: Implement API call to save invoice
    console.log("Saving invoice:", invoiceDetails);
    alert("Factura a fost salvată cu succes!");
    return true;
  };

  const handleGenerateInvoice = (type, selectedRoom) => {
    const validationError = validateInvoiceData();
    if (validationError) {
      alert(validationError);
      return;
    }

    const invoiceDetails = {
      ...invoiceData,
      roomNumber: selectedRoom.number,
      guest: selectedRoom.guest,
    };

    if (type === "print") {
      console.log("Printing invoice:", invoiceDetails);
    } else if (type === "efactura") {
      console.log("Sending to e-factura:", invoiceDetails);
    }
  };

  return {
    invoiceData,
    setInvoiceData,
    validateInvoiceData,
    handleCompanySearch,
    handleSaveInvoice,
    handleGenerateInvoice
  };
};

export default useInvoiceForm; 