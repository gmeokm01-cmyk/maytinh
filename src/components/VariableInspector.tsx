import React, { useState } from 'react';
import { MemoryVariables } from '../types';
import { Database, X, Check, Edit3 } from 'lucide-react';
import { sound } from '../utils/sound';

interface VariableInspectorProps {
  variables: MemoryVariables;
  onUpdateVariable: (name: keyof MemoryVariables, val: number | string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const VariableInspector: React.FC<VariableInspectorProps> = ({
  variables,
  onUpdateVariable,
  isOpen,
  onClose,
}) => {
  const [editingKey, setEditingKey] = useState<keyof MemoryVariables | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  if (!isOpen) return null;

  const handleStartEdit = (key: keyof MemoryVariables, currentVal: number | string) => {
    setEditingKey(key);
    setEditValue(String(currentVal));
  };

  const handleSaveEdit = () => {
    if (editingKey) {
      const num = parseFloat(editValue);
      onUpdateVariable(editingKey, isNaN(num) ? editValue : num);
      setEditingKey(null);
      sound.playKeyClick('shift');
    }
  };

  const varList: Array<{ key: keyof MemoryVariables; label: string; desc: string }> = [
    { key: 'A', label: 'Biến A', desc: 'Shift + (-)' },
    { key: 'B', label: 'Biến B', desc: 'Shift + ° \' "' },
    { key: 'C', label: 'Biến C', desc: 'Shift + x⁻¹' },
    { key: 'D', label: 'Biến D', desc: 'Shift + sin' },
    { key: 'E', label: 'Biến E', desc: 'Shift + cos' },
    { key: 'F', label: 'Biến F', desc: 'Shift + tan' },
    { key: 'x', label: 'Biến X', desc: 'Alpha + )' },
    { key: 'y', label: 'Biến Y', desc: 'Alpha + S⇔D' },
    { key: 'M', label: 'Bộ nhớ M', desc: 'Phím M+ / M-' },
    { key: 'Ans', label: 'Kết quả Ans', desc: 'Phím Ans' },
    { key: 'PreAns', label: 'Kết quả trước', desc: 'Shift + Ans' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center space-x-2.5">
            <Database className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-neutral-100">BỘ NHỚ BIẾN SỐ (STO / RCL)</h2>
          </div>
          <button
            id="close-var-inspector-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-2.5">
          <p className="text-xs text-neutral-400 mb-3">
            Giá trị hiện tại của các thanh ghi bộ nhớ fx-580. Bạn có thể chỉnh sửa trực tiếp hoặc gán qua phím STO.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {varList.map(({ key, label, desc }) => {
              const isEditing = editingKey === key;
              const val = variables[key];

              return (
                <div
                  key={key}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-amber-400 text-sm">{key}</span>
                      <span className="text-[11px] text-neutral-400">{label}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">{desc}</span>

                    {isEditing ? (
                      <div className="mt-1.5 flex items-center space-x-1.5">
                        <input
                          type="text"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="w-full bg-neutral-900 border border-amber-500 rounded px-2 py-0.5 text-xs text-white font-mono"
                          autoFocus
                          onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                        />
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="p-1 bg-amber-500 text-neutral-950 rounded hover:bg-amber-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 font-mono font-bold text-sm text-neutral-100 truncate">
                        = {String(val)}
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(key, val)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-400 hover:bg-neutral-800 transition"
                      title="Sửa giá trị biến"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            id="var-inspector-done-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-bold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
