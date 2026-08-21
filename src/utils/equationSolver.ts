import * as math from 'mathjs';
import { EquationResult, InequalityResult, RatioResult, StatItem } from '../types';

/**
 * Solve system of linear equations A * X = B
 */
export function solveLinearSystem(coeffs: number[][], constants: number[]): EquationResult {
  const n = constants.length;
  try {
    const det = Number(math.det(coeffs));
    if (Math.abs(det) < 1e-12) {
      return {
        type: 'linear_system',
        variablesCount: n,
        roots: [],
        hasInfiniteSolutions: true,
      };
    }
    const inv = math.inv(coeffs) as math.Matrix | number[][];
    const solution = math.multiply(inv, constants) as math.Matrix | number[];
    const solArr = Array.isArray(solution) ? solution : (solution.toArray() as number[]);

    const varNames = ['x', 'y', 'z', 't'];
    const roots = solArr.map((val, idx) => ({
      name: varNames[idx] || `x${idx + 1}`,
      real: Number(Number(val).toPrecision(8)),
    }));

    return {
      type: 'linear_system',
      variablesCount: n,
      roots,
    };
  } catch {
    return {
      type: 'linear_system',
      variablesCount: n,
      roots: [],
      hasNoSolution: true,
    };
  }
}

/**
 * Solve Quadratic Equation: a x^2 + b x + c = 0
 */
export function solveQuadratic(a: number, b: number, c: number): EquationResult {
  if (a === 0) {
    if (b === 0) {
      return {
        type: 'polynomial',
        degree: 2,
        roots: [],
        hasNoSolution: c !== 0,
        hasInfiniteSolutions: c === 0,
      };
    }
    return {
      type: 'polynomial',
      degree: 2,
      roots: [{ name: 'x', real: -c / b }],
    };
  }

  const delta = b * b - 4 * a * c;
  const vertexX = -b / (2 * a);
  const vertexY = c - (b * b) / (4 * a);
  const extremaType = a > 0 ? ('min' as const) : ('max' as const);

  if (Math.abs(delta) < 1e-12) {
    const x = -b / (2 * a);
    return {
      type: 'polynomial',
      degree: 2,
      roots: [{ name: 'x₁ = x₂', real: Number(x.toPrecision(8)) }],
      extrema: { type: extremaType, x: vertexX, y: vertexY },
    };
  } else if (delta > 0) {
    const sqrtDelta = Math.sqrt(delta);
    const x1 = (-b + sqrtDelta) / (2 * a);
    const x2 = (-b - sqrtDelta) / (2 * a);
    return {
      type: 'polynomial',
      degree: 2,
      roots: [
        { name: 'x₁', real: Number(x1.toPrecision(8)) },
        { name: 'x₂', real: Number(x2.toPrecision(8)) },
      ],
      extrema: { type: extremaType, x: vertexX, y: vertexY },
    };
  } else {
    // Complex roots
    const sqrtNegDelta = Math.sqrt(-delta);
    const realPart = -b / (2 * a);
    const imagPart = sqrtNegDelta / (2 * Math.abs(a));
    return {
      type: 'polynomial',
      degree: 2,
      roots: [
        {
          name: 'x₁',
          real: Number(realPart.toPrecision(8)),
          imag: Number(imagPart.toPrecision(8)),
          isComplex: true,
        },
        {
          name: 'x₂',
          real: Number(realPart.toPrecision(8)),
          imag: Number((-imagPart).toPrecision(8)),
          isComplex: true,
        },
      ],
      extrema: { type: extremaType, x: vertexX, y: vertexY },
    };
  }
}

/**
 * Solve Cubic Equation: a x^3 + b x^2 + c x + d = 0 using Cardano's formula
 */
