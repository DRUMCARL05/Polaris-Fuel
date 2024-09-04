import React, { useEffect, useState } from 'react';

// Styles for the custom alert
const alertStyles = {
  position: 'fixed',
  bottom: '100px', // Starting 200px from the bottom
  left: '20px', // Positioned on the left side
  backgroundColor: '#201c1c',
  border: '2px solid #ff7129',
  color: '#fff',
  padding: '20px',
  zIndex: 1000,
  textAlign: 'center',
  opacity: 0, // Initial opacity for fade effect
  transform: 'translateY(100px)', // Start off slightly below the visible area
  transition: 'opacity 0.5s ease, transform 0.5s ease', // Smooth opacity and position transition
};

const MyAlert = ({ isOpen, onClose, message }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true); // Trigger fade-in and rise-up effect
      const timer = setTimeout(() => {
        setVisible(false); // Trigger fade-out and move-down effect
        setTimeout(onClose, 500); // After fade-out, close the alert
      }, 1500); // Show for 3 seconds

      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          ...alertStyles,
          opacity: visible ? 1 : 0, // Fade in when visible
          transform: visible ? 'translateY(0)' : 'translateY(100px)', // Rising effect when visible
        }}
      >
        <h2>{message}</h2>
      </div>
    </>
  );
};

export default MyAlert;
