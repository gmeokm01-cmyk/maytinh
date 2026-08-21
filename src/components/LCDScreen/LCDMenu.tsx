import React, { useState, useEffect } from 'react';
import { CalcMode } from '../../types';

interface LCDMenuProps {
  onSelectMode: (mode: CalcMode, label: string) => void;
  onClose: () => void;
  keypadAction?: { action: string; timestamp: number } | null;
}

interface MenuItem {
  id: CalcMode;
  code: string;
  name: string;
  label: string;
  renderIcon: (isSelected: boolean) => React.ReactNode;
}

export const LCDMenu: React.FC<LCDMenuProps> = ({ onSelectMode, onClose, keypadAction }) => {
  // Page 1: 1..8 (4x2 grid), Page 2: 9, A, B (4x2 grid with 3 items)
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const menuItems: MenuItem[] = [
    // Page 1
    {
      id: 'calculate',
      code: '1',
      name: '1:Calculate',
      label: 'Mode 1: Tính toán chuẩn',
      renderIcon: () => (
        <div className="flex flex-col items-center justify-center font-bold text-[10px] leading-none space-y-0.5">
          <div className="flex space-x-1 text-[9px]">
            <span>+</span>
            <span>-</span>
          </div>
          <div className="flex space-x-1 text-[9px]">
            <span>×</span>
            <span>÷</span>
          </div>
        </div>
      ),
    },
    {
      id: 'complex',
      code: '2',
      name: '2:Complex',
      label: 'Mode 2: Số phức',
      renderIcon: () => (
        <div className="flex items-center justify-center space-x-1 font-serif text-[11px] font-black">
          <span className="italic">i</span>
          <span className="text-[12px] font-sans">∠</span>
        </div>
      ),
    },
    {
      id: 'base_n',
      code: '3',
      name: '3:Base-N',
      label: 'Mode 3: Hệ đếm cơ số',
      renderIcon: () => (
        <div className="grid grid-cols-2 gap-x-0.5 text-[8px] font-bold leading-tight text-center">
          <span>2</span>
          <span>8</span>
          <span>10</span>
          <span>16</span>
        </div>
      ),
    },
    {
      id: 'matrix',
      code: '4',
      name: '4:Matrix',
      label: 'Mode 4: Ma trận',
      renderIcon: () => (
        <div className="flex items-center justify-center font-mono text-[9px] font-black tracking-tighter">
          <span>[</span>
          <div className="grid grid-cols-2 gap-0.5 px-0.5">
            <span className="w-1 h-1 bg-current rounded-xs" />
            <span className="w-1 h-1 bg-current rounded-xs" />
            <span className="w-1 h-1 bg-current rounded-xs" />
            <span className="w-1 h-1 bg-current rounded-xs" />
          </div>
          <span>]</span>
        </div>
      ),
    },
    {
      id: 'vector',
      code: '5',
      name: '5:Vector',
      label: 'Mode 5: Vectơ',
      renderIcon: () => (
        <div className="flex items-center justify-center text-[15px] font-black">
          <span>↗</span>
        </div>
      ),
    },
    {
      id: 'statistics',
      code: '6',
      name: '6:Statistics',
      label: 'Mode 6: Thống kê',
      renderIcon: () => (
        <div className="flex items-end justify-center space-x-0.5 h-4">
          <span className="w-1 h-2 bg-current rounded-xs" />
          <span className="w-1 h-3.5 bg-current rounded-xs" />
          <span className="w-1 h-2.5 bg-current rounded-xs" />
        </div>
      ),
    },
    {
      id: 'distribution',
      code: '7',
      name: '7:Distribution',
      label: 'Mode 7: Phân phối',
      renderIcon: () => (
        <div className="flex items-center justify-center h-4 w-full">
          <svg className="w-6 h-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 16">
            <path d="M 2,14 C 7,14 9,2 12,2 C 15,2 17,14 22,14" />
            <line x1="1" y1="14" x2="23" y2="14" strokeWidth="1" />
          </svg>
        </div>
      ),
    },
    {
      id: 'table',
      code: '8',
      name: '8:Table',
      label: 'Mode 8: Bảng giá trị f(x)',
      renderIcon: () => (
        <div className="w-5 h-4 border border-current rounded-xs flex flex-col justify-between p-0.5">
          <div className="w-full h-0.5 bg-current opacity-70" />
          <div className="flex justify-between h-2">
            <div className="w-1.5 border-r border-current" />
            <div className="w-1.5" />
          </div>
        </div>
      ),
    },
    // Page 2
    {
      id: 'equation',
      code: '9',
      name: '9:Equation/Func',
      label: 'Mode 9: PT & Hệ phương trình',
      renderIcon: () => (
        <div className="text-[9px] font-serif font-black text-center leading-tight">
          <div>ax+b</div>
          <div>=0</div>
        </div>
      ),
    },
    {
      id: 'inequality',
      code: 'A',
      name: 'A:Inequality',
      label: 'Mode A: Bất phương trình',
      renderIcon: () => (
        <div className="text-[9px] font-serif font-black text-center leading-tight">
          <div>ax²</div>
          <div>&gt;0</div>
        </div>
      ),
    },
    {
      id: 'ratio',
      code: 'B',
      name: 'B:Ratio',
      label: 'Mode B: Tỉ lệ thức',
      renderIcon: () => (
        <div className="text-[8px] font-mono font-black text-center leading-tight">
          <div>A:B</div>
          <div>=X:D</div>
        </div>
      ),
    },
  ];

  const currentPage = selectedIdx >= 8 ? 2 : 1;
  const pageItems = currentPage === 1 ? menuItems.slice(0, 8) : menuItems.slice(8, 11);

  // Handle keypad navigation and direct number/letter selection
  useEffect(() => {
    if (!keypadAction) return;
    const { action } = keypadAction;

    if (action === 'AC' || action === 'MENU') {
      onClose();
      return;
    }

    if (action === '=' || action === 'EXE') {
      const selected = menuItems[selectedIdx];
      if (selected) {
        onSelectMode(selected.id, selected.label);
      }
      return;
    }

    // Direct key shortcuts: 1..9, A, B
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(action)) {
      const idx = parseInt(action, 10) - 1;
      const target = menuItems[idx];
      if (target) {
        onSelectMode(target.id, target.label);
      }
      return;
    }

    if (action === 'A' || action === '(-)') {
      const target = menuItems.find(m => m.code === 'A');
      if (target) onSelectMode(target.id, target.label);
      return;
    }

    if (action === 'B' || action === '°\'"') {
      const target = menuItems.find(m => m.code === 'B');
      if (target) onSelectMode(target.id, target.label);
      return;
    }

    // Arrow navigation
    if (action === 'RIGHT') {
      setSelectedIdx(prev => (prev + 1) % menuItems.length);
    } else if (action === 'LEFT') {
      setSelectedIdx(prev => (prev - 1 + menuItems.length) % menuItems.length);
    } else if (action === 'DOWN') {
      if (selectedIdx + 4 < menuItems.length) {
        setSelectedIdx(prev => prev + 4);
      } else if (selectedIdx < 8) {
        setSelectedIdx(8);
      }
    } else if (action === 'UP') {
      if (selectedIdx >= 4) {
        setSelectedIdx(prev => prev - 4);
      }
    }
  }, [keypadAction, selectedIdx, menuItems, onClose, onSelectMode]);

  const activeItem = menuItems[selectedIdx] || menuItems[0];

  return (
    <div className="w-full flex flex-col justify-between h-[126px] text-[#0a120c] font-mono select-none px-0.5">
      {/* Top page indicator */}
      <div className="flex items-center justify-between border-b border-[#7d9482] pb-0.5 text-[9px] font-bold">
        <span className="font-extrabold tracking-widest text-[9px]">
          MENU {currentPage}/2
        </span>
        <div className="flex items-center space-x-1">
          <span className="text-[10px] font-black opacity-80">
            {currentPage === 1 ? '▼' : '▲'}
          </span>
        </div>
      </div>

      {/* 2x4 Icon Matrix strictly formatted like Casio ClassWiz LCD */}
      <div className="grid grid-cols-4 gap-1.5 my-1">
        {pageItems.map((item, localIdx) => {
          const globalIdx = currentPage === 1 ? localIdx : 8 + localIdx;
          const isSelected = selectedIdx === globalIdx;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedIdx(globalIdx);
                onSelectMode(item.id, item.label);
              }}
              onMouseEnter={() => setSelectedIdx(globalIdx)}
              className={`relative h-[34px] rounded-xs flex flex-col items-center justify-center p-0.5 transition-colors border ${
                isSelected
                  ? 'bg-[#08120a] text-[#d6e5d8] border-[#08120a] shadow-sm'
                  : 'bg-[#91a794] text-[#08120a] border-[#7d9482] hover:bg-[#859c88]'
              }`}
            >
              {item.renderIcon(isSelected)}
              {/* Bottom right mode index number */}
              <span
                className={`absolute bottom-0.5 right-0.5 text-[8px] font-black leading-none ${
                  isSelected ? 'text-[#d6e5d8]' : 'text-[#08120a]'
                }`}
              >
                {item.code}
              </span>
            </button>
          );
        })}

        {/* Fill remaining empty cells on Page 2 */}
        {currentPage === 2 &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="h-[34px] rounded-xs border border-dashed border-[#859c88]/40 bg-transparent opacity-20"
            />
          ))}
      </div>

      {/* Bottom Mode Status Line: e.g. "8:Table" as seen in Casio ClassWiz LCD */}
      <div className="flex items-center justify-between border-t border-[#7d9482] pt-0.5 text-[13px] font-bold text-[#08120a] tracking-tight">
        <div className="flex items-center space-x-1">
          <span className="font-extrabold text-[14px]">{activeItem.name}</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[9px] opacity-70">
          <span>[=] OK</span>
          <span>[AC] Đóng</span>
        </div>
      </div>
    </div>
  );
};
