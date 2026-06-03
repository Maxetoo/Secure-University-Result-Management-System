import { useEffect } from 'react';
import toast from 'react-hot-toast';

const ErrorNotificationPopup = ({ trigger, message = "An error occurred" }) => {
  useEffect(() => {
    if (trigger) {
      toast.dismiss('error-toast');
      toast.error(message, {
        id: 'error-toast',
        duration: 3000,
        style: {
          border: '1px solid rgba(248, 113, 113, 0.3)',
          background: '#1c2236',
          color: '#f87171',
          fontWeight: 500,
        },
        iconTheme: {
          primary: '#f87171',
          secondary: '#1c2236',
        },
      });
    }
  }, [trigger, message]);

  return null;
};

export default ErrorNotificationPopup;
