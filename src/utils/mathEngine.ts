import * as math from 'mathjs';
import { AngleUnit, NumberFormat, FractionFormat, MemoryVariables } from '../types';

export interface EvalResult {
  exact: string;
  decimal: string;
  isError: boolean;
  errorMessage?: string;
  isComplex?: boolean;
}

/**
 * Format standard numbers according to setup (NORM1, NORM2, FIX, SCI)
 */
export function formatResultNumber(
  num: number,
  format: NumberFormat = 'NORM1',
  fixDecimals: number = 2,
  sciDigits: number = 5
): string {
  if (!isFinite(num)) {
    if (isNaN(num)) return 'Math ERROR';
    return num > 0 ? 'Infinity' : '-Infinity';
  }

  // Very small or very large in NORM
  if (Math.abs(num) < 1e-10 && num !== 0) {
    return num.toExponential(4).replace('e', '×10^');
  }

  if (format === 'FIX') {
    return num.toFixed(fixDecimals);
  }
  if (format === 'SCI') {
    return num.toExponential(sciDigits).replace('e', '×10^');
  }

  // Normal 1 / 2 format
  if (Math.abs(num) >= 1e10 || (Math.abs(num) < 1e-3 && num !== 0 && format === 'NORM1')) {
    return num.toExponential(6).replace('e', '×10^').replace(/\+/, '');
  }

  // Clean rounding of floating point imprecision
  const rounded = Number(num.toPrecision(12));
  return String(rounded);
}

/**
 * Approximate a decimal as a simplified fraction if exact
 */
export function toFractionString(val: number, format: FractionFormat = 'd/c'): string | null {
  if (!isFinite(val) || Math.abs(val) > 1e7 || Math.abs(val) < 1e-6) return null;
  try {
    const f = math.fraction(val) as math.Fraction;
    const n = Number(f.n);
    const d = Number(f.d);
    const s = Number(f.s) === -1 ? '-' : '';

    if (d === 1) return null; // Integer
    if (d > 100000) return null; // Not clean fraction

    if (format === 'ab/c' && Math.abs(n) > d) {
      const whole = Math.floor(Math.abs(n) / d);
      const rem = Math.abs(n) % d;
      if (rem === 0) return `${s}${whole}`;
      return `${s}${whole} ┘ ${rem}/${d}`;
    }
    return `${s}${Math.abs(n)}/${d}`;
  } catch {
    return null;
  }
}

/**
 * Pre-process calculator display tokens into mathematical expressions
 */
