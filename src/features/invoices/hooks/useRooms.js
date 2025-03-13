import { useState, useEffect } from 'react';

const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const today = new Date();
        const roomsData = [
          { 
            number: "101", 
            status: "occupied", 
            guest: "Ion Popescu",
            hasInvoice: false,
            checkIn: formatDate(new Date()),
            checkOut: formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000))
          },
          { 
            number: "102", 
            status: "occupied", 
            guest: "Maria Ionescu",
            hasInvoice: true,
            invoiceNumber: "F001",
            checkIn: formatDate(new Date(today.getTime() - 24 * 60 * 60 * 1000)),
            checkOut: formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000))
          },
          { 
            number: "201", 
            status: "occupied", 
            guest: "George Popa",
            hasInvoice: false,
            checkIn: formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000)),
            checkOut: formatDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000))
          },
          { 
            number: "202", 
            status: "occupied", 
            guest: "Ana Dumitrescu",
            hasInvoice: true,
            invoiceNumber: "F002",
            checkIn: formatDate(new Date()),
            checkOut: formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000))
          },
          { 
            number: "301", 
            status: "occupied", 
            guest: "Vasile Marin",
            hasInvoice: false,
            checkIn: formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
            checkOut: formatDate(new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000))
          },
          { 
            number: "302", 
            status: "occupied", 
            guest: "Elena Popescu",
            hasInvoice: false,
            checkIn: formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000)),
            checkOut: formatDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000))
          }
        ];
        
        setRooms(roomsData);
        setLoading(false);
      } catch (err) {
        setError("Nu s-au putut încărca camerele. Vă rugăm încercați din nou.");
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const refreshRooms = () => {
    setLoading(true);
    setError(null);
    // Re-fetch rooms
    // TODO: Implement actual API call
  };

  return {
    rooms,
    loading,
    error,
    refreshRooms
  };
};

export default useRooms; 