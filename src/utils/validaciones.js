export const esPrecioValido = (value) => {
  if (value === '') return true;
  return /^\d*\.?\d*$/.test(value);
};