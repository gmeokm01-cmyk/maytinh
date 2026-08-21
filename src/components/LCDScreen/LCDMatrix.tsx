import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../../types';
import { matrixDet, matrixInv, matrixTranspose, matrixMultiply, matrixAdd } from '../../utils/matrixEngine';

interface LCDMatrixProps {
  onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'timestampFormatted'>) => void;
  keypadAction: { action: string; timestamp: number } | null;
}

type MatStep = 'SELECT_MAT' | 'SELECT_DIM' | 'INPUT_MATRIX' | 'OPTN_MENU' | 'SHOW_RESULT';

export const LCDMatrix: React.FC<LCDMatrixProps> = ({ onSaveToHistory, keypadAction }) => {
  const [step, setStep] = useState<MatStep>('SELECT_MAT');
  const [activeMatName, setActiveMatName] = useState<'MatA' | 'MatB' | 'MatC' | 'MatD'>('MatA');
  const [rows, setRows] = useState<number>(2);
  const [cols, setCols] = useState<number>(2);

  const [matrices, setMatrices] = useState<Record<string, number[][]>>({
    MatA: [
      [1, 2],
      [3, 4],
    ],
    MatB: [
      [2, 0],
      [1, 2],
    ],
  });

  const [curRow, setCurRow] = useState<number>(0);
  const [curCol, setCurCol] = useState<number>(0);
  const [inputBuffer, setInputBuffer] = useState<string>('');

  const [resultText, setResultText] = useState<string>('');
  const [resultMatrix, setResultMatrix] = useState<number[][] | null>(null);

  // Handle keypad input
  useEffect(() => {
    if (!keypadAction) return;
    const { action } = keypadAction;

    if (action === 'OPTN') {
      setStep('OPTN_MENU');
      return;
    }

    if (action === 'AC') {
      if (step === 'SHOW_RESULT' || step === 'OPTN_MENU') {
        setStep('INPUT_MATRIX');
      } else {
        setInputBuffer('');
      }
      return;
    }

    if (step === 'SELECT_MAT') {
      if (action === '1') { setActiveMatName('MatA'); setStep('SELECT_DIM'); }
      else if (action === '2') { setActiveMatName('MatB'); setStep('SELECT_DIM'); }
      else if (action === '3') { setActiveMatName('MatC'); setStep('SELECT_DIM'); }
      else if (action === '4') { setActiveMatName('MatD'); setStep('SELECT_DIM'); }
      return;
    }

    if (step === 'SELECT_DIM') {
      if (action >= '1' && action <= '4') {
        const dim = parseInt(action, 10);
        setRows(dim);
        setCols(dim);
        const newM = Array(dim).fill(0).map(() => Array(dim).fill(0));
        setMatrices(prev => ({ ...prev, [activeMatName]: newM }));
        setCurRow(0);
        setCurCol(0);
        setStep('INPUT_MATRIX');
      }
      return;
    }

    if (step === 'INPUT_MATRIX') {
      if (action >= '0' && action <= '9') {
        setInputBuffer(prev => prev + action);
      } else if (action === 'NEG' || action === '-') {
        setInputBuffer(prev => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
      } else if (action === '.') {
        setInputBuffer(prev => (prev.includes('.') ? prev : prev + '.'));
      } else if (action === 'DEL') {
        setInputBuffer(prev => prev.slice(0, -1));
      } else if (action === '=' || action === 'CALC') {
        const currentVal = inputBuffer ? parseFloat(inputBuffer) : matrices[activeMatName]?.[curRow]?.[curCol] ?? 0;
        const currentMat = matrices[activeMatName] || Array(rows).fill(0).map(() => Array(cols).fill(0));
        const next = currentMat.map(r => [...r]);
        if (!next[curRow]) next[curRow] = [];
        next[curRow][curCol] = isNaN(currentVal) ? 0 : currentVal;

        setMatrices(prev => ({ ...prev, [activeMatName]: next }));
        setInputBuffer('');

        if (curCol < cols - 1) {
          setCurCol(prev => prev + 1);
        } else if (curRow < rows - 1) {
          setCurRow(prev => prev + 1);
          setCurCol(0);
        }
      } else if (action === 'LEFT' && curCol > 0) setCurCol(prev => prev - 1);
      else if (action === 'RIGHT' && curCol < cols - 1) setCurCol(prev => prev + 1);
      else if (action === 'UP' && curRow > 0) setCurRow(prev => prev - 1);
      else if (action === 'DOWN' && curRow < rows - 1) setCurRow(prev => prev + 1);
      return;
    }

    if (step === 'OPTN_MENU') {
      const matA = matrices.MatA || [[1, 0], [0, 1]];
      const matB = matrices.MatB || [[1, 0], [0, 1]];

      if (action === '1') {
        // det(MatA)
        const d = matrixDet(matA);
        setResultText(`det(${activeMatName}) = ${d}`);
        setResultMatrix(null);
        setStep('SHOW_RESULT');
        onSaveToHistory({
          mode: 'matrix',
          modeLabel: 'Mode 4: Định thức Ma trận',
          expression: `det(${activeMatName})`,
          displayExpression: `det(${activeMatName})`,
          result: `${d}`,
          category: 'Matrix',
        });
      } else if (action === '2') {
        // MatA^-1
        const inv = matrixInv(matA);
        if (inv) {
          setResultText(`${activeMatName}⁻¹`);
          setResultMatrix(inv);
          setStep('SHOW_RESULT');
          onSaveToHistory({
            mode: 'matrix',
            modeLabel: 'Mode 4: Nghịch đảo Ma trận',
            expression: `${activeMatName}⁻¹`,
            displayExpression: `${activeMatName}⁻¹`,
            result: JSON.stringify(inv),
            category: 'Matrix',
          });
        } else {
          setResultText('Ma trận không khả nghịch (det=0)');
          setResultMatrix(null);
          setStep('SHOW_RESULT');
        }
      } else if (action === '3') {
        // MatA^T
        const trans = matrixTranspose(matA);
        setResultText(`${activeMatName}ᵀ (Chuyển vị)`);
        setResultMatrix(trans);
        setStep('SHOW_RESULT');
      } else if (action === '4') {
        // MatA x MatB
        const prod = matrixMultiply(matA, matB);
        setResultText('MatA × MatB');
        setResultMatrix(prod);
        setStep('SHOW_RESULT');
      } else if (action === '5') {
        // MatA + MatB
        const sum = matrixAdd(matA, matB);
        setResultText('MatA + MatB');
        setResultMatrix(sum);
        setStep('SHOW_RESULT');
      }
    }
  }, [keypadAction, step, activeMatName, rows, cols, matrices, curRow, curCol, inputBuffer, onSaveToHistory]);

  return (
    <div className="w-full h-[120px] flex flex-col justify-between text-[#0a120c] font-mono select-none overflow-hidden">
      {/* 1. SELECT MATRIX */}
      {step === 'SELECT_MAT' && (
        <div className="flex flex-col justify-between h-full p-0.5">
          <div className="text-[10px] font-black border-b border-[#7d9482] pb-0.5">
            <span>Matrix (Mode 4) - Chọn Ma trận:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 my-1 text-[11px] font-bold">
            {(['MatA', 'MatB', 'MatC', 'MatD'] as const).map((m, idx) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setActiveMatName(m);
                  setStep('SELECT_DIM');
                }}
                className="p-1 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] border border-[#718776] flex items-center gap-1.5"
              >
                <span className="w-3.5 h-3.5 rounded bg-[#111c14] text-[#d6e5d8] text-[8px] flex items-center justify-center font-black">
                  {idx + 1}
                </span>
                <span>{m}</span>
              </button>
            ))}
          </div>
          <div className="text-[9px] opacity-70 border-t border-[#7d9482] pt-0.5">
            Bấm phím 1..4 để chọn ma trận cần định nghĩa
          </div>
        </div>
      )}

      {/* 2. SELECT DIMENSIONS */}
      {step === 'SELECT_DIM' && (
        <div className="flex flex-col justify-between h-full p-0.5">
          <div className="text-[10px] font-black border-b border-[#7d9482] pb-0.5">
            <span>{activeMatName} - Chọn kích thước (1 ~ 4)</span>
          </div>
          <div className="flex items-center justify-around my-2">
            {[2, 3, 4].map(dim => (
              <button
                key={dim}
                type="button"
                onClick={() => {
                  setRows(dim);
                  setCols(dim);
                  const newM = Array(dim).fill(0).map(() => Array(dim).fill(0));
                  setMatrices(prev => ({ ...prev, [activeMatName]: newM }));
                  setCurRow(0);
                  setCurCol(0);
                  setStep('INPUT_MATRIX');
                }}
                className="px-3 py-1.5 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] border border-[#718776] font-bold text-xs"
              >
                {dim}×{dim}
              </button>
            ))}
          </div>
          <div className="text-[9px] opacity-70 border-t border-[#7d9482] pt-0.5">
            Nhấn phím 2, 3 hoặc 4 để thiết lập số chiều
          </div>
        </div>
      )}

      {/* 3. INPUT MATRIX */}
      {step === 'INPUT_MATRIX' && (
        <div className="flex flex-col justify-between h-full">
          <div className="text-[10px] font-bold border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span className="font-extrabold">{activeMatName} ({rows}×{cols})</span>
            <span className="text-[9px] bg-[#111c14] text-[#d6e5d8] px-1 rounded">
              [{curRow + 1},{curCol + 1}]
            </span>
          </div>

          {/* Matrix Grid */}
          <div className="my-0.5 overflow-x-auto max-h-[58px]">
            <table className="w-full text-center text-[10px] font-mono border-collapse">
              <tbody>
                {Array(rows).fill(0).map((_, r) => (
                  <tr key={r}>
                    {Array(cols).fill(0).map((__, c) => {
                      const isActive = curRow === r && curCol === c;
                      const val = matrices[activeMatName]?.[r]?.[c] ?? 0;
                      return (
                        <td
                          key={c}
                          onClick={() => {
                            setCurRow(r);
                            setCurCol(c);
                            setInputBuffer('');
                          }}
                          className={`p-0.5 px-2 cursor-pointer font-bold border border-[#7d9482]/40 ${
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

          {/* Bottom Edit Bar & OPTN Hint */}
          <div className="border-t border-[#7d9482] pt-0.5 flex items-center justify-between text-[11px] font-black">
            <div className="flex items-center space-x-1">
              <span className="text-[10px] opacity-80">[{curRow + 1},{curCol + 1}] =</span>
              <span className="text-[12px] bg-[#8aa08f] px-1 py-0.2 rounded border border-[#6b8070]">
                {inputBuffer || (matrices[activeMatName]?.[curRow]?.[curCol] ?? 0)}
                <span className="inline-block w-1.5 h-3 bg-[#0a120c] animate-pulse ml-0.5" />
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep('OPTN_MENU')}
              className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#111c14] text-[#d6e5d8] hover:bg-black"
            >
              [OPTN] Phép tính
            </button>
          </div>
        </div>
      )}

      {/* 4. OPTN MENU */}
      {step === 'OPTN_MENU' && (
        <div className="flex flex-col justify-between h-full p-0.5">
          <div className="text-[10px] font-black border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span>Matrix OPTN Phép tính</span>
            <span className="opacity-75 text-[9px]">Bấm 1..5:</span>
          </div>
          <div className="grid grid-cols-2 gap-1 my-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => {
                const d = matrixDet(matrices[activeMatName] || [[1,0],[0,1]]);
                setResultText(`det(${activeMatName}) = ${d}`);
                setResultMatrix(null);
                setStep('SHOW_RESULT');
              }}
              className="p-1 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] text-left"
            >
              1: det(Ma trận)
            </button>
            <button
              type="button"
              onClick={() => {
                const inv = matrixInv(matrices[activeMatName] || [[1, 0], [0, 1]]);
                setResultText(`${activeMatName}⁻¹`);
                setResultMatrix(inv);
                setStep('SHOW_RESULT');
              }}
              className="p-1 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] text-left"
            >
              2: Nghịch đảo ⁻¹
            </button>
            <button
              type="button"
              onClick={() => {
                const trans = matrixTranspose(matrices[activeMatName] || [[1,0],[0,1]]);
                setResultText(`${activeMatName}ᵀ (Chuyển vị)`);
                setResultMatrix(trans);
                setStep('SHOW_RESULT');
              }}
              className="p-1 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] text-left"
            >
              3: Chuyển vị ᵀ
            </button>
            <button
              type="button"
              onClick={() => {
                const p = matrixMultiply(matrices.MatA || [[1,0],[0,1]], matrices.MatB || [[1,0],[0,1]]);
                setResultText('MatA × MatB');
                setResultMatrix(p);
                setStep('SHOW_RESULT');
              }}
              className="p-1 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] text-left"
            >
              4: MatA × MatB
            </button>
          </div>
          <div className="text-[9px] opacity-70 border-t border-[#7d9482] pt-0.5">
            [AC] Quay lại ma trận
          </div>
        </div>
      )}

      {/* 5. SHOW RESULT */}
      {step === 'SHOW_RESULT' && (
        <div className="flex flex-col justify-between h-full">
          <div className="text-[10px] font-bold border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span className="font-extrabold">{resultText}</span>
            <span className="text-[9px] bg-[#111c14] text-[#d6e5d8] px-1 rounded">MatAns</span>
          </div>

          <div className="my-auto py-1">
            {resultMatrix ? (
              <div className="overflow-x-auto">
                <table className="w-full text-center text-[12px] font-black border-collapse">
                  <tbody>
                    {resultMatrix.map((row, r) => (
                      <tr key={r}>
                        {row.map((val, c) => (
                          <td key={c} className="p-0.5 px-2 border border-[#7d9482]/50">
                            {typeof val === 'number' ? Math.round(val * 1000) / 1000 : val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-right text-[22px] font-black px-2">{resultText.split('=')[1] || resultText}</div>
            )}
          </div>

          <div className="border-t border-[#7d9482] pt-0.5 flex items-center justify-between text-[9px]">
            <span>Kết quả ma trận</span>
            <button
              type="button"
              onClick={() => setStep('INPUT_MATRIX')}
              className="font-bold px-1.5 py-0.2 bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] rounded"
            >
              [AC] Sửa ma trận
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
