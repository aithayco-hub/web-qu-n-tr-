import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Home,
  Users,
  CalendarDays,
  BookOpen,
  ChevronDown,
  UserCheck,
  RotateCcw,
  Sparkles,
  Download,
  Info,
  Database,
  Camera,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Check
} from 'lucide-react';
import { ActiveScreen, ClassMetadata } from '../types';
import { compressImage } from '../utils/imageCompressor';

interface NavbarProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  metadata?: ClassMetadata;
  onUpdateMetadata?: (updated: Partial<ClassMetadata>) => void;
  onResetData?: () => void;
  onShowClassInfo?: () => void;
  onShowYearConfig?: () => void;
  onOpenClassInfo?: () => void;
  onOpenYearConfig?: () => void;
  onOpenSupabase?: () => void;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncTime?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  metadata,
  onUpdateMetadata,
  onResetData,
  onShowClassInfo,
  onShowYearConfig,
  onOpenClassInfo,
  onOpenYearConfig,
  onOpenSupabase,
  syncStatus = 'idle',
  lastSyncTime,
}) => {
  const safeMetadata: ClassMetadata = metadata || {
    schoolName: 'THCS Phan Bội Châu',
    className: 'Lớp 9A2',
    teacherName: 'Dương Thành Tín',
    headTeacher: 'Dương Thành Tín',
    academicYear: '2026–2027',
  };

  const handleClassInfo = onShowClassInfo || onOpenClassInfo || (() => {});
  const handleYearConfig = onShowYearConfig || onOpenYearConfig || (() => {});
  const handleUpdate = onUpdateMetadata || (() => {});
  const handleReset = onResetData || (() => {});

  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarUploadMsg, setAvatarUploadMsg] = useState<string | null>(null);

  const yearRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const availableYears = [
    '2024–2025',
    '2025–2026',
    '2026–2027',
    '2027–2028',
  ];

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressed = await compressImage(file, 400, 400, 0.88);
        handleUpdate({ teacherAvatar: compressed });
        setAvatarUploadMsg('Đã cập nhật ảnh đại diện');
        setTimeout(() => setAvatarUploadMsg(null), 2500);
      } catch (err) {
        console.error('Lỗi khi nén ảnh đại diện:', err);
      }
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressed = await compressImage(file, 1600, 700, 0.82);
        handleUpdate({ bannerBackground: compressed });
        setAvatarUploadMsg('Đã cập nhật ảnh bìa');
        setTimeout(() => setAvatarUploadMsg(null), 2500);
      } catch (err) {
        console.error('Lỗi khi nén ảnh banner:', err);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
        setYearDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Left: App Title & Icon */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
              title="Về Trang chủ"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-600 flex items-center justify-center text-white shadow-md shadow-amber-500/25 group-hover:shadow-amber-500/35 transition-all">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <span className="block text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Sổ tay điện tử
                </span>
                <span className="block text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Giáo viên chủ nhiệm
                </span>
              </div>
            </button>
          </div>

          {/* Center: Main Navigation buttons */}
          <nav className="flex items-center gap-1 md:gap-2">
            <button
              id="nav-home"
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentScreen === 'home'
                  ? 'bg-amber-600 text-white shadow-xs shadow-amber-600/30'
                  : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50/70'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Trang chủ</span>
            </button>

            <button
              id="nav-students"
              onClick={() => onNavigate('students')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentScreen === 'students'
                  ? 'bg-amber-600 text-white shadow-xs shadow-amber-600/30'
                  : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50/70'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Danh sách học sinh</span>
            </button>

            <button
              id="nav-year-config"
              onClick={handleYearConfig}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50/70 transition-all"
              title="Cấu hình năm học & học kỳ"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden lg:inline">Cấu hình năm học</span>
            </button>

            <button
              id="nav-class-info"
              onClick={handleClassInfo}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50/70 transition-all"
              title="Thông tin lớp học 9A2"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden lg:inline">Lớp học</span>
            </button>
          </nav>

          {/* Right: School Year Dropdown & Teacher Info */}
          <div className="flex items-center gap-2">
            {/* Hidden file inputs for Teacher Avatar & Banner */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
            />

            {/* Supabase Cloud Sync Quick Button with dynamic status */}
            {onOpenSupabase && (
              <button
                id="btn-nav-supabase-sync"
                onClick={onOpenSupabase}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer border ${
                  syncStatus === 'syncing'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : syncStatus === 'error'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-emerald-50/90 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                }`}
                title={
                  syncStatus === 'syncing'
                    ? 'Đang tự động lưu lên Supabase Cloud...'
                    : syncStatus === 'error'
                    ? 'Có lỗi khi lưu lên Cloud. Bấm để kiểm tra.'
                    : `Đã lưu trên Supabase Cloud an toàn${lastSyncTime ? ` lúc ${lastSyncTime}` : ''}`
                }
              >
                {syncStatus === 'syncing' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                    <span className="hidden sm:inline">Đang lưu...</span>
                  </>
                ) : syncStatus === 'error' ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span className="hidden sm:inline">Lỗi Cloud</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Đã lưu Cloud</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </>
                )}
              </button>
            )}

            {/* Year Selector */}
            <div className="relative" ref={yearRef}>
              <button
                id="btn-select-year"
                onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50/80 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs"
              >
                <span>{safeMetadata.academicYear}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${yearDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {yearDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                    Chọn năm học
                  </div>
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        handleUpdate({ academicYear: year });
                        setYearDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-amber-50 transition-colors ${
                        safeMetadata.academicYear === year
                          ? 'text-amber-700 font-bold bg-amber-50/60'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>Năm học {year}</span>
                      {safeMetadata.academicYear === year && (
                        <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Teacher Profile / Settings Menu */}
            <div className="relative" ref={userRef}>
              <button
                id="btn-teacher-profile"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-slate-50 transition-all cursor-pointer"
                title="Thông tin giáo viên & Tùy chọn"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-300">
                  {safeMetadata.teacherAvatar ? (
                    <img
                      src={safeMetadata.teacherAvatar}
                      alt={safeMetadata.teacherName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>DTT</span>
                  )}
                </div>
                <div className="hidden xl:block text-left">
                  <span className="block text-xs font-bold text-slate-800 leading-none">
                    Thầy {safeMetadata.teacherName}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    GVCN {safeMetadata.className}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
                  {/* Teacher Avatar & Header */}
                  <div className="px-3 py-3 border-b border-slate-100 flex items-center gap-3">
                    <div className="relative group shrink-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shadow-xs border border-amber-200">
                        {safeMetadata.teacherAvatar ? (
                          <img
                            src={safeMetadata.teacherAvatar}
                            alt={safeMetadata.teacherName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>DTT</span>
                        )}
                      </div>
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs hover:bg-amber-700 transition-colors cursor-pointer"
                        title="Tải ảnh đại diện mới"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Giáo viên chủ nhiệm</p>
                      <p className="text-sm font-bold text-slate-900 truncate">Thầy {safeMetadata.teacherName}</p>
                      <p className="text-xs text-slate-500 truncate">{safeMetadata.className} • {safeMetadata.schoolName}</p>
                    </div>
                  </div>

                  {avatarUploadMsg && (
                    <div className="mx-2 mt-2 p-2 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 animate-in fade-in">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{avatarUploadMsg}</span>
                    </div>
                  )}

                  {/* Image upload options */}
                  <div className="py-1.5 border-b border-slate-100">
                    <button
                      onClick={() => {
                        avatarInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-amber-600" />
                      <span>{safeMetadata.teacherAvatar ? 'Thay đổi ảnh đại diện' : 'Tải ảnh đại diện mới'}</span>
                    </button>

                    <button
                      onClick={() => {
                        bannerInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      <span>{safeMetadata.bannerBackground ? 'Thay đổi ảnh bìa' : 'Tải ảnh bìa trang chủ'}</span>
                    </button>

                    {safeMetadata.teacherAvatar && (
                      <button
                        onClick={() => {
                          handleUpdate({ teacherAvatar: undefined });
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[11px] text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Gỡ ảnh đại diện</span>
                      </button>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleClassInfo();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Info className="w-4 h-4 text-blue-500" />
                      <span>Thông tin lớp học chi tiết</span>
                    </button>

                    <button
                      onClick={() => {
                        handleYearConfig();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <CalendarDays className="w-4 h-4 text-indigo-500" />
                      <span>Cấu hình học kỳ & phân công</span>
                    </button>

                    {onOpenSupabase && (
                      <button
                        onClick={() => {
                          onOpenSupabase();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Database className="w-4 h-4 text-emerald-600" />
                          <span>Đồng bộ Supabase Cloud</span>
                        </div>
                        {syncStatus === 'synced' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        handleReset();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-amber-600" />
                      <span>Đặt lại dữ liệu mẫu lớp 9A2</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
