


module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    testPathIgnorePatterns: [
        "/node_modules/",
        "/tests/.*_(.*).[jt]sx?$"  // This regex matches any file that starts with an underscore in the tests directory
    ],
    transformIgnorePatterns: [
        '/node_modules/(?!(your-module|another-module)/)',
    ],
    moduleNameMapper: {
        '@thinairthings/uix': '<rootDir>/node_modules/@thinairthings/uix/dist/lib/index.js',
    },
};
