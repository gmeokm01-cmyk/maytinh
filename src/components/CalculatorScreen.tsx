import React from 'react';
import { CalcMode, AngleUnit, NumberFormat, HistoryItem } from '../types';
import { LCDMenu } from './LCDScreen/LCDMenu';
import { LCDEquation } from './LCDScreen/LCDEquation';
import { LCDMatrix } from './LCDScreen/LCDMatrix';
import { LCDVector } from './LCDScreen/LCDVector';
import { LCDTable } from './LCDScreen/LCDTable';
import { LCDStatistics } from './LCDScreen/LCDStatistics';
import { LCDInequality } from './LCDScreen/LCDInequality';
import { LCDRatio } from './LCDScreen/LCDRatio';

interface CalculatorScreenProps {
  isPowerOn?: boolean;
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
  isMenuOpen: boolean;
  onSelectMode: (mode: CalcMode, label: string) => void;
  onCloseMenu: () => void;
  onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'timestampFormatted'>) => void;
  keypadAction: { action: string; timestamp: number } | null;
}

export const CalculatorScreen: React.FC<CalculatorScreenProps> = ({
  isPowerOn = true,
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
  cursorPos = 0,
  contrast,
  activeBase,
  isMenuOpen,
  onSelectMode,
  onCloseMenu,
  onSaveToHistory,
  keypadAction,
}) => {
  const contrastClass = contrast > 5 ? 'brightness-95 contrast-105' : 'brightness-100';

  const safeCursor = Math.min(Math.max(0, cursorPos), expression.length);
  const beforeCursor = expression.slice(0, safeCursor);
  const afterCursor = expression.slice(safeCursor);

  // When calculator is OFF (POWER OFF)
  if (!isPowerOn) {
    return (
      <div
        id="fx580-screen-container"
        className="relative w-full min-h-[148px] rounded-lg border-2 border-[#161c22] bg-[#121814] p-2.5 sm:p-3 shadow-inner select-none font-mono text-transparent overflow-hidden flex flex-col items-center justify-center transition-colors duration-200"
        style={{
          boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.85), inset 0 0 15px rgba(0,15,5,0.6)',
        }}
      >
        {/* Faint unpowered LCD reflection glass texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '3px 3px',
          }}
        />
        {/* Subtle diagonal light sheen across the unpowered glass */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10 bg-gradient-to-tr from-transparent via-white/5 to-transparent"
        />
      </div>
    );
  }

  return (
    <div
      id="fx580-screen-container"
      className="relative w-full min-h-[148px] rounded-lg border-2 border-[#1c242c] bg-[#9bb0a0] p-2.5 sm:p-3 shadow-inner select-none font-mono text-[#0a120c] overflow-hidden"
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

      {/* Top Status Bar */}
      <div
        className={`flex items-center justify-between border-b border-[#7d9482] pb-1 text-[11px] font-bold tracking-wider ${contrastClass}`}
      >
        <div className="flex items-center space-x-1.5 sm:space-x-2">
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

          {/* Angle Unit */}
          <span className="bg-[#111c14] text-[#d6e5d8] px-1 rounded text-[9px] font-black">
            {angleUnit === 'DEG' ? 'D' : angleUnit === 'RAD' ? 'R' : 'G'}
          </span>

          {/* Base-N indicator */}
          {mode === 'base_n' && activeBase && (
            <span className="bg-[#111c14] text-[#d6e5d8] px-1 rounded text-[9px] font-black">
              {activeBase}
            </span>
          )}

          {/* Complex indicator */}
          {mode === 'complex' && (
            <span className="bg-[#111c14] text-[#d6e5d8] px-1 rounded text-[9px] font-black">
              i
            </span>
          )}

          {/* Math Natural textbook mode */}
          <span className="opacity-90 text-[10px] font-bold">Math▲</span>
        </div>

        {/* Mode Label right badge */}
        <div className="flex items-center space-x-1">
          <span className="truncate max-w-[120px] sm:max-w-[150px] text-[10px] font-semibold text-[#18281d] text-right">
            {isMenuOpen ? 'MENU' : modeLabel.replace('Mode ', 'M')}
          </span>
        </div>
      </div>

      {/* Main Screen Body */}
      <div className={`mt-1.5 ${contrastClass}`}>
        {isMenuOpen ? (
          <LCDMenu onSelectMode={onSelectMode} onClose={onCloseMenu} keypadAction={keypadAction} />
        ) : mode === 'equation' ? (
          <LCDEquation
            onSaveToHistory={onSaveToHistory}
            onExitMode={() => onSelectMode('calculate', 'Mode 1: Tính toán chuẩn')}
            keypadAction={keypadAction}
          />
        ) : mode === 'matrix' ? (
          <LCDMatrix onSaveToHistory={onSaveToHistory} keypadAction={keypadAction} />
        ) : mode === 'vector' ? (
          <LCDVector onSaveToHistory={onSaveToHistory} keypadAction={keypadAction} />
        ) : mode === 'table' ? (
          <LCDTable onSaveToHistory={onSaveToHistory} keypadAction={keypadAction} />
        ) : mode === 'statistics' ? (
          <LCDStatistics onSaveToHistory={onSaveToHistory} keypadAction={keypadAction} />
        ) : mode === 'inequality' ? (
          <LCDInequality onSaveToHistory={onSaveToHistory} keypadAction={keypadAction} />
        ) : mode === 'ratio' ? (
          <LCDRatio onSaveToHistory={onSaveToHistory} keypadAction={keypadAction} />
        ) : (
          /* Standard Calculation / Complex / Base-N LCD View */
          <div className="flex min-h-[90px] flex-col justify-between">
            {/* Input expression line */}
            <div className="relative min-h-[36px] text-left text-[17px] sm:text-[19px] font-bold tracking-tight text-[#08120a] break-words whitespace-pre-wrap leading-snug">
              {expression ? (
                <span>
                  <span>{beforeCursor}</span>
                  <span className="inline-block w-1.5 h-4.5 bg-[#08120a] animate-pulse align-middle mx-[0.5px]" />
                  <span>{afterCursor}</span>
                </span>
              ) : (
                <span className="inline-block h-4.5 w-2 animate-pulse bg-[#08120a] align-middle opacity-80" />
              )}
            </div>

            {/* Result line */}
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
        )}
      </div>
    </div>
  );
};
