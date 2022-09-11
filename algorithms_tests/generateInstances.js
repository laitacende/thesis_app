const utilsTest = require('./utils');

for (let i = 10; i <= 200; i = i + 10) {
    utilsTest.generateTestCases(i, 10);
}

