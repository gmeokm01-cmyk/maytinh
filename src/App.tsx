import React, { useState, useEffect, useCallback } from 'react';
import { 
  CalcMode, 
  HistoryItem, 
  MemoryVariables, 
  CalculatorSettings, 
  AngleUnit, 
  NumberFormat, 
  FractionFormat 
} from './types';
import { evaluateExpression } from './utils/mathEngine';
import { 
  loadHistoryFromStorage, 
  saveHistoryToStorage, 
  exportHistoryAsJSON 
} from './utils/jsonStorage';
import { sound } from './utils/sound';
import { CalculatorScreen } from './components/CalculatorScreen';
import { Keypad } from './components/Keypad';
import { MenuSelector } from './components/MenuSelector';
import { SetupModal } from './components/SetupModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { VariableInspector } from './components/VariableInspector';
import { SpecializedModeViews } from './components/SpecializedModeViews';
import { QuickHelpModal } from './components/QuickHelpModal';
import { 
  History, 
  Settings, 
  Database, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Grid, 
  Download, 
  Maximize2, 
  Sparkles,
  Calculator as CalcIcon
} from 'lucide-react';

export default function App() {
  // Calculator Core State
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [exactResult, setExactResult] = useState<string>('');
  const [decimalResult, setDecimalResult] = useState<string>('');
  const [isShowingDecimal, setIsShowingDecimal] = useState<boolean>(false);
  const [isShift, setIsShift] = useState<boolean>(false);
  const [isAlpha, setIsAlpha] = useState<boolean>(false);
  const [isSto, setIsSto] = useState<boolean>(false);
  const [isRcl, setIsRcl] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [cursorPos, setCursorPos] = useState<number>(0);

  // Mode state
  const [mode, setMode] = useState<CalcMode>('calculate');
  const [modeLabel, setModeLabel] = useState<string>('Mode 1: Tính toán');
  const [showSpecializedView, setShowSpecializedView] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<CalculatorSettings>({
    angleUnit: 'DEG',
    numberFormat: 'NORM1',
    fixDecimals: 2,
    sciDigits: 5,
    fractionFormat: 'd/c',
    soundEnabled: true,
    autoSaveHistory: true,
    contrast: 5,
  });

  // Memory variables
  const [variables, setVariables] = useState<MemoryVariables>({
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
    x: 0,
    y: 0,
    M: 0,
    Ans: 0,
    PreAns: 0,
  });

  // History & Storage
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Modals state
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isVariableInspectorOpen, setIsVariableInspectorOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Initialize history from storage
  useEffect(() => {
    const loaded = loadHistoryFromStorage();
    setHistory(loaded);
  }, []);

  // Save history whenever it updates
  useEffect(() => {
    if (history.length > 0) {
      saveHistoryToStorage(history);
    }
  }, [history]);

  // Handle calculation evaluation
  const handleCalculate = useCallback(() => {
    if (!expression.trim()) return;

    const evalRes = evaluateExpression(
      expression,
      settings.angleUnit,
      settings.numberFormat,
      settings.fixDecimals,
      settings.sciDigits,
      settings.fractionFormat,
      variables
    );

    if (evalRes.isError) {
      setIsError(true);
      setErrorMessage(evalRes.errorMessage || 'Math ERROR');
      setResult('Math ERROR');
      sound.playKeyClick('error');
    } else {
      setIsError(false);
      setErrorMessage('');
      setExactResult(evalRes.exact);
      setDecimalResult(evalRes.decimal);
      setResult(evalRes.exact || evalRes.decimal);
      setIsShowingDecimal(false);

      // Update Ans and PreAns variables
      const numVal = parseFloat(evalRes.decimal);
      const newAns = isNaN(numVal) ? evalRes.decimal : numVal;
      setVariables(prev => ({
        ...prev,
        PreAns: prev.Ans,
        Ans: newAns,
      }));

      // Add to history
      const now = Date.now();
      const newItem: HistoryItem = {
        id: `calc_${now}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp: now,
        timestampFormatted: new Date(now).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        mode,
        modeLabel,
        expression,
        displayExpression: expression,
        result: evalRes.exact || evalRes.decimal,
        decimalResult: evalRes.decimal,
        exactResult: evalRes.exact,
        category: 'Standard',
      };

      setHistory(prev => [newItem, ...prev]);
      setHistoryIndex(-1);
    }
  }, [expression, settings, variables, mode, modeLabel]);

  // Insert token into expression
  const insertToken = useCallback((token: string) => {
    setIsError(false);
    setExpression(prev => prev + token);
  }, []);

  // Backspace DEL
  const handleDel = useCallback(() => {
    setIsError(false);
    setExpression(prev => {
      if (!prev) return '';
      // Check if ending with function like sin(, cos(, tan(, ln(, log(, √(, etc.
      const funcMatch = prev.match(/(sin|cos|tan|asin|acos|atan|log_|log|ln|d\/dx|∫|Σ|Abs|GCD|LCM|Pol|Rec|ˣ√|√)\($/);
      if (funcMatch) {
        return prev.slice(0, -funcMatch[0].length);
      }
      return prev.slice(0, -1);
    });
  }, []);

  // All Clear AC
  const handleAC = useCallback(() => {
    setIsError(false);
    setErrorMessage('');
    setExpression('');
    setResult('');
    setExactResult('');
    setDecimalResult('');
    setIsShift(false);
    setIsAlpha(false);
    setIsSto(false);
    setIsRcl(false);
  }, []);

  // S<=>D toggle
  const handleSDToggle = useCallback(() => {
    if (!result) return;
    if (exactResult && decimalResult && exactResult !== decimalResult) {
      if (isShowingDecimal) {
        setResult(exactResult);
        setIsShowingDecimal(false);
      } else {
        setResult(decimalResult);
        setIsShowingDecimal(true);
      }
    }
  }, [result, exactResult, decimalResult, isShowingDecimal]);

  // Variable store / recall
  const handleVariableAction = useCallback((varName: keyof MemoryVariables) => {
    if (isSto) {
      // Store current result or expression into variable
      const valToStore = result ? (isNaN(parseFloat(result)) ? result : parseFloat(result)) : 0;
      setVariables(prev => ({ ...prev, [varName]: valToStore }));
      setIsSto(false);
      setResult(`-> ${varName}`);
      sound.playKeyClick('shift');
    } else if (isRcl) {
      // Recall variable value into expression
      const val = variables[varName];
      insertToken(String(val));
      setIsRcl(false);
      sound.playKeyClick('shift');
    } else if (isAlpha) {
      // Type variable letter
      insertToken(varName);
      setIsAlpha(false);
    }
  }, [isSto, isRcl, isAlpha, result, variables, insertToken]);

  // Keypad main press processor
  const handleKeyPress = useCallback((action: string, label?: string) => {
    const shift = isShift;
    const alpha = isAlpha;

    // Reset single-use shift / alpha states unless pressing shift / alpha themselves
    if (action !== 'SHIFT' && action !== 'ALPHA') {
      setIsShift(false);
      setIsAlpha(false);
    }

    switch (action) {
      case 'SHIFT':
        setIsShift(prev => !prev);
        setIsAlpha(false);
        return;

      case 'ALPHA':
        setIsAlpha(prev => !prev);
        setIsShift(false);
        return;

      case 'MENU':
        if (shift) {
          setIsSetupOpen(true);
        } else {
          setIsMenuOpen(true);
        }
        return;

      case 'ON':
        handleAC();
        return;

      case 'DEL':
        handleDel();
        return;

      case 'AC':
        if (shift) {
          // OFF / Reset
          handleAC();
        } else {
          handleAC();
        }
        return;

      case '=':
        handleCalculate();
        return;

      case 'SD_TOGGLE':
        if (alpha) {
          handleVariableAction('y');
        } else {
          handleSDToggle();
        }
        return;

      case 'STO':
        if (shift) {
          setIsRcl(true);
          setIsSto(false);
        } else {
          setIsSto(true);
          setIsRcl(false);
        }
        return;

      case 'OPTN':
        setShowSpecializedView(prev => !prev);
        return;

      case 'CALC':
        if (alpha) {
          insertToken(' = ');
        } else if (shift) {
          // Solve
          handleCalculate();
        } else {
          handleCalculate();
        }
        return;

      case 'M_PLUS':
        if (alpha) {
          handleVariableAction('M');
        } else {
          // Add to M
          const currentVal = parseFloat(result || '0') || 0;
          setVariables(prev => ({
            ...prev,
            M: shift ? prev.M - currentVal : prev.M + currentVal,
          }));
          setResult(shift ? 'M-' : 'M+');
        }
        return;

      case 'FRACTION':
        insertToken('/');
        return;

      case 'SQRT':
        if (shift) {
          insertToken('cbrt(');
        } else {
          insertToken('√(');
        }
        return;

      case 'SQUARE':
        if (shift) {
          insertToken('^3');
        } else {
          insertToken('^2');
        }
        return;

      case 'POWER':
        if (shift) {
          insertToken(' ˣ√(');
        } else {
          insertToken('^');
        }
        return;

      case 'LOG_BASE':
        insertToken('log_10(');
        return;

      case 'LOG10':
        if (shift) {
          insertToken('10^(');
        } else {
          insertToken('log(');
        }
        return;

      case 'LN':
        if (shift) {
          insertToken('e^(');
        } else {
          insertToken('ln(');
        }
        return;

      case 'SIN':
        if (alpha) {
          handleVariableAction('D');
        } else if (shift) {
          insertToken('asin(');
        } else {
          insertToken('sin(');
        }
        return;

      case 'COS':
        if (alpha) {
          handleVariableAction('E');
        } else if (shift) {
          insertToken('acos(');
        } else {
          insertToken('cos(');
        }
        return;

      case 'TAN':
        if (alpha) {
          handleVariableAction('F');
        } else if (shift) {
          insertToken('atan(');
        } else {
          insertToken('tan(');
        }
        return;

      case 'NEG':
        if (alpha) {
          handleVariableAction('A');
        } else {
          insertToken('-');
        }
        return;

      case 'DMS':
        if (alpha) {
          handleVariableAction('B');
        } else {
          insertToken('°');
        }
        return;

      case 'INVERSE':
        if (alpha) {
          handleVariableAction('C');
        } else if (shift) {
          insertToken('!');
        } else {
          insertToken('^-1');
        }
        return;

      case 'ENG':
        if (alpha) {
          insertToken('i');
        } else {
          // ENG notation toggle
          const n = parseFloat(result);
          if (!isNaN(n)) {
            setResult(n.toExponential(3).replace('e', '×10^'));
          }
        }
        return;

      case 'INTEGRAL':
        if (shift) {
          insertToken('d/dx(x^2, 2)');
        } else if (alpha) {
          insertToken('Σ(x, 1, 5)');
        } else {
          insertToken('∫(2x, 0, 3)');
        }
        return;

      case 'ABS':
        insertToken('Abs(');
        return;

      case 'GCD':
        if (shift) {
          insertToken('LCM(');
        } else {
          insertToken('GCD(');
        }
        return;

      case 'EXP':
        if (shift) {
          insertToken('π');
        } else if (alpha) {
          insertToken('e');
        } else {
          insertToken('×10^');
        }
        return;

      case 'Ans':
        if (shift) {
          insertToken('PreAns');
        } else {
          insertToken('Ans');
        }
        return;

      case '(':
        if (shift) {
          insertToken('%');
        } else {
          insertToken('(');
        }
        return;

      case ')':
        if (alpha) {
          handleVariableAction('x');
        } else if (shift) {
          insertToken(',');
        } else {
          insertToken(')');
        }
        return;

      case 'UP':
        // Navigate history tape up
        if (history.length > 0) {
          const nextIdx = Math.min(history.length - 1, historyIndex + 1);
          setHistoryIndex(nextIdx);
          const it = history[nextIdx];
          if (it) {
            setExpression(it.expression);
            setResult(it.result);
          }
        }
        return;

      case 'DOWN':
        // Navigate history tape down
        if (history.length > 0 && historyIndex > 0) {
          const prevIdx = historyIndex - 1;
          setHistoryIndex(prevIdx);
          const it = history[prevIdx];
          if (it) {
            setExpression(it.expression);
            setResult(it.result);
          }
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setExpression('');
          setResult('');
        }
        return;

      case 'LEFT':
      case 'RIGHT':
        return;

      default:
        // Numeric digits and basic operations (*, /, +, -, etc.)
        if (shift) {
          if (action === '*') insertToken(' nPr ');
          else if (action === '/') insertToken(' nCr ');
          else if (action === '0') insertToken('Rnd(');
          else if (action === '.') insertToken(String(Math.random().toFixed(3)));
          else if (action === '1') insertToken('Pol(');
          else if (action === '2') insertToken('Rec(');
          else insertToken(action);
        } else {
          insertToken(action);
        }
        break;
    }
  }, [
    isShift,
    isAlpha,
    handleCalculate,
    handleAC,
    handleDel,
    handleSDToggle,
    handleVariableAction,
    insertToken,
    result,
    history,
    historyIndex,
  ]);

  // Physical Computer Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing inside modal inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        sound.playKeyClick('num');
        insertToken(e.key);
      } else if (e.key === '+') {
        sound.playKeyClick('num');
        insertToken('+');
      } else if (e.key === '-') {
        sound.playKeyClick('num');
        insertToken('-');
      } else if (e.key === '*') {
        sound.playKeyClick('num');
        insertToken('×');
      } else if (e.key === '/') {
        e.preventDefault();
        sound.playKeyClick('num');
        insertToken('÷');
      } else if (e.key === '.' || e.key === ',') {
        sound.playKeyClick('num');
        insertToken('.');
      } else if (e.key === '(' || e.key === ')') {
        sound.playKeyClick('func');
        insertToken(e.key);
      } else if (e.key === '^') {
        sound.playKeyClick('func');
        insertToken('^');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        sound.playKeyClick('equals');
        handleCalculate();
      } else if (e.key === 'Backspace') {
        sound.playKeyClick('clear');
        handleDel();
      } else if (e.key === 'Escape') {
        sound.playKeyClick('clear');
        handleAC();
      } else if (e.key.toLowerCase() === 'm') {
        setIsMenuOpen(true);
      } else if (e.key.toLowerCase() === 'h') {
        setIsHistoryOpen(true);
      } else if (e.key.toLowerCase() === 's') {
        setIsSetupOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [insertToken, handleCalculate, handleDel, handleAC]);

  // Restore calculation from history
  const handleRestoreFromHistory = (item: HistoryItem) => {
    setExpression(item.expression);
    setResult(item.result);
    setExactResult(item.exactResult || item.result);
    setDecimalResult(item.decimalResult || item.result);
    setIsHistoryOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#0d1217] text-neutral-100 flex flex-col font-sans select-none antialiased">
      {/* Top Application Bar */}
      <header className="w-full bg-[#11171f] border-b border-neutral-800/80 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        {/* Brand and Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-neutral-950 font-black shadow-md">
            <CalcIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                CASIO fx-580VN X
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                ClassWiz
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Mô phỏng máy tính cầm tay & lưu trữ lịch sử JSON
            </p>
          </div>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex items-center space-x-2">
          {/* History / JSON Drawer Button */}
          <button
            id="open-history-btn"
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 hover:text-amber-300 text-xs font-bold border border-neutral-700 shadow-sm transition"
            title="Xem lịch sử tính toán và dữ liệu JSON"
          >
            <History className="w-4 h-4" />
            <span className="hidden md:inline">Lịch sử JSON</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-900 text-neutral-200 border border-neutral-700">
              {history.length}
            </span>
          </button>

          {/* Variables Inspector */}
          <button
            id="open-vars-btn"
            type="button"
            onClick={() => setIsVariableInspectorOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition"
            title="Xem và chỉnh sửa các biến A, B, C, D, E, F, X, Y, M"
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline">Bộ nhớ Biến</span>
          </button>

          {/* Setup Button */}
          <button
            id="open-setup-btn"
            type="button"
            onClick={() => setIsSetupOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition flex items-center gap-1"
            title="Cài đặt máy tính (SETUP)"
          >
            <Settings className="w-4 h-4 text-neutral-300" />
            <span className="hidden lg:inline">Cài đặt</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="toggle-sound-btn"
            type="button"
            onClick={() => {
              const next = !settings.soundEnabled;
              sound.setEnabled(next);
              setSettings(prev => ({ ...prev, soundEnabled: next }));
              if (next) sound.playKeyClick('shift');
            }}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition"
            title={settings.soundEnabled ? 'Tắt âm thanh gõ phím' : 'Bật âm thanh gõ phím'}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-500" />
            )}
          </button>

          {/* Help Button */}
          <button
            id="open-help-btn"
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition"
            title="Hướng dẫn sử dụng"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
        {/* Left / Center Column: Realistic fx-580 Handheld Casing */}
        <div
          id="fx580-casing"
          className="w-full max-w-[440px] rounded-3xl bg-gradient-to-b from-[#222830] via-[#171b20] to-[#121519] border-2 border-neutral-700/80 p-4 sm:p-5 shadow-2xl flex flex-col gap-4 relative"
          style={{
            boxShadow:
              '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 2px 2px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Decorative Casio fx-580VN X Header Band */}
          <div className="flex items-center justify-between px-2 pt-1 border-b border-neutral-800 pb-2">
            <div>
              <div className="text-[13px] font-black tracking-widest text-neutral-300 font-sans">
                CASIO
              </div>
              <div className="text-[10px] font-bold text-amber-400 font-mono tracking-tight">
                fx-580VN X
              </div>
            </div>

            {/* Solar Cell Decor & ClassWiz Label */}
            <div className="flex items-center space-x-2">
              <div
                className="w-16 h-4 rounded bg-gradient-to-r from-amber-950/80 to-amber-900/60 border border-amber-900/80 shadow-inner flex items-center justify-around px-1"
                title="Solar Panel Simulator"
              >
                <div className="w-2.5 h-2.5 bg-black/40 rounded-xs" />
                <div className="w-2.5 h-2.5 bg-black/40 rounded-xs" />
                <div className="w-2.5 h-2.5 bg-black/40 rounded-xs" />
              </div>
              <span className="text-[11px] font-extrabold text-neutral-300 tracking-wider">
                CLASSWIZ
              </span>
            </div>
          </div>

          {/* High Resolution Natural Textbook LCD Screen */}
          <CalculatorScreen
            expression={expression}
            result={result}
            isShift={isShift}
            isAlpha={isAlpha}
            isSto={isSto}
            isRcl={isRcl}
            angleUnit={settings.angleUnit}
            numberFormat={settings.numberFormat}
            mode={mode}
            modeLabel={modeLabel}
            hasMemory={variables.M !== 0}
            isError={isError}
            errorMessage={errorMessage}
            cursorPos={cursorPos}
            contrast={settings.contrast}
          />

          {/* Physical Keypad */}
          <Keypad
            onKeyPress={handleKeyPress}
            isShift={isShift}
            isAlpha={isAlpha}
          />

          {/* Bottom Branding / Model info */}
          <div className="text-center text-[10px] font-mono text-neutral-500 pt-1 flex items-center justify-between px-2 border-t border-neutral-800">
            <span>NATURAL-V.P.A.M.</span>
            <span>552 FUNCTIONS</span>
          </div>
        </div>

        {/* Right Column: Quick Mode Solvers & Direct Calculation History Panel */}
        <div className="w-full lg:flex-1 max-w-xl flex flex-col gap-4">
          {/* Quick Mode Solver Panel */}
          {mode !== 'calculate' || showSpecializedView ? (
            <SpecializedModeViews
              mode={mode}
              onClose={() => {
                setShowSpecializedView(false);
                setMode('calculate');
                setModeLabel('Mode 1: Tính toán');
              }}
              onSaveToHistory={newItem => {
                const now = Date.now();
                const item: HistoryItem = {
                  ...newItem,
                  id: `calc_${now}_${Math.random().toString(36).substr(2, 4)}`,
                  timestamp: now,
                  timestampFormatted: new Date(now).toLocaleString('vi-VN'),
                };
                setHistory(prev => [item, ...prev]);
              }}
            />
          ) : (
            /* Quick Tools Card when in standard Calculate mode */
            <div className="rounded-2xl bg-[#131922] border border-neutral-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-neutral-200">
                    BẢNG ĐIỀU KHIỂN & CHẾ ĐỘ NHANH
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(true)}
                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold border border-amber-500/30 transition"
                >
                  Chọn 11 Mode (MENU)
                </button>
              </div>

              {/* Quick Mode shortcuts */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('equation');
                    setModeLabel('Mode 9: Phương trình & Hệ PT');
                  }}
                  className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500 text-left transition group"
                >
                  <span className="text-xs font-bold text-neutral-200 group-hover:text-amber-400 block">
                    Mode 9: Giải PT & Hệ PT
                  </span>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">
                    Hệ 2,3,4 ẩn & Bậc 2,3,4
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('matrix');
                    setModeLabel('Mode 4: Ma trận');
                  }}
                  className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500 text-left transition group"
                >
                  <span className="text-xs font-bold text-neutral-200 group-hover:text-amber-400 block">
                    Mode 4: Ma trận
                  </span>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">
                    det, A⁻¹, nhân ma trận
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('table');
                    setModeLabel('Mode 8: Bảng giá trị');
                  }}
                  className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500 text-left transition group"
                >
                  <span className="text-xs font-bold text-neutral-200 group-hover:text-amber-400 block">
                    Mode 8: Bảng f(x)
                  </span>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">
                    Start, End, Step
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('vector');
                    setModeLabel('Mode 5: Vectơ');
                  }}
                  className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500 text-left transition group"
                >
                  <span className="text-xs font-bold text-neutral-200 group-hover:text-amber-400 block">
                    Mode 5: Vectơ
                  </span>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">
                    Tích vô hướng, có hướng
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('complex');
                    setModeLabel('Mode 2: Số phức');
                  }}
                  className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500 text-left transition group"
                >
                  <span className="text-xs font-bold text-neutral-200 group-hover:text-amber-400 block">
                    Mode 2: Số phức
                  </span>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">
                    |z|, arg(z), liên hợp
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('base_n');
                    setModeLabel('Mode 3: Hệ cơ số Base-N');
                  }}
                  className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500 text-left transition group"
                >
                  <span className="text-xs font-bold text-neutral-200 group-hover:text-amber-400 block">
                    Mode 3: Base-N
                  </span>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">
                    DEC, HEX, BIN, OCT
                  </span>
                </button>
              </div>

              {/* Sample math buttons */}
              <div className="pt-2 border-t border-neutral-800 space-y-2">
                <span className="text-xs font-bold text-neutral-400 block">
                  Biểu thức toán học mẫu fx-580:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'sin(30) + cos(60)',
                    '√(144) + 3^3',
                    '5 nCr 2',
                    'GCD(24, 36)',
                    '∫(2x + 1, 0, 3)',
                    'd/dx(x^2, 3)',
                    'Σ(x, 1, 10)',
                  ].map(sample => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => {
                        setExpression(sample);
                        sound.playKeyClick('func');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-mono text-xs border border-neutral-800 hover:border-neutral-700 transition"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Mini History Tape */}
          <div className="rounded-2xl bg-[#131922] border border-neutral-800 p-5 shadow-xl flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-neutral-200">
                  LỊCH SỬ GẦN ĐÂY (JSON PERSISTENT)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                Mở rộng JSON →
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3 text-center">
                Chưa có phép tính nào. Hãy thực hiện tính toán trên máy tính.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {history.slice(0, 4).map(item => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-neutral-300 font-bold truncate">
                        {item.displayExpression || item.expression}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {item.modeLabel} • {item.timestampFormatted}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-400 font-black text-sm block">
                        = {item.result}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRestoreFromHistory(item)}
                        className="text-[10px] text-cyan-400 hover:underline"
                      >
                        Nạp lại
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Export JSON button */}
            <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-xs text-neutral-400">
              <span>Đã lưu {history.length} bản ghi</span>
              <button
                type="button"
                onClick={() => exportHistoryAsJSON(history)}
                className="flex items-center gap-1 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-bold transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tải tệp JSON</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODALS & DRAWERS --- */}

      {/* 1. Menu Mode Selector */}
      {isMenuOpen && (
        <MenuSelector
          currentMode={mode}
          onSelectMode={(newMode, newLabel) => {
            setMode(newMode);
            setModeLabel(newLabel);
            setIsMenuOpen(false);
            if (newMode !== 'calculate') {
              setShowSpecializedView(true);
            } else {
              setShowSpecializedView(false);
            }
            sound.playKeyClick('shift');
          }}
          onClose={() => setIsMenuOpen(false)}
        />
      )}

      {/* 2. Setup Modal */}
      {isSetupOpen && (
        <SetupModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setIsSetupOpen(false)}
        />
      )}

      {/* 3. History & JSON Drawer */}
      <HistoryDrawer
        history={history}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRestoreCalculation={handleRestoreFromHistory}
        onClearHistory={() => setHistory([])}
        onUpdateHistory={setHistory}
      />

      {/* 4. Variable Memory Inspector */}
      <VariableInspector
        variables={variables}
        onUpdateVariable={(name, val) => {
          setVariables(prev => ({ ...prev, [name]: val }));
        }}
        isOpen={isVariableInspectorOpen}
        onClose={() => setIsVariableInspectorOpen(false)}
      />

      {/* 5. Quick Help Modal */}
      <QuickHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
