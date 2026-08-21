import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../../types';

interface LCDStatisticsProps {
  onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'timestampFormatted'>) => void;
  keypadAction: { action: string; timestamp: number } | null;
}

type StatStep = 'INPUT_TABLE' | 'SHOW_RESULT';

export const LCDStatistics: React.FC<LCDStatisticsProps> = ({ onSaveToHistory, keypadAction }) => {
  const [step, setStep] = useState<StatStep>('INPUT_TABLE');
  const [data, setData] = useState<Array<{ x: number; freq: number }>>([
    { x: 5, freq: 1 },
    { x: 6, freq: 2 },
    { x: 8, freq: 1 },
    { x: 9, freq: 1 },
  ]);

  const [curRow, setCurRow] = useState<number>(0);
  const [curCol, setCurCol] = useState<'x' | 'freq'>('x');
  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [resultCursor, setResultCursor] = useState<number>(0);

  // Compute 1-var statistics summary
  const computeStats = () => {
    const expanded: number[] = [];
    let sumX = 0;
    let sumX2 = 0;
    let totalN = 0;

    data.forEach(d => {
      const f = Math.max(1, Math.round(d.freq));
      for (let i = 0; i < f; i++) {
        expanded.push(d.x);
        sumX += d.x;
        sumX2 += d.x * d.x;
        totalN++;
      }
    });

    if (totalN === 0) return [];

    expanded.sort((a, b) => a - b);
    const mean = sumX / totalN;
    const variance = totalN > 1 ? (sumX2 - (sumX * sumX) / totalN) / (totalN - 1) : 0;
    const stdDev = Math.sqrt(variance);

    const min = expanded[0];
    const max = expanded[expanded.length - 1];
    const med =
      totalN % 2 === 1
        ? expanded[Math.floor(totalN / 2)]
        : (expanded[totalN / 2 - 1] + expanded[totalN / 2]) / 2;

    const q1 = expanded[Math.floor(totalN * 0.25)];
    const q3 = expanded[Math.floor(totalN * 0.75)];

    return [
      { label: 'x̄ (Trung bình)', val: Math.round(mean * 1000) / 1000 },
      { label: 'Σx (Tổng x)', val: sumX },
      { label: 'Σx² (Tổng x²)', val: sumX2 },
      { label: 'sx (Độ lệch chuẩn mẫu)', val: Math.round(stdDev * 1000) / 1000 },
      { label: 'n (Số phần tử)', val: totalN },
      { label: 'min(x) (Nhỏ nhất)', val: min },
      { label: 'Q1 (Tứ phân vị 1)', val: q1 },
      { label: 'Med (Trung vị)', val: med },
      { label: 'Q3 (Tứ phân vị 3)', val: q3 },
      { label: 'max(x) (Lớn nhất)', val: max },
    ];
  };

  const statResults = computeStats();

  useEffect(() => {
    if (!keypadAction) return;
    const { action } = keypadAction;

    if (action === 'AC') {
      if (step === 'SHOW_RESULT') {
        setStep('INPUT_TABLE');
      } else {
        setInputBuffer('');
      }
      return;
    }

    if (action === 'OPTN' || action === 'CALC') {
      if (step === 'INPUT_TABLE') {
        setStep('SHOW_RESULT');
        setResultCursor(0);
        const mean = statResults[0]?.val ?? 0;
        onSaveToHistory({
          mode: 'statistics',
          modeLabel: 'Mode 6: Thống kê 1 biến',
          expression: `1-Variable Statistics (${data.length} hàng)`,
          displayExpression: '1-Var Statistics',
          result: `x̄=${mean}`,
          category: 'Standard',
        });
      }
      return;
    }

    if (step === 'INPUT_TABLE') {
      if (action >= '0' && action <= '9') {
        setInputBuffer(prev => prev + action);
      } else if (action === 'NEG' || action === '-') {
        setInputBuffer(prev => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
      } else if (action === '.') {
        setInputBuffer(prev => (prev.includes('.') ? prev : prev + '.'));
      } else if (action === 'DEL') {
        setInputBuffer(prev => prev.slice(0, -1));
      } else if (action === '=') {
        const val = inputBuffer ? parseFloat(inputBuffer) : data[curRow]?.[curCol] ?? 0;
        const next = [...data];
        if (!next[curRow]) next[curRow] = { x: 0, freq: 1 };
        next[curRow][curCol] = isNaN(val) ? 0 : val;
        setData(next);
        setInputBuffer('');

        if (curCol === 'x') {
          setCurCol('freq');
        } else {
          setCurCol('x');
          if (curRow + 1 < data.length) {
            setCurRow(prev => prev + 1);
          } else if (data.length < 15) {
            setData(prev => [...prev, { x: 0, freq: 1 }]);
            setCurRow(prev => prev + 1);
          }
        }
      } else if (action === 'LEFT') setCurCol('x');
      else if (action === 'RIGHT') setCurCol('freq');
      else if (action === 'UP' && curRow > 0) setCurRow(prev => prev - 1);
      else if (action === 'DOWN' && curRow < data.length - 1) setCurRow(prev => prev + 1);
      return;
    }

    if (step === 'SHOW_RESULT') {
      if (action === 'DOWN' || action === '=') {
        setResultCursor(prev => (prev + 1 < statResults.length ? prev + 1 : prev));
      } else if (action === 'UP') {
        setResultCursor(prev => (prev > 0 ? prev - 1 : 0));
      }
    }
  }, [keypadAction, step, data, curRow, curCol, inputBuffer, statResults, onSaveToHistory]);

  return (
    <div className="w-full h-[120px] flex flex-col justify-between text-[#0a120c] font-mono select-none overflow-hidden">
      {step === 'INPUT_TABLE' ? (
        <div className="flex flex-col justify-between h-full">
          <div className="text-[10px] font-bold border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span className="font-extrabold">1-Variable Statistics</span>
            <span className="text-[9px] bg-[#111c14] text-[#d6e5d8] px-1 rounded">
              #{curRow + 1} [{curCol}]
            </span>
          </div>

          {/* Table */}
          <div className="my-0.5 overflow-y-auto max-h-[60px] text-[11px] font-mono">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="text-[9px] border-b border-[#7d9482] opacity-75">
                  <th className="w-6 p-0.5">#</th>
                  <th className="p-0.5">x</th>
                  <th className="p-0.5">Freq</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, idx) => (
                  <tr key={idx}>
                    <td className="p-0.5 text-[8px] opacity-70">{idx + 1}</td>
                    <td
                      onClick={() => {
                        setCurRow(idx);
                        setCurCol('x');
                        setInputBuffer('');
                      }}
                      className={`p-0.5 font-bold cursor-pointer border-x border-[#7d9482]/30 ${
                        curRow === idx && curCol === 'x'
                          ? 'bg-[#111c14] text-[#d6e5d8] font-black'
                          : 'hover:bg-[#8aa08f]'
                      }`}
                    >
                      {d.x}
                    </td>
                    <td
                      onClick={() => {
                        setCurRow(idx);
                        setCurCol('freq');
                        setInputBuffer('');
                      }}
                      className={`p-0.5 font-bold cursor-pointer ${
                        curRow === idx && curCol === 'freq'
                          ? 'bg-[#111c14] text-[#d6e5d8] font-black'
                          : 'hover:bg-[#8aa08f]'
                      }`}
                    >
                      {d.freq}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit bar & OPTN */}
          <div className="border-t border-[#7d9482] pt-0.5 flex items-center justify-between text-[11px] font-black">
            <div className="flex items-center space-x-1">
              <span className="text-[10px] opacity-80">{curCol} =</span>
              <span className="text-[12px] bg-[#8aa08f] px-1 py-0.2 rounded border border-[#6b8070]">
                {inputBuffer || ((curCol === 'x' ? data[curRow]?.x : data[curRow]?.freq) ?? 0)}
                <span className="inline-block w-1.5 h-3 bg-[#0a120c] animate-pulse ml-0.5" />
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep('SHOW_RESULT');
                setResultCursor(0);
              }}
              className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#111c14] text-[#d6e5d8] hover:bg-black"
            >
              [OPTN] Tính toán
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full">
          <div className="text-[10px] font-bold border-b border-[#7d9482] pb-0.5 flex justify-between">
            <span className="font-extrabold">1-Var Calcs Result</span>
            <span className="text-[9px] bg-[#111c14] text-[#d6e5d8] px-1 rounded font-bold">
              ▲▼ #{resultCursor + 1}/{statResults.length}
            </span>
          </div>

          {/* Main item display */}
          <div className="my-auto px-1 py-1">
            <div className="text-[11px] font-bold opacity-80">
              {statResults[resultCursor]?.label}
            </div>
            <div className="text-right text-[22px] sm:text-[24px] font-black text-[#050e07]">
              {statResults[resultCursor]?.val}
            </div>
          </div>

          <div className="border-t border-[#7d9482] pt-0.5 flex items-center justify-between text-[9px]">
            <span>[▲▼] Xem các chỉ số</span>
            <button
              type="button"
              onClick={() => setStep('INPUT_TABLE')}
              className="font-bold px-1.5 py-0.2 bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] rounded"
            >
              [AC] Sửa bảng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
