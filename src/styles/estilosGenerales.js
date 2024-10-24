// estilosGenerales.js
export const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? '#FF6E31' : '#ccc',
    boxShadow: state.isFocused ? '0 0 0 1px #FF6E31' : null,
    minHeight: '42px',
    height: '42px', // Añadimos altura fija
    padding: '0', // Quitamos el padding del control
    '&:hover': {
      borderColor: '#FF6E31',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#FFE6D9' : 'white',
    color: 'black',
    '&:hover': {
      backgroundColor: '#FFE6D9',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'black',
  }),
  input: (provided) => ({
    ...provided,
    color: 'black',
    margin: '0', // Quitamos márgenes
    padding: '0', // Quitamos padding
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#757575',
  }),
  container: (provided) => ({
    ...provided,
    width: '100%',
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 8px', // Ajustamos el padding interno
    height: '40px', // Altura específica para el contenedor del valor
    display: 'flex',
    alignItems: 'center',
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 1000, // Para asegurar que el menú desplegable aparezca sobre otros elementos
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: '200px', // Altura máxima del menú desplegable
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: '40px', // Altura específica para los indicadores
  }),
 };