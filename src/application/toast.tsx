// src/components/Toast.tsx
import { h, FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';

interface ToastProps {
  message: string;
  duration?: number;
}

export const Toast: FunctionalComponent<ToastProps> = ({ message, duration = 3000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const hideTimeout = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(hideTimeout);
  }, [message, duration]);

  return (
    <div style={{ ...styles.toast, ...(visible ? styles.show : {}) }}>
      {message}
    </div>
  );
};

const styles = {
  toast: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4500', // Error color (Tomato)
    color: '#333',
    padding: '10px 20px',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
    maxWidth: '300px', // Make it narrower
    wordWrap: 'break-word', // Ensure text wraps within the toast
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000, // Ensure it appears above other elements
  },
  show: {
    opacity: 1,
  },
};