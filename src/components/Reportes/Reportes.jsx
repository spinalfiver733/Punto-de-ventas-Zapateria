import './Reportes.css';
import iconoExcel from '../../assets/images/svg/iconoExcel.svg';
import iconoPDF from '../../assets/images/svg/iconoPDF.svg';
const Reportes = () => {
    return (
      <div className="ventas-container">
        <div className="headerTitle">
          <h2>REPORTES</h2>
        </div>
        <div className="icon-container"> {/* Nuevo contenedor */}
          <img src={iconoExcel} className="icon-file" alt="Descargar Excel"/>
          <img src={iconoPDF} className="icon-file" alt="Descargar PDF" />
        </div>
      </div>
    );
  };
  
  export default Reportes;
  