module.exports = {
    verbose: true,
    collectCoverage: true,
    coverageThreshold: {
        global: {
            branches: 100,
            lines: 100
        }
    },
    "roots": [
        "./test"
    ],
    "testMatch": [
        "**/__tests__/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest"
    }
}
