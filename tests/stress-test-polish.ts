import * as fs from 'fs/promises';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../..');

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string;
}

async function readSourceFile(relativePath: string): Promise<string> {
  const absolutePath = path.join(PROJECT_ROOT, relativePath);
  return await fs.readFile(absolutePath, 'utf8');
}

async function checkFileExists(relativePath: string): Promise<boolean> {
  const absolutePath = path.join(PROJECT_ROOT, relativePath);
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function runStressTest() {
  console.log('='.repeat(80));
  console.log('VISUAL POLISH & ANIMATION LEAK STRESS-TEST RUNNER');
  console.log('='.repeat(80));

  const results: CheckResult[] = [];

  // Check 1: MusicPlayer.tsx
  try {
    const content = await readSourceFile('src/components/MusicPlayer.tsx');
    
    // Check if it imports usePerf
    const importsUsePerf = content.includes('usePerf');
    // Check if it contains prefers-reduced-motion check
    const checksMotion = content.includes('prefers-reduced-motion') || content.includes('useReducedMotion');
    // Check if it conditionalizes script loading of YouTube iframe API
    const conditionalScript = content.includes('yt-iframe-api') && 
                              (content.includes('if (lite') || content.includes('if (!lite') || content.includes('isFastMode'));

    results.push({
      name: 'MusicPlayer - Performance Context (lite)',
      passed: importsUsePerf,
      message: importsUsePerf ? 'Imports and uses usePerf()' : 'Fails to import or use usePerf()'
    });

    results.push({
      name: 'MusicPlayer - Reduced Motion Compliance',
      passed: checksMotion,
      message: checksMotion ? 'Checks prefers-reduced-motion' : 'Fails to check prefers-reduced-motion'
    });

    results.push({
      name: 'MusicPlayer - YouTube script leak in Lite mode',
      passed: conditionalScript && importsUsePerf,
      message: (conditionalScript && importsUsePerf) ? 'Bypasses YouTube script loading in Lite mode' : 'Injects YouTube iframe script tag unconditionally in Lite mode'
    });
  } catch (err) {
    results.push({ name: 'MusicPlayer Check', passed: false, message: 'File read error', details: (err as Error).message });
  }

  // Check 2: VaultDoor.tsx
  try {
    const content = await readSourceFile('src/components/VaultDoor.tsx');
    
    const usesLite = content.includes('usePerf') || content.includes('lite');
    const checksMotion = content.includes('prefers-reduced-motion') || content.includes('useReducedMotion');
    const bypassesTimeout = content.includes('onDone?.()') || content.includes('onDone()') && (content.includes('lite') || content.includes('reduced'));

    results.push({
      name: 'VaultDoor - Performance Context (lite)',
      passed: usesLite,
      message: usesLite ? 'Checks performance mode (lite)' : 'Fails to check performance mode (lite)'
    });

    results.push({
      name: 'VaultDoor - Reduced Motion Compliance',
      passed: checksMotion,
      message: checksMotion ? 'Checks prefers-reduced-motion' : 'Fails to check prefers-reduced-motion'
    });

    results.push({
      name: 'VaultDoor - Transition bypass under Lite/Reduced-Motion',
      passed: usesLite && checksMotion && bypassesTimeout,
      message: (usesLite && checksMotion) ? 'Bypasses 3D animation sequence in fast/reduced-motion modes' : 'Forces 2.05s timeout and 3D animations unconditionally'
    });
  } catch (err) {
    results.push({ name: 'VaultDoor Check', passed: false, message: 'File read error', details: (err as Error).message });
  }

  // Check 3: LoginTransition.tsx
  try {
    const content = await readSourceFile('src/components/LoginTransition.tsx');
    
    const usesLite = content.includes('usePerf') || content.includes('lite');
    const checksMotion = content.includes('prefers-reduced-motion') || content.includes('useReducedMotion');
    const skipsAnimation = content.includes('onComplete()') && (content.includes('lite') || content.includes('reduced') || content.includes('fast'));

    results.push({
      name: 'LoginTransition - Performance Context (lite)',
      passed: usesLite,
      message: usesLite ? 'Checks performance mode (lite)' : 'Fails to check performance mode (lite)'
    });

    results.push({
      name: 'LoginTransition - Reduced Motion Compliance',
      passed: checksMotion,
      message: checksMotion ? 'Checks prefers-reduced-motion' : 'Fails to check prefers-reduced-motion'
    });

    results.push({
      name: 'LoginTransition - Animation bypass under Lite/Reduced-Motion',
      passed: usesLite && skipsAnimation,
      message: (usesLite && skipsAnimation) ? 'Skips flash and fragmentation grid animations' : 'Forces heavy framer-motion grid fragmentation and flash animations'
    });
  } catch (err) {
    results.push({ name: 'LoginTransition Check', passed: false, message: 'File read error', details: (err as Error).message });
  }

  // Check 4: MatrixOverlay.tsx
  try {
    const content = await readSourceFile('src/components/MatrixOverlay.tsx');
    
    const usesLite = content.includes('usePerf') || content.includes('lite');
    const checksMotion = content.includes('prefers-reduced-motion') || content.includes('useReducedMotion');
    const skipsCanvasLoop = content.includes('cancelAnimationFrame') || content.includes('return') && (content.includes('lite') || content.includes('reduced'));

    results.push({
      name: 'MatrixOverlay - Performance Context (lite)',
      passed: usesLite,
      message: usesLite ? 'Checks performance mode (lite)' : 'Fails to check performance mode (lite)'
    });

    results.push({
      name: 'MatrixOverlay - Reduced Motion Compliance',
      passed: checksMotion,
      message: checksMotion ? 'Checks prefers-reduced-motion' : 'Fails to check prefers-reduced-motion'
    });

    results.push({
      name: 'MatrixOverlay - Canvas Loop bypass under Lite/Reduced-Motion',
      passed: usesLite && checksMotion && skipsCanvasLoop,
      message: (usesLite && checksMotion) ? 'Disables canvas rain animation' : 'Starts full-screen canvas rain loop unconditionally'
    });
  } catch (err) {
    results.push({ name: 'MatrixOverlay Check', passed: false, message: 'File read error', details: (err as Error).message });
  }

  // Check 5: ModuleCard.tsx
  try {
    const content = await readSourceFile('src/components/ModuleCard.tsx');
    
    const checksLite = content.includes('usePerf') || content.includes('lite');
    const checksMotion = content.includes('useReducedMotion') || content.includes('prefers-reduced-motion');
    const restrictsMouseMove = content.includes('onMouseMove') && (content.includes('lite') || content.includes('reduced') || content.includes('motion') || content.includes('usePerf'));

    results.push({
      name: 'ModuleCard - Mouse move listener restriction',
      passed: restrictsMouseMove,
      message: restrictsMouseMove ? 'Restricts onMouseMove calculations' : 'Fires mousemove spotlight calculations unconditionally on every mouse move'
    });
  } catch (err) {
    results.push({ name: 'ModuleCard Check', passed: false, message: 'File read error', details: (err as Error).message });
  }

  // Check 6: CSS Overrides in globals.css
  try {
    const content = await readSourceFile('src/app/globals.css');
    
    const hasLiteRules = content.includes('.lite');
    const hasReducedMotion = content.includes('prefers-reduced-motion');
    const overridesEq = content.includes('.lite .eq') || content.includes('.eq > i') && content.includes('animation: none');

    results.push({
      name: 'CSS - Lite mode overrides defined',
      passed: hasLiteRules,
      message: hasLiteRules ? 'Found .lite override rules' : 'Missing .lite override rules'
    });

    results.push({
      name: 'CSS - Reduced motion overrides defined',
      passed: hasReducedMotion,
      message: hasReducedMotion ? 'Found media query for prefers-reduced-motion' : 'Missing media query for prefers-reduced-motion'
    });

    results.push({
      name: 'CSS - Equalizer animations disabled',
      passed: overridesEq,
      message: overridesEq ? 'Equalizer animation disabled in lite/reduced-motion' : 'Equalizer continues to animate under lite/reduced-motion modes'
    });
  } catch (err) {
    results.push({ name: 'globals.css Check', passed: false, message: 'File read error', details: (err as Error).message });
  }

  // Print Report Table
  console.log('\nSTRESS TEST RESULTS:');
  console.log('='.repeat(80));
  console.table(results.map(r => ({
    Check: r.name,
    Status: r.passed ? 'PASS' : 'FAIL',
    Message: r.message,
    Details: r.details || ''
  })));

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log('='.repeat(80));
  console.log(`Total Stress Checks: ${total}`);
  console.log(`Passed:              \x1b[32m${passed}\x1b[0m`);
  console.log(`Failed:              \x1b[31m${failed}\x1b[0m`);
  console.log('='.repeat(80));
}

runStressTest().catch(console.error);
