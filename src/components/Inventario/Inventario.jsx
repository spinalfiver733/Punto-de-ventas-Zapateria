// import React, { useState } from 'react';
// import iconAgregar from '../../assets/images/svg/agregar.svg';
// import iconCodigoBarras from '../../assets/images/svg/escaneoBarras.svg';
// const Inventario = () => {
//   const [formData, setFormData] = useState({
//     producto: '',
//     talla: '',
//     modelo: '',
//     vendedor: '',
//     color: '',
//     precio: '',
//     metodoPago: ''
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prevState => ({
//       ...prevState,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Aquí irá la lógica para procesar la venta
//     console.log('Datos de la venta:', formData);
//   };

//   return (
//     <div className="ventas-container">
//       <div className="headerTitle">
//         <h2>INVENTARIO</h2>
//       </div>
//       <form onSubmit={handleSubmit}>
//         <div className="form-row">
//           <div className="form-group">
//             <label htmlFor="producto">Producto:</label>
//             <select id="producto" name="producto" value={formData.producto} onChange={handleChange}>
//               <option value="">SELECCIONA UNA OPCIÓN</option>
//               {/* Opciones de productos */}
//             </select>
//           </div>
//           <div className="form-group">
//             <label htmlFor="talla">Talla:</label>
//             <select id="talla" name="talla" value={formData.talla} onChange={handleChange}>
//               <option value="">SELECCIONA UNA OPCIÓN</option>
//               {/* Opciones de tallas */}
//             </select>
//           </div>
//         </div>
//         <div className="form-row">
//           <div className="form-group">
//             <label htmlFor="modelo">Modelo:</label>
//             <select id="modelo" name="modelo" value={formData.modelo} onChange={handleChange}>
//               <option value="">SELECCIONA UNA OPCIÓN</option>
//               {/* Opciones de modelos */}
//             </select>
//           </div>
//           <div className="form-group">
//             <label htmlFor="precio">Precio:</label>
//             <input type="number" id="precio" name="precio" value={formData.precio} onChange={handleChange} />
//           </div>
//         </div>
//         <div className="form-row">
//           <div className="form-group">
//             <label htmlFor="color">Color:</label>
//             <select id="color" name="color" value={formData.color} onChange={handleChange}>
//               <option value="">SELECCIONA UNA OPCIÓN</option>
//               {/* Opciones de colores */}
//             </select>
//           </div>
//         </div>
//         <button type="submit" className="btn-agregar">
//           <img src={iconAgregar} alt="Agregar producto" />
//           AGREGAR
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Inventario;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Inventario = () => {
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/inventario');
        setVentas(response.data);
      } catch (error) {
        console.error('Error fetching ventas:', error);
      }
    };

    fetchVentas();
  }, []);

  return (
    <div className="ventas-container">
      <div className="headerTitle">
        <h2>INVENTARIO</h2>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Talla</th>
            <th>Modelo</th>
            <th>Vendedor</th>
            <th>Color</th>
            <th>Precio</th>
            <th>Método de Pago</th>
            <th>Fecha de Venta</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.PK_PRODUCTO}>
              <td>{venta.PK_PRODUCTO}</td>
              <td>{venta.TALLA}</td>
              <td>{venta.MODELO}</td>
              <td>{venta.VENDEDOR}</td>
              <td>{venta.COLOR}</td>
              <td>{venta.PRECIO}</td>
              <td>{venta.METODO_PAGO}</td>
              <td>{new Date(venta.FECHA_VENTA).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventario;