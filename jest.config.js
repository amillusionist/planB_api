module.exports = {
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/tests/setup.js'],
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/tests/'
    ],
    verbose: true
}; 