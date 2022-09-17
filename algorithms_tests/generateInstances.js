const utilsTest = require('./utils');

/**
 * Generate random test cases for different sizes of graph.
 */

for (let i = 10; i <= 200; i = i + 10) {
    utilsTest.generateTestCases(i, 10);
}

