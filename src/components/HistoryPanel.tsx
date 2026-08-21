import React, { useState } from 'react';
import { HistoryItem, MemoryVariables } from '../types';
import {
  Clock,
  Download,
  Upload,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Search,
  Code,
  FileJson,
  Layers,
  HelpCircle,
  Cloud,
  CloudCheck,
  RefreshCw,
} from 'lucide-react';
import { sound } from '../utils/sound';

interface HistoryPanelProps {
  history: HistoryItem[];
  variables: MemoryVariables;
  isFirestoreConnected?: boolean;
  isSyncing?: boolean;
  onRecallHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  onImportHistory: (imported: HistoryItem[]) => void;
  onOpenHelp: () => void;
  onRefreshFirestore?: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  variables,
  isFirestoreConnected = true,
  isSyncing = false,
  onRecallHistory,
  onClearHistory,
  onDeleteHistoryItem,
  onImportHistory,
  onOpenHelp,
  onRefreshFirestore,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'variables' | 'json'>('history');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCopiedJson, setIsCopiedJson] = useState<boolean>(false);

  // Filter history
  const filteredHistory = history.filter(item => {
    const matchesFilter =
      filterMode === 'all' ||
      (filterMode === 'standard' && (item.mode === 'calculate' || item.mode === 'complex' || item.mode === 'base_n')) ||
      (filterMode === 'equation' && (item.mode === 'equation' || item.mode === 'inequality' || item.mode === 'ratio')) ||
      (filterMode === 'matrix' && (item.mode === 'matrix' || item.mode === 'vector')) ||
      (filterMode === 'table' && (item.mode === 'table' || item.mode === 'statistics'));

    const matchesSearch =
      item.expression.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.modeLabel.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Export JSON file
  const handleExportJSON = () => {
    sound.playKeyClick('shift');
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fx580vnx-history-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy full JSON
  const handleCopyJSON = () => {
    sound.playKeyClick('shift');
    navigator.clipboard.writeText(JSON.stringify(history, null, 2));
    setIsCopiedJson(true);
    setTimeout(() => setIsCopiedJson(false), 2000);
  };

  // Import JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportHistory(parsed);
          sound.playKeyClick('func');
        } else {
          alert('Tệp JSON không hợp lệ! Vui lòng chọn tệp lịch sử fx-580 đã xuất.');
        }
      } catch (err) {
        alert('Lỗi đọc tệp JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Copy single result
  const handleCopySingle = (id: string, text: string) => {
    sound.playKeyClick('func');
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="w-full flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl text-neutral-200">
      {/* Header with Title & Action Icons */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white tracking-wide">Lịch sử & Firestore Cloud</h2>
              {/* Firestore Live Badge */}
              <div
                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold border ${
                  isFirestoreConnected
                    ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300'
                    : 'bg-amber-950/60 border-amber-700/50 text-amber-300'
                }`}
                title="Dữ liệu lịch sử được tự động đồng bộ lên Firebase Firestore (Project: quanlythoigiandocsach)"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSyncing
                      ? 'bg-amber-400 animate-ping'
                      : isFirestoreConnected
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-amber-400'
                  }`}
                />
                <span>{isSyncing ? 'Đang đồng bộ...' : isFirestoreConnected ? 'Firestore Online' : 'Offline'}</span>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400">
              Tự động lưu & đồng bộ thời gian thực lên Firebase
            </p>
          </div>
        </div>

        {/* Quick Help, Refresh & Clear */}
        <div className="flex items-center space-x-1.5">
          {onRefreshFirestore && (
            <button
              type="button"
              onClick={onRefreshFirestore}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Làm mới từ Firestore"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          )}
          <button
            type="button"
            onClick={onOpenHelp}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Hướng dẫn phím tắt & Sử dụng"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 transition-colors"
              title="Xoá toàn bộ lịch sử (Local & Firestore)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher: History / JSON Raw / Memory Variables */}
      <div className="grid grid-cols-3 gap-1 my-3 p-1 bg-neutral-950/60 rounded-xl border border-neutral-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-neutral-800 text-white shadow font-bold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Lịch sử ({history.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('json')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'json'
              ? 'bg-neutral-800 text-amber-300 shadow font-bold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileJson className="w-3.5 h-3.5" />
          <span>Tệp JSON</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('variables')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'variables'
              ? 'bg-neutral-800 text-cyan-300 shadow font-bold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Bộ nhớ</span>
        </button>
      </div>

      {/* TAB 1: HISTORY LIST */}
      {activeTab === 'history' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search and Category Filter */}
          <div className="space-y-2 mb-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm công thức hoặc kết quả..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[11px]">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'standard', label: 'Chuẩn / Phức' },
                { id: 'equation', label: 'Phương trình' },
                { id: 'matrix', label: 'Ma trận & Vct' },
                { id: 'table', label: 'Bảng / Thống kê' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterMode(f.id)}
                  className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                    filterMode === f.id
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* History Items Scrollable Container */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[380px] scrollbar-thin">
            {filteredHistory.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-neutral-800 rounded-xl bg-neutral-950/40 text-neutral-500">
                <Clock className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs font-medium text-neutral-400">Chưa có phép tính nào trong lịch sử</p>
                <p className="text-[11px] mt-1 text-neutral-500">
                  Thực hiện tính toán trên máy tính để tự động lưu vào Firestore
                </p>
              </div>
            ) : (
              filteredHistory.map(item => (
                <div
                  key={item.id}
                  className="group relative bg-neutral-950/70 hover:bg-neutral-800/80 border border-neutral-800/80 hover:border-neutral-700 rounded-xl p-3 transition-all shadow-sm"
                >
                  {/* Top info badge */}
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1.5">
                    <span className="font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {item.modeLabel}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[9px] text-emerald-400/80 font-mono flex items-center gap-0.5">
                        <Cloud className="w-2.5 h-2.5" /> Firestore
                      </span>
                      <span>•</span>
                      <span>{item.timestampFormatted}</span>
                    </div>
                  </div>

                  {/* Expression */}
                  <div className="text-xs font-mono text-neutral-300 font-semibold break-words pr-12">
                    {item.expression}
                  </div>

                  {/* Result */}
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-[11px] text-neutral-500 font-mono">=</span>
                    <span className="text-sm sm:text-base font-black font-mono text-amber-400 tracking-tight break-all text-right">
                      {item.result}
                    </span>
                  </div>

                  {/* Action buttons on hover */}
                  <div className="mt-2 pt-1.5 border-t border-neutral-800/60 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => onRecallHistory(item)}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[10px] font-medium flex items-center gap-1 transition-colors"
                      title="Nạp phép tính này vào màn hình máy tính"
                    >
                      <RotateCcw className="w-3 h-3 text-cyan-400" />
                      <span>Nạp lại</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopySingle(item.id, item.result)}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[10px] font-medium flex items-center gap-1 transition-colors"
                      title="Sao chép kết quả"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-amber-400" />
                          <span>Chép kết quả</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                      title="Xoá mục này khỏi lịch sử và Firestore"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: JSON RAW & IMPORT/EXPORT */}
      {activeTab === 'json' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-3">
          {/* JSON Export / Import Toolbar */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleExportJSON}
              className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Tải tệp JSON</span>
            </button>

            <label className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer transition-colors active:scale-95">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Nhập tệp JSON</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-amber-400" />
              <span>Dữ liệu JSON ({history.length} bản ghi đồng bộ Firestore)</span>
            </span>

            <button
              type="button"
              onClick={handleCopyJSON}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              {isCopiedJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Đã chép JSON</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sao chép JSON</span>
                </>
              )}
            </button>
          </div>

          {/* JSON Code Viewer */}
          <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl p-3 font-mono text-[11px] text-amber-300/90 overflow-y-auto max-h-[340px] select-text scrollbar-thin">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(history, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: VARIABLES MEMORY */}
      {activeTab === 'variables' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-3">
          <div className="text-xs text-neutral-400">
            Trạng thái các thanh ghi biến số hiện tại trong máy tính:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-[340px] pr-1">
            {Object.entries(variables).map(([k, val]) => (
              <div
                key={k}
                className="bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 flex flex-col justify-between"
              >
                <span className="text-[10px] font-bold text-amber-400">Biến {k}</span>
                <span className="text-sm font-black font-mono text-white mt-1 break-all">
                  {val !== undefined ? String(val) : '0'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
