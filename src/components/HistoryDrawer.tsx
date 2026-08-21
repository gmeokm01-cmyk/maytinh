import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { 
  exportHistoryAsJSON, 
  parseImportedJSON, 
  getInitialSampleHistory 
} from '../utils/jsonStorage';
import { 
  History, 
  FileJson, 
  Download, 
  Upload, 
  Copy, 
  Trash2, 
  RotateCcw, 
  Search, 
  Check, 
  ArrowUpRight, 
  Sparkles,
  X
} from 'lucide-react';
import { sound } from '../utils/sound';

interface HistoryDrawerProps {
  history: HistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onRestoreCalculation: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onUpdateHistory: (newHistory: HistoryItem[]) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  isOpen,
  onClose,
  onRestoreCalculation,
  onClearHistory,
  onUpdateHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'tape' | 'json'>('tape');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter(item => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.expression.toLowerCase().includes(q) ||
      item.result.toLowerCase().includes(q) ||
      item.modeLabel.toLowerCase().includes(q) ||
      (item.note && item.note.toLowerCase().includes(q))
    );
  });

  const handleCopyJSON = () => {
    try {
      const jsonStr = JSON.stringify(history, null, 2);
      navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      sound.playKeyClick('shift');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleExportJSON = () => {
    sound.playKeyClick('func');
    exportHistoryAsJSON(history);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const imported = parseImportedJSON(text);
        onUpdateHistory(imported);
        setImportSuccess(`Đã nhập thành công ${imported.length} phép tính từ file JSON!`);
        sound.playKeyClick('equals');
        setTimeout(() => setImportSuccess(null), 4000);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Lỗi đọc file JSON');
        sound.playKeyClick('error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadSamples = () => {
    const samples = getInitialSampleHistory();
    onUpdateHistory([...samples, ...history]);
    sound.playKeyClick('shift');
    setImportSuccess(`Đã nạp ${samples.length} phép tính mẫu chuẩn fx-580!`);
    setTimeout(() => setImportSuccess(null), 3000);
  };

  const handleDeleteItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    onUpdateHistory(updated);
    sound.playKeyClick('clear');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        id="history-drawer-panel"
        className="w-full max-w-xl h-full bg-neutral-900 border-l border-neutral-800 text-white flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <span>Lịch Sử Tính Toán (JSON)</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-800 text-amber-400 border border-neutral-700">
                  {history.length}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">Lưu trữ, xem lại và xuất/nhập tệp JSON</p>
            </div>
          </div>
          <button
            id="close-history-drawer-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Action bar */}
        <div className="px-5 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center space-x-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <button
              id="history-tab-tape"
              type="button"
              onClick={() => setActiveTab('tape')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
                activeTab === 'tape'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Danh sách</span>
            </button>
            <button
              id="history-tab-json"
              type="button"
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
                activeTab === 'json'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Dữ liệu JSON</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-1.5">
            <button
              id="export-json-btn"
              type="button"
              onClick={handleExportJSON}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg text-xs font-bold border border-neutral-700 transition"
              title="Tải xuống tệp JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Xuất JSON</span>
            </button>

            <label
              htmlFor="json-file-input"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg text-xs font-bold border border-neutral-700 transition cursor-pointer"
              title="Nhập dữ liệu từ tệp JSON"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Nhập JSON</span>
              <input
                id="json-file-input"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              id="clear-history-btn"
              type="button"
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xoá toàn bộ lịch sử tính toán không?')) {
                  onClearHistory();
                  sound.playKeyClick('clear');
                }
              }}
              className="p-1.5 bg-neutral-800 hover:bg-red-900/50 text-neutral-400 hover:text-red-300 rounded-lg text-xs border border-neutral-700 transition"
              title="Xoá toàn bộ lịch sử"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification alerts */}
        {importSuccess && (
          <div className="px-5 py-2 bg-emerald-950/80 border-b border-emerald-800 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{importSuccess}</span>
          </div>
        )}
        {importError && (
          <div className="px-5 py-2 bg-red-950/80 border-b border-red-800 text-red-300 text-xs font-medium flex items-center gap-2">
            <X className="w-4 h-4 text-red-400 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        {/* Tab 1: Tape List */}
        {activeTab === 'tape' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search Input */}
            <div className="px-5 py-3 border-b border-neutral-800 bg-neutral-950/50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="search-history-input"
                  type="text"
                  placeholder="Tìm kiếm biểu thức, kết quả hoặc chế độ..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            {/* List entries */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3">
              {filteredHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-3">
                  <History className="w-12 h-12 opacity-30" />
                  <p className="text-sm font-semibold text-neutral-400">Chưa có phép tính nào trong lịch sử</p>
                  <p className="text-xs max-w-xs text-neutral-500">
                    Thực hiện các phép tính trên máy tính hoặc nhấn nút bên dưới để nạp các biểu thức mẫu fx-580.
                  </p>
                  <button
                    id="load-samples-btn"
                    type="button"
                    onClick={handleLoadSamples}
                    className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Nạp phép tính mẫu fx-580</span>
                  </button>
                </div>
              ) : (
                filteredHistory.map(item => (
                  <div
                    key={item.id}
                    id={`history-item-${item.id}`}
                    className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 hover:border-neutral-700 transition space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 border-b border-neutral-800/80 pb-1.5">
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-amber-400 font-semibold font-mono">
                        {item.modeLabel}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span>{item.timestampFormatted}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition"
                          title="Xoá mục này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expression */}
                    <div className="font-mono text-sm font-bold text-neutral-200 break-all">
                      {item.displayExpression || item.expression}
                    </div>

                    {/* Result and exact form */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-xs text-neutral-400 font-mono">
                        {item.exactResult && item.exactResult !== item.result && (
                          <span className="text-cyan-400 mr-2">≈ {item.exactResult}</span>
                        )}
                        {item.note && <span className="text-neutral-500 italic text-[11px]">({item.note})</span>}
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-base text-amber-400">
                          = {item.result}
                        </span>

                        <button
                          id={`restore-btn-${item.id}`}
                          type="button"
                          onClick={() => {
                            onRestoreCalculation(item);
                            sound.playKeyClick('shift');
                          }}
                          className="p-1 rounded bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-300 text-xs transition"
                          title="Đưa vào máy tính"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Raw JSON View & Editor */}
        {activeTab === 'json' && (
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-400 font-mono">
                Cấu trúc JSON ({history.length} bản ghi)
              </span>
              <button
                id="copy-json-btn"
                type="button"
                onClick={handleCopyJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-bold border border-neutral-700 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sao chép JSON</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Block Container */}
            <div className="flex-1 rounded-xl bg-neutral-950 border border-neutral-800 p-4 font-mono text-xs text-emerald-400 overflow-auto shadow-inner leading-relaxed select-text">
              <pre>{JSON.stringify(history, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400">
          <span>Dữ liệu được tự động lưu cục bộ & đồng bộ tức thì.</span>
          <button
            id="drawer-close-bottom-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-bold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
