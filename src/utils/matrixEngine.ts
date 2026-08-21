import * as math from 'mathjs';

export function matrixDet(m: number[][]): number {
  return Number(math.det(m));
}

export function matrixInv(m: number[][]): number[][] {
  const inv = math.inv(m) as math.Matrix | number[][];
  return Array.isArray(inv) ? (inv as number[][]) : (inv.toArray() as number[][]);
}

export function matrixTranspose(m: number[][]): number[][] {
  const trans = math.transpose(m) as math.Matrix | number[][];
  return Array.isArray(trans) ? (trans as number[][]) : (trans.toArray() as number[][]);
}

export function matrixAdd(a: number[][], b: number[][]): number[][] {
  const res = math.add(a, b) as math.Matrix | number[][];
  return Array.isArray(res) ? (res as number[][]) : (res.toArray() as number[][]);
}

export function matrixSub(a: number[][], b: number[][]): number[][] {
  const res = math.subtract(a, b) as math.Matrix | number[][];
  return Array.isArray(res) ? (res as number[][]) : (res.toArray() as number[][]);
}

export function matrixMultiply(a: number[][], b: number[][]): number[][] {
  const res = math.multiply(a, b) as math.Matrix | number[][];
  return Array.isArray(res) ? (res as number[][]) : (res.toArray() as number[][]);
}

export function formatMatrix(m: number[][]): string {
  return m.map(row => '[' + row.map(v => Number(v.toPrecision(6))).join(', ') + ']').join('\n');
}
