import React from 'react';
import { CalculatorSettings, AngleUnit, NumberFormat, FractionFormat } from '../types';
import { Settings, X, Volume2, VolumeX, Eye } from 'lucide-react';
import { sound } from '../utils/sound';

interface SetupModalProps {
  settings: CalculatorSettings;
  onUpdateSettings: (newSettings: CalculatorSettings) => void;
  onClose: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const handleAngleChange = (unit: AngleUnit) => {
    onUpdateSettings({ ...settings, angleUnit: unit });
  };

  const handleFormatChange = (fmt: NumberFormat) => {
    onUpdateSettings({ ...settings, numberFormat: fmt });
  };

  const handleFractionChange = (frac: FractionFormat) => {
    onUpdateSettings({ ...settings, fractionFormat: frac });
  };

  const toggleSound = () => {
    const next = !settings.soundEnabled;
    sound.setEnabled(next);
    onUpdateSettings({ ...settings, soundEnabled: next });
    if (next) sound.playKeyClick('shift');
  };

  const handleContrastChange = (val: number) => {
    onUpdateSettings({ ...settings, contrast: val });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center space-x-2.5">
            <Settings className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-neutral-100">CÀI ĐẶT MÁY TÍNH (SETUP - SHIFT + MENU)</h2>
          </div>
          <button
            id="close-setup-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-sm">
          {/* 1. Angle Unit */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              1. Đơn vị góc (Angle Unit)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['DEG', 'RAD', 'GRA'] as AngleUnit[]).map(unit => (
                <button
                  key={unit}
                  id={`setup-angle-${unit}`}
                  type="button"
                  onClick={() => handleAngleChange(unit)}
                  className={`py-2 rounded-lg font-bold text-xs border transition ${
                    settings.angleUnit === unit
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 ring-2 ring-amber-500/40'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                  }`}
                >
                  {unit === 'DEG' ? 'Degree (Độ °)' : unit === 'RAD' ? 'Radian (rad)' : 'Gradian (gra)'}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Number Format */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              2. Định dạng hiển thị số (Number Format)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['NORM1', 'NORM2', 'FIX', 'SCI'] as NumberFormat[]).map(fmt => (
                <button
                  key={fmt}
                  id={`setup-format-${fmt}`}
                  type="button"
                  onClick={() => handleFormatChange(fmt)}
                  className={`py-2 rounded-lg font-bold text-xs border transition ${
                    settings.numberFormat === fmt
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 ring-2 ring-amber-500/40'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                  }`}
                >
                  {fmt === 'NORM1' ? 'Norm 1' : fmt === 'NORM2' ? 'Norm 2' : fmt === 'FIX' ? 'Fix (Làm tròn)' : 'Sci (Khoa học)'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Fraction Format */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              3. Định dạng phân số (Fraction Result)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="setup-frac-dc"
                type="button"
                onClick={() => handleFractionChange('d/c')}
                className={`py-2 px-3 rounded-lg font-bold text-xs border transition text-left ${
                  settings.fractionFormat === 'd/c'
                    ? 'bg-amber-500 text-neutral-950 border-amber-400'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                }`}
              >
                Phân số thường: <span className="font-mono">d/c (7/3)</span>
              </button>
              <button
                id="setup-frac-abc"
                type="button"
                onClick={() => handleFractionChange('ab/c')}
                className={`py-2 px-3 rounded-lg font-bold text-xs border transition text-left ${
                  settings.fractionFormat === 'ab/c'
                    ? 'bg-amber-500 text-neutral-950 border-amber-400'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                }`}
              >
                Hỗn số: <span className="font-mono">ab/c (2 ┘ 1/3)</span>
              </button>
            </div>
          </div>

          {/* 4. Sound feedback */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/80 border border-neutral-700">
            <div className="flex items-center space-x-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-neutral-400" />
              )}
              <div>
                <p className="font-bold text-sm text-neutral-100">Âm thanh gõ phím vật lý</p>
                <p className="text-xs text-neutral-400">Âm thanh click chân thực theo từng phím fx-580</p>
              </div>
            </div>
            <button
              id="setup-sound-toggle"
              type="button"
              onClick={toggleSound}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                settings.soundEnabled
                  ? 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              {settings.soundEnabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
            </button>
          </div>

          {/* 5. Contrast */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>5. Độ tương phản màn hình LCD (Contrast)</span>
              </label>
              <span className="text-xs font-mono font-bold text-neutral-300">{settings.contrast} / 10</span>
            </div>
            <input
              id="setup-contrast-slider"
              type="range"
              min="1"
              max="10"
              value={settings.contrast}
              onChange={e => handleContrastChange(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            id="setup-done-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-bold transition"
          >
            Lưu & Thoát
          </button>
        </div>
      </div>
    </div>
  );
};
