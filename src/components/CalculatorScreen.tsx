import React from 'react';
import { CalcMode, AngleUnit, NumberFormat } from '../types';

interface CalculatorScreenProps {
  expression: string;
  result: string;
  isShift: boolean;
  isAlpha: boolean;
  isSto: boolean;
  isRcl: boolean;
  angleUnit: AngleUnit;
  numberFormat: NumberFormat;
  mode: CalcMode;
  modeLabel: string;
  hasMemory: boolean;
  isError: boolean;
  errorMessage?: string;
  cursorPos: number;
  contrast: number;
  activeBase?: 'DEC' | 'HEX' | 'BIN' | 'OCT';
  onScreenClick?: () => void;
}

export const CalculatorScreen: React.FC<CalculatorScreenProps> = ({
  expression,
  result,
  isShift,
  isAlpha,
  isSto,
  isRcl,
  angleUnit,
  mode,
  modeLabel,
  hasMemory,
  isError,
  errorMessage,
  contrast,
  activeBase,
}) => {
  // LCD contrast filter styling
  const contrastClass = contrast > 5 ? 'brightness-95 contrast-105' : 'brightness-100';

  return (
    <div
      id="fx580-screen-container"
      className="relative w-full rounded-md border-2 border-[#1c242c] bg-[#9bb0a0] p-3 shadow-inner select-none font-mono text-[#0a120c] overflow-hidden"
      style={{
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.55), inset 0 0 12px rgba(0,30,10,0.25)',
      }}
    >
      {/* Subtle LCD Dot Matrix overlay scanline pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }}
      />

      {/* Top Status Bar (ClassWiz LCD top row indicators) */}
      <div className={`flex items-center justify-between border-b border-[#7d9482] pb-1 text-[11px] font-bold tracking-wider ${contrastClass}`}>
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* SHIFT indicator */}
          <span
            className={`px-1 py-0.5 rounded text-[10px] font-extrabold transition-opacity duration-150 ${
              isShift ? 'bg-[#111c14] text-[#d6e5d8] opacity-100' : 'opacity-20 text-[#304435]'
            }`}
          >
            S
          </span>

          {/* ALPHA indicator */}
          <span
            className={`px-1 py-0.5 rounded text-[10px] font-extrabold transition-opacity duration-150 ${
              isAlpha ? 'bg-[#111c14] text-[#d6e5d8] opacity-100' : 'opacity-20 text-[#304435]'
            }`}
          >
            A
          </span>

          {/* STO / RCL */}
          {isSto && <span className="bg-[#111c14] text-[#d6e5d8] px-1 rounded text-[9px] font-extrabold">STO</span>}
          {isRcl && <span className="bg-[#111c14] text-[#d6e5d8] px-1 rounded text-[9px] font-extrabold">RCL</span>}

          {/* Memory M */}
          <span
            className={`text-[10px] font-extrabold ${
              hasMemory ? 'opacity-100 text-[#111c14]' : 'opacity-20 text-[#304435]'
            }`}
          >
            M
          </span>

          {/* Angle Unit indicator */}
          <span className="bg-[#111c14] text-[#d6e5d8] px-1 rounded text-[9px] font-black">
            {angleUnit === 'DEG' ? 'D' : angleUnit === 'RAD' ? 'R' : 'G'}
          </span>

          {/* Base indicator if Base-N mode */}
          {mode === 'base_n' && activeBase && (
            <span className="bg-[#111c14] text-[#d6e5d8] px-1 rounded text-[9px] font-black">
              {activeBase}
            </span>
          )}

          {/* Math Natural textbook mode */}
          <span className="opacity-90 text-[10px] font-bold">Math▲</span>
        </div>

        {/* Mode Label right badge */}
        <div className="flex items-center space-x-1">
          <span className="truncate max-w-[130px] sm:max-w-[170px] text-[10px] font-semibold text-[#18281d] text-right">
            {modeLabel}
          </span>
        </div>
      </div>

      {/* Main Screen Body: Expression & Result Area */}
      <div className={`mt-2 flex min-h-[78px] flex-col justify-between ${contrastClass}`}>
        {/* Input line (Natural textbook style) */}
        <div className="relative min-h-[30px] text-left text-[17px] sm:text-[19px] font-bold tracking-tight text-[#08120a] break-words whitespace-pre-wrap leading-tight">
          {expression || (
            <span className="inline-block h-5 w-2 animate-pulse bg-[#08120a] align-middle opacity-80" />
          )}
          {expression && (
            <span className="inline-block h-4 w-1.5 ml-0.5 animate-pulse bg-[#08120a] align-middle" />
          )}
        </div>

        {/* Result line (Right aligned high-contrast) */}
        <div className="mt-1 flex items-end justify-between border-t border-dashed border-[#7d9482] pt-1">
          <div className="text-[11px] text-[#2c3d31] font-semibold">
            {isError ? 'ERROR' : result ? 'Ans' : ''}
          </div>
          <div
            className={`text-right font-black tracking-tight ${
              isError
                ? 'text-sm text-red-950 font-bold'
                : 'text-[22px] sm:text-[26px] text-[#050e07]'
            }`}
          >
            {isError ? errorMessage || result : result || '0'}
          </div>
        </div>
      </div>
    </div>
  );
};
