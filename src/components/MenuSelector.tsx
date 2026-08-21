import React from 'react';
import { CalcMode } from '../types';
import { 
  Calculator, 
  Binary, 
  Grid3X3, 
  Compass, 
  BarChart3, 
  Sigma, 
  Table, 
  Variable, 
  Scale, 
  Percent, 
  X,
  Layers
} from 'lucide-react';

interface MenuSelectorProps {
  currentMode: CalcMode;
  onSelectMode: (mode: CalcMode, label: string) => void;
  onClose: () => void;
}

interface MenuItem {
  id: CalcMode;
  code: string;
  title: string;
  vietnameseTitle: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}

export const MenuSelector: React.FC<MenuSelectorProps> = ({
  currentMode,
  onSelectMode,
  onClose,
}) => {
  const menuItems: MenuItem[] = [
    {
      id: 'calculate',
      code: '1',
      title: 'Calculate',
      vietnameseTitle: '1: Tính toán chuẩn',
      desc: 'Phân số, căn thức, đạo hàm d/dx, tích phân ∫, luỹ thừa, hàm lượng giác, chuỗi Σ',
      icon: <Calculator className="w-5 h-5" />,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'complex',
      code: '2',
      title: 'Complex',
      vietnameseTitle: '2: Số phức (i)',
      desc: 'Phép tính a+bi, môđun |z|, arg(z), liên hợp Conjg, dạng cực r∠θ',
      icon: <Layers className="w-5 h-5" />,
      color: 'from-purple-600 to-pink-600',
    },
    {
      id: 'base_n',
      code: '3',
      title: 'Base-N',
      vietnameseTitle: '3: Hệ đếm cơ số',
      desc: 'Chuyển đổi & tính toán DEC (10), HEX (16), BIN (2), OCT (8), logic AND/OR/XOR',
      icon: <Binary className="w-5 h-5" />,
      color: 'from-emerald-600 to-teal-600',
    },
    {
      id: 'matrix',
      code: '4',
      title: 'Matrix',
      vietnameseTitle: '4: Ma trận',
      desc: 'Ma trận MatA, MatB, MatC, MatD (1x1 - 4x4), định thức det, nghịch đảo A⁻¹, nhân',
      icon: <Grid3X3 className="w-5 h-5" />,
      color: 'from-amber-600 to-orange-600',
    },
    {
      id: 'vector',
      code: '5',
      title: 'Vector',
      vietnameseTitle: '5: Vectơ',
      desc: 'VctA, VctB, VctC (2D, 3D), tích vô hướng (Dot), tích có hướng (Cross), độ dài Norm',
      icon: <Compass className="w-5 h-5" />,
      color: 'from-cyan-600 to-blue-600',
    },
    {
      id: 'statistics',
      code: '6',
      title: 'Statistics',
      vietnameseTitle: '6: Thống kê',
      desc: 'Thống kê 1 biến (mean x̄, tổng Σx, phương sai, s, min, max, tứ phân vị Q1, Med, Q3)',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-green-600 to-emerald-600',
    },
    {
      id: 'distribution',
      code: '7',
      title: 'Distribution',
      vietnameseTitle: '7: Phân phối',
      desc: 'Phân phối chuẩn Normal PD/CD, nhị thức Binomial PD, Poisson',
      icon: <Sigma className="w-5 h-5" />,
      color: 'from-violet-600 to-purple-600',
    },
    {
      id: 'table',
      code: '8',
      title: 'Table',
      vietnameseTitle: '8: Bảng giá trị',
      desc: 'Sinh bảng giá trị hàm f(x), g(x) với khoảng Start, End, Step linh hoạt',
      icon: <Table className="w-5 h-5" />,
      color: 'from-rose-600 to-red-600',
    },
    {
      id: 'equation',
      code: '9',
      title: 'Equation / Func',
      vietnameseTitle: '9: Hệ PT & PT Bậc 2,3,4',
      desc: 'Hệ 2,3,4 ẩn & Giải PT bậc 2, bậc 3, bậc 4 (nghiệm thực, nghiệm phức, toạ độ đỉnh)',
      icon: <Variable className="w-5 h-5" />,
      color: 'from-sky-600 to-blue-700',
    },
    {
      id: 'inequality',
      code: 'A',
      title: 'Inequality',
      vietnameseTitle: 'A: Bất phương trình',
      desc: 'Bất phương trình bậc 2, bậc 3, bậc 4 dạng >, <, ≥, ≤',
      icon: <Scale className="w-5 h-5" />,
      color: 'from-orange-600 to-amber-700',
    },
    {
      id: 'ratio',
      code: 'B',
      title: 'Ratio',
      vietnameseTitle: 'B: Tỉ lệ thức',
      desc: 'Tính toán tỉ lệ A : B = X : D hoặc A : B = C : X',
      icon: <Percent className="w-5 h-5" />,
      color: 'from-fuchsia-600 to-pink-700',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-neutral-900 border border-neutral-700 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
            <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
              <span>MENU / MODE (fx-580VN X)</span>
            </h2>
          </div>
          <button
            id="close-menu-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh]">
          {menuItems.map(item => {
            const isCurrent = currentMode === item.id;
            return (
              <button
                key={item.id}
                id={`menu-item-${item.code}`}
                type="button"
                onClick={() => onSelectMode(item.id, item.vietnameseTitle)}
                className={`flex text-left items-start p-3.5 rounded-xl border transition-all duration-150 ${
                  isCurrent
                    ? 'border-amber-500 bg-neutral-800 ring-2 ring-amber-500/30'
                    : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800/80 hover:border-neutral-600'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md mr-3 mt-0.5`}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-100">{item.vietnameseTitle}</span>
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-neutral-800 text-amber-400 border border-neutral-700">
                      [{item.code}]
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Hint */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 text-xs text-neutral-400 flex items-center justify-between">
          <span>Nhấn phím số (1-9, A, B) hoặc click để chuyển nhanh chế độ.</span>
          <button
            id="menu-back-btn"
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-200 text-xs font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
