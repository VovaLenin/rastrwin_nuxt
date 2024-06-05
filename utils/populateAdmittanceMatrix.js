//РАБОТАЕТ

const populateAdmittanceMatrix = (Y, nodes, branches) => {
  branches.forEach((branch) => {
    const r = branch.resistanceOhms / baseImpedance;
    const x = branch.reactanceOhms / baseImpedance;
    const z = new Complex(r, x);
    const y = z.inverse();
    const k = new Complex(branch.ratio, 0);

    const from = branch.from - 1;
    const to = branch.to - 1;

    Y[from][from] = Y[from][from].add(y);
    Y[to][to] = Y[to][to].add(y.mul(k).mul(k));
    Y[from][to] = Y[from][to].sub(y.mul(k));
    Y[to][from] = Y[to][from].sub(y.mul(k));
  });

  nodes.forEach((node, i) => {
    const yNode = new Complex(
      node.conductanceMicroS,
      node.susceptanceMicroS
    ).mul(baseAdmittance);
    Y[i][i] = Y[i][i].add(yNode);
  });
};
