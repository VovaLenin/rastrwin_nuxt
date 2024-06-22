import Complex from "complex.js";

export default function invertJacobian(matrix) {
  const nodes = matrix.length;
  let YP = matrix.map((row) =>
    row.map((complex) =>
      complex ? new Complex(complex.re, complex.im) : new Complex(0, 0)
    )
  );
  let DWOBR = new Array(nodes)
    .fill(null)
    .map(() => new Array(nodes).fill(null));
  const ONE = new Complex(-1, 0);

  for (let k = 1; k < nodes; k++) {
    for (let i = 1; i < nodes; i++) {
      for (let j = 1; j < nodes; j++) {
        if (i === k && j === k) {
          DWOBR[i][j] = YP[i][j].inverse();
        } else if (i === k && j !== k) {
          DWOBR[i][j] = ONE.mul(YP[i][j].mul(YP[k][k].inverse()));
        } else if (i !== k && j === k) {
          DWOBR[i][j] = YP[i][j].mul(YP[k][k].inverse());
        } else if (i !== k && j !== k) {
          DWOBR[i][j] = YP[i][j].sub(
            YP[i][k].mul(YP[k][j].mul(YP[k][k].inverse()))
          );
        }
      }
    }

    // Обновляем YP с новыми значениями DWOBR
    for (let i = 1; i < nodes; i++) {
      for (let j = 1; j < nodes; j++) {
        YP[i][j] = DWOBR[i][j];
      }
    }
  }

  // Заменить все оставшиеся null на Complex(0, 0)
  for (let i = 0; i < nodes; i++) {
    for (let j = 0; j < nodes; j++) {
      if (DWOBR[i][j] === null) {
        DWOBR[i][j] = new Complex(0, 0);
      }
    }
  }

  return DWOBR;
}
