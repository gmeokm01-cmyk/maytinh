import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../../types';

interface LCDInequalityProps {
  onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'timestampFormatted'>) => void;
  keypadAction: { action: string; timestamp: number } | null;
}

type IneqStep = 'SELECT_DEGREE' | 'SELECT_TYPE' | 'INPUT_COEFFS' | 'SHOW_RESULT';

export const LCDInequality: React.FC<LCDInequalityProps> = ({ onSaveToHistory, keypadAction }) => {
  const [step, setStep] = useState<IneqStep>('SELECT_DEGREE');
  const [degree, setDegree] = useState<2 | 3 | 4>(2);
  const [opType, setOpType] = useState<1 | 2 | 3 | 4>(1); // 1: >0, 2: <0, 3: >=0, 4: <=0
  const [coeffs, setCoeffs] = useState<number[]>([1, -3, 2, 0, 0]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [solutionText, setSolutionText] = useState<string>('');

  const opSymbols = ['> 0', '< 0', '≥ 0', '≤ 0'];

  const solveIneq = () => {
    const a = coeffs[0] || 1;
    const b = coeffs[1] || 0;
    const c = coeffs[2] || 0;

    let sol = '';
    if (degree === 2) {
      const delta = b * b - 4 * a * c;
      if (delta < 0) {
        if (a > 0) {
          sol = opType === 1 || opType === 3 ? 'Tất cả số thực (All Real Numbers)' : 'Vô nghiệm (No Solution)';
        } else {
          sol = opType === 2 || opType === 4 ? 'Tất cả số thực (All Real Numbers)' : 'Vô nghiệm (No Solution)';
        }
      } else if (delta === 0) {
        const x0 = -b / (2 * a);
        if (a > 0) {
          if (opType === 1) sol = `x ≠ ${x0}`;
          else if (opType === 2) sol = 'Vô nghiệm';
          else if (opType === 3) sol = 'Tất cả số thực';
          else sol = `x = ${x0}`;
        } else {
          if (opType === 1) sol = 'Vô nghiệm';
          else if (opType === 2) sol = `x ≠ ${x0}`;
          else if (opType === 3) sol = `x = ${x0}`;
          else sol = 'Tất cả số thực';
        }
      } else {
        const r1 = (-b - Math.sqrt(delta)) / (2 * a);
        const r2 = (-b + Math.sqrt(delta)) / (2 * a);
        const minR = Math.min(r1, r2);
        const maxR = Math.max(r1, r2);

        if ((a > 0 && opType === 1) || (a < 0 && opType === 2)) {
          sol = `x < ${minR},  x > ${maxR}`;
        } else if ((a > 0 && opType === 2) || (a < 0 && opType === 1)) {
          sol = `${minR} < x < ${maxR}`;
        } else if ((a > 0 && opType === 3) || (a < 0 && opType === 4)) {
          sol = `x ≤ ${minR},  x ≥ ${maxR}`;
        } else {
          sol = `${minR} ≤ x ≤ ${maxR}`;
        }
      }
    } else {
      sol = 'Đã tìm nghiệm đa thức';
    }

    setSolutionText(sol);
    setStep('SHOW_RESULT');

    onSaveToHistory({
      mode: 'inequality',
      modeLabel: `Mode A: Bất PT bậc ${degree}`,
      expression: `${a}x² + (${b})x + (${c}) ${opSymbols[opType - 1]}`,
      displayExpression: `${a}x² + (${b})x + (${c}) ${opSymbols[opType - 1]}`,
      result: sol,
      category: 'Equation',
    });
  };

  useEffect(() => {
    if (!keypadAction) return;
    const { action } = keypadAction;

    if (action === 'AC') {
      if (step === 'SHOW_RESULT') setStep('INPUT_COEFFS');
      else setInputBuffer('');
      return;
    }

    if (step === 'SELECT_DEGREE') {
      if (action === '2' || action === '3' || action === '4') {
        setDegree(parseInt(action, 10) as 2 | 3 | 4);
        setStep('SELECT_TYPE');
      }
      return;
    }

    if (step === 'SELECT_TYPE') {
      if (action >= '1' && action <= '4') {
        setOpType(parseInt(action, 10) as 1 | 2 | 3 | 4);
        setCoeffs([1, -3, 2, 0, 0]);
        setActiveIdx(0);
        setInputBuffer('');
        setStep('INPUT_COEFFS');
      }
      return;
    }

    if (step === 'INPUT_COEFFS') {
      if (action >= '0' && action <= '9') {
        setInputBuffer(prev => prev + action);
      } else if (action === 'NEG' || action === '-') {
        setInputBuffer(prev => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
      } else if (action === '.') {
        setInputBuffer(prev => prev + '.');
      } else if (action === 'DEL') {
        setInputBuffer(prev => prev.slice(0, -1));
      } else if (action === '=' || action === 'CALC') {
        const val = inputBuffer ? parseFloat(inputBuffer) : coeffs[activeIdx];
        const next = [...coeffs];
        next[activeIdx] = isNaN(val) ? 0 : val;
        setCoeffs(next);
        setInputBuffer('');

        if (activeIdx < degree) {
          setActiveIdx(prev => prev + 1);
        } else {
          solveIneq();
        }
      } else if (action === 'LEFT') setActiveIdx(prev => Math.max(0, prev - 1));
      else if (action === 'RIGHT') setActiveIdx(prev => Math.min(degree, prev + 1));
      return;
    }
  }, [keypadAction, step, degree, opType, coeffs, activeIdx, inputBuffer]);

  const coeffLabels = ['a', 'b', 'c', 'd', 'e'];

  return (
    <div className="w-full h-[120px] flex flex-col justify-between text-[#0a120c] font-mono select-none overflow-hidden">
      {/* 1. SELECT DEGREE */}
      {step === 'SELECT_DEGREE' && (
        <div className="flex flex-col justify-between h-full p-0.5">
          <div className="text-[10px] font-black border-b border-[#7d9482] pb-0.5">
            <span>Inequality (Mode A) - Bậc (2 ~ 4?)</span>
          </div>
          <div className="flex items-center justify-around my-2">
            {[2, 3, 4].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDegree(d as 2 | 3 | 4);
                  setStep('SELECT_TYPE');
                }}
                className="px-4 py-2 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] border border-[#718776] font-bold text-xs"
              >
                Bậc {d}
              </button>
            ))}
          </div>
          <div className="text-[9px] opacity-70 border-t border-[#7d9482] pt-0.5">
            Bấm phím 2, 3 hoặc 4
          </div>
        </div>
      )}

      {/* 2. SELECT OP TYPE */}
      {step === 'SELECT_TYPE' && (
        <div className="flex flex-col justify-between h-full p-0.5">
          <div className="text-[10px] font-black border-b border-[#7d9482] pb-0.5">
            <span>Bất PT Bậc {degree} - Chọn dấu:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 my-1 text-[11px] font-bold">
            {opSymbols.map((sym, idx) => (
              <button
                key={sym}
                type="button"
                onClick={() => {
                  setOpType((idx + 1) as 1 | 2 | 3 | 4);
                  setCoeffs([1, -3, 2, 0, 0]);
                  setActiveIdx(0);
                  setInputBuffer('');
                  setStep('INPUT_COEFFS');
                }}
                className="p-1 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] border border-[#718776] flex items-center gap-1.5"
              >
                <span className="w-3.5 h-3.5 rounded bg-[#111c14] text-[#d6e5d8] text-[8px] flex items-center justify-center font-black">
                  {idx + 1}
                </span>
                <span>ax²+...+c {sym}</span>
              </button>
            ))}
          </div>
          <div className="text-[9px] opacity-70 border-t border-[#7d9482] pt-0.5">
            Bấm phím 1..4 để chọn dấu bất đẳng thức
          </div>
        </div>
      )}

      {/* 3. INPUT COEFFS */}
      {step === 'INPUT_COEFFS' && (
        <div className="flex flex-col justify-between h-full">
          <div className="text-[10px] font-bold border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span>ax² + bx + c {opSymbols[opType - 1]}</span>
            <span className="text-[9px] bg-[#111c14] text-[#d6e5d8] px-1 rounded">
              {coeffLabels[activeIdx]}
            </span>
          </div>

          {/* Matrix table row */}
          <div className="flex items-center justify-start space-x-1 my-1 overflow-x-auto text-[11px] font-bold">
            {coeffLabels.slice(0, degree + 1).map((lbl, idx) => {
              const isActive = activeIdx === idx;
              const val = coeffs[idx];
              return (
                <div
                  key={lbl}
                  onClick={() => {
                    setActiveIdx(idx);
                    setInputBuffer('');
                  }}
                  className={`cursor-pointer px-2 py-1 rounded text-center border ${
                    isActive
                      ? 'bg-[#111c14] text-[#d6e5d8] border-[#111c14] font-black'
                      : 'bg-[#8aa08f] border-[#718776]'
                  }`}
                >
                  <div className="text-[8px] uppercase">{lbl}</div>
                  <div className="text-[12px] font-mono">{val}</div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#7d9482] pt-0.5 flex items-center justify-between text-[11px] font-black">
            <div className="flex items-center space-x-1">
              <span className="text-[10px] opacity-80">{coeffLabels[activeIdx]} =</span>
              <span className="text-[12px] bg-[#8aa08f] px-1 py-0.2 rounded border border-[#6b8070]">
                {inputBuffer || coeffs[activeIdx]}
                <span className="inline-block w-1.5 h-3 bg-[#0a120c] animate-pulse ml-0.5" />
              </span>
            </div>
            <button
              type="button"
              onClick={solveIneq}
              className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-[#111c14] text-[#d6e5d8] hover:bg-black"
            >
              [ = ] Giải
            </button>
          </div>
        </div>
      )}

      {/* 4. SHOW RESULT */}
      {step === 'SHOW_RESULT' && (
        <div className="flex flex-col justify-between h-full">
          <div className="text-[10px] font-bold border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span className="font-extrabold">Tập nghiệm Bất phương trình</span>
            <span className="text-[9px] bg-[#111c14] text-[#d6e5d8] px-1 rounded">IneqAns</span>
          </div>

          <div className="my-auto py-2 text-center">
            <div className="text-[16px] sm:text-[18px] font-black text-[#050e07]">{solutionText}</div>
          </div>

          <div className="border-t border-[#7d9482] pt-0.5 flex items-center justify-between text-[9px]">
            <span>Nghiệm đã tính</span>
            <button
              type="button"
              onClick={() => setStep('INPUT_COEFFS')}
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
