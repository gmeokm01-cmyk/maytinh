import React, { useState, useEffect, useCallback } from 'react';
import {
  CalcMode,
  HistoryItem,
  MemoryVariables,
  CalculatorSettings,
} from './types';
import { evaluateExpression } from './utils/mathEngine';
import {
  loadHistoryFromStorage,
  saveHistoryToStorage,
} from './utils/jsonStorage';
import { sound } from './utils/sound';
import { CalculatorScreen } from './components/CalculatorScreen';
import { Keypad } from './components/Keypad';
import { MenuSelector } from './components/MenuSelector';
import { SetupModal } from './components/SetupModal';
import { HistoryPanel } from './components/HistoryPanel';
import { VariableInspector } from './components/VariableInspector';
import { QuickHelpModal } from './components/QuickHelpModal';
import {
  Settings,
  Database,
  HelpCircle,
  Volume2,
  VolumeX,
  Calculator as CalcIcon,
} from 'lucide-react';

export default function App() {
  // Power state (true = ON, false = OFF / black screen)
  const [isPowerOn, setIsPowerOn] = useState<boolean>(true);

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

  // Keypad event stream dispatched to active LCD sub-screen
  const [keypadAction, setKeypadAction] = useState<{ action: string; timestamp: number } | null>(null);

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

  // Handle calculation evaluation in standard / complex / base-n mode
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

  // Insert token into expression at current cursor position
  const insertToken = useCallback((token: string) => {
    setIsError(false);
    setExpression(prev => {
      const pos = Math.min(Math.max(0, cursorPos), prev.length);
      const next = prev.slice(0, pos) + token + prev.slice(pos);
      setCursorPos(pos + token.length);
      return next;
    });
  }, [cursorPos]);

  // Backspace DEL before current cursor position
  const handleDel = useCallback(() => {
    setIsError(false);
    setExpression(prev => {
      if (!prev) {
        setCursorPos(0);
        return '';
      }
      const pos = Math.min(Math.max(0, cursorPos), prev.length);
      if (pos <= 0) return prev;

      const before = prev.slice(0, pos);
      const after = prev.slice(pos);
      const funcMatch = before.match(/(sin|cos|tan|asin|acos|atan|log_|log|ln|d\/dx|∫|Σ|Abs|GCD|LCM|Pol|Rec|ˣ√|√)\($/);
      const deleteLength = funcMatch ? funcMatch[0].length : 1;

      const next = before.slice(0, -deleteLength) + after;
      setCursorPos(pos - deleteLength);
      return next;
    });
  }, [cursorPos]);

  // All Clear AC
  const handleAC = useCallback(() => {
    setIsError(false);
    setErrorMessage('');
    setExpression('');
    setCursorPos(0);
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
      const valToStore = result ? (isNaN(parseFloat(result)) ? result : parseFloat(result)) : 0;
      setVariables(prev => ({ ...prev, [varName]: valToStore }));
      setIsSto(false);
      setResult(`-> ${varName}`);
      sound.playKeyClick('shift');
    } else if (isRcl) {
      const val = variables[varName];
      insertToken(String(val));
      setIsRcl(false);
      sound.playKeyClick('shift');
    } else if (isAlpha) {
      insertToken(varName);
      setIsAlpha(false);
    }
  }, [isSto, isRcl, isAlpha, result, variables, insertToken]);

  // Save item from specialized LCD screen (Equation, Matrix, Table, Vector, etc.)
  const handleSaveSpecializedHistory = useCallback((newItem: Omit<HistoryItem, 'id' | 'timestamp' | 'timestampFormatted'>) => {
    const now = Date.now();
    const item: HistoryItem = {
      ...newItem,
      id: `calc_${now}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: now,
      timestampFormatted: new Date(now).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    };
    setHistory(prev => [item, ...prev]);
  }, []);

  // Keypad main press processor
  const handleKeyPress = useCallback((action: string, label?: string) => {
    // 1. Power ON key handling
    if (action === 'ON') {
      if (!isPowerOn) {
        setIsPowerOn(true);
        handleAC();
        setIsShift(false);
        setIsAlpha(false);
        setIsSto(false);
        setIsRcl(false);
        setIsMenuOpen(false);
        setIsSetupOpen(false);
        sound.playKeyClick('shift');
        return;
      }
      handleAC();
      setIsMenuOpen(false);
      setIsShift(false);
      setIsAlpha(false);
      return;
    }

    // 2. If the calculator is powered OFF, do not process any other keys
    if (!isPowerOn) {
      return;
    }

    // 3. SHIFT + AC = OFF (power off calculator)
    if ((action === 'AC' && isShift) || action === 'OFF') {
      setIsPowerOn(false);
      setIsShift(false);
      setIsAlpha(false);
      setIsSto(false);
      setIsRcl(false);
      setIsMenuOpen(false);
      setIsSetupOpen(false);
      sound.playKeyClick('clear');
      return;
    }

    // Notify active LCD screen of the keypad action
    setKeypadAction({ action, timestamp: Date.now() });

    // In specialized modes (Equation, Matrix, Vector, Table, Statistics, Inequality, Ratio),
    // the LCD screen handles numerical inputs, arrows, and calculation internally
    const isSpecializedScreen = [
      'equation',
      'matrix',
      'vector',
      'table',
      'statistics',
      'inequality',
      'ratio',
    ].includes(mode);

    if (action === 'MENU') {
      if (isShift) {
        setIsSetupOpen(true);
        setIsShift(false);
      } else {
        setIsMenuOpen(prev => !prev);
      }
      return;
    }

    if (action === 'SHIFT') {
      setIsShift(prev => !prev);
      setIsAlpha(false);
      return;
    }

    if (action === 'ALPHA') {
      setIsAlpha(prev => !prev);
      setIsShift(false);
      return;
    }

    // If we're on a specialized LCD screen or the LCD Menu is open, delegate controls
    if (isSpecializedScreen || isMenuOpen) {
      if (action === 'AC') {
        // Let the specialized screen catch AC to clear cell or go back to input matrix
      }
      setIsShift(false);
      setIsAlpha(false);
      return;
    }

    // Standard Math Calculation Engine Handlers
    const shift = isShift;
    const alpha = isAlpha;
    setIsShift(false);
    setIsAlpha(false);

    switch (action) {
      case 'DEL':
        handleDel();
        return;

      case 'AC':
        handleAC();
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
        setIsMenuOpen(true);
        return;

      case 'CALC':
        if (alpha) {
          insertToken(' = ');
        } else {
          handleCalculate();
        }
        return;

      case 'M_PLUS':
        if (alpha) {
          handleVariableAction('M');
        } else {
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
        if (alpha || mode === 'complex') {
          insertToken('i');
        } else {
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
        if (history.length > 0) {
          const nextIdx = Math.min(history.length - 1, historyIndex + 1);
          setHistoryIndex(nextIdx);
          const it = history[nextIdx];
          if (it) {
            setExpression(it.expression);
            setCursorPos(it.expression.length);
            setResult(it.result);
          }
        }
        return;

      case 'DOWN':
        if (history.length > 0 && historyIndex > 0) {
          const prevIdx = historyIndex - 1;
          setHistoryIndex(prevIdx);
          const it = history[prevIdx];
          if (it) {
            setExpression(it.expression);
            setCursorPos(it.expression.length);
            setResult(it.result);
          }
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setExpression('');
          setCursorPos(0);
          setResult('');
        }
        return;

      case 'LEFT':
        setCursorPos(prev => Math.max(0, prev - 1));
        return;

      case 'RIGHT':
        setCursorPos(prev => Math.min(expression.length, prev + 1));
        return;

      default:
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
    isMenuOpen,
    mode,
    expression,
    handleCalculate,
    handleAC,
    handleDel,
    handleSDToggle,
    handleVariableAction,
    insertToken,
    result,
    history,
    historyIndex,
    isPowerOn,
  ]);

  // Physical Computer Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // If calculator is powered OFF, only allow turning it ON
      if (!isPowerOn) {
        if (e.key.toLowerCase() === 'o' || e.key === 'Escape' || e.key === 'Enter') {
          handleKeyPress('ON');
        }
        return;
      }

      // Shortcut for turning OFF: Shift + Escape or Shift + C or Shift + Delete
      if (e.shiftKey && (e.key === 'Escape' || e.key === 'Delete' || e.key.toLowerCase() === 'c')) {
        e.preventDefault();
        handleKeyPress('OFF');
        return;
      }

      if (e.key.toLowerCase() === 'o') {
        handleKeyPress('ON');
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        sound.playKeyClick('num');
        handleKeyPress(e.key);
      } else if (e.key === '+') {
        sound.playKeyClick('num');
        handleKeyPress('+');
      } else if (e.key === '-') {
        sound.playKeyClick('num');
        handleKeyPress('-');
      } else if (e.key === '*') {
        sound.playKeyClick('num');
        handleKeyPress('×');
      } else if (e.key === '/') {
        e.preventDefault();
        sound.playKeyClick('num');
        handleKeyPress('÷');
      } else if (e.key === '.' || e.key === ',') {
        sound.playKeyClick('num');
        handleKeyPress('.');
      } else if (e.key === '(' || e.key === ')') {
        sound.playKeyClick('func');
        handleKeyPress(e.key);
      } else if (e.key === '^') {
        sound.playKeyClick('func');
        handleKeyPress('^');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        sound.playKeyClick('equals');
        handleKeyPress('=');
      } else if (e.key === 'Backspace') {
        sound.playKeyClick('clear');
        handleKeyPress('DEL');
      } else if (e.key === 'Escape') {
        sound.playKeyClick('clear');
        handleKeyPress('AC');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        sound.playKeyClick('func');
        handleKeyPress('UP');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        sound.playKeyClick('func');
        handleKeyPress('DOWN');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        sound.playKeyClick('func');
        handleKeyPress('LEFT');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        sound.playKeyClick('func');
        handleKeyPress('RIGHT');
      } else if (e.key.toLowerCase() === 'm') {
        setIsMenuOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 's') {
        setIsSetupOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, isPowerOn]);

  // Restore calculation from history
  const handleRestoreFromHistory = (item: HistoryItem) => {
    if (!isPowerOn) {
      setIsPowerOn(true);
    }
    if (item.mode !== mode) {
      setMode(item.mode);
      setModeLabel(item.modeLabel);
    }
    setExpression(item.expression);
    setCursorPos(item.expression.length);
    setResult(item.result);
    setExactResult(item.exactResult || item.result);
    setDecimalResult(item.decimalResult || item.result);
    sound.playKeyClick('shift');
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
          {/* Mode Switcher Quick Button */}
          <button
            id="open-menu-top-btn"
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 shadow-sm transition"
          >
            <span>{modeLabel}</span>
            <span className="text-[10px] opacity-75">(MENU)</span>
          </button>

          {/* Variables Inspector */}
          <button
            id="open-vars-btn"
            type="button"
            onClick={() => setIsVariableInspectorOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition flex items-center gap-1"
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
            title="Hướng dẫn sử dụng & Phím tắt"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </header>

      {/* Main Workspace Body: Left Handheld Calculator & Right JSON History Panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
        {/* Left Column: Realistic fx-580 Handheld Casing with Integrated In-Screen Modes */}
        <div
          id="fx580-casing"
          className="w-full max-w-[440px] rounded-[36px] bg-[#1a1f26] p-1.5 shadow-2xl relative border-4 border-[#e2e8f0]"
          style={{
            boxShadow:
              '0 30px 60px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
          }}
        >
          {/* Inner Carbon Faceplate */}
          <div
            className="w-full rounded-[30px] bg-gradient-to-b from-[#242930] via-[#1a1d22] to-[#121417] p-3.5 sm:p-4.5 flex flex-col gap-3 relative overflow-hidden border border-neutral-800"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
              backgroundSize: '4px 4px',
            }}
          >
            {/* Authentic Casio fx-580VN X Header with BITEX Hologram Badge */}
            <div className="flex items-center justify-between px-2 pt-0.5 pb-1 relative">
              {/* Left Brand */}
              <div className="text-[16px] sm:text-[18px] font-black tracking-widest text-white font-sans drop-shadow-sm">
                CASIO
              </div>

              {/* Center: TEM CHỐNG GIẢ BITEX Hologram Sticker */}
              <div
                className="relative px-2 py-0.5 rounded-sm border border-neutral-400/60 shadow-md overflow-hidden flex flex-col items-center justify-center select-none"
                style={{
                  background:
                    'linear-gradient(135deg, #d1d5db 0%, #f3f4f6 25%, #cbd5e1 50%, #e2e8f0 75%, #94a3b8 100%)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.5), inset 0 0 6px rgba(255,255,255,0.8)',
                }}
                title="Tem Chống Giả BITEX Chính Hãng"
              >
                {/* Iridescent Rainbow Sheen */}
                <div
                  className="absolute inset-0 opacity-40 mix-blend-color-dodge pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(45deg, #ff0000 0%, #ffff00 25%, #00ff00 50%, #00ffff 75%, #ff00ff 100%)',
                  }}
                />
                <div className="relative z-10 flex items-center space-x-1">
                  <svg className="w-3.5 h-3.5 text-red-600 fill-current drop-shadow-xs" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l-8-4v6l8 4 8-4v-6l-8 4z" />
                  </svg>
                  <div className="flex flex-col leading-none">
                    <span className="text-[6.5px] font-black tracking-tighter text-amber-950 uppercase">
                      TEM CHỐNG GIẢ
                    </span>
                    <span className="text-[8px] font-black tracking-wider text-red-700">
                      BITEX
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Model Number */}
              <div className="text-right">
                <div className="text-[12px] sm:text-[13px] font-black text-neutral-200 font-sans tracking-tight">
                  fx-580VN X
                </div>
              </div>
            </div>

            {/* CLASSWIZ Signature Magenta Title */}
            <div className="text-center -mt-1.5 mb-0.5">
              <span
                className="text-[12px] sm:text-[13px] font-black tracking-[0.2em] uppercase font-sans text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 drop-shadow-[0_1px_2px_rgba(244,63,94,0.3)]"
              >
                CLASSWIZ
              </span>
            </div>

            {/* High Resolution Natural Textbook LCD Screen with Full In-Screen Mode Support */}
            <CalculatorScreen
              isPowerOn={isPowerOn}
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
              isMenuOpen={isMenuOpen}
              onSelectMode={(newMode, newLabel) => {
                setMode(newMode);
                setModeLabel(newLabel);
                setIsMenuOpen(false);
                handleAC();
                sound.playKeyClick('shift');
              }}
              onCloseMenu={() => setIsMenuOpen(false)}
              onSaveToHistory={handleSaveSpecializedHistory}
              keypadAction={keypadAction}
            />

            {/* Keypad Container with Relative Positioning for BITEX Seal */}
            <div className="relative">
              {/* Physical Keypad */}
              <Keypad
                isPowerOn={isPowerOn}
                onKeyPress={handleKeyPress}
                isShift={isShift}
                isAlpha={isAlpha}
              />

              {/* Genuine Circular BITEX Stamp Seal Watermark in Bottom Right Corner */}
              <div
                className="pointer-events-none absolute bottom-1 right-1 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-cyan-500/40 opacity-35 flex flex-col items-center justify-center p-1 select-none transform rotate-[-8deg]"
                style={{
                  boxShadow: '0 0 10px rgba(6, 182, 212, 0.2)',
                }}
              >
                <div className="w-full h-full rounded-full border border-dashed border-cyan-400/50 flex flex-col items-center justify-center text-center p-0.5">
                  <span className="text-[5.5px] font-bold text-cyan-300 uppercase tracking-tighter leading-none">
                    VIỆT NAM • NHÀ PHÂN PHỐI
                  </span>
                  <div className="flex items-center space-x-0.5 my-0.5">
                    <svg className="w-3 h-3 text-red-500 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l-8-4v6l8 4 8-4v-6l-8 4z" />
                    </svg>
                    <span className="text-[9px] font-black text-cyan-200 tracking-wider">
                      BITEX
                    </span>
                  </div>
                  <span className="text-[5px] font-bold text-cyan-300 uppercase tracking-tighter leading-none">
                    ĐỘC QUYỀN MÁY TÍNH CASIO
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Branding / Specs Info */}
            <div className="text-center text-[9px] font-mono text-neutral-400 pt-1 flex items-center justify-between px-2 border-t border-neutral-800">
              <span className="tracking-wider">NATURAL-V.P.A.M.</span>
              <span className="font-bold text-neutral-300">552 FUNCTIONS</span>
            </div>
          </div>
        </div>

        {/* Right Column: EXCLUSIVELY for History & JSON Management */}
        <div className="w-full lg:flex-1 max-w-xl flex flex-col h-full min-h-[580px]">
          <HistoryPanel
            history={history}
            variables={variables}
            onRecallHistory={handleRestoreFromHistory}
            onClearHistory={() => setHistory([])}
            onDeleteHistoryItem={id => setHistory(prev => prev.filter(i => i.id !== id))}
            onImportHistory={imported => setHistory(prev => [...imported, ...prev])}
            onOpenHelp={() => setIsHelpOpen(true)}
          />
        </div>
      </main>

      {/* --- GLOBAL POPUP MODALS --- */}

      {/* 1. Menu Mode Selector Modal (Alternative to LCD Menu) */}
      {isMenuOpen && (
        <MenuSelector
          currentMode={mode}
          onSelectMode={(newMode, newLabel) => {
            setMode(newMode);
            setModeLabel(newLabel);
            setIsMenuOpen(false);
            handleAC();
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

      {/* 3. Variable Memory Inspector Modal */}
      <VariableInspector
        variables={variables}
        onUpdateVariable={(name, val) => {
          setVariables(prev => ({ ...prev, [name]: val }));
        }}
        isOpen={isVariableInspectorOpen}
        onClose={() => setIsVariableInspectorOpen(false)}
      />

      {/* 4. Quick Help Modal */}
      <QuickHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
