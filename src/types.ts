export type CalcMode =
  | 'calculate'     // Mode 1: Math standard
  | 'complex'       // Mode 2: Số phức
  | 'base_n'        // Mode 3: Hệ cơ số (Dec, Hex, Bin, Oct)
  | 'matrix'        // Mode 4: Ma trận
  | 'vector'        // Mode 5: Vectơ
  | 'statistics'    // Mode 6: Thống kê
  | 'distribution'  // Mode 7: Phân phối xác suất
  | 'table'         // Mode 8: Bảng giá trị f(x)
  | 'equation'      // Mode 9: Hệ PT & PT bậc 2, 3, 4
  | 'inequality'    // Mode A: Bất phương trình
  | 'ratio';        // Mode B: Tỉ lệ thức

export type AngleUnit = 'DEG' | 'RAD' | 'GRA';
export type NumberFormat = 'NORM1' | 'NORM2' | 'FIX' | 'SCI';
export type FractionFormat = 'd/c' | 'ab/c';
export type BaseType = 'DEC' | 'HEX' | 'BIN' | 'OCT';

export interface HistoryItem {
  id: string;
  timestamp: number;
  timestampFormatted: string;
  mode: CalcMode;
  modeLabel: string;
  expression: string;
  displayExpression: string;
  result: string;
  decimalResult?: string;
  exactResult?: string;
  note?: string;
  variablesSnapshot?: Record<string, string>;
  category?: 'Standard' | 'Equation' | 'Matrix' | 'Vector' | 'Table' | 'Complex' | 'Base-N';
}

export interface MemoryVariables {
  A: number | string;
  B: number | string;
  C: number | string;
  D: number | string;
  E: number | string;
  F: number | string;
  x: number | string;
  y: number | string;
  M: number;
  Ans: number | string;
  PreAns: number | string;
}

export interface MatrixStorage {
  MatA?: number[][];
  MatB?: number[][];
  MatC?: number[][];
  MatD?: number[][];
  MatAns?: number[][];
}

export interface VectorStorage {
  VctA?: number[];
  VctB?: number[];
  VctC?: number[];
  VctD?: number[];
  VctAns?: number[];
}

export interface StatItem {
  x: number;
  y?: number;
  freq: number;
}

export interface TableConfig {
  f_expr: string;
  g_expr: string;
  start: number;
  end: number;
  step: number;
  rows: Array<{ x: number; fx: number | string; gx?: number | string }>;
}

export interface EquationResult {
  type: 'linear_system' | 'polynomial';
  degree?: number;
  variablesCount?: number;
  roots: Array<{ name: string; real: number; imag?: number; isComplex?: boolean }>;
  extrema?: {
    type: 'min' | 'max';
    x: number;
    y: number;
  };
  hasInfiniteSolutions?: boolean;
  hasNoSolution?: boolean;
}

export interface InequalityResult {
  degree: number;
  op: '>' | '<' | '>=' | '<=';
  condition: string;
  explanation: string;
}

export interface RatioResult {
  type: 'A:B=X:D' | 'A:B=C:X';
  xValue: number | string;
}

export interface CalculatorSettings {
  angleUnit: AngleUnit;
  numberFormat: NumberFormat;
  fixDecimals: number;
  sciDigits: number;
  fractionFormat: FractionFormat;
  soundEnabled: boolean;
  autoSaveHistory: boolean;
  contrast: number; // 0 to 10
}
