import React from 'react';
import { School, User, Calendar, ShieldCheck, Sparkles, MapPin, Clock } from 'lucide-react';
import { ClassMetadata } from '../types';

interface ClassHeaderProps {
  metadata?: ClassMetadata;
  totalStudents: number;
  onOpenStudents?: () => void;
}

export const ClassHeader: React.FC<ClassHeaderProps> = ({ metadata, totalStudents }) => {
  const safeMetadata: ClassMetadata = {
    schoolName: metadata?.schoolName || 'THCS Phan Bội Châu',
    className: metadata?.className || 'Lớp 9A2',
    teacherName: metadata?.teacherName || 'Dương Thành Tín',
    headTeacher: metadata?.headTeacher || 'Dương Thành Tín',
    academicYear: metadata?.academicYear || '2026–2027',
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-amber-600/20 mb-8 border border-amber-400/40">
      {/* Decorative subtle background accents */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-yellow-200/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/15 backdrop-blur-md text-amber-100 text-xs font-semibold tracking-wide uppercase mb-3 border border-white/25">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Hệ thống quản lý chủ nhiệm điện tử</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3 drop-shadow-xs">
            <span>{safeMetadata.className}</span>
            <span className="text-amber-200 text-2xl sm:text-3xl font-normal">—</span>
            <span className="text-xl sm:text-2xl font-medium text-amber-100">{safeMetadata.schoolName}</span>
          </h1>

          <p className="mt-2 text-amber-50/95 text-sm sm:text-base max-w-2xl leading-relaxed">
            Bảng điều khiển công tác chủ nhiệm số hóa hằng ngày của thầy giáo <strong className="text-white font-semibold">{safeMetadata.teacherName}</strong>. Theo dõi chuyên cần, đánh giá nề nếp, quỹ lớp và liên lạc phụ huynh nhanh chóng.
          </p>
        </div>

        {/* Informative Badges */}
        <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2.5 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/15 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium">
            <School className="w-4 h-4 text-amber-200" />
            <span>{safeMetadata.schoolName}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/15 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium">
            <User className="w-4 h-4 text-amber-200" />
            <span>GVCN: <strong>{safeMetadata.teacherName}</strong></span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/20 backdrop-blur-md border border-white/25 text-white text-xs sm:text-sm font-semibold text-yellow-200">
            <Calendar className="w-4 h-4 text-yellow-300" />
            <span>Năm học: {safeMetadata.academicYear}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/30 backdrop-blur-md border border-emerald-300/40 text-emerald-100 text-xs sm:text-sm font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Sĩ số: {totalStudents} học sinh</span>
          </div>
        </div>
      </div>

      {/* Classroom Quick Meta Strip */}
      <div className="mt-6 pt-4 border-t border-white/20 flex flex-wrap items-center gap-4 text-xs text-amber-100/90">
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
    </section>
  );
};
