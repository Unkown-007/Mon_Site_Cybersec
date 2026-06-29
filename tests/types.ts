export interface Test {
  id: string;
  name: string;
  tier: 1 | 2 | 3 | 4;
  feature: 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7' | 'Cross-Feature' | 'Scenario';
  type: 'static' | 'runtime';
  run: () => Promise<TestResult>;
}

export interface TestResult {
  id: string;
  passed: boolean;
  message?: string;
  details?: string;
}

export interface Runner {
  tests: Test[];
  results: TestResult[];
  runAll(): Promise<void>;
  printReport(): void;
}
