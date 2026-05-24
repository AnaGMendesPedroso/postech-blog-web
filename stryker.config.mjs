export default {
  mutate: [
    'src/domains/**/domain/**/*.js',
    'src/domains/**/application/**/*.js',
    'src/domains/**/infrastructure/**/*.js',
    'src/shared/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/**/index.js',
    '!src/shared/test-utils.js',
    '!src/shared/styles/**'
  ],
  testRunner: 'jest',
  jest: {
    projectType: 'create-react-app'
  },
  reporters: ['html', 'clear-text', 'progress', 'json'],
  htmlReporter: { fileName: 'reports/mutation/index.html' },
  jsonReporter: { fileName: 'reports/mutation/mutation-report.json' },
  thresholds: { high: 90, low: 80, break: 80 },
  concurrency: 2,
  timeoutMS: 30000,
  timeoutFactor: 2.5,
  cleanTempDir: 'always',
  ignoreStatic: true
};
