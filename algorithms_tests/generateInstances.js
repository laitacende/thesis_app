const utilsTest = require('./utils');

/**
 * Generate random test cases for different sizes of graph.
 */

for (let i = 2; i <= 200; i = i + 2) {
    if (i % 10 !== 0)
    utilsTest.generateTestCases(i, 10);
}

