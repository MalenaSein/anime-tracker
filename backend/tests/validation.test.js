const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isNonEmptyString,
  isValidEmail,
  toInteger,
  isValidEstado,
  isValidRating,
  isValidMinute
} = require('../utils/validation');

test('isNonEmptyString valida strings con contenido', () => {
  assert.equal(isNonEmptyString('Naruto'), true);
  assert.equal(isNonEmptyString('   '), false);
  assert.equal(isNonEmptyString(null), false);
});

test('isValidEmail valida formato de email', () => {
  assert.equal(isValidEmail('test@example.com'), true);
  assert.equal(isValidEmail('test@'), false);
  assert.equal(isValidEmail('sin-arroba.com'), false);
});

test('toInteger convierte solo números enteros', () => {
  assert.equal(toInteger('5'), 5);
  assert.equal(toInteger(0), 0);
  assert.equal(toInteger('5.5'), null);
  assert.equal(toInteger('abc'), null);
});

test('isValidEstado acepta los estados del backend', () => {
  ['viendo', 'completado', 'pausado', 'abandonado', 'por_ver'].forEach((estado) => {
    assert.equal(isValidEstado(estado), true);
  });
  assert.equal(isValidEstado('otro'), false);
});

test('isValidRating acepta 0-5 y rechaza fuera de rango', () => {
  assert.equal(isValidRating(0), true);
  assert.equal(isValidRating(5), true);
  assert.equal(isValidRating(6), false);
  assert.equal(isValidRating(-1), false);
});

test('isValidMinute solo acepta 0, 15, 30 y 45', () => {
  [0, 15, 30, 45].forEach((minute) => assert.equal(isValidMinute(minute), true));
  assert.equal(isValidMinute(10), false);
  assert.equal(isValidMinute(60), false);
});