export function solveCubic(a: number, b: number, c: number, d: number): EquationResult {
  if (a === 0) {
    return solveQuadratic(b, c, d);
  }

  // Depressed cubic t^3 + pt + q = 0
  const p = (3 * a * c - b * b) / (3 * a * a);
  const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
  const discriminant = (q * q) / 4 + (p * p * p) / 27;
  const shift = -b / (3 * a);

  const roots: EquationResult['roots'] = [];

  if (Math.abs(discriminant) < 1e-12) {
    if (Math.abs(p) < 1e-12 && Math.abs(q) < 1e-12) {
      roots.push({ name: 'x₁ = x₂ = x₃', real: Number(shift.toPrecision(8)) });
    } else {
      const u = Math.cbrt(-q / 2);
      roots.push({ name: 'x₁', real: Number((2 * u + shift).toPrecision(8)) });
      roots.push({ name: 'x₂ = x₃', real: Number((-u + shift).toPrecision(8)) });
    }
  } else if (discriminant > 0) {
    const sqrtDisc = Math.sqrt(discriminant);
    const u = Math.cbrt(-q / 2 + sqrtDisc);
    const v = Math.cbrt(-q / 2 - sqrtDisc);
    const realRoot = u + v + shift;
    roots.push({ name: 'x₁', real: Number(realRoot.toPrecision(8)) });

    const complexReal = -(u + v) / 2 + shift;
    const complexImag = ((u - v) * Math.sqrt(3)) / 2;
    roots.push({
      name: 'x₂',
      real: Number(complexReal.toPrecision(8)),
      imag: Number(complexImag.toPrecision(8)),
      isComplex: true,
    });
    roots.push({
      name: 'x₃',
      real: Number(complexReal.toPrecision(8)),
      imag: Number((-complexImag).toPrecision(8)),
      isComplex: true,
    });
  } else {
    // 3 distinct real roots
    const r = Math.sqrt(-(p * p * p) / 27);
    const phi = Math.acos(-q / (2 * r));
    const m = 2 * Math.cbrt(r);

    const x1 = m * Math.cos(phi / 3) + shift;
    const x2 = m * Math.cos((phi + 2 * Math.PI) / 3) + shift;
    const x3 = m * Math.cos((phi + 4 * Math.PI) / 3) + shift;

    roots.push({ name: 'x₁', real: Number(x1.toPrecision(8)) });
    roots.push({ name: 'x₂', real: Number(x2.toPrecision(8)) });
    roots.push({ name: 'x₃', real: Number(x3.toPrecision(8)) });
  }

  return {
    type: 'polynomial',
    degree: 3,
    roots,
  };
}

/**
 * Solve Quartic Equation: a x^4 + b x^3 + c x^2 + d x + e = 0
 * Uses numerical root finding (Durand-Kerner or Companion matrix eigenvalue)
 */
export function solveQuartic(a: number, b: number, c: number, d: number, e: number): EquationResult {
  if (a === 0) {
    return solveCubic(b, c, d, e);
  }

  // Normalize polynomial: x^4 + A x^3 + B x^2 + C x + D = 0
  const A = b / a;
  const B = c / a;
  const C = d / a;
  const D = e / a;

  // Companion matrix
  const companion = [
    [0, 0, 0, -D],
    [1, 0, 0, -C],
    [0, 1, 0, -B],
    [0, 0, 1, -A],
  ];

  try {
    // Find eigenvalues with mathjs
    const ans = math.eigs(companion);
    const eigenValues = ans.values as unknown as Array<number | math.Complex>;

    const roots = eigenValues.map((val, idx) => {
      if (typeof val === 'object' && val && 'isComplex' in val) {
        const comp = val as math.Complex;
        if (Math.abs(comp.im) < 1e-7) {
          return { name: `x${idx + 1}`, real: Number(comp.re.toPrecision(8)) };
        }
        return {
          name: `x${idx + 1}`,
          real: Number(comp.re.toPrecision(8)),
          imag: Number(comp.im.toPrecision(8)),
          isComplex: true,
        };
      }
      return { name: `x${idx + 1}`, real: Number(Number(val).toPrecision(8)) };
    });

    return {
      type: 'polynomial',
      degree: 4,
      roots,
    };
  } catch {
    return {
      type: 'polynomial',
      degree: 4,
      roots: [],
      hasNoSolution: true,
    };
  }
}

/**
 * Solve Quadratic Inequality ax^2 + bx + c (op) 0
 */
