import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../../types';
import { vectorDot, vectorCross, vectorNorm, vectorAngle } from '../../utils/vectorEngine';

interface LCDVectorProps {
  onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'timestampFormatted'>) => void;
  keypadAction: { action: string; timestamp: number } | null;
}

type VctStep = 'SELECT_VCT' | 'SELECT_DIM' | 'INPUT_VCT' | 'OPTN_MENU' | 'SHOW_RESULT';

export const LCDVector: React.FC<LCDVectorProps> = ({ onSaveToHistory, keypadAction }) => {
  const [step, setStep] = useState<VctStep>('SELECT_VCT');
  const [activeVctName, setActiveVctName] = useState<'VctA' | 'VctB' | 'VctC' | 'VctD'>('VctA');
  const [dim, setDim] = useState<2 | 3>(3);

  const [vectors, setVectors] = useState<Record<string, number[]>>({
    VctA: [1, 2, 3],
    VctB: [4, 5, 6],
  });

  const [curIdx, setCurIdx] = useState<number>(0);
  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [resultText, setResultText] = useState<string>('');

  useEffect(() => {
    if (!keypadAction) return;
    const { action } = keypadAction;

    if (action === 'OPTN') {
      setStep('OPTN_MENU');
      return;
    }

    if (action === 'AC') {
      if (step === 'SHOW_RESULT' || step === 'OPTN_MENU') {
        setStep('INPUT_VCT');
      } else {
        setInputBuffer('');
      }
      return;
    }

    if (step === 'SELECT_VCT') {
      if (action === '1') { setActiveVctName('VctA'); setStep('SELECT_DIM'); }
      else if (action === '2') { setActiveVctName('VctB'); setStep('SELECT_DIM'); }
      else if (action === '3') { setActiveVctName('VctC'); setStep('SELECT_DIM'); }
      else if (action === '4') { setActiveVctName('VctD'); setStep('SELECT_DIM'); }
      return;
    }

    if (step === 'SELECT_DIM') {
      if (action === '2' || action === '3') {
        const d = parseInt(action, 10) as 2 | 3;
        setDim(d);
        setVectors(prev => ({ ...prev, [activeVctName]: Array(d).fill(0) }));
        setCurIdx(0);
        setStep('INPUT_VCT');
      }
      return;
    }

    if (step === 'INPUT_VCT') {
      if (action >= '0' && action <= '9') {
        setInputBuffer(prev => prev + action);
      } else if (action === 'NEG' || action === '-') {
        setInputBuffer(prev => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
      } else if (action === '.') {
        setInputBuffer(prev => (prev.includes('.') ? prev : prev + '.'));
      } else if (action === 'DEL') {
        setInputBuffer(prev => prev.slice(0, -1));
      } else if (action === '=' || action === 'CALC') {
        const currentVal = inputBuffer ? parseFloat(inputBuffer) : vectors[activeVctName]?.[curIdx] ?? 0;
        const currentVct = vectors[activeVctName] || Array(dim).fill(0);
        const next = [...currentVct];
        next[curIdx] = isNaN(currentVal) ? 0 : currentVal;

        setVectors(prev => ({ ...prev, [activeVctName]: next }));
        setInputBuffer('');

        if (curIdx < dim - 1) {
          setCurIdx(prev => prev + 1);
        }
      } else if (action === 'LEFT' && curIdx > 0) setCurIdx(prev => prev - 1);
      else if (action === 'RIGHT' && curIdx < dim - 1) setCurIdx(prev => prev + 1);
      return;
    }

    if (step === 'OPTN_MENU') {
      const vA = vectors.VctA || [1, 0, 0];
      const vB = vectors.VctB || [0, 1, 0];

      if (action === '1') {
        // Dot product
        const dot = vectorDot(vA, vB);
        setResultText(`VctA • VctB = ${dot}`);
        setStep('SHOW_RESULT');
        onSaveToHistory({
          mode: 'vector',
          modeLabel: 'Mode 5: Tích vô hướng Vectơ',
          expression: 'VctA • VctB',
          displayExpression: 'VctA • VctB',
          result: `${dot}`,
          category: 'Vector',
        });
      } else if (action === '2') {
        // Cross product
        const cross = vectorCross(vA, vB);
        setResultText(`VctA × VctB = [${cross.join(', ')}]`);
        setStep('SHOW_RESULT');
        onSaveToHistory({
          mode: 'vector',
          modeLabel: 'Mode 5: Tích có hướng Vectơ',
          expression: 'VctA × VctB',
          displayExpression: 'VctA × VctB',
          result: `[${cross.join(', ')}]`,
          category: 'Vector',
        });
      } else if (action === '3') {
        // Norm
        const norm = vectorNorm(vectors[activeVctName] || [1, 0, 0]);
        setResultText(`|${activeVctName}| = ${Math.round(norm * 1000) / 1000}`);
        setStep('SHOW_RESULT');
      } else if (action === '4') {
        // Angle
        const ang = vectorAngle(vA, vB);
        setResultText(`∠(VctA, VctB) = ${Math.round(ang * 100) / 100}°`);
        setStep('SHOW_RESULT');
      }
    }
  }, [keypadAction, step, activeVctName, dim, vectors, curIdx, inputBuffer, onSaveToHistory]);

  const coordLabels = ['x', 'y', 'z'];

  return (
    <div className="w-full h-[120px] flex flex-col justify-between text-[#0a120c] font-mono select-none overflow-hidden">
      {/* 1. SELECT VCT */}
      {step === 'SELECT_VCT' && (
        <div className="flex flex-col justify-between h-full p-0.5">
          <div className="text-[10px] font-black border-b border-[#7d9482] pb-0.5">
            <span>Vector (Mode 5) - Chọn Vectơ:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 my-1 text-[11px] font-bold">
            {(['VctA', 'VctB', 'VctC', 'VctD'] as const).map((v, idx) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setActiveVctName(v);
                  setStep('SELECT_DIM');
                }}
                className="p-1 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] border border-[#718776] flex items-center gap-1.5"
              >
                <span className="w-3.5 h-3.5 rounded bg-[#111c14] text-[#d6e5d8] text-[8px] flex items-center justify-center font-black">
                  {idx + 1}
                </span>
                <span>{v}</span>
              </button>
            ))}
          </div>
          <div className="text-[9px] opacity-70 border-t border-[#7d9482] pt-0.5">
            Bấm phím 1..4 để chọn vectơ
          </div>
        </div>
      )}

      {/* 2. SELECT DIM */}
      {step === 'SELECT_DIM' && (
        <div className="flex flex-col justify-between h-full p-0.5">
          <div className="text-[10px] font-black border-b border-[#7d9482] pb-0.5">
            <span>{activeVctName} - Chiều không gian (2 hoặc 3)?</span>
          </div>
          <div className="flex items-center justify-around my-2">
            {[2, 3].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDim(d as 2 | 3);
                  setVectors(prev => ({ ...prev, [activeVctName]: Array(d).fill(0) }));
                  setCurIdx(0);
                  setStep('INPUT_VCT');
                }}
                className="px-4 py-2 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] border border-[#718776] font-bold text-xs"
              >
                {d} Chiều ({d === 2 ? '2D' : '3D'})
              </button>
            ))}
          </div>
          <div className="text-[9px] opacity-70 border-t border-[#7d9482] pt-0.5">
            Bấm phím 2 hoặc 3 trên bàn phím
          </div>
        </div>
      )}

      {/* 3. INPUT VCT */}
      {step === 'INPUT_VCT' && (
        <div className="flex flex-col justify-between h-full">
          <div className="text-[10px] font-bold border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span className="font-extrabold">{activeVctName} ({dim}D)</span>
            <span className="text-[9px] bg-[#111c14] text-[#d6e5d8] px-1 rounded">
              {coordLabels[curIdx]}
            </span>
          </div>

          <div className="flex items-center justify-center space-x-2 my-1">
            {coordLabels.slice(0, dim).map((coord, idx) => {
              const isActive = curIdx === idx;
              const val = vectors[activeVctName]?.[idx] ?? 0;
              return (
                <div
                  key={coord}
                  onClick={() => {
                    setCurIdx(idx);
                    setInputBuffer('');
                  }}
                  className={`cursor-pointer px-3 py-1 rounded text-center border ${
                    isActive
                      ? 'bg-[#111c14] text-[#d6e5d8] border-[#111c14] font-black'
                      : 'bg-[#8aa08f] border-[#718776]'
                  }`}
                >
                  <div className="text-[8px] uppercase">{coord}</div>
                  <div className="text-[14px] font-mono">{val}</div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#7d9482] pt-0.5 flex items-center justify-between text-[11px] font-black">
            <div className="flex items-center space-x-1">
              <span className="text-[10px] opacity-80">{coordLabels[curIdx]} =</span>
              <span className="text-[12px] bg-[#8aa08f] px-1 py-0.2 rounded border border-[#6b8070]">
                {inputBuffer || (vectors[activeVctName]?.[curIdx] ?? 0)}
                <span className="inline-block w-1.5 h-3 bg-[#0a120c] animate-pulse ml-0.5" />
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep('OPTN_MENU')}
              className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#111c14] text-[#d6e5d8] hover:bg-black"
            >
              [OPTN] Tính toán
            </button>
          </div>
        </div>
      )}

      {/* 4. OPTN MENU */}
      {step === 'OPTN_MENU' && (
        <div className="flex flex-col justify-between h-full p-0.5">
          <div className="text-[10px] font-black border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span>Vector OPTN Phép tính</span>
            <span className="opacity-75 text-[9px]">Bấm 1..4:</span>
          </div>
          <div className="grid grid-cols-2 gap-1 my-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => {
                const dot = vectorDot(vectors.VctA || [1,0,0], vectors.VctB || [0,1,0]);
                setResultText(`VctA • VctB = ${dot}`);
                setStep('SHOW_RESULT');
              }}
              className="p-1 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] text-left"
            >
              1: Tích vô hướng (•)
            </button>
            <button
              type="button"
              onClick={() => {
                const cross = vectorCross(vectors.VctA || [1,0,0], vectors.VctB || [0,1,0]);
                setResultText(`VctA × VctB = [${cross.join(', ')}]`);
                setStep('SHOW_RESULT');
              }}
              className="p-1 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] text-left"
            >
              2: Tích có hướng (×)
            </button>
            <button
              type="button"
              onClick={() => {
                const norm = vectorNorm(vectors[activeVctName] || [1,0,0]);
                setResultText(`|${activeVctName}| = ${Math.round(norm * 1000) / 1000}`);
                setStep('SHOW_RESULT');
              }}
              className="p-1 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] text-left"
            >
              3: Độ dài |Vct|
            </button>
            <button
              type="button"
              onClick={() => {
                const ang = vectorAngle(vectors.VctA || [1,0,0], vectors.VctB || [0,1,0]);
                setResultText(`∠(VctA, VctB) = ${Math.round(ang * 100) / 100}°`);
                setStep('SHOW_RESULT');
              }}
              className="p-1 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] text-left"
            >
              4: Góc ∠(A, B)
            </button>
          </div>
          <div className="text-[9px] opacity-70 border-t border-[#7d9482] pt-0.5">
            [AC] Quay lại vectơ
          </div>
        </div>
      )}

      {/* 5. SHOW RESULT */}
      {step === 'SHOW_RESULT' && (
        <div className="flex flex-col justify-between h-full">
          <div className="text-[10px] font-bold border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span className="font-extrabold">Kết quả Vectơ</span>
            <span className="text-[9px] bg-[#111c14] text-[#d6e5d8] px-1 rounded">VctAns</span>
          </div>

          <div className="my-auto text-center py-2">
            <div className="text-[18px] sm:text-[20px] font-black text-[#050e07]">{resultText}</div>
          </div>

          <div className="border-t border-[#7d9482] pt-0.5 flex items-center justify-between text-[9px]">
            <span>VctAns đã lưu</span>
            <button
              type="button"
              onClick={() => setStep('INPUT_VCT')}
              className="font-bold px-1.5 py-0.2 bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] rounded"
            >
              [AC] Sửa toạ độ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