export function preprocessExpression(
  expr: string,
  angleUnit: AngleUnit = 'DEG',
  vars: MemoryVariables
): string {
  let processed = expr;

  // Replace display symbols with math equivalents
  processed = processed.replace(/×/g, '*');
  processed = processed.replace(/÷/g, '/');
  processed = processed.replace(/−/g, '-');
  processed = processed.replace(/π/g, '(pi)');
  processed = processed.replace(/e\b/g, '(e)');

  // Handle scientific 10^x shorthand like 5×10^3 or 5E3
  processed = processed.replace(/×10\^([0-9\-]+)/g, '*10^($1)');

  // Replace variable names (Ans, PreAns, A, B, C, D, E, F, x, y, M)
  // Ensure Ans is substituted first before A
  processed = processed.replace(/\bPreAns\b/g, `(${vars.PreAns})`);
  processed = processed.replace(/\bAns\b/g, `(${vars.Ans})`);

  // Substitute variables safely
  const varMap: Record<string, string | number> = {
    A: vars.A,
    B: vars.B,
    C: vars.C,
    D: vars.D,
    E: vars.E,
    F: vars.F,
    X: vars.x,
    x: vars.x,
    Y: vars.y,
    y: vars.y,
    M: vars.M,
  };

  for (const [key, val] of Object.entries(varMap)) {
    const re = new RegExp(`\\b${key}\\b`, 'g');
    processed = processed.replace(re, `(${val})`);
  }

  // Handle trigonometric functions according to angle unit
  // In DEG: sin(x) -> sin(x * pi / 180)
  // In GRA: sin(x) -> sin(x * pi / 200)
  if (angleUnit === 'DEG') {
    processed = processed.replace(/\bsin\(([^)]+)\)/g, 'sin(($1) * pi / 180)');
    processed = processed.replace(/\bcos\(([^)]+)\)/g, 'cos(($1) * pi / 180)');
    processed = processed.replace(/\btan\(([^)]+)\)/g, 'tan(($1) * pi / 180)');
    processed = processed.replace(/\basin\(([^)]+)\)/g, '(asin($1) * 180 / pi)');
    processed = processed.replace(/\bacos\(([^)]+)\)/g, '(acos($1) * 180 / pi)');
    processed = processed.replace(/\batan\(([^)]+)\)/g, '(atan($1) * 180 / pi)');
  } else if (angleUnit === 'GRA') {
    processed = processed.replace(/\bsin\(([^)]+)\)/g, 'sin(($1) * pi / 200)');
    processed = processed.replace(/\bcos\(([^)]+)\)/g, 'cos(($1) * pi / 200)');
    processed = processed.replace(/\btan\(([^)]+)\)/g, 'tan(($1) * pi / 200)');
    processed = processed.replace(/\basin\(([^)]+)\)/g, '(asin($1) * 200 / pi)');
    processed = processed.replace(/\bacos\(([^)]+)\)/g, '(acos($1) * 200 / pi)');
    processed = processed.replace(/\batan\(([^)]+)\)/g, '(atan($1) * 200 / pi)');
  }

  // Combinations & Permutations (e.g. 5 nCr 2 -> combinations(5, 2), 5 nPr 2 -> permutations(5, 2))
  processed = processed.replace(/(\d+(?:\.\d+)?)\s*nCr\s*(\d+(?:\.\d+)?)/g, 'combinations($1, $2)');
  processed = processed.replace(/(\d+(?:\.\d+)?)\s*nPr\s*(\d+(?:\.\d+)?)/g, 'permutations($1, $2)');

  // GCD and LCM (e.g. GCD(12, 18), LCM(12, 18))
  processed = processed.replace(/\bGCD\(([^,]+),([^)]+)\)/gi, 'gcd($1, $2)');
  processed = processed.replace(/\bLCM\(([^,]+),([^)]+)\)/gi, 'lcm($1, $2)');

  // Log base: log(b, x) or log10(x)
  processed = processed.replace(/\blog_([0-9\.]+)\(([^)]+)\)/g, '(log($2) / log($1))');
  processed = processed.replace(/\blog\(([^)]+)\)/g, 'log10($1)');
  processed = processed.replace(/\bln\(([^)]+)\)/g, 'log($1)');

  // Square root & nth root
  processed = processed.replace(/√\(([^)]+)\)/g, 'sqrt($1)');
  processed = processed.replace(/(\d+(?:\.\d+)?)\s*ˣ√\(([^)]+)\)/g, 'nthRoot($2, $1)');

  // Absolute value |x| -> abs(x)
  processed = processed.replace(/Abs\(([^)]+)\)/gi, 'abs($1)');

  // Percentages 50% -> (50/100)
  processed = processed.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

  return processed;
}

/**
 * Numerical derivative approximation: d/dx f(x) at x = val
 */
export function numericalDerivative(
  funcExpr: string,
  xVal: number,
  angleUnit: AngleUnit = 'DEG',
  vars: MemoryVariables
): number {
  const h = 1e-6;
  const evalAt = (x: number) => {
    const scopeVars = { ...vars, x };
    const p = preprocessExpression(funcExpr, angleUnit, scopeVars);
    return Number(math.evaluate(p));
  };
  const fPlus = evalAt(xVal + h);
  const fMinus = evalAt(xVal - h);
  return (fPlus - fMinus) / (2 * h);
}

/**
 * Numerical definite integration: ∫ f(x) dx from a to b using Simpson's rule
 */
export function numericalIntegration(
  funcExpr: string,
  a: number,
  b: number,
  angleUnit: AngleUnit = 'DEG',
  vars: MemoryVariables,
  n: number = 100
): number {
  if (n % 2 !== 0) n += 1;
  const h = (b - a) / n;
  const evalAt = (x: number) => {
    const scopeVars = { ...vars, x };
    const p = preprocessExpression(funcExpr, angleUnit, scopeVars);
    return Number(math.evaluate(p));
  };

  let sum = evalAt(a) + evalAt(b);
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += (i % 2 === 0 ? 2 : 4) * evalAt(x);
  }
  return (h / 3) * sum;
}

/**
 * Summation: Σ f(x) from start to end
 */
