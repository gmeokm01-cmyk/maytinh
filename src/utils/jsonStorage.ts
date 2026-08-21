import { HistoryItem } from '../types';

const STORAGE_KEY = 'fx580_calc_history_v1';
const SETTINGS_KEY = 'fx580_calc_settings_v1';

export function loadHistoryFromStorage(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialSampleHistory();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return getInitialSampleHistory();
  }
}

export function saveHistoryToStorage(history: HistoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to persist history to localStorage', e);
  }
}

export function exportHistoryAsJSON(history: HistoryItem[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `fx580_lich_su_tinh_toan_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseImportedJSON(jsonString: string): HistoryItem[] {
  const parsed = JSON.parse(jsonString);
  if (!Array.isArray(parsed)) {
    throw new Error('Dữ liệu JSON không đúng định dạng danh sách phép tính.');
  }

  return parsed.map((item, idx) => {
    return {
      id: item.id || `import_${Date.now()}_${idx}`,
      timestamp: item.timestamp || Date.now(),
      timestampFormatted: item.timestampFormatted || new Date().toLocaleString('vi-VN'),
      mode: item.mode || 'calculate',
      modeLabel: item.modeLabel || 'Mode 1: Tính toán',
      expression: String(item.expression || ''),
      displayExpression: String(item.displayExpression || item.expression || ''),
      result: String(item.result || '0'),
      decimalResult: item.decimalResult ? String(item.decimalResult) : undefined,
      exactResult: item.exactResult ? String(item.exactResult) : undefined,
      note: item.note ? String(item.note) : undefined,
      variablesSnapshot: item.variablesSnapshot || undefined,
      category: item.category || 'Standard',
    };
  });
}

export function getInitialSampleHistory(): HistoryItem[] {
  const now = Date.now();
  return [
    {
      id: 'sample_1',
      timestamp: now - 3600000 * 3,
      timestampFormatted: 'Hôm nay lúc ' + new Date(now - 3600000 * 3).toLocaleTimeString('vi-VN'),
      mode: 'calculate',
      modeLabel: 'Mode 1: Tính toán',
      expression: 'sin(30) + cos(60) * √(16)',
      displayExpression: 'sin(30) + cos(60) × √(16)',
      result: '2.5',
      decimalResult: '2.5',
      exactResult: '5/2',
      note: 'Lượng giác & căn bậc hai',
      category: 'Standard',
    },
    {
      id: 'sample_2',
      timestamp: now - 3600000 * 2,
      timestampFormatted: 'Hôm nay lúc ' + new Date(now - 3600000 * 2).toLocaleTimeString('vi-VN'),
      mode: 'calculate',
      modeLabel: 'Mode 1: Phân số & Tích phân',
      expression: '∫(2x + 1, 0, 3)',
      displayExpression: '∫(2x + 1, 0, 3)',
      result: '12',
      decimalResult: '12',
      exactResult: '12',
      note: 'Tích phân xác định từ 0 đến 3',
      category: 'Standard',
    },
    {
      id: 'sample_3',
      timestamp: now - 3600000,
      timestampFormatted: 'Hôm nay lúc ' + new Date(now - 3600000).toLocaleTimeString('vi-VN'),
      mode: 'equation',
      modeLabel: 'Mode 9: PT bậc 2',
      expression: '2x² - 5x + 2 = 0',
      displayExpression: '2x² − 5x + 2 = 0',
      result: 'x₁ = 2, x₂ = 0.5 (Min: x=1.25, y=-1.125)',
      decimalResult: 'x₁ = 2, x₂ = 0.5',
      exactResult: 'x₁ = 2, x₂ = 1/2',
      note: 'Giải phương trình bậc 2 có cực trị',
      category: 'Equation',
    },
    {
      id: 'sample_4',
      timestamp: now - 1800000,
      timestampFormatted: 'Hôm nay lúc ' + new Date(now - 1800000).toLocaleTimeString('vi-VN'),
      mode: 'matrix',
      modeLabel: 'Mode 4: Ma trận',
      expression: 'det(MatA) [2x2]',
      displayExpression: 'det([[4, 2], [1, 3]])',
      result: '10',
      decimalResult: '10',
      exactResult: '10',
      note: 'Định thức ma trận vuông cấp 2',
      category: 'Matrix',
    },
  ];
}
