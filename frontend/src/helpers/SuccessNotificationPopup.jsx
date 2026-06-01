import React, { useEffect } from 'react';
import toast from 'react-hot-toast';

const SuccessNotificationPopup = ({ trigger, message = "Action successful", onClose }) => {
  useEffect(() => {
    if (trigger) {
      toast.dismiss('success-toast'); 
      // Show success toast
      toast.success(message, {
        duration: 3000,
        style: {
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          color: '#166534',
          fontWeight: 500,
          fontSize: '0.875rem',
        },
        iconTheme: {
          primary: '#16A34A',
          secondary: '#F0FDF4',
        },
      });

      // Optional callback after toast duration
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [trigger, message, onClose]);

  return null; 
};

export default SuccessNotificationPopup;

// import React, { useEffect, useRef } from 'react';
// import toast from 'react-hot-toast';

// const SuccessNotificationPopup = ({ trigger, message = "Action successful", onClose }) => {
//   const hasShownToast = useRef(false);

//   useEffect(() => {
//     if (trigger && !hasShownToast.current) {
//       toast.dismiss('success-toast'); 
      
//       // Show success toast
//       toast.success(message, {
//         duration: 3000,
//         style: {
//           background: '#F0FDF4',
//           border: '1px solid #BBF7D0',
//           color: '#166534',
//           fontWeight: 500,
//           fontSize: '0.875rem',
//         },
//         iconTheme: {
//           primary: '#16A34A',
//           secondary: '#F0FDF4',
//         },
//       });

//       hasShownToast.current = true;
//     }

//     // Cleanup: Reset trigger after showing toast
//     return () => {
//       if (trigger && hasShownToast.current && onClose) {
//         onClose();
//         hasShownToast.current = false;
//       }
//     };
//   }, [trigger, message, onClose]);

//   return null; 
// };

// export default SuccessNotificationPopup;
