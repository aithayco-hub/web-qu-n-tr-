import React, { useRef, useState } from 'react';
import {
  School,
  User,
  Calendar,
  ShieldCheck,
  Sparkles,
  MapPin,
  Clock,
  Camera,
  Upload,
  RotateCcw,
  Check,
  UserCircle
} from 'lucide-react';
import { ClassMetadata } from '../types';
import { compressImage } from '../utils/imageCompressor';

interface ClassHeaderProps {
  metadata?: ClassMetadata;
  totalStudents: number;
  onOpenStudents?: () => void;
  onUpdateMetadata?: (updated: Partial<ClassMetadata>) => void;
}

export const ClassHeader: React.FC<ClassHeaderProps> = ({
  metadata,
  totalStudents,
  onOpenStudents,
  onUpdateMetadata,
}) => {
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  const safeMetadata: ClassMetadata = {
    schoolName: metadata?.schoolName || 'THCS Phan Bội Châu',
    className: metadata?.className || 'Lớp 9A2',
    teacherName: metadata?.teacherName || 'Dương Thành Tín',
    headTeacher: metadata?.headTeacher || 'Dương Thành Tín',
    academicYear: metadata?.academicYear || '2026–2027',
    teacherAvatar: metadata?.teacherAvatar,
    bannerBackground: metadata?.bannerBackground,
  };

  const handleBannerUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (PNG, JPG, WEBP).');
      return;
    }

    try {
      const compressed = await compressImage(file, 1600, 700, 0.82);
      if (compressed && onUpdateMetadata) {
        onUpdateMetadata({ bannerBackground: compressed });
        setUploadSuccessMessage('Đã cập nhật ảnh bìa mới');
        setTimeout(() => setUploadSuccessMessage(null), 2500);
      }
    } catch (err) {
      console.error('Lỗi khi nén ảnh banner:', err);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (PNG, JPG, WEBP).');
      return;
    }

    try {
      const compressed = await compressImage(file, 400, 400, 0.88);
      if (compressed && onUpdateMetadata) {
        onUpdateMetadata({ teacherAvatar: compressed });
        setUploadSuccessMessage('Đã cập nhật ảnh đại diện GVCN');
        setTimeout(() => setUploadSuccessMessage(null), 2500);
      }
    } catch (err) {
      console.error('Lỗi khi nén ảnh đại diện:', err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleBannerUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateMetadata) {
      onUpdateMetadata({ bannerBackground: undefined });
    }
  };

  const hasCustomBanner = Boolean(safeMetadata.bannerBackground);

  return (
    <section
      id="classroom-main-header"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`group relative overflow-hidden text-white rounded-3xl p-6 sm:p-8 sm:py-9 shadow-xl mb-8 border transition-all duration-300 min-h-[220px] flex flex-col justify-between ${
        isDragging
          ? 'ring-4 ring-amber-400 border-amber-300 scale-[1.005]'
          : 'border-amber-400/25'
      } ${
        hasCustomBanner
          ? 'shadow-amber-950/20'
          : 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 shadow-amber-600/20'
      }`}
      style={
        hasCustomBanner
          ? {
              backgroundImage: `url(${safeMetadata.bannerBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center right',
              backgroundRepeat: 'no-repeat',
            }
          : undefined
      }
    >
      {/* Hidden File Input for Banner */}
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleBannerUpload(e.target.files[0]);
          }
        }}
      />

      {/* Hidden File Input for Teacher Avatar */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleAvatarUpload(e.target.files[0]);
          }
        }}
      />

      {/* Gentle gradient scrim to keep left-hand text 100% legible while keeping teacher photo on the right completely clear */}
      {hasCustomBanner && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-950/80 via-amber-900/40 to-transparent pointer-events-none" />
      )}

      {/* Subtle background glow when using gradient */}
      {!hasCustomBanner && (
        <>
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-yellow-200/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        </>
      )}

      {/* Dragging state overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-30 bg-amber-700/85 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 border-2 border-dashed border-white rounded-3xl animate-in fade-in duration-200">
          <Upload className="w-10 h-10 mb-2 animate-bounce" />
          <p className="text-base font-bold">Thả ảnh bìa vào đây để cập nhật</p>
        </div>
      )}

      {/* Subtle Discreet Controls: Hidden by default, gently appears only on hover in top-right */}
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 bg-black/50 hover:bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-xs shadow-lg">
        <button
          id="btn-subtle-change-banner"
          onClick={() => bannerInputRef.current?.click()}
          className="flex items-center gap-1.5 text-white/90 hover:text-white font-medium transition-colors cursor-pointer"
          title="Thay đổi ảnh bìa banner"
        >
          <Camera className="w-3.5 h-3.5 text-yellow-300" />
          <span>{hasCustomBanner ? 'Đổi ảnh bìa' : 'Tải ảnh bìa'}</span>
        </button>

        <span className="text-white/30">•</span>

        <button
          id="btn-subtle-change-avatar"
          onClick={() => avatarInputRef.current?.click()}
          className="flex items-center gap-1.5 text-white/90 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
          title="Tải ảnh đại diện giáo viên"
        >
          <UserCircle className="w-3.5 h-3.5 text-emerald-300" />
          <span>Đổi ảnh đại diện</span>
        </button>

        {hasCustomBanner && (
          <>
            <span className="text-white/30">•</span>
            <button
              id="btn-subtle-remove-banner"
              onClick={handleRemoveBanner}
              className="flex items-center gap-1 text-white/70 hover:text-rose-300 font-medium transition-colors cursor-pointer"
              title="Khôi phục nền màu mặc định"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Khôi phục nền</span>
            </button>
          </>
        )}
      </div>

      {/* Quick success toast pill */}
      {uploadSuccessMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-emerald-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in zoom-in-95">
          <Check className="w-3.5 h-3.5" />
          <span>{uploadSuccessMessage}</span>
        </div>
      )}

      {/* Main Content Layout: Left side for info, right side completely open for teacher's portrait */}
      <div className="relative z-10 max-w-xl lg:max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-amber-100 text-xs font-semibold tracking-wide uppercase mb-3 border border-white/20">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Hệ thống quản lý chủ nhiệm điện tử</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-2.5 drop-shadow-md">
          <span>{safeMetadata.className}</span>
          <span className="text-amber-200 text-2xl font-normal">—</span>
          <span className="text-xl sm:text-2xl font-medium text-amber-100">{safeMetadata.schoolName}</span>
        </h1>

        <p className="mt-2 text-amber-50/95 text-sm sm:text-base leading-relaxed drop-shadow-xs">
          Bảng điều khiển công tác chủ nhiệm số hóa hằng ngày của thầy giáo{' '}
          <strong className="text-white font-bold">{safeMetadata.teacherName}</strong>. Theo dõi chuyên cần, đánh giá nề nếp, quỹ lớp và liên lạc phụ huynh nhanh chóng.
        </p>

        {/* Compact metadata pills placed neatly on the left side */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-md border border-white/20 text-white font-medium">
            <School className="w-3.5 h-3.5 text-amber-200" />
            <span>{safeMetadata.schoolName}</span>
          </div>

          <div
            onClick={() => avatarInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/20 hover:bg-black/35 backdrop-blur-md border border-white/20 text-white font-medium cursor-pointer transition-colors"
            title="Bấm để đổi ảnh đại diện GVCN"
          >
            {safeMetadata.teacherAvatar ? (
              <img
                src={safeMetadata.teacherAvatar}
                alt={safeMetadata.teacherName}
                className="w-5 h-5 rounded-full object-cover border border-amber-300 shadow-xs"
              />
            ) : (
              <User className="w-3.5 h-3.5 text-amber-200" />
            )}
            <span>GVCN: <strong>{safeMetadata.teacherName}</strong></span>
            <Camera className="w-3 h-3 text-amber-200/70 hover:text-white" />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-md border border-white/20 text-yellow-200 font-medium">
            <Calendar className="w-3.5 h-3.5 text-yellow-300" />
            <span>Năm học: {safeMetadata.academicYear}</span>
          </div>

          <button
            onClick={onOpenStudents}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/35 hover:bg-emerald-600/50 backdrop-blur-md border border-emerald-300/40 text-emerald-100 font-semibold transition-colors cursor-pointer"
            title="Xem danh sách học sinh"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Sĩ số: {totalStudents} học sinh</span>
          </button>
        </div>
      </div>

      {/* Classroom Quick Meta Strip at bottom */}
      <div className="relative z-10 mt-6 pt-3.5 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-100/90">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-200" />
            <span>Phòng học: P.204 (Khu A)</span>
          </div>
          <span className="hidden sm:inline text-white/40">•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-200" />
            <span>Ca học: Buổi Sáng (07:00 – 11:30)</span>
          </div>
          <span className="hidden sm:inline text-white/40">•</span>
          <div className="flex items-center gap-1.5 text-emerald-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Trạng thái: Hoạt động bình thường</span>
          </div>
        </div>
      </div>
    </section>
  );
};
