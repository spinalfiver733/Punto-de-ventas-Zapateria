export const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#FF6E31' : '#ccc',
      boxShadow: state.isFocused ? '0 0 0 1px #FF6E31' : null,
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
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#757575',
    }),
  };