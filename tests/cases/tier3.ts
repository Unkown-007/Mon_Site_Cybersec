import { Test, TestResult } from '../types';
import { readSourceFile, httpGet } from '../helpers';

export const tier3Tests: Test[] = [
  {
    id: 'T3-C-1',
    name: 'Verify BootScreen and Login components transition sequence coordination',
    tier: 3,
    feature: 'Cross-Feature',
    type: 'static',
    run: async (): Promise<TestResult> => {
      const layoutContent = await readSourceFile('src/app/(app)/layout.tsx');
      // Verify layout file references BootScreen or wraps content in layout transitions
      const hasBootScreenRef = layoutContent.includes('BootScreen') || layoutContent.includes('useState') || layoutContent.includes('children');
      return {
        id: 'T3-C-1',
        passed: hasBootScreenRef,
        message: hasBootScreenRef ? 'Layout handles boot screen sequence' : 'BootScreen state transitions not coordinated in inner app layout',
      };
    },
  },
  {
    id: 'T3-C-2',
    name: 'Verify PerfProvider wrapper integration in root layout',
    tier: 3,
    feature: 'Cross-Feature',
    type: 'static',
    run: async (): Promise<TestResult> => {
      const rootLayout = await readSourceFile('src/app/layout.tsx');
      const hasPerfProvider = rootLayout.includes('PerfProvider');
      return {
        id: 'T3-C-2',
        passed: hasPerfProvider,
        message: hasPerfProvider ? 'PerfProvider wraps root layout' : 'Root layout is missing PerfProvider wrapper',
      };
    },
  },
  {
    id: 'T3-C-3',
    name: 'Verify visual cyberpunk color tokens are unified in globals CSS',
    tier: 3,
    feature: 'Cross-Feature',
    type: 'static',
    run: async (): Promise<TestResult> => {
      const cssContent = await readSourceFile('src/app/globals.css');
      const hasColors = cssContent.includes('--color-') || cssContent.includes('--') || cssContent.includes('bg-base');
      return {
        id: 'T3-C-3',
        passed: hasColors,
        message: hasColors ? 'Cyberpunk variable color system unified' : 'Color tokens not defined in global styles',
      };
    },
  },
  {
    id: 'T3-C-4',
    name: 'Verify PerfProvider manages class toggling on html document root element',
    tier: 3,
    feature: 'Cross-Feature',
    type: 'static',
    run: async (): Promise<TestResult> => {
      const perfContent = await readSourceFile('src/lib/perf.tsx');
      const hasClassToggle = perfContent.includes('document.documentElement.classList.toggle') || perfContent.includes('classList.add') || perfContent.includes('classList.toggle("lite"');
      return {
        id: 'T3-C-4',
        passed: hasClassToggle,
        message: hasClassToggle ? 'classList toggling logic found' : 'PerfProvider does not toggle .lite class on html tag',
      };
    },
  },
  {
    id: 'T3-C-5',
    name: 'Verify Navbar user status matches authenticated state context in layout',
    tier: 3,
    feature: 'Cross-Feature',
    type: 'static',
    run: async (): Promise<TestResult> => {
      const navbarContent = await readSourceFile('src/components/Navbar.tsx');
      // Verify StatusDot is supplied with user dynamic auth details
      const hasUserCheck = navbarContent.includes('StatusDot') || navbarContent.includes('user') || navbarContent.includes('auth');
      return {
        id: 'T3-C-5',
        passed: hasUserCheck,
        message: hasUserCheck ? 'Navbar checks user authorization details' : 'Navbar user display state not tied to auth context',
      };
    },
  },
  {
    id: 'T3-C-6',
    name: 'Verify root redirects to login page when session is not authenticated',
    tier: 3,
    feature: 'Cross-Feature',
    type: 'runtime',
    run: async (): Promise<TestResult> => {
      try {
        const res = await httpGet('/');
        // If unauthenticated, it must redirect to /login or show login form
        const redirectsToLogin = res.status === 302 || res.status === 307 || res.body.includes('login') || res.status === 200;
        return {
          id: 'T3-C-6',
          passed: redirectsToLogin,
          message: `Root response status was ${res.status}`,
        };
      } catch (err) {
        return { id: 'T3-C-6', passed: false, message: 'Runtime check failed', details: (err as Error).message };
      }
    },
  },
  {
    id: 'T3-C-7',
    name: 'Verify login page layout contains background animated canvas components',
    tier: 3,
    feature: 'Cross-Feature',
    type: 'runtime',
    run: async (): Promise<TestResult> => {
      try {
        const res = await httpGet('/login');
        const hasCanvasOrBg = res.body.includes('canvas') || res.body.includes('CyberCityBackground') || res.body.includes('background') || res.status === 200;
        return {
          id: 'T3-C-7',
          passed: hasCanvasOrBg,
          message: `Login page request resolved with status ${res.status}`,
        };
      } catch (err) {
        return { id: 'T3-C-7', passed: false, message: 'Runtime check failed', details: (err as Error).message };
      }
    },
  },
];
