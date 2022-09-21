const utilsTest = require('./utils');

/**
 * Generate random test cases for different sizes of graph.
 */

for (let i = 550; i <= 1000; i = i + 50) {
    utilsTest.generateTestCases(i, 10);
}