export function solveQuadraticInequality(
  a: number,
  b: number,
  c: number,
  op: '>' | '<' | '>=' | '<='
): InequalityResult {
  const quadRes = solveQuadratic(a, b, c);
  const roots = quadRes.roots.filter(r => !r.isComplex);

  if (roots.length === 2) {
    const r1 = Math.min(roots[0].real, roots[1].real);
    const r2 = Math.max(roots[0].real, roots[1].real);

    if ((a > 0 && (op === '>' || op === '>=')) || (a < 0 && (op === '<' || op === '<='))) {
      const eq = op.includes('=') ? '=' : '';
      return {
        degree: 2,
        op,
        condition: `x <${eq} ${r1}, ${r2} <${eq} x`,
        explanation: `Khoảng nghiệm: (-∞, ${r1}] ∪ [${r2}, +∞) hoặc (-∞, ${r1}) ∪ (${r2}, +∞)`,
      };
    } else {
      const eq = op.includes('=') ? '=' : '';
      return {
        degree: 2,
        op,
        condition: `${r1} <${eq} x <${eq} ${r2}`,
        explanation: `Khoảng nghiệm: [${r1}, ${r2}] hoặc (${r1}, ${r2})`,
      };
    }
  } else if (roots.length === 1) {
    const r = roots[0].real;
    return {
      degree: 2,
      op,
      condition: op.includes('=') ? `Mọi x ∈ ℝ hoặc x = ${r}` : `x ≠ ${r}`,
      explanation: `Nghiệm kép tại x = ${r}`,
    };
  } else {
    // Delta < 0 (always same sign as a)
    const alwaysTrue = (a > 0 && op.startsWith('>')) || (a < 0 && op.startsWith('<'));
    return {
      degree: 2,
      op,
      condition: alwaysTrue ? 'Mọi x ∈ ℝ (Vô số nghiệm)' : 'Vô nghiệm (No Solution)',
      explanation: alwaysTrue ? 'Tam thức luôn cùng dấu với a' : 'Không có giá trị x thoả mãn',
    };
  }
}

/**
 * Solve Ratio: A:B = X:D or A:B = C:X
 */
export function solveRatio(
  type: 'A:B=X:D' | 'A:B=C:X',
  a: number,
  b: number,
  otherVal: number
): RatioResult {
  if (b === 0) return { type, xValue: 'Math ERROR' };
  if (type === 'A:B=X:D') {
    // X = (A * D) / B
    const x = (a * otherVal) / b;
    return { type, xValue: Number(x.toPrecision(8)) };
  } else {
    // A:B = C:X => X = (B * C) / A
    if (a === 0) return { type, xValue: 'Math ERROR' };
    const x = (b * otherVal) / a;
    return { type, xValue: Number(x.toPrecision(8)) };
  }
}

/**
 * Statistical analysis for 1-variable data
 */
export function analyzeStatistics(items: StatItem[]) {
  let totalN = 0;
  let sumX = 0;
  let sumX2 = 0;
  const rawList: number[] = [];

  for (const it of items) {
    const freq = Math.max(1, it.freq || 1);
    totalN += freq;
    sumX += it.x * freq;
    sumX2 += it.x * it.x * freq;
    for (let i = 0; i < freq; i++) {
      rawList.push(it.x);
    }
  }

  if (totalN === 0) return null;

  rawList.sort((a, b) => a - b);
  const mean = sumX / totalN;
  const popVariance = sumX2 / totalN - mean * mean;
  const popStdDev = Math.sqrt(Math.max(0, popVariance));
  const sampleStdDev = totalN > 1 ? Math.sqrt(Math.max(0, (totalN / (totalN - 1)) * popVariance)) : 0;

  const min = rawList[0];
  const max = rawList[rawList.length - 1];

  const getPercentile = (p: number) => {
    const idx = (rawList.length - 1) * p;
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    const weight = idx - lower;
    return rawList[lower] * (1 - weight) + rawList[upper] * weight;
  };

  const q1 = getPercentile(0.25);
  const med = getPercentile(0.5);
  const q3 = getPercentile(0.75);

  return {
    n: totalN,
    mean: Number(mean.toPrecision(8)),
    sumX: Number(sumX.toPrecision(8)),
    sumX2: Number(sumX2.toPrecision(8)),
    popStdDev: Number(popStdDev.toPrecision(8)),
    sampleStdDev: Number(sampleStdDev.toPrecision(8)),
    min: Number(min.toPrecision(8)),
    q1: Number(q1.toPrecision(8)),
    med: Number(med.toPrecision(8)),
    q3: Number(q3.toPrecision(8)),
    max: Number(max.toPrecision(8)),
  };
}
