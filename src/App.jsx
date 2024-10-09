import React from 'react';
import { SnackbarProvider } from 'notistack';
import MainLayout from './Layouts/MainLayout';
import { VentaProvider } from './context/VentaContext';
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
          marginTop: '65px',
        }}
        classes={{
          variantSuccess: 'success-snackbar',
          variantError: 'error-snackbar',
          variantWarning: 'warning-snackbar',
          variantInfo: 'info-snackbar',
        }}
      >
        <VentaProvider>
          <MainLayout/>
        </VentaProvider>
      </SnackbarProvider>
    </div>
  );
}

export default App;