import React from 'react';
import { sound } from '../utils/sound';

interface KeypadProps {
  onKeyPress: (action: string, label?: string) => void;
  isShift: boolean;
  isAlpha: boolean;
  isPowerOn?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({ onKeyPress, isShift, isAlpha, isPowerOn = true }) => {
  const handleKey = (action: string, type: 'num' | 'func' | 'equals' | 'shift' | 'clear' = 'num', label?: string) => {
    sound.playKeyClick(type);
    onKeyPress(action, label);
  };

  return (
    <div id="fx580-keypad" className="w-full flex flex-col gap-2 select-none">
      {/* Top Control Section: Shift, Alpha, D-Pad, Option, Calc, Menu, On */}
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2 items-center">
        {/* SHIFT */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] sm:text-[11px] font-extrabold text-[#d97706] tracking-tight">SHIFT</span>
          <button
            id="btn-shift"
            type="button"
            onClick={() => handleKey('SHIFT', 'shift')}
            className={`w-9 h-7 sm:w-11 sm:h-8 rounded-full text-[11px] font-black transition-all shadow-md active:translate-y-0.5 border flex items-center justify-center ${
              isShift
                ? 'bg-amber-400 text-neutral-900 border-amber-300 ring-2 ring-amber-400 shadow-amber-400/50'
                : 'bg-gradient-to-b from-neutral-600 via-neutral-700 to-neutral-800 hover:from-neutral-500 text-amber-400 border-neutral-500 shadow-inner'
            }`}
          >
            S
          </button>
        </div>

        {/* ALPHA */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] sm:text-[11px] font-extrabold text-[#e11d48] tracking-tight">ALPHA</span>
          <button
            id="btn-alpha"
            type="button"
            onClick={() => handleKey('ALPHA', 'shift')}
            className={`w-9 h-7 sm:w-11 sm:h-8 rounded-full text-[11px] font-black transition-all shadow-md active:translate-y-0.5 border flex items-center justify-center ${
              isAlpha
                ? 'bg-rose-500 text-white border-rose-400 ring-2 ring-rose-400 shadow-rose-500/50'
                : 'bg-gradient-to-b from-neutral-600 via-neutral-700 to-neutral-800 hover:from-neutral-500 text-rose-400 border-neutral-500 shadow-inner'
            }`}
          >
            A
          </button>
        </div>

        {/* D-Pad REPLAY Wheel (Spans 2 columns) */}
        <div className="col-span-2 flex flex-col items-center justify-center">
          <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-widest -mb-0.5">REPLAY</span>
          <div className="relative w-[82px] h-[44px] sm:w-[94px] sm:h-[48px] rounded-[22px] bg-gradient-to-b from-[#3a414b] via-[#242930] to-[#171b20] border-2 border-neutral-500/80 shadow-lg flex items-center justify-center overflow-hidden">
            {/* Up */}
            <button
              id="dpad-up"
              type="button"
              onClick={() => handleKey('UP', 'func')}
              className="absolute top-0.5 left-1/2 -translate-x-1/2 w-8 h-4 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 active:bg-white/20 text-[9px] font-black transition-colors rounded-t-full"
              title="Lên (▲)"
            >
              ▲
            </button>
            {/* Left */}
            <button
              id="dpad-left"
              type="button"
              onClick={() => handleKey('LEFT', 'func')}
              className="absolute left-0.5 top-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 active:bg-white/20 text-[9px] font-black transition-colors rounded-l-full"
              title="Sang trái (◀)"
            >
              ◀
            </button>
            {/* Center metallic glossy core */}
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-neutral-400 via-neutral-700 to-neutral-900 border border-neutral-400 shadow-md flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-neutral-600" />
            </div>
            {/* Right */}
            <button
              id="dpad-right"
              type="button"
              onClick={() => handleKey('RIGHT', 'func')}
              className="absolute right-0.5 top-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 active:bg-white/20 text-[9px] font-black transition-colors rounded-r-full"
              title="Sang phải (▶)"
            >
              ▶
            </button>
            {/* Down */}
            <button
              id="dpad-down"
              type="button"
              onClick={() => handleKey('DOWN', 'func')}
              className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-4 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 active:bg-white/20 text-[9px] font-black transition-colors rounded-b-full"
              title="Xuống (▼)"
            >
              ▼
            </button>
          </div>
        </div>

        {/* MENU / SETUP */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-1 text-[9px] font-extrabold tracking-tighter">
            <span className="text-neutral-300">MENU</span>
            <span className="text-[#d97706]">SETUP</span>
          </div>
          <button
            id="btn-menu"
            type="button"
            onClick={() => handleKey('MENU', 'func')}
            className="w-9 h-7 sm:w-11 sm:h-8 rounded-full bg-gradient-to-b from-neutral-600 via-neutral-700 to-neutral-800 hover:from-neutral-500 text-neutral-200 text-[10px] sm:text-[11px] font-extrabold border border-neutral-500 shadow-md active:translate-y-0.5 flex items-center justify-center"
          >
            MENU
          </button>
        </div>

        {/* ON */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-neutral-300">ON</span>
          <button
            id="btn-on"
            type="button"
            onClick={() => handleKey('ON', 'clear')}
            className={`w-9 h-7 sm:w-11 sm:h-8 rounded-full text-[10px] sm:text-[11px] font-black border shadow-md active:translate-y-0.5 transition-all flex items-center justify-center ${
              !isPowerOn
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 animate-pulse ring-2 ring-emerald-400/60 shadow-emerald-900/50'
                : 'bg-gradient-to-b from-neutral-600 via-neutral-700 to-neutral-800 hover:from-neutral-500 text-emerald-400 border-neutral-500 shadow-inner'
            }`}
            title={!isPowerOn ? 'Nhấn để BẬT máy tính (ON)' : 'Bật / Khởi động lại (ON)'}
          >
            ON
          </button>
        </div>
      </div>

      {/* 2nd Function Row: OPTN, CALC, d/dx, ∫, Fraction, Sqrt */}
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
        {/* OPTN */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-neutral-400">QR</span>
          <button
            id="btn-optn"
            type="button"
            onClick={() => handleKey('OPTN', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            OPTN
          </button>
        </div>

        {/* CALC / SOLVE / = */}
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full px-0.5 text-[9px] font-extrabold">
            <span className="text-[#d97706]">SOLVE</span>
            <span className="text-[#e11d48]">=</span>
          </div>
          <button
            id="btn-calc"
            type="button"
            onClick={() => handleKey('CALC', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            CALC
          </button>
        </div>

        {/* Integral / Derivative */}
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full px-0.5 text-[9px] font-extrabold">
            <span className="text-[#d97706]">d/dx</span>
            <span className="text-[#e11d48]">Σ</span>
          </div>
          <button
            id="btn-integral"
            type="button"
            onClick={() => handleKey('INTEGRAL', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            ∫dx
          </button>
        </div>

        {/* Fraction */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">a b/c</span>
          <button
            id="btn-fraction"
            type="button"
            onClick={() => handleKey('FRACTION', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            x/y
          </button>
        </div>

        {/* Square Root */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">∛</span>
          <button
            id="btn-sqrt"
            type="button"
            onClick={() => handleKey('SQRT', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            √□
          </button>
        </div>

        {/* x² */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">x³</span>
          <button
            id="btn-square"
            type="button"
            onClick={() => handleKey('SQUARE', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            x²
          </button>
        </div>
      </div>

      {/* 3rd Function Row: x^□, log_b, ln, (-), ° ' ", x⁻¹ */}
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
        {/* x^□ */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">ˣ√□</span>
          <button
            id="btn-power"
            type="button"
            onClick={() => handleKey('POWER', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            x^□
          </button>
        </div>

        {/* log_b */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">log_□</span>
          <button
            id="btn-log-base"
            type="button"
            onClick={() => handleKey('LOG_BASE', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            log_b
          </button>
        </div>

        {/* ln / e^x */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">e^x</span>
          <button
            id="btn-ln"
            type="button"
            onClick={() => handleKey('LN', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            ln
          </button>
        </div>

        {/* (-) / FACT / A */}
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full px-0.5 text-[9px] font-extrabold">
            <span className="text-[#d97706]">FACT</span>
            <span className="text-[#e11d48]">A</span>
          </div>
          <button
            id="btn-neg"
            type="button"
            onClick={() => handleKey('NEG', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            (-)
          </button>
        </div>

        {/* ° ' " / ∠ / B */}
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full px-0.5 text-[9px] font-extrabold">
            <span className="text-[#d97706]">∠</span>
            <span className="text-[#e11d48]">B</span>
          </div>
          <button
            id="btn-dms"
            type="button"
            onClick={() => handleKey('DMS', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            ° ' "
          </button>
        </div>

        {/* x⁻¹ / ! / C */}
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full px-0.5 text-[9px] font-extrabold">
            <span className="text-[#d97706]">x!</span>
            <span className="text-[#e11d48]">C</span>
          </div>
          <button
            id="btn-inverse"
            type="button"
            onClick={() => handleKey('INVERSE', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            x⁻¹
          </button>
        </div>
      </div>

      {/* 4th Function Row: sin, cos, tan, STO, ENG, ( */}
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
        {/* sin / sin⁻¹ / D */}
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full px-0.5 text-[9px] font-extrabold">
            <span className="text-[#d97706]">sin⁻¹</span>
            <span className="text-[#e11d48]">D</span>
          </div>
          <button
            id="btn-sin"
            type="button"
            onClick={() => handleKey('SIN', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            sin
          </button>
        </div>

        {/* cos / cos⁻¹ / E */}
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full px-0.5 text-[9px] font-extrabold">
            <span className="text-[#d97706]">cos⁻¹</span>
            <span className="text-[#e11d48]">E</span>
          </div>
          <button
            id="btn-cos"
            type="button"
            onClick={() => handleKey('COS', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            cos
          </button>
        </div>

        {/* tan / tan⁻¹ / F */}
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full px-0.5 text-[9px] font-extrabold">
            <span className="text-[#d97706]">tan⁻¹</span>
            <span className="text-[#e11d48]">F</span>
          </div>
          <button
            id="btn-tan"
            type="button"
            onClick={() => handleKey('TAN', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            tan
          </button>
        </div>

        {/* STO / RECALL */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">RECALL</span>
          <button
            id="btn-sto"
            type="button"
            onClick={() => handleKey('STO', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            STO
          </button>
        </div>

        {/* ENG / ← / i */}
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full px-0.5 text-[9px] font-extrabold">
            <span className="text-[#d97706]">←</span>
            <span className="text-[#e11d48]">i</span>
          </div>
          <button
            id="btn-eng"
            type="button"
            onClick={() => handleKey('ENG', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            ENG
          </button>
        </div>

        {/* ( / % */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">%</span>
          <button
            id="btn-paren-open"
            type="button"
            onClick={() => handleKey('(', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            (
          </button>
        </div>
      </div>

      {/* 5th Function Row: ), S<=>D, M+, log, Abs */}
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
        {/* ) / , / X */}
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full px-0.5 text-[9px] font-extrabold">
            <span className="text-[#d97706]">,</span>
            <span className="text-[#e11d48]">x</span>
          </div>
          <button
            id="btn-paren-close"
            type="button"
            onClick={() => handleKey(')', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            )
          </button>
        </div>

        {/* S<=>D / a b/c<=>d/c / Y */}
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full px-0.5 text-[9px] font-extrabold">
            <span className="text-[#d97706]">ab/c</span>
            <span className="text-[#e11d48]">y</span>
          </div>
          <button
            id="btn-sd"
            type="button"
            onClick={() => handleKey('SD_TOGGLE', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            S⇔D
          </button>
        </div>

        {/* M+ / M- / M */}
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full px-0.5 text-[9px] font-extrabold">
            <span className="text-[#d97706]">M-</span>
            <span className="text-[#e11d48]">M</span>
          </div>
          <button
            id="btn-mplus"
            type="button"
            onClick={() => handleKey('M_PLUS', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            M+
          </button>
        </div>

        {/* log (base 10) / 10^x */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">10^x</span>
          <button
            id="btn-log"
            type="button"
            onClick={() => handleKey('LOG10', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            log
          </button>
        </div>

        {/* Abs |x| */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">|x|</span>
          <button
            id="btn-abs"
            type="button"
            onClick={() => handleKey('ABS', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            Abs
          </button>
        </div>

        {/* GCD / LCM */}
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full px-0.5 text-[9px] font-extrabold">
            <span className="text-[#d97706]">LCM</span>
            <span className="text-cyan-400">GCD</span>
          </div>
          <button
            id="btn-gcd"
            type="button"
            onClick={() => handleKey('GCD', 'func')}
            className="w-full py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border-t border-neutral-600 shadow active:translate-y-0.5"
          >
            GCD
          </button>
        </div>
      </div>

      {/* Main Numeric & Calculation Pad (5 columns x 4 rows) */}
      <div className="mt-1 grid grid-cols-5 gap-1.5 sm:gap-2">
        {/* ROW 1: 7, 8, 9, DEL, AC */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">CONST</span>
          <button
            id="btn-7"
            type="button"
            onClick={() => handleKey('7', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-200 hover:bg-white text-neutral-900 text-lg sm:text-xl font-bold border-b-2 border-neutral-400 shadow-md active:translate-y-0.5"
          >
            7
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">CONV</span>
          <button
            id="btn-8"
            type="button"
            onClick={() => handleKey('8', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-200 hover:bg-white text-neutral-900 text-lg sm:text-xl font-bold border-b-2 border-neutral-400 shadow-md active:translate-y-0.5"
          >
            8
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">RESET</span>
          <button
            id="btn-9"
            type="button"
            onClick={() => handleKey('9', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-200 hover:bg-white text-neutral-900 text-lg sm:text-xl font-bold border-b-2 border-neutral-400 shadow-md active:translate-y-0.5"
          >
            9
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">INS</span>
          <button
            id="btn-del"
            type="button"
            onClick={() => handleKey('DEL', 'clear')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm sm:text-base font-extrabold border-b-2 border-amber-800 shadow-md active:translate-y-0.5"
          >
            DEL
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">OFF</span>
          <button
            id="btn-ac"
            type="button"
            onClick={() => handleKey('AC', 'clear')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm sm:text-base font-extrabold border-b-2 border-amber-800 shadow-md active:translate-y-0.5"
          >
            AC
          </button>
        </div>

        {/* ROW 2: 4, 5, 6, ×, ÷ */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">MATRIX</span>
          <button
            id="btn-4"
            type="button"
            onClick={() => handleKey('4', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-200 hover:bg-white text-neutral-900 text-lg sm:text-xl font-bold border-b-2 border-neutral-400 shadow-md active:translate-y-0.5"
          >
            4
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">VECTOR</span>
          <button
            id="btn-5"
            type="button"
            onClick={() => handleKey('5', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-200 hover:bg-white text-neutral-900 text-lg sm:text-xl font-bold border-b-2 border-neutral-400 shadow-md active:translate-y-0.5"
          >
            5
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">STAT</span>
          <button
            id="btn-6"
            type="button"
            onClick={() => handleKey('6', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-200 hover:bg-white text-neutral-900 text-lg sm:text-xl font-bold border-b-2 border-neutral-400 shadow-md active:translate-y-0.5"
          >
            6
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">nPr</span>
          <button
            id="btn-multiply"
            type="button"
            onClick={() => handleKey('*', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-lg sm:text-xl font-bold border-b-2 border-neutral-900 shadow-md active:translate-y-0.5"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">nCr</span>
          <button
            id="btn-divide"
            type="button"
            onClick={() => handleKey('/', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-lg sm:text-xl font-bold border-b-2 border-neutral-900 shadow-md active:translate-y-0.5"
          >
            ÷
          </button>
        </div>

        {/* ROW 3: 1, 2, 3, +, - */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">Pol</span>
          <button
            id="btn-1"
            type="button"
            onClick={() => handleKey('1', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-200 hover:bg-white text-neutral-900 text-lg sm:text-xl font-bold border-b-2 border-neutral-400 shadow-md active:translate-y-0.5"
          >
            1
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">Rec</span>
          <button
            id="btn-2"
            type="button"
            onClick={() => handleKey('2', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-200 hover:bg-white text-neutral-900 text-lg sm:text-xl font-bold border-b-2 border-neutral-400 shadow-md active:translate-y-0.5"
          >
            2
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">Int</span>
          <button
            id="btn-3"
            type="button"
            onClick={() => handleKey('3', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-200 hover:bg-white text-neutral-900 text-lg sm:text-xl font-bold border-b-2 border-neutral-400 shadow-md active:translate-y-0.5"
          >
            3
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">Sum</span>
          <button
            id="btn-add"
            type="button"
            onClick={() => handleKey('+', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-lg sm:text-xl font-bold border-b-2 border-neutral-900 shadow-md active:translate-y-0.5"
          >
            +
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">−</span>
          <button
            id="btn-subtract"
            type="button"
            onClick={() => handleKey('-', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-lg sm:text-xl font-bold border-b-2 border-neutral-900 shadow-md active:translate-y-0.5"
          >
            −
          </button>
        </div>

        {/* ROW 4: 0, ., ×10^x, Ans, = */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">Rnd</span>
          <button
            id="btn-0"
            type="button"
            onClick={() => handleKey('0', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-200 hover:bg-white text-neutral-900 text-lg sm:text-xl font-bold border-b-2 border-neutral-400 shadow-md active:translate-y-0.5"
          >
            0
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">Ran#</span>
          <button
            id="btn-dot"
            type="button"
            onClick={() => handleKey('.', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-200 hover:bg-white text-neutral-900 text-lg sm:text-xl font-bold border-b-2 border-neutral-400 shadow-md active:translate-y-0.5"
          >
            •
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full px-0.5 text-[9px] font-extrabold">
            <span className="text-[#d97706]">π</span>
            <span className="text-[#e11d48]">e</span>
          </div>
          <button
            id="btn-exp"
            type="button"
            onClick={() => handleKey('EXP', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-xs sm:text-sm font-extrabold border-b-2 border-neutral-900 shadow-md active:translate-y-0.5"
          >
            ×10^x
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-[#d97706]">PreAns</span>
          <button
            id="btn-ans"
            type="button"
            onClick={() => handleKey('Ans', 'num')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-xs sm:text-sm font-extrabold border-b-2 border-neutral-900 shadow-md active:translate-y-0.5"
          >
            Ans
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-extrabold text-neutral-400">EXE</span>
          <button
            id="btn-equals"
            type="button"
            onClick={() => handleKey('=', 'equals')}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-lg sm:text-xl font-black border-b-2 border-blue-800 shadow-lg active:translate-y-0.5"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};
