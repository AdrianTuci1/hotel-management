import React, { useEffect, useState } from "react";
import styles from "./ChatWindow.module.css";
import ChatMessage from "./ChatMessage";
import ChatOverlay from "./ChatOverlay";
import { useChatStore } from "../../store/chatStore";
import useRoomOptionsStore from "../../store/roomOptionsStore";
import { useCalendarStore } from "../../store/calendarStore";
import { handleChatMessage, initializeChat } from "../../actions/chatActions";
import apiService from "../../actions/apiService";
import ChatInput from "./ChatInput";

const commandsList = [
  "deschide calendarul",
  "deschide pos-ul",
  "deschide facturile",
  "deschide stocurile",
  // ... alte comenzi
];

const ChatWindow = () => {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const { updateViewPeriod, isRoomAvailable, setDefaultDates } = useCalendarStore();
  const {
    selectedRooms,
    addRoom,
    removeRoom,
    updateRoomPeriod,
    updateRoomPrice,
    getRoomInfo,
    setHighlightedRoom,
    reset: resetRoomOptions
  } = useRoomOptionsStore();

  // Overlay state
  const [overlay, setOverlay] = useState({
    isVisible: false,
    type: null,
    data: null
  });

  // Initialize chat
  useEffect(() => {
    initializeChat();
    return () => resetRoomOptions();
  }, []);

  const handleShowDetails = (reservation) => {
    // Don't reinitialize if we're already showing this reservation
    if (overlay.isVisible && overlay.data?.id === reservation.id) {
      return;
    }

    // Initialize reservation data
    const initialData = {
      id: reservation.id,
      fullName: reservation.fullName || reservation.guestName || "",
      phone: reservation.phone || "",
      email: reservation.email || "",
      notes: reservation.notes || "",
      isPaid: reservation.isPaid || false,
      hasInvoice: reservation.hasInvoice || false,
      hasReceipt: reservation.hasReceipt || false,
      rooms: reservation.rooms || []
    };

    // Reset room options and update calendar if needed
    resetRoomOptions();
    if (reservation.rooms?.length) {
      const firstRoom = reservation.rooms[0];
      setDefaultDates({
        startDate: firstRoom.startDate,
        endDate: firstRoom.endDate
      });
      updateViewPeriod(firstRoom.startDate, firstRoom.endDate);

      // Add rooms to selection
      reservation.rooms.forEach(room => {
        addRoom(room.roomNumber, room.startDate, room.endDate);
        updateRoomPrice(room.roomNumber, room.basePrice || room.price);
        setHighlightedRoom(room.roomNumber);
      });
    }

    setOverlay({
      isVisible: true,
      type: 'reservation',
      data: initialData
    });
  };

  const handleOverlayAction = async (action, data) => {
    switch (action) {
      case 'updateReservation':
        setOverlay(prev => ({ ...prev, data }));
        break;

      case 'finalizeReservation':
        try {
          const finalData = {
            ...data,
            rooms: selectedRooms.map(room => ({
              ...room,
              type: getRoomInfo(room.roomNumber)?.type || "Standard"
            }))
          };

          await apiService.createReservation(finalData);

          if (selectedRooms[0]) {
            const room = selectedRooms[0];
            addMessage({
              type: "bot",
              text: `Rezervare finalizată cu succes pentru camera ${room.roomNumber} în perioada ${room.startDate} - ${room.endDate}.`
            });
          }

          setOverlay({ isVisible: false, type: null, data: null });
          resetRoomOptions();
        } catch (error) {
          console.error('Error saving reservation:', error);
          addMessage({
            type: "bot",
            text: "❌ A apărut o eroare la salvarea rezervării!"
          });
        }
        break;

      case 'deleteReservation':
        if (window.confirm("Sigur doriți să ștergeți această rezervare?")) {
          setOverlay({ isVisible: false, type: null, data: null });
          resetRoomOptions();
        }
        break;

      case 'acceptNotification':
      case 'dismissNotification':
        // Handle notification actions
        setOverlay({ isVisible: false, type: null, data: null });
        break;

      default:
        console.warn('Unsupported overlay action:', action);
    }
  };

  const handleCloseOverlay = () => {
    setOverlay({ isVisible: false, type: null, data: null });
    resetRoomOptions();
  };

  const [showCommands, setShowCommands] = useState(false);

  const toggleCommands = () => {
    setShowCommands(!showCommands);
  };

  return (
    <div className={styles.chatContainer}>
      {/* 🔹 Buton pentru afișarea comenzilor în colțul din dreapta sus */}
      <button className={styles.commandsButton} onClick={toggleCommands}>
        ?
      </button>

      {showCommands && (
        <div className={styles.commandsPanel}>
          <h4>Comenzi Acceptate</h4>
          <ul>
            {commandsList.map((cmd, idx) => (
              <li key={idx}>{cmd}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.chatWrapper}>
        <div className={styles.messageList}>
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              {...message}
              onShowDetails={handleShowDetails}
            />
          ))}
        </div>
        <ChatInput onSendMessage={handleChatMessage} />
      </div>

      <ChatOverlay
        isVisible={overlay.isVisible}
        type={overlay.type}
        data={overlay.data}
        onClose={handleCloseOverlay}
        onAction={handleOverlayAction}
        roomManagement={{
          selectedRooms,
          defaultDates: {
            startDate: selectedRooms[0]?.startDate || "",
            endDate: selectedRooms[0]?.endDate || ""
          },
          isRoomAvailable,
          addRoom,
          removeRoom,
          updateRoomPeriod,
          updateRoomPrice,
          getRoomInfo,
          setHighlightedRoom
        }}
      />
    </div>
  );
};

export default ChatWindow;