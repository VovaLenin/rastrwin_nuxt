export function formatComplexNumber(complexNumber) {
  const realPart = complexNumber.re.toFixed(3);
  const imaginaryPart = complexNumber.im.toFixed(3);

  // Убираем ведущий плюс для отрицательной мнимой части
  const sign = complexNumber.im >= 0 ? "+" : "";

  return `${realPart} ${sign} ${imaginaryPart}i`;
}
