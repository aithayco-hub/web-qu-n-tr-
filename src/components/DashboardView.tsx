import React, { useState } from 'react';
import {
  ClipboardCheck,
  Wallet,
  UserCheck2,
  MessageSquare,
  Users,
  BarChart3,
  Award,
  CalendarDays,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Coins,
  Phone,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  FileSpreadsheet,
  Check,
  BookOpen,
  Send,
  UserCheck
} from 'lucide-react';
import {
  Student,
  DailyAttendance,
  AttendanceStatus,
  ConductRecord,
  FinanceRecord,
  ContactRecord,
  RewardDisciplineRecord,
  ScheduleEvent,
  ActiveScreen,
  ClassMetadata
} from '../types';
import { formatCurrency } from '../utils/storage';

interface DashboardViewProps {
  students: Student[];
  todayAttendance?: DailyAttendance;
  conductList: ConductRecord[];
  financeList: FinanceRecord[];
  contactsList: ContactRecord[];
  awardsList: RewardDisciplineRecord[];
  scheduleList: ScheduleEvent[];
  metadata?: ClassMetadata;
  onNavigate: (screen: ActiveScreen) => void;
  onQuickAttendance?: (records: Record<string, { status: AttendanceStatus; note?: string }>) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  todayAttendance,
  conductList,
  financeList,
  contactsList,
  awardsList,
  scheduleList,
  metadata,
  onNavigate,
  onQuickAttendance,
}) => {
  const [quickSearch, setQuickSearch] = useState('');
  const [attendanceJustUpdated, setAttendanceJustUpdated] = useState(false);

  // Compute stats
  const totalStudents = students.length;
  const maleCount = students.filter((s) => s.gender === 'Nam').length;
  const femaleCount = students.filter((s) => s.gender === 'Nữ').length;

  // Attendance details
  let presentCount = 0;
  let excusedCount = 0;
  let unexcusedCount = 0;
  let lateCount = 0;

  const absentOrLateStudents: Array<{
    student: Student;
    status: AttendanceStatus;
    note?: string;
  }> = [];

  if (todayAttendance && todayAttendance.records) {
    Object.entries(todayAttendance.records).forEach(([studentId, r]) => {
      const rec = r as { status: AttendanceStatus; note?: string };
      if (rec.status === 'present') presentCount++;
      if (rec.status === 'excused') excusedCount++;
      if (rec.status === 'unexcused') unexcusedCount++;
      if (rec.status === 'late') lateCount++;

      if (rec.status !== 'present') {
        const s = students.find((item) => item.id === studentId);
        if (s) {
          absentOrLateStudents.push({
            student: s,
            status: rec.status,
            note: rec.note,
          });
        }
      }
    });
  } else {
    presentCount = totalStudents;
  }

  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 100;

  // Finance calculations
  const totalIncome = financeList
    .filter((f) => f.type === 'thu')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = financeList
    .filter((f) => f.type === 'chi')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const currentBalance = totalIncome - totalExpense;
  const recentFinance = [...financeList].reverse().slice(0, 3);

  // Pending contacts
  const pendingContacts = contactsList.filter((c) => c.status === 'pending');
  const resolvedContactsCount = contactsList.filter((c) => c.status === 'resolved').length;

  // Awards & disciplines
  const recentAwards = awardsList.filter((a) => a.type === 'reward').slice(0, 3);
  const recentDisciplines = awardsList.filter((a) => a.type === 'discipline').slice(0, 2);

  // Key student leaders
  const studentLeaders = students.filter((s) =>
    ['Lớp trưởng', 'Lớp phó', 'Bí thư', 'Tổ trưởng'].includes(s.role)
  );

  // Upcoming schedule events
  const upcomingEvents = scheduleList.slice(0, 2);

  // Quick mark 100% present
  const handleMarkAllPresent = () => {
    if (onQuickAttendance) {
      const newRecords: Record<string, { status: AttendanceStatus; note?: string }> = {};
      students.forEach((s) => {
        newRecords[s.id] = { status: 'present' };
      });
      onQuickAttendance(newRecords);
      setAttendanceJustUpdated(true);
      setTimeout(() => setAttendanceJustUpdated(false), 3000);
    } else {
      onNavigate('attendance');
    }
  };

  // Filtered students for quick find
  const filteredLeaders = quickSearch.trim()
    ? students.filter((s) =>
        s.fullName.toLowerCase().includes(quickSearch.toLowerCase()) ||
        s.parentPhone.includes(quickSearch) ||
        s.role.toLowerCase().includes(quickSearch.toLowerCase())
      ).slice(0, 4)
    : studentLeaders.slice(0, 4);

  return (
    <div id="teacher-command-workspace" className="space-y-6">
      {/* 1. TOP QUICK ACTION COMMAND BAR */}
      <section
        id="quick-command-bar"
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Bàn làm việc số GVCN
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">Hôm nay, Buổi sáng</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Không gian quản lý & điều phối lớp học
            </h2>
          </div>
        </div>

        {/* Quick 1-touch actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="quick-btn-attendance"
            onClick={() => onNavigate('attendance')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs sm:text-sm font-semibold border border-amber-200/70 transition-all active:scale-95"
          >
            <UserCheck2 className="w-4 h-4 text-amber-600" />
            <span>Điểm danh lớp</span>
          </button>

          <button
            id="quick-btn-conduct"
            onClick={() => onNavigate('conduct')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200 transition-all active:scale-95"
          >
            <ClipboardCheck className="w-4 h-4 text-blue-600" />
            <span>Sổ nề nếp</span>
          </button>

          <button
            id="quick-btn-finance"
            onClick={() => onNavigate('finance')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200 transition-all active:scale-95"
          >
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>Thu / Chi quỹ</span>
          </button>

          <button
            id="quick-btn-contacts"
            onClick={() => onNavigate('contacts')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200 transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span>Liên hệ PHHS</span>
            {pendingContacts.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                {pendingContacts.length}
              </span>
            )}
          </button>

          <button
            id="quick-btn-students"
            onClick={() => onNavigate('students')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95"
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Hồ sơ 40 HS</span>
          </button>
        </div>
      </section>

      {/* 2. MAIN BENTO WORKSPACE GRID (Left 7 cols, Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* === LEFT COLUMN: CORE OPERATIONS (7 Columns) === */}
        <div className="lg:col-span-7 space-y-6">

          {/* BENTO 1: LIVE ATTENDANCE CENTER (Trung tâm chuyên cần trực tiếp) */}
          <div
            id="bento-attendance-center"
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Điểm danh trực tiếp hôm nay
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Chuyên cần: {presentCount}/{totalStudents} học sinh
                </h3>
              </div>

              {/* Attendance Rate Pill */}
              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-emerald-600">{attendanceRate}%</div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Tỉ lệ có mặt</div>
              </div>
            </div>

            {/* Attendance Progress Bar */}
            <div className="mt-4">
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(presentCount / (totalStudents || 1)) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`Có mặt: ${presentCount}`}
                />
                <div
                  style={{ width: `${(excusedCount / (totalStudents || 1)) * 100}%` }}
                  className="bg-amber-400 h-full transition-all duration-500"
                  title={`Có phép: ${excusedCount}`}
                />
                <div
                  style={{ width: `${(unexcusedCount / (totalStudents || 1)) * 100}%` }}
                  className="bg-rose-500 h-full transition-all duration-500"
                  title={`Không phép: ${unexcusedCount}`}
                />
                <div
                  style={{ width: `${(lateCount / (totalStudents || 1)) * 100}%` }}
                  className="bg-blue-500 h-full transition-all duration-500"
                  title={`Đi muộn: ${lateCount}`}
                />
              </div>

              {/* Legend breakdown */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Có mặt: <strong>{presentCount}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Có phép: <strong>{excusedCount}</strong></span>
                </div>
                {unexcusedCount > 0 && (
                  <div className="flex items-center gap-1.5 font-medium text-rose-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Không phép: <strong>{unexcusedCount}</strong></span>
                  </div>
                )}
                {lateCount > 0 && (
                  <div className="flex items-center gap-1.5 font-medium text-blue-700">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Đi muộn: <strong>{lateCount}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Absent or Late List OR 100% Present State */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              {absentOrLateStudents.length === 0 ? (
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-900">
                        Tuyệt vời! Toàn bộ 40 em đều có mặt đầy đủ
                      </p>
                      <p className="text-xs text-emerald-700">
                        Lớp giữ vững nề nếp chuyên cần 100% đúng giờ.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('attendance')}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shrink-0"
                  >
                    Xem sổ điểm danh
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                    <span>Học sinh vắng / đi trễ cần lưu ý ({absentOrLateStudents.length}):</span>
                    <span className="text-slate-400">Bấm số để liên hệ phụ huynh</span>
                  </div>
                  {absentOrLateStudents.map(({ student, status, note }) => (
                    <div
                      key={student.id}
                      className="bg-slate-50 hover:bg-slate-100/80 transition-colors rounded-xl p-3 flex items-center justify-between gap-3 border border-slate-100"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {student.orderNumber}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm truncate">
                              {student.fullName}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                status === 'excused'
                                  ? 'bg-amber-100 text-amber-800'
                                  : status === 'late'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {status === 'excused' ? 'Nghỉ phép' : status === 'late' ? 'Đi muộn' : 'Không phép'}
                            </span>
                          </div>
                          {note && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              Lý do: {note}
                            </p>
                          )}
                        </div>
                      </div>

                      <a
                        href={`tel:${student.parentPhone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-xs font-semibold rounded-lg border border-slate-200 hover:border-amber-200 transition-colors shrink-0"
                        title={`Gọi phụ huynh: ${student.parentPhone}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-600" />
                        <span className="hidden sm:inline">{student.parentPhone}</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons under attendance */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  id="btn-mark-all-present"
                  onClick={handleMarkAllPresent}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{attendanceJustUpdated ? 'Đã lưu điểm danh đủ!' : 'Đánh dấu cả lớp có mặt'}</span>
                </button>

                <button
                  id="btn-full-attendance"
                  onClick={() => onNavigate('attendance')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-700 transition-colors"
                >
                  <span>Mở bảng điểm danh đầy đủ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* BENTO 2: TODAY'S TIMETABLE & TASKS (Thời khóa biểu & Lịch công tác) */}
          <div
            id="bento-schedule-agenda"
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Kế hoạch hoạt động
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-amber-600" />
                  <span>Thời khóa biểu & Nhiệm vụ hôm nay</span>
                </h3>
              </div>

              <button
                onClick={() => onNavigate('schedule')}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200/60 transition-colors flex items-center gap-1"
              >
                <span>Xem cả tuần</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick 5-Period timetable badge strip */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
              <div className="text-xs font-semibold text-slate-500 mb-2.5 flex items-center justify-between">
                <span>5 Tiết học buổi sáng hôm nay (Thứ Hai):</span>
                <span className="text-amber-700 font-bold">Lớp 9A2 • P.204</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 text-center shadow-2xs">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Tiết 1</span>
                  <span className="block text-xs font-extrabold text-slate-900 mt-0.5">Chào cờ</span>
                  <span className="block text-[10px] text-amber-700 mt-0.5">Toàn trường</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 text-center shadow-2xs">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Tiết 2</span>
                  <span className="block text-xs font-extrabold text-slate-900 mt-0.5">Toán hình</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">Thầy Tín</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 text-center shadow-2xs">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Tiết 3</span>
                  <span className="block text-xs font-extrabold text-slate-900 mt-0.5">Ngữ văn</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">Cô Mai</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 text-center shadow-2xs">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Tiết 4</span>
                  <span className="block text-xs font-extrabold text-slate-900 mt-0.5">Tiếng Anh</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">Cô Lan</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 text-center shadow-2xs">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Tiết 5</span>
                  <span className="block text-xs font-extrabold text-slate-900 mt-0.5">Vật lý</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">Thầy Hải</span>
                </div>
              </div>
            </div>

            {/* Upcoming key events from scheduleList */}
            <div className="mt-4 space-y-2.5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Sự kiện & Việc chủ nhiệm sắp tới:
              </div>
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white hover:bg-slate-50/80 transition-colors rounded-xl p-3.5 border border-slate-200/80 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{evt.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {evt.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{evt.content}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-amber-700 block">{evt.date}</span>
                    <span className="text-[10px] text-slate-400 block">{evt.time || 'Buổi sáng'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BENTO 3: HONOR ROLL & MERIT (Tuyên dương & Hoa điểm 10) */}
          <div
            id="bento-honor-roll"
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Phong trào thi đua
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span>Tuyên dương hoa điểm tốt & Nề nếp lớp</span>
                </h3>
              </div>
              <button
                onClick={() => onNavigate('awards')}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <span>Xem sổ thi đua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Positive rewards */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Khen thưởng mới nhất:</span>
                </span>
                {recentAwards.map((item) => {
                  const s = students.find((st) => st.id === item.studentId);
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100/80 flex items-start gap-2.5"
                    >
                      <div className="w-6 h-6 rounded-md bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        +{item.points || 5}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {s?.fullName || 'Học sinh lớp 9A2'}
                        </p>
                        <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug line-clamp-1">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reminders / Disciplinary note */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Lưu ý rèn luyện nề nếp:</span>
                </span>
                {recentDisciplines.map((item) => {
                  const s = students.find((st) => st.id === item.studentId);
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 flex items-start gap-2.5"
                    >
                      <div className="w-6 h-6 rounded-md bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {item.points || -2}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {s?.fullName || 'Học sinh lớp 9A2'}
                        </p>
                        <p className="text-[11px] text-amber-900 mt-0.5 leading-snug line-clamp-1">
                          {item.title}: {item.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {recentDisciplines.length === 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-500 text-xs italic">
                    Không có trường hợp nào vi phạm nề nếp.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* === RIGHT COLUMN: TREASURY, PARENTS & LEADERS (5 Columns) === */}
        <div className="lg:col-span-5 space-y-6">

          {/* BENTO 4: CLASS TREASURY (Sổ quỹ & Tài chính lớp) */}
          <div
            id="bento-class-treasury"
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Ngân quỹ minh bạch
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <span>Quỹ phụ huynh lớp 9A2</span>
                </h3>
              </div>
              <button
                onClick={() => onNavigate('finance')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Sổ quỹ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Premium Gold/Amber Card Design */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-700 text-white p-5 shadow-md shadow-amber-600/15 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-between text-xs text-amber-100">
                <span className="font-semibold uppercase tracking-wider">Số dư khả dụng</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px]">
                  Học kỳ I
                </span>
              </div>

              <div className="relative z-10 mt-2 text-2xl sm:text-3xl font-black text-white tracking-tight">
                {formatCurrency(currentBalance)}
              </div>

              <div className="relative z-10 mt-4 pt-3 border-t border-white/20 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-amber-200 text-[11px] block">Tổng thu:</span>
                  <span className="font-bold text-white block">{formatCurrency(totalIncome)}</span>
                </div>
                <div>
                  <span className="text-amber-200 text-[11px] block">Tổng chi:</span>
                  <span className="font-bold text-white block">{formatCurrency(totalExpense)}</span>
                </div>
              </div>
            </div>

            {/* Recent 3 transactions */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                <span>Giao dịch gần nhất:</span>
                <button
                  onClick={() => onNavigate('finance')}
                  className="text-emerald-600 hover:text-emerald-700 text-[11px] font-bold"
                >
                  + Thêm phiếu
                </button>
              </div>

              {recentFinance.map((f) => (
                <div
                  key={f.id}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between gap-2 border border-slate-100"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-slate-800 text-xs block truncate">
                      {f.title}
                    </span>
                    <span className="text-[11px] text-slate-400 block">{f.date}</span>
                  </div>
                  <span
                    className={`text-xs font-extrabold shrink-0 ${
                      f.type === 'thu' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {f.type === 'thu' ? '+' : '-'}
                    {formatCurrency(f.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* BENTO 5: PARENT CONTACTS (Sổ liên lạc & Kết nối phụ huynh) */}
          <div
            id="bento-parent-contacts"
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Kênh trao đổi 2 chiều
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                  <span>Sổ liên lạc Phụ huynh</span>
                </h3>
              </div>
              <button
                onClick={() => onNavigate('contacts')}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pending calls alert */}
            {pendingContacts.length > 0 ? (
              <div className="bg-rose-50 border border-rose-200/70 rounded-2xl p-3.5 mb-3.5">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Có {pendingContacts.length} việc cần liên hệ phụ huynh hôm nay:</span>
                </div>
                <div className="mt-2 space-y-2">
                  {pendingContacts.map((ct) => {
                    const s = students.find((st) => st.id === ct.studentId);
                    return (
                      <div
                        key={ct.id}
                        className="bg-white p-2.5 rounded-xl border border-rose-100 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {s?.fullName || 'Học sinh'} ({s?.role || 'Thành viên'})
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {ct.content}
                          </p>
                        </div>
                        {s?.parentPhone && (
                          <a
                            href={`tel:${s.parentPhone}`}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg shrink-0 transition-colors"
                            title={`Gọi ngay ${s.parentPhone}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5 mb-3.5 flex items-center gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mọi trao đổi với phụ huynh trong tuần đều đã được xử lý xong.</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Đã liên hệ: <strong>{resolvedContactsCount}</strong> lượt</span>
              <button
                onClick={() => onNavigate('contacts')}
                className="text-amber-700 hover:text-amber-800 font-bold text-xs"
              >
                + Ghi nhật ký trao đổi
              </button>
            </div>
          </div>

          {/* BENTO 6: CLASS LEADERSHIP TEAM (Ban cán sự lớp 9A2) */}
          <div
            id="bento-class-leaders"
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Nòng cốt tự quản
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>Ban cán sự lớp</span>
                </h3>
              </div>
              <button
                onClick={() => onNavigate('students')}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <span>Hồ sơ cả lớp</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm nhanh học sinh / SĐT..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Leaders list */}
            <div className="space-y-2">
              {filteredLeaders.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onNavigate('students')}
                  className="group cursor-pointer p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-100 hover:border-amber-200 transition-all flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {s.fullName.slice(-1)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 text-xs block truncate group-hover:text-amber-800">
                        {s.fullName}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {s.role} • Tổ {s.groupNumber}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-amber-700 shrink-0">
                    Xem &rarr;
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 3. BOTTOM ANALYTICS & INSIGHT BAR */}
      <section
        id="bottom-class-insights"
        className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Chỉ số tổng hợp năm học 2026–2027</span>
          </div>
          <h4 className="text-xl font-bold text-white">
            Lớp 9A2 duy trì thành tích thi đua xuất sắc
          </h4>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Sĩ số 40 học sinh (20 Nam, 20 Nữ) • Dự kiến xếp loại Hạnh kiểm: 100% Tốt và Khá • Số dư quỹ lớp ổn định đảm bảo các hoạt động học kỳ I.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('stats')}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            Mở báo cáo thống kê chi tiết
          </button>
          <button
            onClick={() => onNavigate('students')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/15 transition-all"
          >
            Xuất danh sách Excel
          </button>
        </div>
      </section>
    </div>
  );
};
