import React, { useState } from 'react';
import { 
  CalcMode, 
  EquationResult, 
  InequalityResult, 
  RatioResult, 
  StatItem, 
  HistoryItem 
} from '../types';
import { 
  solveLinearSystem, 
  solveQuadratic, 
  solveCubic, 
  solveQuartic, 
  solveQuadraticInequality, 
  solveRatio, 
  analyzeStatistics 
} from '../utils/equationSolver';
import { 
  matrixDet, 
  matrixInv, 
  matrixTranspose, 
  matrixAdd, 
  matrixMultiply 
} from '../utils/matrixEngine';
import { 
  vectorDot, 
  vectorCross, 
  vectorNorm, 
  vectorAngle 
} from '../utils/vectorEngine';
import { 
  Check, 
  Play, 
  Grid, 
  Plus, 
  Trash2, 
  Save 
} from 'lucide-react';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface SpecializedModeViewsProps {
  mode: CalcMode;
  onClose: () => void;
  onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'timestampFormatted'>) => void;
}

export const SpecializedModeViews: React.FC<SpecializedModeViewsProps> = ({
  mode,
  onClose,
  onSaveToHistory,
}) => {
  // Equation Mode state
  const [eqType, setEqType] = useState<'simul' | 'poly'>('poly');
  const [polyDegree, setPolyDegree] = useState<2 | 3 | 4>(2);
  const [simulUnknowns, setSimulUnknowns] = useState<2 | 3 | 4>(2);
  const [polyCoeffs, setPolyCoeffs] = useState<number[]>([1, -5, 6, 0, 0]);
  const [simulMatrix, setSimulMatrix] = useState<number[][]>([
    [2, 1, 8],
    [1, -1, 1],
  ]);
  const [equationResult, setEquationResult] = useState<EquationResult | null>(null);

  // Inequality state
  const [ineqDegree, setIneqDegree] = useState<2 | 3 | 4>(2);
  const [ineqOp, setIneqOp] = useState<'>' | '<' | '>=' | '<='>('>');
  const [ineqCoeffs, setIneqCoeffs] = useState<number[]>([1, -4, 3]);
  const [ineqResult, setIneqResult] = useState<InequalityResult | null>(null);

  // Ratio state
  const [ratioType, setRatioType] = useState<'A:B=X:D' | 'A:B=C:X'>('A:B=X:D');
  const [ratioA, setRatioA] = useState<number>(2);
  const [ratioB, setRatioB] = useState<number>(3);
  const [ratioOther, setRatioOther] = useState<number>(9);
  const [ratioResult, setRatioResult] = useState<RatioResult | null>(null);

  // Matrix state
  const [matrixDim, setMatrixDim] = useState<{ rows: number; cols: number }>({ rows: 2, cols: 2 });
  const [matA, setMatA] = useState<number[][]>([
    [1, 2],
    [3, 4],
  ]);
  const [matB, setMatB] = useState<number[][]>([
    [5, 6],
    [7, 8],
  ]);
  const [matrixResultText, setMatrixResultText] = useState<string | null>(null);

  // Vector state
  const [vctA, setVctA] = useState<number[]>([1, 2, 3]);
  const [vctB, setVctB] = useState<number[]>([4, 5, 6]);
  const [vectorResultText, setVectorResultText] = useState<string | null>(null);

  // Statistics state
  const [statRows, setStatRows] = useState<StatItem[]>([
    { x: 5, freq: 2 },
    { x: 7, freq: 3 },
    { x: 9, freq: 1 },
    { x: 10, freq: 4 },
  ]);
  const [statAnalysis, setStatAnalysis] = useState<ReturnType<typeof analyzeStatistics> | null>(null);

  // Table state
  const [tableFunc, setTableFunc] = useState<string>('2*x^2 - 3*x + 1');
  const [tableStart, setTableStart] = useState<number>(-2);
  const [tableEnd, setTableEnd] = useState<number>(2);
  const [tableStep, setTableStep] = useState<number>(0.5);
  const [tableResultRows, setTableResultRows] = useState<Array<{ x: number; fx: number }>>([]);

  // Base-N state
  const [baseVal, setBaseVal] = useState<string>('255');
  const [activeBaseType, setActiveBaseType] = useState<'DEC' | 'HEX' | 'BIN' | 'OCT'>('DEC');

  // Complex state
  const [compReal, setCompReal] = useState<number>(3);
  const [compImag, setCompImag] = useState<number>(4);
  const [compResultText, setCompResultText] = useState<string | null>(null);

  // --- Handlers ---

  const handleSolveEquation = () => {
    sound.playKeyClick('equals');
    if (eqType === 'poly') {
      if (polyDegree === 2) {
        const res = solveQuadratic(polyCoeffs[0], polyCoeffs[1], polyCoeffs[2]);
        setEquationResult(res);
        onSaveToHistory({
          mode: 'equation',
          modeLabel: 'Mode 9: PT bậc 2',
          expression: `${polyCoeffs[0]}x² + (${polyCoeffs[1]})x + (${polyCoeffs[2]}) = 0`,
          displayExpression: `${polyCoeffs[0]}x² + (${polyCoeffs[1]})x + (${polyCoeffs[2]}) = 0`,
          result: res.roots.map(r => `${r.name}=${r.real}${r.imag ? (r.imag >= 0 ? `+${r.imag}i` : `${r.imag}i`) : ''}`).join(', '),
          category: 'Equation',
        });
      } else if (polyDegree === 3) {
        const res = solveCubic(polyCoeffs[0], polyCoeffs[1], polyCoeffs[2], polyCoeffs[3]);
        setEquationResult(res);
        onSaveToHistory({
          mode: 'equation',
          modeLabel: 'Mode 9: PT bậc 3',
          expression: `${polyCoeffs[0]}x³ + (${polyCoeffs[1]})x² + (${polyCoeffs[2]})x + (${polyCoeffs[3]}) = 0`,
          displayExpression: `${polyCoeffs[0]}x³ + (${polyCoeffs[1]})x² + (${polyCoeffs[2]})x + (${polyCoeffs[3]}) = 0`,
          result: res.roots.map(r => `${r.name}=${r.real}${r.imag ? `+${r.imag}i` : ''}`).join(', '),
          category: 'Equation',
        });
      } else {
        const res = solveQuartic(polyCoeffs[0], polyCoeffs[1], polyCoeffs[2], polyCoeffs[3], polyCoeffs[4]);
        setEquationResult(res);
        onSaveToHistory({
          mode: 'equation',
          modeLabel: 'Mode 9: PT bậc 4',
          expression: `${polyCoeffs[0]}x⁴ + ${polyCoeffs[1]}x³ + ${polyCoeffs[2]}x² + ${polyCoeffs[3]}x + ${polyCoeffs[4]} = 0`,
          displayExpression: `${polyCoeffs[0]}x⁴ + ${polyCoeffs[1]}x³ + ${polyCoeffs[2]}x² + ${polyCoeffs[3]}x + ${polyCoeffs[4]} = 0`,
          result: res.roots.map(r => `${r.name}=${r.real}${r.imag ? `+${r.imag}i` : ''}`).join(', '),
          category: 'Equation',
        });
      }
    } else {
      // Linear system
      const n = simulUnknowns;
      const coeffs = simulMatrix.slice(0, n).map(r => r.slice(0, n));
      const constants = simulMatrix.slice(0, n).map(r => r[n]);
      const res = solveLinearSystem(coeffs, constants);
      setEquationResult(res);
      onSaveToHistory({
        mode: 'equation',
        modeLabel: `Mode 9: Hệ ${n} ẩn`,
        expression: `Hệ ${n} phương trình tuyến tính`,
        displayExpression: `Hệ ${n} phương trình tuyến tính`,
        result: res.roots.map(r => `${r.name}=${r.real}`).join(', '),
        category: 'Equation',
      });
    }
  };

  const handleSolveInequality = () => {
    sound.playKeyClick('equals');
    const res = solveQuadraticInequality(ineqCoeffs[0], ineqCoeffs[1], ineqCoeffs[2], ineqOp);
    setIneqResult(res);
    onSaveToHistory({
      mode: 'inequality',
      modeLabel: 'Mode A: Bất phương trình',
      expression: `${ineqCoeffs[0]}x² + (${ineqCoeffs[1]})x + (${ineqCoeffs[2]}) ${ineqOp} 0`,
      displayExpression: `${ineqCoeffs[0]}x² + (${ineqCoeffs[1]})x + (${ineqCoeffs[2]}) ${ineqOp} 0`,
      result: res.condition,
      note: res.explanation,
      category: 'Equation',
    });
  };

  const handleSolveRatio = () => {
    sound.playKeyClick('equals');
    const res = solveRatio(ratioType, ratioA, ratioB, ratioOther);
    setRatioResult(res);
    onSaveToHistory({
      mode: 'ratio',
      modeLabel: 'Mode B: Tỉ lệ thức',
      expression: ratioType === 'A:B=X:D' ? `${ratioA}:${ratioB} = X:${ratioOther}` : `${ratioA}:${ratioB} = ${ratioOther}:X`,
      displayExpression: ratioType === 'A:B=X:D' ? `${ratioA}:${ratioB} = X:${ratioOther}` : `${ratioA}:${ratioB} = ${ratioOther}:X`,
      result: `X = ${res.xValue}`,
      category: 'Standard',
    });
  };

  const handleMatrixOperation = (op: 'det' | 'inv' | 'transpose' | 'add' | 'multiply') => {
    sound.playKeyClick('equals');
    try {
      if (op === 'det') {
        const d = matrixDet(matA);
        setMatrixResultText(`det(MatA) = ${d}`);
        onSaveToHistory({
          mode: 'matrix',
          modeLabel: 'Mode 4: Định thức ma trận',
          expression: `det(MatA [${matA.length}x${matA[0].length}])`,
          displayExpression: `det(MatA)`,
          result: String(d),
          category: 'Matrix',
        });
      } else if (op === 'inv') {
        const inv = matrixInv(matA);
        const txt = inv.map(r => '[' + r.map(n => Number(n.toFixed(4))).join(', ') + ']').join('\n');
        setMatrixResultText(`MatA⁻¹ =\n${txt}`);
        onSaveToHistory({
          mode: 'matrix',
          modeLabel: 'Mode 4: Ma trận nghịch đảo',
          expression: `inv(MatA)`,
          displayExpression: `MatA⁻¹`,
          result: txt,
          category: 'Matrix',
        });
      } else if (op === 'transpose') {
        const tr = matrixTranspose(matA);
        const txt = tr.map(r => '[' + r.join(', ') + ']').join('\n');
        setMatrixResultText(`MatAᵀ =\n${txt}`);
        onSaveToHistory({
          mode: 'matrix',
          modeLabel: 'Mode 4: Chuyển vị ma trận',
          expression: `transpose(MatA)`,
          displayExpression: `MatAᵀ`,
          result: txt,
          category: 'Matrix',
        });
      } else if (op === 'add') {
        const sum = matrixAdd(matA, matB);
        const txt = sum.map(r => '[' + r.join(', ') + ']').join('\n');
        setMatrixResultText(`MatA + MatB =\n${txt}`);
        onSaveToHistory({
          mode: 'matrix',
          modeLabel: 'Mode 4: Cộng ma trận',
          expression: `MatA + MatB`,
          displayExpression: `MatA + MatB`,
          result: txt,
          category: 'Matrix',
        });
      } else if (op === 'multiply') {
        const prod = matrixMultiply(matA, matB);
        const txt = prod.map(r => '[' + r.join(', ') + ']').join('\n');
        setMatrixResultText(`MatA × MatB =\n${txt}`);
        onSaveToHistory({
          mode: 'matrix',
          modeLabel: 'Mode 4: Nhân ma trận',
          expression: `MatA × MatB`,
          displayExpression: `MatA × MatB`,
          result: txt,
          category: 'Matrix',
        });
      }
    } catch (e: unknown) {
      setMatrixResultText('Lỗi: Không thể thực hiện phép toán ma trận này (' + (e instanceof Error ? e.message : 'Error') + ')');
    }
  };

  const handleVectorOperation = (op: 'dot' | 'cross' | 'norm' | 'angle') => {
    sound.playKeyClick('equals');
    try {
      if (op === 'dot') {
        const d = vectorDot(vctA, vctB);
        setVectorResultText(`VctA • VctB = ${d}`);
        onSaveToHistory({
          mode: 'vector',
          modeLabel: 'Mode 5: Tích vô hướng',
          expression: `[${vctA}] • [${vctB}]`,
          displayExpression: `VctA • VctB`,
          result: String(d),
          category: 'Vector',
        });
      } else if (op === 'cross') {
        const cr = vectorCross(vctA, vctB);
        setVectorResultText(`VctA × VctB = [${cr.join(', ')}]`);
        onSaveToHistory({
          mode: 'vector',
          modeLabel: 'Mode 5: Tích có hướng',
          expression: `[${vctA}] × [${vctB}]`,
          displayExpression: `VctA × VctB`,
          result: `[${cr.join(', ')}]`,
          category: 'Vector',
        });
      } else if (op === 'norm') {
        const n = vectorNorm(vctA);
        setVectorResultText(`|VctA| = ${n}`);
        onSaveToHistory({
          mode: 'vector',
          modeLabel: 'Mode 5: Độ lớn vectơ',
          expression: `|VctA| = |[${vctA}]|`,
          displayExpression: `|VctA|`,
          result: String(n),
          category: 'Vector',
        });
      } else if (op === 'angle') {
        const ang = vectorAngle(vctA, vctB, 'DEG');
        setVectorResultText(`Góc ∠(VctA, VctB) = ${ang.toFixed(4)}°`);
        onSaveToHistory({
          mode: 'vector',
          modeLabel: 'Mode 5: Góc giữa 2 vectơ',
          expression: `∠([${vctA}], [${vctB}])`,
          displayExpression: `∠(VctA, VctB)`,
          result: `${ang.toFixed(4)}°`,
          category: 'Vector',
        });
      }
    } catch (e: unknown) {
      setVectorResultText('Lỗi: ' + (e instanceof Error ? e.message : 'Error'));
    }
  };

  const handleAnalyzeStats = () => {
    sound.playKeyClick('equals');
    const res = analyzeStatistics(statRows);
    setStatAnalysis(res);
    if (res) {
      onSaveToHistory({
        mode: 'statistics',
        modeLabel: 'Mode 6: Thống kê',
        expression: `Phân tích ${res.n} mẫu dữ liệu`,
        displayExpression: `Thống kê 1-Biến`,
        result: `x̄=${res.mean}, s=${res.sampleStdDev}, Med=${res.med}`,
        category: 'Standard',
      });
    }
  };

  const handleGenerateTable = () => {
    sound.playKeyClick('equals');
    try {
      const rows: Array<{ x: number; fx: number }> = [];
      const step = tableStep <= 0 ? 1 : tableStep;
      for (let x = tableStart; x <= tableEnd + 1e-7; x += step) {
        const roundedX = Number(x.toFixed(4));
        const substituted = tableFunc.replace(/x/g, `(${roundedX})`).replace(/\^/g, '**');
        // eslint-disable-next-line no-eval
        const val = Function(`"use strict"; return (${substituted})`)();
        rows.push({ x: roundedX, fx: Number(Number(val).toFixed(6)) });
      }
      setTableResultRows(rows);
      onSaveToHistory({
        mode: 'table',
        modeLabel: 'Mode 8: Bảng giá trị f(x)',
        expression: `f(x) = ${tableFunc} [${tableStart}, ${tableEnd}, step ${tableStep}]`,
        displayExpression: `f(x) = ${tableFunc}`,
        result: `${rows.length} giá trị sinh thành công`,
        category: 'Table',
      });
    } catch {
      alert('Biểu thức hàm f(x) không hợp lệ');
    }
  };

  const handleComplexAnalysis = () => {
    sound.playKeyClick('equals');
    const mod = Math.sqrt(compReal * compReal + compImag * compImag);
    const argRad = Math.atan2(compImag, compReal);
    const argDeg = (argRad * 180) / Math.PI;
    const conj = `${compReal} ${compImag >= 0 ? '-' : '+'} ${Math.abs(compImag)}i`;
    const polar = `${mod.toFixed(4)} ∠ ${argDeg.toFixed(2)}°`;

    const txt = `Môđun |z| = ${mod.toFixed(4)}\nArg(z) = ${argDeg.toFixed(2)}° (${argRad.toFixed(4)} rad)\nSố phức liên hợp z̄ = ${conj}\nDạng cực = ${polar}`;
    setCompResultText(txt);
    onSaveToHistory({
      mode: 'complex',
      modeLabel: 'Mode 2: Số phức',
      expression: `z = ${compReal} + ${compImag}i`,
      displayExpression: `z = ${compReal} + ${compImag}i`,
      result: `|z|=${mod.toFixed(4)}, Arg=${argDeg.toFixed(2)}°`,
      category: 'Complex',
    });
  };

  return (
    <div className="w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-5 text-white shadow-xl space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center space-x-2">
          <Grid className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-base text-neutral-100">
            {mode === 'equation' && 'BẢNG GIẢI PHƯƠNG TRÌNH & HỆ PHƯƠNG TRÌNH (MODE 9)'}
            {mode === 'inequality' && 'BẢNG GIẢI BẤT PHƯƠNG TRÌNH (MODE A)'}
            {mode === 'ratio' && 'TỈ LỆ THỨC RATIO (MODE B)'}
            {mode === 'matrix' && 'TÍNH TOÁN MA TRẬN (MODE 4)'}
            {mode === 'vector' && 'TÍNH TOÁN VECTƠ (MODE 5)'}
            {mode === 'statistics' && 'BẢNG DỮ LIỆU THỐNG KÊ (MODE 6)'}
            {mode === 'table' && 'BẢNG GIÁ TRỊ HÀM SỐ f(x) (MODE 8)'}
            {mode === 'base_n' && 'CHUYỂN ĐỔI HỆ ĐẾM BASE-N (MODE 3)'}
            {mode === 'complex' && 'TÍNH TOÁN SỐ PHỨC (MODE 2)'}
            {mode === 'distribution' && 'PHÂN PHỐI XÁC SUẤT (MODE 7)'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-xs font-bold text-neutral-300"
        >
          Quay lại bàn phím
        </button>
      </div>

      {/* --- MODE 9: EQUATION --- */}
      {mode === 'equation' && (
        <div className="space-y-4 text-sm">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setEqType('poly');
                setEquationResult(null);
              }}
              className={`px-4 py-2 rounded-lg font-bold text-xs ${
                eqType === 'poly' ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              1: Phương trình đa thức (Bậc 2, 3, 4)
            </button>
            <button
              type="button"
              onClick={() => {
                setEqType('simul');
                setEquationResult(null);
              }}
              className={`px-4 py-2 rounded-lg font-bold text-xs ${
                eqType === 'simul' ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              2: Hệ phương trình tuyến tính (2, 3, 4 ẩn)
            </button>
          </div>

          {eqType === 'poly' ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-neutral-400 font-bold">Chọn bậc phương trình:</span>
                {[2, 3, 4].map(deg => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => {
                      setPolyDegree(deg as 2 | 3 | 4);
                      setEquationResult(null);
                    }}
                    className={`px-3 py-1 rounded text-xs font-bold ${
                      polyDegree === deg ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    Bậc {deg}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <p className="text-xs text-amber-400 font-mono">
                  {polyDegree === 2 && 'ax² + bx + c = 0'}
                  {polyDegree === 3 && 'ax³ + bx² + cx + d = 0'}
                  {polyDegree === 4 && 'ax⁴ + bx³ + cx² + dx + e = 0'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {['a', 'b', 'c', 'd', 'e'].slice(0, polyDegree + 1).map((lbl, idx) => (
                    <div key={lbl}>
                      <label className="text-[11px] text-neutral-400 block font-mono">{lbl} =</label>
                      <input
                        type="number"
                        value={polyCoeffs[idx]}
                        onChange={e => {
                          const next = [...polyCoeffs];
                          next[idx] = parseFloat(e.target.value) || 0;
                          setPolyCoeffs(next);
                        }}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm font-mono text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-neutral-400 font-bold">Số lượng ẩn:</span>
                {[2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setSimulUnknowns(n as 2 | 3 | 4);
                      setEquationResult(null);
                      // Expand matrix
                      const next = Array(n)
                        .fill(0)
                        .map((_, r) =>
                          Array(n + 1)
                            .fill(0)
                            .map((__, c) => (simulMatrix[r] ? simulMatrix[r][c] || (c === n ? 1 : 1) : 1))
                        );
                      setSimulMatrix(next);
                    }}
                    className={`px-3 py-1 rounded text-xs font-bold ${
                      simulUnknowns === n ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {n} Ẩn
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 overflow-x-auto">
                <div className="space-y-2 min-w-[320px]">
                  {Array(simulUnknowns)
                    .fill(0)
                    .map((_, r) => (
                      <div key={r} className="flex items-center space-x-2 text-xs font-mono">
                        {Array(simulUnknowns)
                          .fill(0)
                          .map((__, c) => {
                            const varName = ['x', 'y', 'z', 't'][c];
                            return (
                              <div key={c} className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  value={simulMatrix[r]?.[c] ?? 1}
                                  onChange={e => {
                                    const next = [...simulMatrix];
                                    if (!next[r]) next[r] = [];
                                    next[r][c] = parseFloat(e.target.value) || 0;
                                    setSimulMatrix(next);
                                  }}
                                  className="w-14 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-1 text-center text-white"
                                />
                                <span className="text-neutral-400">{varName}</span>
                                {c < simulUnknowns - 1 && <span className="text-neutral-500">+</span>}
                              </div>
                            );
                          })}
                        <span className="text-amber-400 font-bold">=</span>
                        <input
                          type="number"
                          value={simulMatrix[r]?.[simulUnknowns] ?? 0}
                          onChange={e => {
                            const next = [...simulMatrix];
                            if (!next[r]) next[r] = [];
                            next[r][simulUnknowns] = parseFloat(e.target.value) || 0;
                            setSimulMatrix(next);
                          }}
                          className="w-16 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-1 text-center text-amber-300 font-bold"
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Action button */}
          <button
            type="button"
            onClick={handleSolveEquation}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition"
          >
            <Play className="w-4 h-4" />
            <span>GIẢI PHƯƠNG TRÌNH (=)</span>
          </button>

          {/* Result view */}
          {equationResult && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-800 text-emerald-300 space-y-2 font-mono">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
                <span className="text-xs font-bold text-neutral-400">KẾT QUẢ NGHIỆM:</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Thành công
                </span>
              </div>

              {equationResult.hasNoSolution && <p className="text-rose-400 font-bold">Vô nghiệm (No Solution)</p>}
              {equationResult.hasInfiniteSolutions && (
                <p className="text-cyan-400 font-bold">Vô số nghiệm (Infinite Solutions)</p>
              )}

              {equationResult.roots.map((root, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="font-bold text-amber-400">{root.name} =</span>
                  <span className="font-black text-white text-base">
                    {root.real}
                    {root.isComplex && root.imag !== undefined && (
                      <span className="text-cyan-400">
                        {' '}
                        {root.imag >= 0 ? `+ ${root.imag}i` : `- ${Math.abs(root.imag)}i`}
                      </span>
                    )}
                  </span>
                </div>
              ))}

              {equationResult.extrema && (
                <div className="pt-2 border-t border-neutral-800 text-xs text-neutral-300">
                  <span className="text-amber-400 font-bold">
                    Toạ độ đỉnh Parabol ({equationResult.extrema.type === 'min' ? 'Cực tiểu / Min' : 'Cực đại / Max'}):
                  </span>
                  <p className="mt-0.5">
                    x = {equationResult.extrema.x}, y = {equationResult.extrema.y}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- MODE A: INEQUALITY --- */}
      {mode === 'inequality' && (
        <div className="space-y-4 text-sm">
          <p className="text-xs text-neutral-400">Giải bất phương trình đa thức bậc 2 dạng ax² + bx + c (op) 0</p>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-[11px] text-neutral-400 block font-mono">a =</label>
              <input
                type="number"
                value={ineqCoeffs[0]}
                onChange={e => setIneqCoeffs([parseFloat(e.target.value) || 0, ineqCoeffs[1], ineqCoeffs[2]])}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-center font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-400 block font-mono">b =</label>
              <input
                type="number"
                value={ineqCoeffs[1]}
                onChange={e => setIneqCoeffs([ineqCoeffs[0], parseFloat(e.target.value) || 0, ineqCoeffs[2]])}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-center font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-400 block font-mono">c =</label>
              <input
                type="number"
                value={ineqCoeffs[2]}
                onChange={e => setIneqCoeffs([ineqCoeffs[0], ineqCoeffs[1], parseFloat(e.target.value) || 0])}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-center font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-400 block font-mono">Dấu =</label>
              <select
                value={ineqOp}
                onChange={e => setIneqOp(e.target.value as '>' | '<' | '>=' | '<=')}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-center font-bold text-amber-400"
              >
                <option value=">">&gt; 0</option>
                <option value="<">&lt; 0</option>
                <option value=">=">&gt;= 0</option>
                <option value="<=">&lt;= 0</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSolveInequality}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition"
          >
            GIẢI BẤT PHƯƠNG TRÌNH (=)
          </button>

          {ineqResult && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-800 text-emerald-300 font-mono space-y-1">
              <span className="text-xs text-neutral-400">TẬP NGHIỆM:</span>
              <p className="text-base font-black text-white">{ineqResult.condition}</p>
              <p className="text-xs text-cyan-400 italic">{ineqResult.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* --- MODE B: RATIO --- */}
      {mode === 'ratio' && (
        <div className="space-y-4 text-sm">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setRatioType('A:B=X:D');
                setRatioResult(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                ratioType === 'A:B=X:D' ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              1: A : B = X : D
            </button>
            <button
              type="button"
              onClick={() => {
                setRatioType('A:B=C:X');
                setRatioResult(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                ratioType === 'A:B=C:X' ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              2: A : B = C : X
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] text-neutral-400 block font-mono">A =</label>
              <input
                type="number"
                value={ratioA}
                onChange={e => setRatioA(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-center font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-400 block font-mono">B =</label>
              <input
                type="number"
                value={ratioB}
                onChange={e => setRatioB(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-center font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-400 block font-mono">
                {ratioType === 'A:B=X:D' ? 'D =' : 'C ='}
              </label>
              <input
                type="number"
                value={ratioOther}
                onChange={e => setRatioOther(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-center font-mono"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSolveRatio}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition"
          >
            TÌM GIÁ TRỊ X (=)
          </button>

          {ratioResult && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-800 text-emerald-300 font-mono">
              <span className="text-xs text-neutral-400">KẾT QUẢ:</span>
              <p className="text-lg font-black text-amber-400">X = {ratioResult.xValue}</p>
            </div>
          )}
        </div>
      )}

      {/* --- MODE 4: MATRIX --- */}
      {mode === 'matrix' && (
        <div className="space-y-4 text-sm">
          <p className="text-xs text-neutral-400">Nhập ma trận MatA và MatB để tính định thức, nghịch đảo, nhân ma trận</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* MatA */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 font-mono">Ma trận MatA [2x2]</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[0, 1].map(r =>
                  [0, 1].map(c => (
                    <input
                      key={`${r}-${c}`}
                      type="number"
                      value={matA[r]?.[c] ?? 0}
                      onChange={e => {
                        const next = [...matA];
                        next[r][c] = parseFloat(e.target.value) || 0;
                        setMatA(next);
                      }}
                      className="bg-neutral-900 border border-neutral-700 rounded p-1.5 text-center font-mono text-white"
                    />
                  ))
                )}
              </div>
            </div>

            {/* MatB */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-xs font-bold text-cyan-400 font-mono">Ma trận MatB [2x2]</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[0, 1].map(r =>
                  [0, 1].map(c => (
                    <input
                      key={`${r}-${c}`}
                      type="number"
                      value={matB[r]?.[c] ?? 0}
                      onChange={e => {
                        const next = [...matB];
                        next[r][c] = parseFloat(e.target.value) || 0;
                        setMatB(next);
                      }}
                      className="bg-neutral-900 border border-neutral-700 rounded p-1.5 text-center font-mono text-white"
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              type="button"
              onClick={() => handleMatrixOperation('det')}
              className="py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-bold text-amber-400 border border-neutral-700"
            >
              det(MatA)
            </button>
            <button
              type="button"
              onClick={() => handleMatrixOperation('inv')}
              className="py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-bold text-amber-400 border border-neutral-700"
            >
              MatA⁻¹
            </button>
            <button
              type="button"
              onClick={() => handleMatrixOperation('transpose')}
              className="py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-bold text-amber-400 border border-neutral-700"
            >
              MatAᵀ
            </button>
            <button
              type="button"
              onClick={() => handleMatrixOperation('add')}
              className="py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-bold text-emerald-400 border border-neutral-700"
            >
              MatA + MatB
            </button>
            <button
              type="button"
              onClick={() => handleMatrixOperation('multiply')}
              className="py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-bold text-cyan-400 border border-neutral-700"
            >
              MatA × MatB
            </button>
          </div>

          {matrixResultText && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-800 text-emerald-300 font-mono whitespace-pre-wrap">
              {matrixResultText}
            </div>
          )}
        </div>
      )}

      {/* --- MODE 5: VECTOR --- */}
      {mode === 'vector' && (
        <div className="space-y-4 text-sm">
          <p className="text-xs text-neutral-400">Tích vô hướng, tích có hướng, góc và độ dài vectơ không gian 3D</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 font-mono">VctA (x, y, z)</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[0, 1, 2].map(idx => (
                  <input
                    key={idx}
                    type="number"
                    value={vctA[idx]}
                    onChange={e => {
                      const next = [...vctA];
                      next[idx] = parseFloat(e.target.value) || 0;
                      setVctA(next);
                    }}
                    className="bg-neutral-900 border border-neutral-700 rounded p-1.5 text-center font-mono text-white"
                  />
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-xs font-bold text-cyan-400 font-mono">VctB (x, y, z)</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[0, 1, 2].map(idx => (
                  <input
                    key={idx}
                    type="number"
                    value={vctB[idx]}
                    onChange={e => {
                      const next = [...vctB];
                      next[idx] = parseFloat(e.target.value) || 0;
                      setVctB(next);
                    }}
                    className="bg-neutral-900 border border-neutral-700 rounded p-1.5 text-center font-mono text-white"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleVectorOperation('dot')}
              className="py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-bold text-amber-400 border border-neutral-700"
            >
              VctA • VctB (Dot)
            </button>
            <button
              type="button"
              onClick={() => handleVectorOperation('cross')}
              className="py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-bold text-amber-400 border border-neutral-700"
            >
              VctA × VctB (Cross)
            </button>
            <button
              type="button"
              onClick={() => handleVectorOperation('norm')}
              className="py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-bold text-emerald-400 border border-neutral-700"
            >
              |VctA| (Độ lớn)
            </button>
            <button
              type="button"
              onClick={() => handleVectorOperation('angle')}
              className="py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-bold text-cyan-400 border border-neutral-700"
            >
              ∠(VctA, VctB) (Góc)
            </button>
          </div>

          {vectorResultText && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-800 text-emerald-300 font-mono">
              {vectorResultText}
            </div>
          )}
        </div>
      )}

      {/* --- MODE 8: TABLE --- */}
      {mode === 'table' && (
        <div className="space-y-4 text-sm">
          <p className="text-xs text-neutral-400">Sinh bảng giá trị hàm số f(x) với khoảng Start, End, Step</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-4">
              <label className="text-[11px] text-neutral-400 block font-mono">f(x) =</label>
              <input
                type="text"
                value={tableFunc}
                onChange={e => setTableFunc(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 font-mono text-amber-300 font-bold"
                placeholder="2*x^2 - 3*x + 1"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-400 block font-mono">Start =</label>
              <input
                type="number"
                value={tableStart}
                onChange={e => setTableStart(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-center font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-400 block font-mono">End =</label>
              <input
                type="number"
                value={tableEnd}
                onChange={e => setTableEnd(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-center font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-400 block font-mono">Step =</label>
              <input
                type="number"
                value={tableStep}
                onChange={e => setTableStep(parseFloat(e.target.value) || 1)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-center font-mono"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleGenerateTable}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow"
              >
                Sinh Bảng (=)
              </button>
            </div>
          </div>

          {tableResultRows.length > 0 && (
            <div className="max-h-60 overflow-y-auto rounded-xl bg-neutral-950 border border-neutral-800">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 sticky top-0">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2 text-amber-400">x</th>
                    <th className="p-2 text-emerald-400">f(x)</th>
                  </tr>
                </thead>
                <tbody>
                  {tableResultRows.map((r, i) => (
                    <tr key={i} className="border-b border-neutral-900 hover:bg-neutral-900/40">
                      <td className="p-2 text-neutral-500">{i + 1}</td>
                      <td className="p-2 text-white font-bold">{r.x}</td>
                      <td className="p-2 text-emerald-300 font-bold">{r.fx}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- MODE 6: STATISTICS --- */}
      {mode === 'statistics' && (
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-400">Bảng dữ liệu 1 biến: x (Giá trị) và Freq (Tần số)</p>
            <button
              type="button"
              onClick={() => setStatRows([...statRows, { x: 0, freq: 1 }])}
              className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-xs text-amber-400 border border-neutral-700"
            >
              <Plus className="w-3 h-3" />
              <span>Thêm hàng</span>
            </button>
          </div>

          <div className="max-h-44 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-neutral-950 border border-neutral-800">
            {statRows.map((row, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="text-neutral-500 font-mono text-xs w-6">{idx + 1}</span>
                <input
                  type="number"
                  placeholder="x"
                  value={row.x}
                  onChange={e => {
                    const next = [...statRows];
                    next[idx].x = parseFloat(e.target.value) || 0;
                    setStatRows(next);
                  }}
                  className="w-24 bg-neutral-900 border border-neutral-700 rounded p-1 text-center font-mono text-white text-xs"
                />
                <input
                  type="number"
                  placeholder="Freq"
                  value={row.freq}
                  onChange={e => {
                    const next = [...statRows];
                    next[idx].freq = parseInt(e.target.value) || 1;
                    setStatRows(next);
                  }}
                  className="w-20 bg-neutral-900 border border-neutral-700 rounded p-1 text-center font-mono text-amber-400 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setStatRows(statRows.filter((_, i) => i !== idx))}
                  className="text-neutral-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAnalyzeStats}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition"
          >
            TÍNH TOÁN THỐNG KÊ 1-BIẾN (=)
          </button>

          {statAnalysis && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-neutral-950 border border-emerald-800 font-mono text-xs">
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400">Số lượng (n):</span>
                <p className="text-sm font-bold text-white">{statAnalysis.n}</p>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-amber-400">Trung bình (x̄):</span>
                <p className="text-sm font-bold text-white">{statAnalysis.mean}</p>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-cyan-400">Độ lệch chuẩn (s):</span>
                <p className="text-sm font-bold text-white">{statAnalysis.sampleStdDev}</p>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-emerald-400">Trung vị (Med):</span>
                <p className="text-sm font-bold text-white">{statAnalysis.med}</p>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400">Min(x):</span>
                <p className="text-sm font-bold text-white">{statAnalysis.min}</p>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400">Q1:</span>
                <p className="text-sm font-bold text-white">{statAnalysis.q1}</p>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400">Q3:</span>
                <p className="text-sm font-bold text-white">{statAnalysis.q3}</p>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400">Max(x):</span>
                <p className="text-sm font-bold text-white">{statAnalysis.max}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MODE 2: COMPLEX --- */}
      {mode === 'complex' && (
        <div className="space-y-4 text-sm">
          <p className="text-xs text-neutral-400">Nhập số phức z = a + bi để tính môđun |z|, arg(z), liên hợp z̄</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-neutral-400 block font-mono">Phần thực (a) =</label>
              <input
                type="number"
                value={compReal}
                onChange={e => setCompReal(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-center font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-400 block font-mono">Phần ảo (b) =</label>
              <input
                type="number"
                value={compImag}
                onChange={e => setCompImag(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-center font-mono text-white"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleComplexAnalysis}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition"
          >
            PHÂN TÍCH SỐ PHỨC (=)
          </button>

          {compResultText && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-800 text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed">
              {compResultText}
            </div>
          )}
        </div>
      )}

      {/* --- MODE 3: BASE-N --- */}
      {mode === 'base_n' && (
        <div className="space-y-4 text-sm">
          <p className="text-xs text-neutral-400">Chuyển đổi số nguyên giữa các hệ DEC, HEX, BIN, OCT</p>
          <div className="space-y-2">
            <label className="text-xs text-neutral-400 font-bold">Giá trị nhập:</label>
            <input
              type="text"
              value={baseVal}
              onChange={e => setBaseVal(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 font-mono text-amber-400 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['DEC', 'HEX', 'BIN', 'OCT'] as const).map(b => (
              <button
                key={b}
                type="button"
                onClick={() => setActiveBaseType(b)}
                className={`py-2 rounded-lg font-bold text-xs ${
                  activeBaseType === b ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                Hệ {b}
              </button>
            ))}
          </div>

          {/* Real-time converted values */}
          {(() => {
            try {
              let decVal = 0;
              if (activeBaseType === 'DEC') decVal = parseInt(baseVal, 10);
              else if (activeBaseType === 'HEX') decVal = parseInt(baseVal, 16);
              else if (activeBaseType === 'BIN') decVal = parseInt(baseVal, 2);
              else if (activeBaseType === 'OCT') decVal = parseInt(baseVal, 8);

              if (isNaN(decVal)) return <p className="text-rose-400 font-mono">Giá trị không hợp lệ</p>;

              return (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 font-mono text-xs">
                  <div className="flex justify-between border-b border-neutral-800/80 pb-1">
                    <span className="text-amber-400 font-bold">DEC (Thập phân):</span>
                    <span className="font-bold text-white">{decVal.toString(10)}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800/80 pb-1">
                    <span className="text-cyan-400 font-bold">HEX (Thập lục phân):</span>
                    <span className="font-bold text-white">0x{decVal.toString(16).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800/80 pb-1">
                    <span className="text-emerald-400 font-bold">BIN (Nhị phân):</span>
                    <span className="font-bold text-white">{decVal.toString(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400 font-bold">OCT (Bát phân):</span>
                    <span className="font-bold text-white">{decVal.toString(8)}</span>
                  </div>
                </div>
              );
            } catch {
              return null;
            }
          })()}
        </div>
      )}
    </div>
  );
};
