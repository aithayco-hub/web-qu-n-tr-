import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  CloudUpload,
  CloudDownload,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  Code2,
  Sparkles,
  Settings,
  KeyRound,
  Globe,
  RotateCcw,
} from 'lucide-react';
import {
  SQL_SCHEMA_SCRIPT,
  testSupabaseConnection,
  uploadAppStateToSupabase,
  fetchAppStateFromSupabase,
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  resetSupabaseConfig,
  getSupabaseProjectRef,
  normalizeSupabaseUrl,
} from '../lib/supabase';
import { AppState } from '../utils/storage';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: AppState;
  onRestoreState: (state: AppState) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  currentState,
  onRestoreState,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'sql' | 'config'>('sync');
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    tableReady: boolean;
    message: string;
  } | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('GVCN_LAST_SUPABASE_SYNC');
  });

  // Connection fields
  const currentConfig = getStoredSupabaseConfig();
  const [inputUrl, setInputUrl] = useState(currentConfig.url);
  const [inputKey, setInputKey] = useState(currentConfig.key);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const projectRef = getSupabaseProjectRef();

  const checkConnection = async () => {
    setIsTesting(true);
    const result = await testSupabaseConnection();
    setConnectionStatus(result);
    setIsTesting(false);
  };

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredSupabaseConfig();
      setInputUrl(cfg.url);
      setInputKey(cfg.key);
      checkConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingConfig(true);
    const cleanedUrl = normalizeSupabaseUrl(inputUrl);
    saveSupabaseConfig(cleanedUrl, inputKey);
    setInputUrl(cleanedUrl);
    showToast('Đã lưu cấu hình kết nối Supabase!', 'success');
    await checkConnection();
    setIsSavingConfig(false);
  };

  const handleResetConfig = () => {
    resetSupabaseConfig();
    const cfg = getStoredSupabaseConfig();
    setInputUrl(cfg.url);
    setInputKey(cfg.key);
    showToast('Đã khôi phục cấu hình mặc định ban đầu!', 'info');
    checkConnection();
  };

  const handleUpload = async () => {
    setIsUploading(true);
    const res = await uploadAppStateToSupabase(currentState);
    setIsUploading(false);

    if (res.success) {
      const now = new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN');
      setLastSyncTime(now);
      localStorage.setItem('GVCN_LAST_SUPABASE_SYNC', now);
      showToast('Đã đồng bộ toàn bộ dữ liệu lớp học lên Supabase Cloud thành công!', 'success');
      setConnectionStatus((prev) => (prev ? { ...prev, tableReady: true } : null));
    } else {
      showToast(`Không thể đồng bộ: ${res.error}. Hãy đảm bảo thầy đã chạy mã SQL để tạo bảng.`, 'error');
      if (res.error?.includes('schema cache') || res.error?.includes('does not exist')) {
        setActiveTab('sql');
      }
    }
  };

  const handleDownload = async () => {
    if (
      !window.confirm(
        'Thao tác này sẽ tải dữ liệu mới nhất từ Supabase về và thay thế dữ liệu trên máy hiện tại. Thầy có muốn tiếp tục?'
      )
    ) {
      return;
    }

    setIsDownloading(true);
    const res = await fetchAppStateFromSupabase();
    setIsDownloading(false);

    if (res.success && res.data) {
      onRestoreState(res.data);
      const now = new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN');
      setLastSyncTime(now);
      localStorage.setItem('GVCN_LAST_SUPABASE_SYNC', now);
      showToast('Đã tải và áp dụng dữ liệu từ Supabase Cloud thành công!', 'success');
      onClose();
    } else {
      showToast(`Không thể tải dữ liệu: ${res.error}`, 'error');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopiedSql(true);
    showToast('Đã sao chép toàn bộ mã SQL khởi tạo bảng!', 'success');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Database className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Cơ sở dữ liệu Supabase Cloud</h2>
              <p className="text-xs text-emerald-100/90">Lưu trữ & đồng bộ dữ liệu lớp học trực tuyến an toàn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sync'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Đồng bộ dữ liệu</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Mã SQL tạo bảng {connectionStatus && !connectionStatus.tableReady && ' (Cần chạy)'}</span>
            {connectionStatus && !connectionStatus.tableReady && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cấu hình kết nối</span>
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Connection Status Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Thông tin dự án Supabase
              </span>
              <button
                onClick={checkConnection}
                disabled={isTesting}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Kiểm tra kết nối</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Project URL:</span>
                <span className="font-mono font-medium text-slate-800 truncate block" title={inputUrl}>
                  {inputUrl}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">API Key Type:</span>
                <span className="font-mono font-medium text-emerald-600 truncate block">
                  Publishable Key ({inputKey.slice(0, 16)}...)
                </span>
              </div>
            </div>

            {/* Connection Status Indicator */}
            {isTesting ? (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Đang kiểm tra kết nối tới Supabase...</span>
              </div>
            ) : connectionStatus ? (
              connectionStatus.tableReady ? (
                <div className="flex items-center gap-2.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">
                    🟢 Máy chủ đã kết nối & bảng dữ liệu trên Supabase đã sẵn sàng đồng bộ!
                  </span>
                </div>
              ) : connectionStatus.connected ? (
                <div className="flex items-start gap-2.5 text-xs text-amber-900 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Đã kết nối máy chủ Supabase thành công!</span>
                    <p className="mt-0.5 text-amber-800 leading-relaxed">
                      Tuy nhiên cơ sở dữ liệu của thầy chưa tạo bảng <code className="bg-amber-100 px-1 rounded">classroom_state</code>. Thầy chỉ cần bấm sang tab <strong>"Mã SQL tạo bảng"</strong> và chạy mã 1 lần duy nhất trong Supabase SQL Editor.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-xs text-rose-800 bg-rose-50 border border-rose-200 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{connectionStatus.message}</span>
                </div>
              )
            ) : null}
          </div>

          {activeTab === 'sync' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Upload Action */}
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2">
                      <CloudUpload className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">Đồng bộ lên Supabase</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Tải toàn bộ danh sách {currentState.students.length} học sinh, nề nếp, điểm danh và quỹ lớp hiện tại lên cơ sở dữ liệu đám mây.
                    </p>
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang tải lên...</span>
                      </>
                    ) : (
                      <>
                        <CloudUpload className="w-3.5 h-3.5" />
                        <span>Đẩy dữ liệu lên Cloud</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Download Action */}
                <div className="p-4 rounded-2xl border border-teal-200 bg-teal-50/40 hover:bg-teal-50/70 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-2">
                      <CloudDownload className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">Tải dữ liệu từ Supabase</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Khôi phục hoặc nạp dữ liệu mới nhất đã lưu trên Supabase về máy tính/điện thoại này.
                    </p>
                  </div>

                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isDownloading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang tải về...</span>
                      </>
                    ) : (
                      <>
                        <CloudDownload className="w-3.5 h-3.5" />
                        <span>Tải dữ liệu từ Cloud</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {lastSyncTime && (
                <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  Lần đồng bộ gần nhất: <strong className="text-slate-700">{lastSyncTime}</strong>
                </div>
              )}
            </div>
          ) : activeTab === 'sql' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Hướng dẫn khởi tạo bảng trên Supabase (Chỉ cần làm 1 lần):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  <li>
                    Bấm nút <strong>"Sao chép toàn bộ mã SQL"</strong> ở bên dưới.
                  </li>
                  <li>
                    Mở trình duyệt vào trang SQL Editor của dự án:{' '}
                    <a
                      href={`https://supabase.com/dashboard/project/${projectRef}/sql/new`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Mở Supabase SQL Editor</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    Dán (Paste) đoạn mã vào và bấm nút <strong>"Run"</strong> (Chạy) màu xanh lá. Xong!
                  </li>
                </ol>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-slate-600">Đoạn mã SQL (PostgreSQL & RLS):</span>
                  <button
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    {copiedSql ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã sao chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép toàn bộ mã SQL</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-56 select-all border border-slate-800 leading-relaxed">
                  {SQL_SCHEMA_SCRIPT}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleSaveConfig} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Supabase Project URL</span>
                  </label>
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-800 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    (Hệ thống tự động chuẩn hóa URL, loại bỏ phần /rest/v1/ nếu có)
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Supabase Publishable / Anon Key</span>
                  </label>
                  <input
                    type="password"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="sb_publishable_..."
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-800 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Khóa công khai an toàn (Publishable Key / Anon Key)
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleResetConfig}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 text-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Khôi phục mặc định</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
                  >
                    {isSavingConfig ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Lưu & Kiểm tra kết nối</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Bảo mật với Row Level Security (RLS) của Supabase</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
