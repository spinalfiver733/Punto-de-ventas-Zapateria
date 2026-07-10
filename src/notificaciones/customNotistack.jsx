import React from 'react';
import { SnackbarProvider } from 'notistack';

function customNotistack({ children }) {
  return (
    <SnackbarProvider 
      maxSnack={3} 
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      autoHideDuration={3000}
      style={{ marginTop: '65px' }}
      classes={{
        variantSuccess: 'success-snackbar',
        variantError: 'error-snackbar',
        variantWarning: 'warning-snackbar',
        variantInfo: 'info-snackbar',
      }}
    >
      {children}
    </SnackbarProvider>
  );
}

export default customNotistack;