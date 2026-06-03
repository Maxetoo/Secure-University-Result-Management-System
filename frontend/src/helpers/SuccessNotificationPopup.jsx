import React, { useEffect } from 'react';
import toast from 'react-hot-toast';

const SuccessNotificationPopup = ({ trigger, message = "Action successful", onClose }) => {
  useEffect(() => {
    if (trigger) {
      toast.dismiss('success-toast');
      toast.success(message, {
        duration: 3000,
        style: {
          background: '#1c2236',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          color: '#34d399',
          fontWeight: 500,
          fontSize: '0.875rem',
        },
        iconTheme: {
          primary: '#34d399',
          secondary: '#1c2236',
        },
      });

      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [trigger, message, onClose]);

  return null;
};

export default SuccessNotificationPopup;
