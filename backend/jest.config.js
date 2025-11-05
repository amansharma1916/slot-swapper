module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/'],
    testTimeout: 30000,
    verbose: true,
    collectCoverageFrom: [
        'routes/**/*.js',
        'models/**/*.js',
        'middleware/**/*.js',
        '!**/node_modules/**'
    ],
    testMatch: ['**/__tests__/**/*.test.js'],
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js']
};
