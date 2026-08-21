import React from 'react';
import { HelpCircle, X, Keyboard, Sparkles, BookOpen, Layers } from 'lucide-react';

interface QuickHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickHelpModal: React.FC<QuickHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-neutral-900 border border-neutral-700 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-neutral-100">HƯỚNG DẪN SỬ DỤNG MÁY TÍNH FX-580VN X</h2>
          </div>
          <button
            id="close-help-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-neutral-300">
          {/* Section 1: Phím bấm & Thao tác */}
          <div className="space-y-2">
            <h3 className="font-bold text-amber-400 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Sparkles className="w-4 h-4" />
              <span>1. Quy tắc phím bấm cơ bản</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="font-bold text-amber-400">Phím SHIFT (Vàng):</span>
                <p className="text-neutral-400">
                  Nhấn SHIFT trước khi nhấn các phím có nhãn màu vàng ở trên (như sin⁻¹, ˣ√, Setup, Fact, Pol, Rec, v.v.)
                </p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="font-bold text-rose-400">Phím ALPHA (Đỏ/Hồng):</span>
                <p className="text-neutral-400">
                  Nhấn ALPHA để gõ biến số A, B, C, D, E, F, x, y, đơn vị ảo i, hằng số e hoặc dấu bằng = trong giải phương trình.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="font-bold text-cyan-400">Phím S⇔D:</span>
                <p className="text-neutral-400">
                  Chuyển đổi linh hoạt giữa dạng phân số chuẩn, căn thức exact và số thập phân tương đương.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="font-bold text-emerald-400">Phím STO / RCL:</span>
                <p className="text-neutral-400">
                  Lưu trữ kết quả Ans vào các thanh ghi biến số A, B, C, D, E, F, x, y, M hoặc gọi lại giá trị.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Danh sách các chế độ MENU */}
          <div className="space-y-2">
            <h3 className="font-bold text-amber-400 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Layers className="w-4 h-4" />
              <span>2. Toàn bộ 11 Chế độ (MENU)</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-300">
              <li><strong className="text-white">1: Calculate</strong> - Tính toán chuẩn, đạo hàm <code className="text-amber-300">d/dx</code>, tích phân <code className="text-amber-300">∫</code>, tổng <code className="text-amber-300">Σ</code>, GCD, LCM, logarit cơ số bất kỳ.</li>
              <li><strong className="text-white">2: Complex</strong> - Tính toán số phức, môđun <code className="text-amber-300">|z|</code>, arg(z), liên hợp và đổi sang dạng cực.</li>
              <li><strong className="text-white">3: Base-N</strong> - Chuyển đổi và tính toán hệ nhị phân (BIN), thập lục phân (HEX), bát phân (OCT) và thập phân (DEC).</li>
              <li><strong className="text-white">4: Matrix</strong> - Tính toán ma trận cấp 1 đến cấp 4, định thức det, ma trận nghịch đảo, tích ma trận.</li>
              <li><strong className="text-white">5: Vector</strong> - Phép toán vectơ 2D/3D: tích vô hướng, tích có hướng, độ lớn và góc giữa 2 vectơ.</li>
              <li><strong className="text-white">6: Statistics</strong> - Bảng thống kê 1 biến: giá trị trung bình x̄, phương sai, độ lệch chuẩn, tứ phân vị Q1, Med, Q3.</li>
              <li><strong className="text-white">8: Table</strong> - Lập bảng giá trị hàm số f(x) trong khoảng xác định.</li>
              <li><strong className="text-white">9: Equation</strong> - Giải hệ phương trình tuyến tính 2, 3, 4 ẩn & phương trình bậc 2, bậc 3, bậc 4 với toạ độ đỉnh Parabol.</li>
              <li><strong className="text-white">A: Inequality</strong> - Giải bất phương trình bậc 2, 3, 4.</li>
              <li><strong className="text-white">B: Ratio</strong> - Giải tỉ lệ thức A:B = X:D hoặc A:B = C:X.</li>
            </ul>
          </div>

          {/* Section 3: Phím tắt bàn phím máy tính */}
          <div className="space-y-2">
            <h3 className="font-bold text-amber-400 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Keyboard className="w-4 h-4" />
              <span>3. Phím tắt trên bàn phím máy tính PC/Laptop</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                <span className="text-amber-400">Enter / =</span> : Phím Bằng (=)
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                <span className="text-amber-400">Backspace</span> : Phím Xoá DEL
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                <span className="text-amber-400">Escape</span> : Phím Clear AC
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                <span className="text-amber-400">M</span> : Mở Menu chế độ
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                <span className="text-amber-400">H</span> : Mở Lịch sử JSON
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                <span className="text-amber-400">S</span> : Mở Cài đặt SETUP
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            id="help-done-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs transition"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
