module.exports = function (config) {
  return {
    ...config,
    plugins: [
      './withBatteryOptimizationIntent',
    ],
  };
};
