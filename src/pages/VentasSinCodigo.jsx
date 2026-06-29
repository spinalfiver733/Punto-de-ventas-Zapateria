//Importaciones react
import {useState} from 'react';

//Estilos
{/*import './Ventas.css';
import { useVenta } from '../../context/VentaContext';
import { customSelectStyles } from '../../styles/estilosGenerales';
import  '../../styles/estilosGenerales.css';


//Importación de imagenes
import iconAgregar from '../../assets/images/svg/agregar.svg';
import iconCancelar from '../../assets/images/svg/cancelar.svg';
import iconAceptar from '../../assets/images/svg/aceptar.svg';

//Importación de librerias
import { useSnackbar } from 'notistack';
import Select from 'react-select';
import api from '../../config/api.js';
*/}
const VentasSinCodigo = () => {
  // El return con el JSX se omite aquí, ya que lo tienes en tu código original
  return (
    <div className="page-container">
  
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="marca">Marca:</label>
            <input 
              type="text" 
              id="marca" 
              name="marca" 
            />
          </div>
          <div className="form-group">
            <label htmlFor="modelo">Modelo:</label>
            <input 
              type="text" 
              id="precio" 
              name="precio"
            />
          </div>
        </div>
  
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="color">Color:</label>
            <input 
              type="text" 
              id="precio" 
              name="precio"
            />
          </div>          
          <div className="form-group">
            <label htmlFor="numero">Número:</label>
            <input 
              type="text" 
              id="precio" 
              name="precio"
            />
          </div>
        </div>
  
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="precio">Precio:</label>
            <input 
              type="text" 
              id="precio" 
              name="precio"
            />
          </div>
          <div className="form-group">
            <label htmlFor="vendedor">Vendedor:</label>
            <input 
              type="text" 
              id="precio" 
              name="precio"
            />
          </div>
        </div>
  
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="metodoPago">Método de pago:</label>
            <input 
              type="text" 
              id="precio" 
              name="precio"
            />
          </div>       
        </div>
  
        <div className="form-row">
          <div className="textarea-group">
            <label htmlFor="observaciones">Observaciones:</label>
            <textarea 
              id="observaciones" 
              name="observaciones" 
              rows="4" 
              cols="50" 
              placeholder="Escribe aquí la observación"
            ></textarea>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VentasSinCodigo;