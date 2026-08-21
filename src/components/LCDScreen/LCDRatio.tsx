import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../../types';

interface LCDRatioProps {
  onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'timestampFormatted'>) => void;
  keypadAction: { action: string; timestamp: number } | null;
}

type RatioStep = 'SELECT_TYPE' | 'INPUT_VALS' | 'SHOW_RESULT';

export const LCDRatio: React.FC<LCDRatioProps> = ({ onSaveToHistory, keypadAction }) => {
  const [step, setStep] = useState<RatioStep>('SELECT_TYPE');
  const [ratioType, setRatioType] = useState<1 | 2>(1); // 1: A:B = X:D, 2: A:B = C:X
  const [values, setValues] = useState<{ A: number; B: number; C: number; D: number }>({
    A: 2,
    B: 3,
    C: 4,
    D: 6,
  });
  const [activeKey, setActiveKey] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [xResult, setXResult] = useState<number | string>(4);

  const solveRatio = () => {
    let res = 0;
    if (ratioType === 1) {
      // A : B = X : D => X = (A * D) / B
      if (values.B === 0) {
        setXResult('ERROR (B=0)');
      } else {
        res = (values.A * values.D) / values.B;
        setXResult(Math.round(res * 1000) / 1000);
      }
    } else {
      // A : B = C : X => X = (B * C) / A
      if (values.A === 0) {
        setXResult('ERROR (A=0)');
      } else {
        res = (values.B * values.C) / values.A;
        setXResult(Math.round(res * 1000) / 1000);
      }
    }
    setStep('SHOW_RESULT');

    onSaveToHistory({
      mode: 'ratio',
      modeLabel: 'Mode B: Tỉ lệ thức',
      expression: ratioType === 1 ? `${values.A}:${values.B} = X:${values.D}` : `${values.A}:${values.B} = ${values.C}:X`,
      displayExpression: 'Ratio',
      result: `X = ${res}`,
      category: 'Standard',
    });
  };

  useEffect(() => {
    if (!keypadAction) return;
    const { action } = keypadAction;

    if (action === 'AC') {
      if (step === 'SHOW_RESULT') setStep('INPUT_VALS');
      else setInputBuffer('');
      return;
    }

    if (step === 'SELECT_TYPE') {
      if (action === '1') {
        setRatioType(1);
        setActiveKey('A');
        setInputBuffer('');
        setStep('INPUT_VALS');
      } else if (action === '2') {
        setRatioType(2);
        setActiveKey('A');
        setInputBuffer('');
        setStep('INPUT_VALS');
      }
      return;
    }

    if (step === 'INPUT_VALS') {
      if (action >= '0' && action <= '9') {
        setInputBuffer(prev => prev + action);
      } else if (action === 'NEG' || action === '-') {
        setInputBuffer(prev => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
      } else if (action === '.') {
        setInputBuffer(prev => (prev.includes('.') ? prev : prev + '.'));
      } else if (action === 'DEL') {
        setInputBuffer(prev => prev.slice(0, -1));
      } else if (action === '=' || action === 'CALC') {
        const val = inputBuffer ? parseFloat(inputBuffer) : values[activeKey];
        const next = { ...values, [activeKey]: isNaN(val) ? 0 : val };
        setValues(next);
        setInputBuffer('');

        if (ratioType === 1) {
          if (activeKey === 'A') setActiveKey('B');
          else if (activeKey === 'B') setActiveKey('D');
          else solveRatio();
        } else {
          if (activeKey === 'A') setActiveKey('B');
          else if (activeKey === 'B') setActiveKey('C');
          else solveRatio();
        }
      }
      return;
    }
  }, [keypadAction, step, ratioType, values, activeKey, inputBuffer]);

  return (
    <div className="w-full h-[120px] flex flex-col justify-between text-[#0a120c] font-mono select-none overflow-hidden">
      {/* 1. SELECT TYPE */}
      {step === 'SELECT_TYPE' && (
        <div className="flex flex-col justify-between h-full p-0.5">
          <div className="text-[10px] font-black border-b border-[#7d9482] pb-0.5">
            <span>Ratio (Mode B) - Chọn dạng tỉ lệ thức:</span>
          </div>
          <div className="space-y-1.5 my-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => {
                setRatioType(1);
                setActiveKey('A');
                setInputBuffer('');
                setStep('INPUT_VALS');
              }}
              className="w-full text-left p-1.5 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] border border-[#718776] flex items-center gap-2"
            >
              <span className="w-4 h-4 rounded bg-[#111c14] text-[#d6e5d8] text-[9px] flex items-center justify-center font-black">
                1
              </span>
              <span>1: A : B = X : D</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRatioType(2);
                setActiveKey('A');
                setInputBuffer('');
                setStep('INPUT_VALS');
              }}
              className="w-full text-left p-1.5 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] border border-[#718776] flex items-center gap-2"
            >
              <span className="w-4 h-4 rounded bg-[#111c14] text-[#d6e5d8] text-[9px] flex items-center justify-center font-black">
                2
              </span>
              <span>2: A : B = C : X</span>
            </button>
          </div>
          <div className="text-[9px] opacity-70 border-t border-[#7d9482] pt-0.5">
            Bấm phím 1 hoặc 2 để chọn dạng
          </div>
        </div>
      )}

      {/* 2. INPUT VALS */}
      {step === 'INPUT_VALS' && (
        <div className="flex flex-col justify-between h-full">
          <div className="text-[10px] font-bold border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span>{ratioType === 1 ? 'A : B = X : D' : 'A : B = C : X'}</span>
            <span className="text-[9px] bg-[#111c14] text-[#d6e5d8] px-1 rounded">Biến {activeKey}</span>
          </div>

          {/* Cards for values */}
          <div className="flex items-center justify-around my-1 text-[11px] font-bold">
            {(ratioType === 1 ? ['A', 'B', 'X', 'D'] : ['A', 'B', 'C', 'X']).map(k => {
              const isX = k === 'X';
              const isAct = activeKey === k;
              return (
                <div
                  key={k}
                  onClick={() => {
                    if (!isX) {
                      setActiveKey(k as any);
                      setInputBuffer('');
                    }
                  }}
                  className={`px-2 py-1 rounded text-center border ${
                    isX
                      ? 'bg-[#7a8f7e] text-[#111c14] border-dashed border-[#556658]'
                      : isAct
                      ? 'bg-[#111c14] text-[#d6e5d8] border-[#111c14] font-black'
                      : 'bg-[#8aa08f] border-[#718776] cursor-pointer'
                  }`}
                >
                  <div className="text-[8px] uppercase">{k}</div>
                  <div className="text-[12px] font-mono">
                    {isX ? '?' : values[k as 'A' | 'B' | 'C' | 'D']}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#7d9482] pt-0.5 flex items-center justify-between text-[11px] font-black">
            <div className="flex items-center space-x-1">
              <span className="text-[10px] opacity-80">{activeKey} =</span>
              <span className="text-[12px] bg-[#8aa08f] px-1 py-0.2 rounded border border-[#6b8070]">
                {inputBuffer || values[activeKey]}
                <span className="inline-block w-1.5 h-3 bg-[#0a120c] animate-pulse ml-0.5" />
              </span>
            </div>
            <button
              type="button"
              onClick={solveRatio}
              className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-[#111c14] text-[#d6e5d8] hover:bg-black"
            >
              [ = ] Giải
            </button>
          </div>
        </div>
      )}

      {/* 3. SHOW RESULT */}
      {step === 'SHOW_RESULT' && (
        <div className="flex flex-col justify-between h-full">
          <div className="text-[10px] font-bold border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span className="font-extrabold">Kết quả Tỉ lệ thức</span>
            <span className="text-[9px] bg-[#111c14] text-[#d6e5d8] px-1 rounded">X</span>
          </div>

          <div className="my-auto py-2 flex items-baseline justify-between px-3">
            <span className="text-[20px] font-black">X =</span>
            <span className="text-[26px] font-black text-[#050e07]">{xResult}</span>
          </div>

          <div className="border-t border-[#7d9482] pt-0.5 flex items-center justify-between text-[9px]">
            <span>Nghiệm X</span>
            <button
              type="button"
              onClick={() => setStep('INPUT_VALS')}
              className="font-bold px-1.5 py-0.2 bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] rounded"
            >
              [AC] Sửa số
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
