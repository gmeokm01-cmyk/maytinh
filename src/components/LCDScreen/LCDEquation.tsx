import React, { useState, useEffect, useCallback } from 'react';
import { EquationResult, HistoryItem } from '../../types';
import { solveLinearSystem, solveQuadratic, solveCubic, solveQuartic } from '../../utils/equationSolver';
import { sound } from '../../utils/sound';

interface LCDEquationProps {
  onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'timestampFormatted'>) => void;
  onExitMode: () => void;
  // Keypad action listener hooks
  keypadAction: { action: string; timestamp: number } | null;
}

type EqStep = 'SELECT_TYPE' | 'SELECT_DEGREE' | 'SELECT_UNKNOWNS' | 'INPUT_POLY' | 'INPUT_SIMUL' | 'SHOW_RESULT';

export const LCDEquation: React.FC<LCDEquationProps> = ({
  onSaveToHistory,
  onExitMode,
  keypadAction,
}) => {
  const [step, setStep] = useState<EqStep>('SELECT_TYPE');
  const [eqType, setEqType] = useState<'poly' | 'simul'>('poly');
  const [degree, setDegree] = useState<2 | 3 | 4>(2);
  const [unknowns, setUnknowns] = useState<2 | 3 | 4>(2);

  // Polynomial coefficients: a, b, c, d, e
  const [polyCoeffs, setPolyCoeffs] = useState<number[]>([1, -5, 6, 0, 0]);
  const [polyActiveIdx, setPolyActiveIdx] = useState<number>(0);

  // Linear system matrix: rows = unknowns, cols = unknowns + 1
  const [simulMatrix, setSimulMatrix] = useState<number[][]>([
    [2, 1, 8],
    [1, -1, 1],
  ]);
  const [simulRow, setSimulRow] = useState<number>(0);
  const [simulCol, setSimulCol] = useState<number>(0);

  // Buffer for currently typed digits in the active cell
  const [inputBuffer, setInputBuffer] = useState<string>('');

  // Results
  const [result, setResult] = useState<EquationResult | null>(null);
  const [resultCursor, setResultCursor] = useState<number>(0);
  const [showDecimal, setShowDecimal] = useState<boolean>(false);

  // Compute polynomial solution
  const solvePoly = useCallback(() => {
    let res: EquationResult;
    const a = polyCoeffs[0] || 0;
    const b = polyCoeffs[1] || 0;
    const c = polyCoeffs[2] || 0;
    const d = polyCoeffs[3] || 0;
    const e = polyCoeffs[4] || 0;

    if (degree === 2) {
      res = solveQuadratic(a, b, c);
    } else if (degree === 3) {
      res = solveCubic(a, b, c, d);
    } else {
      res = solveQuartic(a, b, c, d, e);
    }

    setResult(res);
    setResultCursor(0);
    setStep('SHOW_RESULT');

    // Save to history
    const expr =
      degree === 2
        ? `${a}x² + (${b})x + (${c}) = 0`
        : degree === 3
        ? `${a}x³ + (${b})x² + (${c})x + (${d}) = 0`
        : `${a}x⁴ + (${b})x³ + (${c})x² + (${d})x + (${e}) = 0`;

    const rootsTxt = res.roots
      .map(r => `${r.name}=${r.real}${r.imag ? (r.imag >= 0 ? `+${r.imag}i` : `${r.imag}i`) : ''}`)
      .join(', ');

    onSaveToHistory({
      mode: 'equation',
      modeLabel: `Mode 9: PT bậc ${degree}`,
      expression: expr,
      displayExpression: expr,
      result: rootsTxt,
      category: 'Equation',
    });
  }, [degree, polyCoeffs, onSaveToHistory]);

  // Compute system of equations solution
  const solveSimul = useCallback(() => {
    const n = unknowns;
    const coeffs = simulMatrix.slice(0, n).map(r => r.slice(0, n));
    const constants = simulMatrix.slice(0, n).map(r => r[n]);
    const res = solveLinearSystem(coeffs, constants);

    setResult(res);
    setResultCursor(0);
    setStep('SHOW_RESULT');

    const rootsTxt = res.roots.map(r => `${r.name}=${r.real}`).join(', ');

    onSaveToHistory({
      mode: 'equation',
      modeLabel: `Mode 9: Hệ ${n} ẩn`,
      expression: `Hệ ${n} phương trình tuyến tính`,
      displayExpression: `Hệ ${n} phương trình tuyến tính`,
      result: res.hasNoSolution ? 'Vô nghiệm' : res.hasInfiniteSolutions ? 'Vô số nghiệm' : rootsTxt,
      category: 'Equation',
    });
  }, [unknowns, simulMatrix, onSaveToHistory]);

  // Handle keypad interaction in Equation mode
  useEffect(() => {
    if (!keypadAction) return;
    const { action } = keypadAction;

    if (action === 'AC') {
      if (step === 'SHOW_RESULT') {
        setStep(eqType === 'poly' ? 'INPUT_POLY' : 'INPUT_SIMUL');
        setInputBuffer('');
      } else {
        setInputBuffer('');
      }
      return;
    }

    if (step === 'SELECT_TYPE') {
      if (action === '1') {
        setEqType('simul');
        setStep('SELECT_UNKNOWNS');
      } else if (action === '2') {
        setEqType('poly');
        setStep('SELECT_DEGREE');
      }
      return;
    }

    if (step === 'SELECT_UNKNOWNS') {
      if (action === '2' || action === '3' || action === '4') {
        const n = parseInt(action, 10) as 2 | 3 | 4;
        setUnknowns(n);
        const newMat = Array(n)
          .fill(0)
          .map(() => Array(n + 1).fill(0));
        // Default sample
        newMat[0][0] = 2;
        newMat[0][1] = 1;
        newMat[0][n] = 8;
        if (n >= 2) {
          newMat[1][0] = 1;
          newMat[1][1] = -1;
          newMat[1][n] = 1;
        }
        setSimulMatrix(newMat);
        setSimulRow(0);
        setSimulCol(0);
        setInputBuffer('');
        setStep('INPUT_SIMUL');
      }
      return;
    }

    if (step === 'SELECT_DEGREE') {
      if (action === '2' || action === '3' || action === '4') {
        const deg = parseInt(action, 10) as 2 | 3 | 4;
        setDegree(deg);
        setPolyCoeffs([1, -5, 6, 0, 0]);
        setPolyActiveIdx(0);
        setInputBuffer('');
        setStep('INPUT_POLY');
      }
      return;
    }

    // Poly coefficient input on LCD
    if (step === 'INPUT_POLY') {
      if (action >= '0' && action <= '9') {
        setInputBuffer(prev => prev + action);
      } else if (action === 'NEG' || action === '-') {
        setInputBuffer(prev => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
      } else if (action === '.') {
        setInputBuffer(prev => (prev.includes('.') ? prev : prev + '.'));
      } else if (action === 'DEL') {
        setInputBuffer(prev => prev.slice(0, -1));
      } else if (action === '=' || action === 'CALC') {
        const currentVal = inputBuffer ? parseFloat(inputBuffer) : polyCoeffs[polyActiveIdx];
        const next = [...polyCoeffs];
        next[polyActiveIdx] = isNaN(currentVal) ? 0 : currentVal;
        setPolyCoeffs(next);
        setInputBuffer('');

        if (polyActiveIdx < degree) {
          setPolyActiveIdx(prev => prev + 1);
        } else {
          // Solved!
          solvePoly();
        }
      } else if (action === 'LEFT') {
        setPolyActiveIdx(prev => Math.max(0, prev - 1));
        setInputBuffer('');
      } else if (action === 'RIGHT') {
        setPolyActiveIdx(prev => Math.min(degree, prev + 1));
        setInputBuffer('');
      }
      return;
    }

    // Linear system matrix input on LCD
    if (step === 'INPUT_SIMUL') {
      if (action >= '0' && action <= '9') {
        setInputBuffer(prev => prev + action);
      } else if (action === 'NEG' || action === '-') {
        setInputBuffer(prev => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
      } else if (action === '.') {
        setInputBuffer(prev => (prev.includes('.') ? prev : prev + '.'));
      } else if (action === 'DEL') {
        setInputBuffer(prev => prev.slice(0, -1));
      } else if (action === '=' || action === 'CALC') {
        const currentVal = inputBuffer ? parseFloat(inputBuffer) : simulMatrix[simulRow]?.[simulCol] ?? 0;
        const next = simulMatrix.map(r => [...r]);
        if (!next[simulRow]) next[simulRow] = [];
        next[simulRow][simulCol] = isNaN(currentVal) ? 0 : currentVal;
        setSimulMatrix(next);
        setInputBuffer('');

        // Move cursor to next cell
        if (simulCol < unknowns) {
          setSimulCol(prev => prev + 1);
        } else if (simulRow < unknowns - 1) {
          setSimulRow(prev => prev + 1);
          setSimulCol(0);
        } else {
          // Solved!
          solveSimul();
        }
      } else if (action === 'LEFT') {
        if (simulCol > 0) setSimulCol(prev => prev - 1);
        else if (simulRow > 0) {
          setSimulRow(prev => prev - 1);
          setSimulCol(unknowns);
        }
        setInputBuffer('');
      } else if (action === 'RIGHT') {
        if (simulCol < unknowns) setSimulCol(prev => prev + 1);
        else if (simulRow < unknowns - 1) {
          setSimulRow(prev => prev + 1);
          setSimulCol(0);
        }
        setInputBuffer('');
      } else if (action === 'UP') {
        if (simulRow > 0) setSimulRow(prev => prev - 1);
        setInputBuffer('');
      } else if (action === 'DOWN') {
        if (simulRow < unknowns - 1) setSimulRow(prev => prev + 1);
        setInputBuffer('');
      }
      return;
    }

    // Results navigation on LCD
    if (step === 'SHOW_RESULT' && result) {
      const totalItems =
        result.roots.length + (result.extrema ? 2 : 0);

      if (action === 'DOWN' || action === '=') {
        setResultCursor(prev => (prev + 1 < totalItems ? prev + 1 : prev));
      } else if (action === 'UP') {
        setResultCursor(prev => (prev > 0 ? prev - 1 : 0));
      } else if (action === 'SD_TOGGLE') {
        setShowDecimal(prev => !prev);
      }
    }
  }, [keypadAction, step, eqType, degree, unknowns, polyCoeffs, polyActiveIdx, simulMatrix, simulRow, simulCol, inputBuffer, result, solvePoly, solveSimul]);

  const coeffLabels = ['a', 'b', 'c', 'd', 'e'];
  const varNames = ['x', 'y', 'z', 't'];

  return (
    <div className="w-full h-[120px] flex flex-col justify-between text-[#0a120c] font-mono select-none overflow-hidden">
      {/* 1. SELECT TYPE */}
      {step === 'SELECT_TYPE' && (
        <div className="flex flex-col justify-between h-full p-0.5">
          <div className="text-[10px] font-black border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span>Equation / Func (Mode 9)</span>
            <span className="opacity-70">Chọn 1 hoặc 2:</span>
          </div>
          <div className="space-y-1.5 my-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => {
                setEqType('simul');
                setStep('SELECT_UNKNOWNS');
                sound.playKeyClick('num');
              }}
              className="w-full text-left p-1.5 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] border border-[#718776] flex items-center gap-2"
            >
              <span className="w-4 h-4 rounded bg-[#111c14] text-[#d6e5d8] text-[9px] flex items-center justify-center font-black">
                1
              </span>
              <span>1: Hệ phương trình (Simul Eq)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEqType('poly');
                setStep('SELECT_DEGREE');
                sound.playKeyClick('num');
              }}
              className="w-full text-left p-1.5 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] border border-[#718776] flex items-center gap-2"
            >
              <span className="w-4 h-4 rounded bg-[#111c14] text-[#d6e5d8] text-[9px] flex items-center justify-center font-black">
                2
              </span>
              <span>2: Phương trình đa thức (Polynomial)</span>
            </button>
          </div>
          <div className="text-[9px] opacity-70 border-t border-[#7d9482] pt-0.5">
            Nhấn phím 1 hoặc 2 trên bàn phím máy tính
          </div>
        </div>
      )}

      {/* 2. SELECT DEGREE */}
      {step === 'SELECT_DEGREE' && (
        <div className="flex flex-col justify-between h-full p-0.5">
          <div className="text-[10px] font-black border-b border-[#7d9482] pb-0.5">
            <span>Polynomial (Bậc 2 ~ 4?)</span>
          </div>
          <div className="flex items-center justify-around my-2">
            {[2, 3, 4].map(deg => (
              <button
                key={deg}
                type="button"
                onClick={() => {
                  setDegree(deg as 2 | 3 | 4);
                  setPolyCoeffs([1, -5, 6, 0, 0]);
                  setPolyActiveIdx(0);
                  setInputBuffer('');
                  setStep('INPUT_POLY');
                  sound.playKeyClick('num');
                }}
                className="px-4 py-2 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] border border-[#718776] font-black text-xs"
              >
                Bậc {deg}
              </button>
            ))}
          </div>
          <div className="text-[9px] opacity-70 border-t border-[#7d9482] pt-0.5">
            Nhấn phím số 2, 3 hoặc 4 để bắt đầu
          </div>
        </div>
      )}

      {/* 3. SELECT UNKNOWNS */}
      {step === 'SELECT_UNKNOWNS' && (
        <div className="flex flex-col justify-between h-full p-0.5">
          <div className="text-[10px] font-black border-b border-[#7d9482] pb-0.5">
            <span>Simul Equation (Số lượng ẩn 2 ~ 4?)</span>
          </div>
          <div className="flex items-center justify-around my-2">
            {[2, 3, 4].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setUnknowns(n as 2 | 3 | 4);
                  const newMat = Array(n)
                    .fill(0)
                    .map(() => Array(n + 1).fill(0));
                  newMat[0][0] = 2;
                  newMat[0][1] = 1;
                  newMat[0][n] = 8;
                  if (n >= 2) {
                    newMat[1][0] = 1;
                    newMat[1][1] = -1;
                    newMat[1][n] = 1;
                  }
                  setSimulMatrix(newMat);
                  setSimulRow(0);
                  setSimulCol(0);
                  setInputBuffer('');
                  setStep('INPUT_SIMUL');
                  sound.playKeyClick('num');
                }}
                className="px-4 py-2 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] border border-[#718776] font-black text-xs"
              >
                {n} Ẩn
              </button>
            ))}
          </div>
          <div className="text-[9px] opacity-70 border-t border-[#7d9482] pt-0.5">
            Nhấn phím số 2, 3 hoặc 4 trên bàn phím máy tính
          </div>
        </div>
      )}

      {/* 4. INPUT POLYNOMIAL MATRIX */}
      {step === 'INPUT_POLY' && (
        <div className="flex flex-col justify-between h-full">
          {/* Header eq prototype */}
          <div className="text-[10px] font-bold border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span className="truncate">
              {degree === 2 && 'ax² + bx + c = 0'}
              {degree === 3 && 'ax³ + bx² + cx + d = 0'}
              {degree === 4 && 'ax⁴ + bx³ + cx² + dx + e = 0'}
            </span>
            <span className="text-[9px] bg-[#111c14] text-[#d6e5d8] px-1 rounded">Bậc {degree}</span>
          </div>

          {/* Matrix table row */}
          <div className="flex items-center justify-start space-x-1 my-1 overflow-x-auto text-[11px] font-bold">
            {coeffLabels.slice(0, degree + 1).map((lbl, idx) => {
              const isActive = polyActiveIdx === idx;
              const val = polyCoeffs[idx];
              return (
                <div
                  key={lbl}
                  onClick={() => {
                    setPolyActiveIdx(idx);
                    setInputBuffer('');
                  }}
                  className={`cursor-pointer px-2 py-1 rounded text-center border transition-all ${
                    isActive
                      ? 'bg-[#111c14] text-[#d6e5d8] border-[#111c14] shadow-sm font-black ring-1 ring-black'
                      : 'bg-[#8aa08f] border-[#718776] text-[#0a120c]'
                  }`}
                >
                  <div className="text-[8px] uppercase tracking-tighter opacity-80">{lbl}</div>
                  <div className="text-[12px] font-mono leading-tight">{val}</div>
                </div>
              );
            })}
          </div>

          {/* Active cell edit line */}
          <div className="border-t border-[#7d9482] pt-1 flex items-center justify-between text-[13px] font-black">
            <div className="flex items-center space-x-1">
              <span className="text-[11px] font-bold">{coeffLabels[polyActiveIdx]} =</span>
              <span className="text-[14px] bg-[#8aa08f] px-1.5 py-0.2 rounded border border-[#6b8070]">
                {inputBuffer || polyCoeffs[polyActiveIdx]}
                <span className="inline-block w-1.5 h-3 bg-[#0a120c] animate-pulse ml-0.5" />
              </span>
            </div>
            <button
              type="button"
              onClick={solvePoly}
              className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#111c14] text-[#d6e5d8] hover:bg-black"
            >
              [ = ] Giải
            </button>
          </div>
        </div>
      )}

      {/* 5. INPUT SIMUL MATRIX */}
      {step === 'INPUT_SIMUL' && (
        <div className="flex flex-col justify-between h-full">
          {/* Header system title */}
          <div className="text-[10px] font-bold border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span>Hệ {unknowns} phương trình</span>
            <span className="text-[9px] bg-[#111c14] text-[#d6e5d8] px-1 rounded">
              Ô: R{simulRow + 1}C{simulCol + 1}
            </span>
          </div>

          {/* Matrix table on LCD */}
          <div className="my-0.5 overflow-x-auto max-h-[56px]">
            <table className="w-full text-center text-[10px] font-mono border-collapse">
              <thead>
                <tr className="text-[8px] border-b border-[#7d9482] opacity-75">
                  <th className="p-0.5">#</th>
                  {varNames.slice(0, unknowns).map(v => (
                    <th key={v} className="p-0.5">
                      {v}
                    </th>
                  ))}
                  <th className="p-0.5 text-amber-950 font-black">= Const</th>
                </tr>
              </thead>
              <tbody>
                {Array(unknowns)
                  .fill(0)
                  .map((_, r) => (
                    <tr key={r}>
                      <td className="text-[8px] opacity-60 px-1">{r + 1}</td>
                      {Array(unknowns + 1)
                        .fill(0)
                        .map((__, c) => {
                          const isActive = simulRow === r && simulCol === c;
                          const val = simulMatrix[r]?.[c] ?? 0;
                          return (
                            <td
                              key={c}
                              onClick={() => {
                                setSimulRow(r);
                                setSimulCol(c);
                                setInputBuffer('');
                              }}
                              className={`p-0.5 px-1 cursor-pointer font-bold border border-[#7d9482]/40 ${
                                isActive ? 'bg-[#111c14] text-[#d6e5d8] font-black' : 'hover:bg-[#8aa08f]'
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Active cell edit line */}
          <div className="border-t border-[#7d9482] pt-0.5 flex items-center justify-between text-[11px] font-black">
            <div className="flex items-center space-x-1">
              <span className="text-[10px] opacity-80">
                {simulCol < unknowns ? `${varNames[simulCol]}${simulRow + 1}` : `c${simulRow + 1}`} =
              </span>
              <span className="text-[12px] bg-[#8aa08f] px-1 py-0.2 rounded border border-[#6b8070]">
                {inputBuffer || (simulMatrix[simulRow]?.[simulCol] ?? 0)}
                <span className="inline-block w-1.5 h-3 bg-[#0a120c] animate-pulse ml-0.5" />
              </span>
            </div>
            <button
              type="button"
              onClick={solveSimul}
              className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-[#111c14] text-[#d6e5d8] hover:bg-black"
            >
              [ = ] Giải
            </button>
          </div>
        </div>
      )}

      {/* 6. SHOW RESULT */}
      {step === 'SHOW_RESULT' && result && (
        <div className="flex flex-col justify-between h-full">
          {/* Top header status */}
          <div className="text-[10px] font-bold border-b border-[#7d9482] pb-0.5 flex justify-between items-center">
            <span className="font-extrabold text-[10px]">
              {eqType === 'poly' ? `Nghiệm PT Bậc ${degree}` : `Nghiệm Hệ ${unknowns} ẩn`}
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-[9px] bg-[#111c14] text-[#d6e5d8] px-1 rounded font-bold">
                ▲▼ REPLAY
              </span>
            </div>
          </div>

          {/* Result Main Display Area */}
          <div className="my-auto py-1">
            {result.hasNoSolution && (
              <div className="text-center py-2">
                <span className="text-sm font-black text-red-950">Vô nghiệm (No Solution)</span>
              </div>
            )}
            {result.hasInfiniteSolutions && (
              <div className="text-center py-2">
                <span className="text-sm font-black">Vô số nghiệm (Infinite Solutions)</span>
              </div>
            )}

            {!result.hasNoSolution && !result.hasInfiniteSolutions && (
              <div>
                {/* Regular roots */}
                {resultCursor < result.roots.length && (
                  <div className="flex items-baseline justify-between px-1">
                    <span className="text-[16px] font-black text-[#111c14]">
                      {result.roots[resultCursor].name} =
                    </span>
                    <span className="text-[20px] sm:text-[22px] font-black text-[#050e07] tracking-tight">
                      {result.roots[resultCursor].real}
                      {result.roots[resultCursor].isComplex &&
                        result.roots[resultCursor].imag !== undefined && (
                          <span className="text-[16px]">
                            {result.roots[resultCursor].imag! >= 0
                              ? ` + ${result.roots[resultCursor].imag}i`
                              : ` - ${Math.abs(result.roots[resultCursor].imag!)}i`}
                          </span>
                        )}
                    </span>
                  </div>
                )}

                {/* Min / Max Extrema */}
                {result.extrema && resultCursor >= result.roots.length && (
                  <div className="px-1 space-y-0.5">
                    <div className="text-[10px] font-black">
                      {result.extrema.type === 'min'
                        ? 'Min of y = ax² + bx + c'
                        : 'Max of y = ax² + bx + c'}
                    </div>
                    <div className="flex items-baseline justify-between text-[16px] font-black">
                      <span>{resultCursor === result.roots.length ? 'x =' : 'y ='}</span>
                      <span className="text-[20px]">
                        {resultCursor === result.roots.length ? result.extrema.x : result.extrema.y}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom control bar */}
          <div className="border-t border-[#7d9482] pt-0.5 flex items-center justify-between text-[9px] opacity-85">
            <span>[▲▼] Cuộn nghiệm | [S⇔D] Đổi số</span>
            <button
              type="button"
              onClick={() => {
                setStep(eqType === 'poly' ? 'INPUT_POLY' : 'INPUT_SIMUL');
                setInputBuffer('');
              }}
              className="font-bold px-1.5 py-0.2 bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] rounded"
            >
              [AC] Sửa hệ số
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
