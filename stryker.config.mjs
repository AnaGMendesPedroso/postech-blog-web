export default {
  mutate: ['src/domains/**/*.js', '!src/**/*.test.js', '!src/**/*.spec.js'],
  testRunner: 'jest',
  jest: { projectType: 'create-react-app' },
  reporters: ['html', 'clear-text', 'progress'],
  htmlReporter: { baseDir: 'reports/mutation' },
  thresholds: { high: 90, low: 80, break: 80 }
};
