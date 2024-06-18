import roundValues from "./roundValues";
import Complex from "complex.js";

function createMatrixY(isConnectivity, values) {
  if (isConnectivity) {
    const nodes = values.nodes.length;
    const Y = [];

    // ЗАДАЕМ НУЛЕВУЮ МАТРИЦУ
    for (let i = 0; i < nodes; i++) {
      Y[i] = [];
      for (let j = 0; j < nodes; j++) {
        Y[i][j] = new Complex(0, 0);
      }
    }

    // ВВОД ПРОВОДИМОСТЕЙ УЗЛОВ
    for (let i = 0; i < nodes; i++) {
      const numder = Number(values.nodes[i][0]);
      const Yd = Number(values.nodes[i][7]) * 0.000001;
      const Ym = Number(values.nodes[i][8]) * 0.000001;
      Y[numder - 1][numder - 1] = Y[numder - 1][numder - 1].add(
        new Complex(Yd, Ym)
      );
    }

    // ВВОД ПРОВОДИМОСТЕЙ ВЕТВЕЙ
    for (let i = 0; i < values.branches.length; i++) {
      const NN = Number(values.branches[i][1]);
      const NK = Number(values.branches[i][2]);
      const R = Number(values.branches[i][3]);
      const X = Number(values.branches[i][4]);
      const K = Number(values.branches[i][5]);
      const Z = new Complex(R, X);
      const KT = new Complex(K, 0);

      const inverseZ = Z.inverse();
      Y[NN - 1][NN - 1] = Y[NN - 1][NN - 1].add(inverseZ);
      Y[NK - 1][NK - 1] = Y[NK - 1][NK - 1].add(inverseZ.mul(KT.mul(KT)));
      Y[NN - 1][NK - 1] = Y[NN - 1][NK - 1].sub(inverseZ.mul(KT));
      Y[NK - 1][NN - 1] = Y[NK - 1][NN - 1].sub(inverseZ.mul(KT));
    }

    const Y1 = roundValues(Y, 3);
    console.log("МАТРИЦА ПРОВОДИМОСТИ", Y1);
    return Y1;
  } else return null;
}

export default createMatrixY;