export function numericalSummation(
  funcExpr: string,
  start: number,
  end: number,
  angleUnit: AngleUnit = 'DEG',
  vars: MemoryVariables
): number {
  let total = 0;
  for (let x = Math.round(start); x <= Math.round(end); x++) {
    const scopeVars = { ...vars, x };
    const p = preprocessExpression(funcExpr, angleUnit, scopeVars);
    total += Number(math.evaluate(p));
  }
  return total;
}

/**
 * Main evaluation function for calculator expressions
 */
export function evaluateExpression(
  expr: string,
  angleUnit: AngleUnit = 'DEG',
  numberFormat: NumberFormat = 'NORM1',
  fixDecimals: number = 2,
  sciDigits: number = 5,
  fractionFormat: FractionFormat = 'd/c',
  vars: MemoryVariables
): EvalResult {
  const trimmed = expr.trim();
  if (!trimmed) {
    return { exact: '0', decimal: '0', isError: false };
  }

  try {
    // Check for special functions like derivative d/dx(f(x), x=val)
    const derivMatch = trimmed.match(/^d\/dx\((.+),\s*([0-9\.\-]+)\)$/);
    if (derivMatch) {
      const func = derivMatch[1];
      const xVal = parseFloat(derivMatch[2]);
      const res = numericalDerivative(func, xVal, angleUnit, vars);
      const dec = formatResultNumber(res, numberFormat, fixDecimals, sciDigits);
      const frac = toFractionString(res, fractionFormat);
      return {
        exact: frac || dec,
        decimal: dec,
        isError: false,
      };
    }

    // Check for definite integral ∫(f(x), a, b)
    const intMatch = trimmed.match(/^∫\((.+),\s*([0-9\.\-]+),\s*([0-9\.\-]+)\)$/);
    if (intMatch) {
      const func = intMatch[1];
      const a = parseFloat(intMatch[2]);
      const b = parseFloat(intMatch[3]);
      const res = numericalIntegration(func, a, b, angleUnit, vars);
      const dec = formatResultNumber(res, numberFormat, fixDecimals, sciDigits);
      const frac = toFractionString(res, fractionFormat);
      return {
        exact: frac || dec,
        decimal: dec,
        isError: false,
      };
    }

    // Check for summation Σ(f(x), start, end)
    const sumMatch = trimmed.match(/^Σ\((.+),\s*([0-9\.\-]+),\s*([0-9\.\-]+)\)$/);
    if (sumMatch) {
      const func = sumMatch[1];
      const start = parseFloat(sumMatch[2]);
      const end = parseFloat(sumMatch[3]);
      const res = numericalSummation(func, start, end, angleUnit, vars);
      const dec = formatResultNumber(res, numberFormat, fixDecimals, sciDigits);
      return {
        exact: String(res),
        decimal: dec,
        isError: false,
      };
    }

    // Standard expression
    const processed = preprocessExpression(trimmed, angleUnit, vars);
    const rawVal = math.evaluate(processed);

    // Handle complex numbers (e.g. 3 + 4i)
    if (rawVal && typeof rawVal === 'object' && 'isComplex' in rawVal) {
      const c = rawVal as math.Complex;
      const reStr = formatResultNumber(c.re, numberFormat, fixDecimals, sciDigits);
      const imStr = formatResultNumber(Math.abs(c.im), numberFormat, fixDecimals, sciDigits);
      const sign = c.im >= 0 ? '+' : '-';
      const formatted = `${reStr} ${sign} ${imStr}i`;
      return {
        exact: formatted,
        decimal: formatted,
        isError: false,
        isComplex: true,
      };
    }

    const numVal = Number(rawVal);
    if (isNaN(numVal) || !isFinite(numVal)) {
      return {
        exact: 'Math ERROR',
        decimal: 'Math ERROR',
        isError: true,
        errorMessage: 'Calculation range exceeded or invalid operation',
      };
    }

    const dec = formatResultNumber(numVal, numberFormat, fixDecimals, sciDigits);
    const frac = toFractionString(numVal, fractionFormat);

    return {
      exact: frac || dec,
      decimal: dec,
      isError: false,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Syntax ERROR';
    return {
      exact: 'Syntax ERROR',
      decimal: 'Syntax ERROR',
      isError: true,
      errorMessage: msg,
    };
  }
}
