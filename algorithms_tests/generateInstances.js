const utilsTest = require('./utils');

/**
 * Generate random test cases for different sizes of graph.
 */

for (let i = 2; i <= 1002; i = i + 50) {
    utilsTest.generateTestCases(i, 10);
}

