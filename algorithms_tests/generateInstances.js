const utilsTest = require('./utils');

/**
 * Generate random test cases for different sizes of graph.
 */

for (let i = 2; i <= 24; i = i + 2) {
    utilsTest.generateTestCases(i, 100);
}

