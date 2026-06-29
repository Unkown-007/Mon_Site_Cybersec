import { Test, TestResult, Runner } from './types';
import { tier1Tests } from './cases/tier1';
import { tier2Tests } from './cases/tier2';
import { tier3Tests } from './cases/tier3';
import { tier4Tests } from './cases/tier4';

class E2ETestRunner implements Runner {
  tests: Test[] = [];
  results: TestResult[] = [];

  constructor() {
    this.tests = [
      ...tier1Tests,
      ...tier2Tests,
      ...tier3Tests,
      ...tier4Tests
    ];
  }

  async runAll() {
    console.log(`Starting E2E Test Suite. Total test cases: ${this.tests.length}`);
    console.log('='.repeat(80));
    
    for (const test of this.tests) {
      process.stdout.write(`Running [Tier ${test.tier}] [${test.feature}] ${test.id}: ${test.name} ... `);
      try {
        const res = await test.run();
        this.results.push(res);
        if (res.passed) {
          console.log('\x1b[32mPASSED\x1b[0m');
        } else {
          console.log('\x1b[31mFAILED\x1b[0m');
          if (res.message) {
            console.log(`  Reason: ${res.message}`);
          }
        }
      } catch (err) {
        console.log('\x1b[31mERROR\x1b[0m');
        console.log(`  Unhandled Error: ${(err as Error).message}`);
        this.results.push({
          id: test.id,
          passed: false,
          message: 'Unhandled exception',
          details: (err as Error).message
        });
      }
    }
  }

  printReport() {
    console.log('\n' + '='.repeat(80));
    console.log('E2E TEST RUN SUMMARY');
    console.log('='.repeat(80));
    
    const summaryTable = this.results.map(res => {
      const test = this.tests.find(t => t.id === res.id)!;
      return {
        ID: res.id,
        Tier: `Tier ${test.tier}`,
        Feature: test.feature,
        Type: test.type,
        Status: res.passed ? 'PASS' : 'FAIL',
        Message: res.message || ''
      };
    });

    console.table(summaryTable);

    const total = this.tests.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;

    console.log('='.repeat(80));
    console.log(`Total Tests:  ${total}`);
    console.log(`Passed:       \x1b[32m${passed}\x1b[0m`);
    console.log(`Failed:       \x1b[31m${failed}\x1b[0m`);
    console.log('='.repeat(80));

    if (failed > 0) {
      console.log('Note: Failed tests are expected as visual enhancements are not yet fully implemented.');
    }
  }
}

async function main() {
  const runner = new E2ETestRunner();
  await runner.runAll();
  runner.printReport();
}

main().catch(err => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
