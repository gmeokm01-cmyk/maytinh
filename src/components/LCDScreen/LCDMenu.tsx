import React from 'react';
import { CalcMode } from '../../types';

interface LCDMenuProps {
  onSelectMode: (mode: CalcMode, label: string) => void;
  onClose: () => void;
}

export const LCDMenu: React.FC<LCDMenuProps> = ({ onSelectMode, onClose }) => {
  const modes: Array<{ id: CalcMode; code: string; label: string; name: string }> = [
    { id: 'calculate', code: '1', label: 'Mode 1: Tính toán', name: '1: Calculate' },
    { id: 'complex', code: '2', label: 'Mode 2: Số phức', name: '2: Complex' },
    { id: 'base_n', code: '3', label: 'Mode 3: Base-N', name: '3: Base-N' },
    { id: 'matrix', code: '4', label: 'Mode 4: Ma trận', name: '4: Matrix' },
    { id: 'vector', code: '5', label: 'Mode 5: Vectơ', name: '5: Vector' },
    { id: 'statistics', code: '6', label: 'Mode 6: Thống kê', name: '6: Statistics' },
    { id: 'distribution', code: '7', label: 'Mode 7: Phân phối', name: '7: Distribution' },
    { id: 'table', code: '8', label: 'Mode 8: Bảng giá trị', name: '8: Table' },
    { id: 'equation', code: '9', label: 'Mode 9: PT & Hệ PT', name: '9: Equation' },
    { id: 'inequality', code: 'A', label: 'Mode A: Bất PT', name: 'A: Inequality' },
    { id: 'ratio', code: 'B', label: 'Mode B: Tỉ lệ thức', name: 'B: Ratio' },
  ];

  return (
    <div className="w-full flex flex-col justify-between h-[120px] text-[#0a120c] font-mono select-none">
      <div className="flex items-center justify-between border-b border-[#7d9482] pb-0.5 text-[10px] font-bold">
        <span className="font-extrabold bg-[#111c14] text-[#d6e5d8] px-1 rounded text-[9px]">
          MENU / MODE
        </span>
        <span className="text-[10px] opacity-80">Bấm phím 1..9, A, B hoặc click:</span>
      </div>

      {/* Grid of Menu icons/items on LCD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1 my-1 overflow-y-auto max-h-[85px] pr-0.5 text-[11px] font-bold">
        {modes.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelectMode(m.id, m.label)}
            className="flex items-center space-x-1 p-1 rounded bg-[#8aa08f] hover:bg-[#111c14] hover:text-[#d6e5d8] border border-[#718776] text-left transition-colors active:scale-95"
          >
            <span className="w-4 h-4 rounded bg-[#111c14] text-[#d6e5d8] text-[9px] font-black flex items-center justify-center">
              {m.code}
            </span>
            <span className="truncate text-[10px] font-semibold">{m.name.split(': ')[1]}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-[9px] border-t border-[#7d9482] pt-0.5 opacity-70">
        <span>▲▼ Chọn chế độ</span>
        <button
          type="button"
          onClick={onClose}
          className="hover:underline font-bold text-[9px] px-1 bg-[#8aa08f] rounded"
        >
          [AC/ESC] Thoát
        </button>
      </div>
    </div>
  );
};
