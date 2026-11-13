const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ESTADOS_ANIME = ['viendo', 'completado', 'pausado', 'abandonado', 'por_ver'];
const MINUTOS_VALIDOS = [0, 15, 30, 45];

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const isValidEmail = (value) =>
  typeof value === 'string' && EMAIL_REGEX.test(value.trim());

const toInteger = (value) => {
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
};

const isValidEstado = (value) => ESTADOS_ANIME.includes(value);

const isValidRating = (value) => {
  if (value === null || value === undefined || value === '') return true;
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 && number <= 5;
};

const isValidMinute = (value) => MINUTOS_VALIDOS.includes(Number(value));

module.exports = {
  ESTADOS_ANIME,
  MINUTOS_VALIDOS,
  isNonEmptyString,
  isValidEmail,
  toInteger,
  isValidEstado,
  isValidRating,
  isValidMinute
};