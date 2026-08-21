import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../../types';
import { evaluateExpression } from '../../utils/mathEngine';

interface LCDTableProps {
  onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'timestampFormatted'>) => void;
  keypadAction: { action: string; timestamp: number } | null;
}

type TableStep = 'INPUT_FUNC' | 'INPUT_START' | 'INPUT_END' | 'INPUT_STEP' | 'VIEW_TABLE';

export const LCDTable: React.FC<LCDTableProps> = ({ onSaveToHistory, keypadAction }) => {
  const [step, setStep] = useState<TableStep>('INPUT_FUNC');
  const [fxExpr, setFxExpr] = useState<string>('x^2 - 3x + 1');
  const [startVal, setStartVal] = useState<number>(1);
  const [endVal, setEndVal] = useState<number>(5);
  const [stepVal, setStepVal] = useState<number>(1);

  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [rows, setRows] = useState<Array<{ x: number; fx: number | string }>>([]);
  const [cursorIdx, setCursorIdx] = useState<number>(0);

  const computeTable = (expr: string, s: number, e: number, st: number) => {
    const validStep = st === 0 ? 1 : Math.abs(st);
    const calculatedRows: Array<{ x: number; fx: number | string }> = [];

    // Cap iterations to avoid infinite loop
    let currentX = s;
    let count = 0;
    while (currentX <= e + 0.00001 && count < 40) {
      const formattedX = Math.round(currentX * 1000) / 1000;
      const res = evaluateExpression(
        expr,
        'DEG',
        'NORM1',
        2,
        5,
        'd/c',
        { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, x: formattedX, y: 0, M: 0, Ans: 0, PreAns: 0 }
      );
      calculatedRows.push({
        x: formattedX,
        fx: res.isError ? 'ERROR' : res.exact || res.decimal,
      });
      currentX += validStep;
      count++;
    }
    setRows(calculatedRows);
    setCursorIdx(0);
    setStep('VIEW_TABLE');

    onSaveToHistory({
      mode: 'table',
      modeLabel: 'Mode 8: Bảng giá trị f(x)',
      expression: `f(x) = ${expr} [${s}..${e}] step ${st}`,
      displayExpression: `f(x) = ${expr}`,
      result: `${calculatedRows.length} giá trị`,
      category: 'Table',
    });
  };

  useEffect(() => {
    if (!keypadAction) return;
    const { action } = keypadAction;

    if (action === 'AC') {
      if (step === 'VIEW_TABLE') {
        setStep('INPUT_FUNC');
      } else {
        setInputBuffer('');
      }
      return;
    }

    if (step === 'INPUT_FUNC') {
      if (action === 'X' || action === 'x') setFxExpr(prev => prev + 'x');
      else if (action >= '0' && action <= '9') setFxExpr(prev => prev + action);
      else if (['+', '-', '×', '÷', '^', '(', ')'].includes(action)) setFxExpr(prev => prev + action);
      else if (action === 'SQUARE') setFxExpr(prev => prev + '^2');
      else if (action === 'DEL') setFxExpr(prev => prev.slice(0, -1));
      else if (action === '=' || action === 'CALC') {
        setInputBuffer(String(startVal));
        setStep('INPUT_START');
      }
      return;
    }

    if (step === 'INPUT_START') {
      if (action >= '0' && action <= '9') setInputBuffer(prev => prev + action);
      else if (action === 'NEG' || action === '-') setInputBuffer(prev => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
      else if (action === '.') setInputBuffer(prev => prev + '.');
      else if (action === 'DEL') setInputBuffer(prev => prev.slice(0, -1));
      else if (action === '=' || action === 'CALC') {
        const val = inputBuffer ? parseFloat(inputBuffer) : startVal;
        setStartVal(isNaN(val) ? 1 : val);
        setInputBuffer(String(endVal));
        setStep('INPUT_END');
      }
      return;
    }

    if (step === 'INPUT_END') {
      if (action >= '0' && action <= '9') setInputBuffer(prev => prev + action);
      else if (action === 'NEG' || action === '-') setInputBuffer(prev => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
      else if (action === '.') setInputBuffer(prev => prev + '.');
      else if (action === 'DEL') setInputBuffer(prev => prev.slice(0, -1));
      else if (action === '=' || action === 'CALC') {
        const val = inputBuffer ? parseFloat(inputBuffer) : endVal;
        setEndVal(isNaN(val) ? 5 : val);
        setInputBuffer(String(stepVal));
        setStep('INPUT_STEP');
      }
      return;
    }

    if (step === 'INPUT_STEP') {
      if (action >= '0' && action <= '9') setInputBuffer(prev => prev + action);
      else if (action === '.') setInputBuffer(prev => prev + '.');
      else if (action === 'DEL') setInputBuffer(prev => prev.slice(0, -1));
      else if (action === '=' || action === 'CALC') {
        const val = inputBuffer ? parseFloat(inputBuffer) : stepVal;
        const finalStep = isNaN(val) || val <= 0 ? 1 : val;
        setStepVal(finalStep);
        computeTable(fxExpr, startVal, endVal, finalStep);
      }
      return;
    }

    if (step === 'VIEW_TABLE') {
      if (action === 'DOWN' || action === '=') {
        setCursorIdx(prev => (prev + 1 < rows.length ? prev + 1 : prev));
      } else if (action === 'UP') {
        setCursorIdx(prev => (prev > 0 ? prev - 1 : 0));
      }
    }
  }, [keypadAction, step, fxExpr, startVal, endVal, stepVal, inputBuffer, rows]);

  return (
    <div className="w-full h-[120px] flex flex-col justify-between text-[#0a120c] font-mono select-none overflow-hidden">
      {/* 1. INPUT f(x) */}
      {step === 'INPUT_FUNC' && (
        <div className="flex flex-col justify-between h-full p-0.5">
          <div className="text-[10px] font-black border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span>Table (Mode 8)</span>
            <span className="text-[9px] bg-[#111c14] text-[#d6e5d8] px-1 rounded font-bold">f(x)</span>
          </div>
          <div className="my-auto">
            <div className="text-[15px] font-black text-[#050e07] break-words">
              f(x) = {fxExpr || ''}
              <span className="inline-block w-1.5 h-3.5 bg-[#0a120c] animate-pulse ml-0.5" />
            </div>
          </div>
          <div className="border-t border-[#7d9482] pt-0.5 flex items-center justify-between text-[9px]">
            <span>Nhập biểu thức x rồi bấm [ = ]</span>
            <button
              type="button"
              onClick={() => {
                setInputBuffer(String(startVal));
                setStep('INPUT_START');
              }}
              className="px-1.5 py-0.2 bg-[#111c14] text-[#d6e5d8] rounded font-bold"
            >
              [ = ] Tiếp
            </button>
          </div>
        </div>
      )}

      {/* 2. START */}
      {step === 'INPUT_START' && (
        <div className="flex flex-col justify-between h-full p-0.5">
          <div className="text-[10px] font-black border-b border-[#7d9482] pb-0.5">
            <span>Table Range: Điểm bắt đầu (Start)</span>
          </div>
          <div className="my-auto flex items-baseline space-x-2 text-[16px] font-black">
            <span>Start =</span>
            <span className="text-[20px] bg-[#8aa08f] px-2 rounded border border-[#6b8070]">
              {inputBuffer || startVal}
              <span className="inline-block w-1.5 h-4 bg-[#0a120c] animate-pulse ml-0.5" />
            </span>
          </div>
          <div className="border-t border-[#7d9482] pt-0.5 flex justify-between text-[9px]">
            <span>Gõ số rồi bấm [ = ]</span>
            <button
              type="button"
              onClick={() => {
                const val = inputBuffer ? parseFloat(inputBuffer) : startVal;
                setStartVal(isNaN(val) ? 1 : val);
                setInputBuffer(String(endVal));
                setStep('INPUT_END');
              }}
              className="px-1.5 py-0.2 bg-[#111c14] text-[#d6e5d8] rounded font-bold"
            >
              [ = ] Tiếp
            </button>
          </div>
        </div>
      )}

      {/* 3. END */}
      {step === 'INPUT_END' && (
        <div className="flex flex-col justify-between h-full p-0.5">
          <div className="text-[10px] font-black border-b border-[#7d9482] pb-0.5">
            <span>Table Range: Điểm kết thúc (End)</span>
          </div>
          <div className="my-auto flex items-baseline space-x-2 text-[16px] font-black">
            <span>End =</span>
            <span className="text-[20px] bg-[#8aa08f] px-2 rounded border border-[#6b8070]">
              {inputBuffer || endVal}
              <span className="inline-block w-1.5 h-4 bg-[#0a120c] animate-pulse ml-0.5" />
            </span>
          </div>
          <div className="border-t border-[#7d9482] pt-0.5 flex justify-between text-[9px]">
            <span>Gõ số rồi bấm [ = ]</span>
            <button
              type="button"
              onClick={() => {
                const val = inputBuffer ? parseFloat(inputBuffer) : endVal;
                setEndVal(isNaN(val) ? 5 : val);
                setInputBuffer(String(stepVal));
                setStep('INPUT_STEP');
              }}
              className="px-1.5 py-0.2 bg-[#111c14] text-[#d6e5d8] rounded font-bold"
            >
              [ = ] Tiếp
            </button>
          </div>
        </div>
      )}

      {/* 4. STEP */}
      {step === 'INPUT_STEP' && (
        <div className="flex flex-col justify-between h-full p-0.5">
          <div className="text-[10px] font-black border-b border-[#7d9482] pb-0.5">
            <span>Table Range: Bước nhảy (Step)</span>
          </div>
          <div className="my-auto flex items-baseline space-x-2 text-[16px] font-black">
            <span>Step =</span>
            <span className="text-[20px] bg-[#8aa08f] px-2 rounded border border-[#6b8070]">
              {inputBuffer || stepVal}
              <span className="inline-block w-1.5 h-4 bg-[#0a120c] animate-pulse ml-0.5" />
            </span>
          </div>
          <div className="border-t border-[#7d9482] pt-0.5 flex justify-between text-[9px]">
            <span>Gõ bước nhảy rồi bấm [ = ]</span>
            <button
              type="button"
              onClick={() => {
                const val = inputBuffer ? parseFloat(inputBuffer) : stepVal;
                const finalStep = isNaN(val) || val <= 0 ? 1 : val;
                setStepVal(finalStep);
                computeTable(fxExpr, startVal, endVal, finalStep);
              }}
              className="px-1.5 py-0.2 bg-[#111c14] text-[#d6e5d8] rounded font-bold"
            >
              [ = ] Lập bảng
            </button>
          </div>
        </div>
      )}

      {/* 5. VIEW TABLE */}
      {step === 'VIEW_TABLE' && (
        <div className="flex flex-col justify-between h-full">
          <div className="text-[10px] font-bold border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span className="truncate max-w-[150px]">f(x) = {fxExpr}</span>
            <span className="text-[9px] bg-[#111c14] text-[#d6e5d8] px-1 rounded font-black">
              ▲▼ #{cursorIdx + 1}/{rows.length}
            </span>
          </div>

          {/* Table display */}
          <div className="my-0.5 overflow-y-auto max-h-[60px] text-[11px] font-mono">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="text-[9px] border-b border-[#7d9482] opacity-75">
                  <th className="w-6 p-0.5">#</th>
                  <th className="p-0.5">x</th>
                  <th className="p-0.5">f(x)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => {
                  const isActive = cursorIdx === idx;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setCursorIdx(idx)}
                      className={`cursor-pointer ${
                        isActive
                          ? 'bg-[#111c14] text-[#d6e5d8] font-black'
                          : 'hover:bg-[#8aa08f]'
                      }`}
                    >
                      <td className="p-0.5 text-[8px] opacity-70">{idx + 1}</td>
                      <td className="p-0.5 font-bold border-x border-[#7d9482]/30">{r.x}</td>
                      <td className="p-0.5 font-bold">{r.fx}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="border-t border-[#7d9482] pt-0.5 flex items-center justify-between text-[9px]">
            <span>[▲▼] Cuộn bảng giá trị</span>
            <button
              type="button"
              onClick={() => setStep('INPUT_FUNC')}
              className="font-bold px-1.5 py-0.2 bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] rounded"
            >
              [AC] Sửa f(x)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
