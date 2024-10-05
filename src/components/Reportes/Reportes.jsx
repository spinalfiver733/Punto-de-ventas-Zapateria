import { useState } from 'react';
import Select from 'react-select';
import './Reportes.css';
import iconoExcel from '../../assets/images/svg/iconoExcel.svg';
import iconoPDF from '../../assets/images/svg/iconoPDF.svg';
import { customSelectStyles } from '../../styles/estilosGenerales';

const Reportes = () => {
  const [periodo, setPeriodo] = useState(null);

  const opciones = [
    { value: 'hoy', label: 'Hoy' },
    { value: 'semana', label: 'Semana' },
    { value: 'mensual', label: 'Mensual' },
    { value: 'anual', label: 'Anual' }
  ];

  const handlePeriodoChange = (selectedOption) => {
    setPeriodo(selectedOption);
  };

  return (
    <div className="reportes-container">
      <div className="headerTitle">
        <h2>REPORTES</h2>
      </div>
      <div className="content-container">
        <div className="icon-container">
          <img src={iconoExcel} className="icon-file" alt="Descargar Excel"/>
          <img src={iconoPDF} className="icon-file" alt="Descargar PDF" />
        </div>
        <div className="selector-container">
          <label htmlFor="periodo-selector">Periodo:</label>
          <Select
            id="periodo-selector"
            value={periodo}
            onChange={handlePeriodoChange}
            options={opciones}
            styles={customSelectStyles}
            placeholder="Seleccionar periodo..."
          />
        </div>
      </div>
    </div>
  );
};

export default Reportes;