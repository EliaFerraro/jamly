// Deliberately failing: proves a red PR cannot merge into dev (#2). Never merge.
it('fails on purpose', () => {
  expect(1).toBe(2);
});
