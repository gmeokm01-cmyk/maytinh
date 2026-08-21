import * as math from 'mathjs';

export function vectorDot(a: number[], b: number[]): number {
  return Number(math.dot(a, b));
}

export function vectorCross(a: number[], b: number[]): number[] {
  if (a.length !== 3 || b.length !== 3) {
    throw new Error('Cross product requires 3D vectors');
  }
  const res = math.cross(a, b) as math.Matrix | number[];
  return Array.isArray(res) ? (res as number[]) : (res.toArray() as number[]);
}

export function vectorNorm(a: number[]): number {
  return Number(math.norm(a));
}

export function vectorAngle(a: number[], b: number[], unit: 'DEG' | 'RAD' = 'DEG'): number {
  const dot = vectorDot(a, b);
  const normA = vectorNorm(a);
  const normB = vectorNorm(b);
  if (normA === 0 || normB === 0) return 0;
  const cosTheta = Math.max(-1, Math.min(1, dot / (normA * normB)));
  const rad = Math.acos(cosTheta);
  return unit === 'DEG' ? (rad * 180) / Math.PI : rad;
}

export function formatVector(v: number[]): string {
  return `[${v.map(n => Number(n.toPrecision(6))).join(', ')}]`;
}
