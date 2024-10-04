import React from 'react';
import { SnackbarProvider } from 'notistack';
import MainLayout from './Layouts/MainLayout';
import './App.css';

function App() {
  return (
    <div className="full-width-container">
      <SnackbarProvider 
        maxSnack={3} 
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={3000}
        style={{
          marginTop: '65px', // Ajusta esto según la altura de tu barra de navegación
        }}
        classes={{
          variantSuccess: 'success-snackbar',
          variantError: 'error-snackbar',
          variantWarning: 'warning-snackbar',
          variantInfo: 'info-snackbar',
        }}
      >
        <MainLayout/>
      </SnackbarProvider>
    </div>
  );
}

export default App;