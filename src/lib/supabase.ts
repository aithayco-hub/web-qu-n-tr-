import { createClient } from '@supabase/supabase-js';
import {
  Student,
  DailyAttendance,
  ConductRecord,
  FinanceRecord,
  ContactRecord,
  RewardDisciplineRecord,
  ScheduleEvent,
  ClassMetadata,
} from '../types';
import { AppState } from '../utils/storage';

// Default to user's connected Supabase project
const DEFAULT_RAW_URL = 'https://ensvdjrepgfgkywspzhf.supabase.co';
const DEFAULT_KEY = 'sb_publishable_S3E7rNpzctFS6pkJiL5tJA_AXN3Mw-7';

/**
 * Chuẩn hóa URL Supabase: loại bỏ /rest/v1/ hoặc dấu / thừa ở cuối
 * Vì @supabase/supabase-js yêu cầu Root Project URL (https://xyz.supabase.co)
 */
export function normalizeSupabaseUrl(url: string): string {
  if (!url) return '';
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export function getStoredSupabaseConfig(): { url: string; key: string } {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('GVCN_SUPABASE_URL') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('GVCN_SUPABASE_KEY') : null;

  const rawUrl = localUrl || import.meta.env.VITE_SUPABASE_URL || DEFAULT_RAW_URL;
  const key = localKey || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;

  return {
    url: normalizeSupabaseUrl(rawUrl),
    key: key.trim(),
  };
}

export function getSupabaseProjectRef(): string {
  const { url } = getStoredSupabaseConfig();
  try {
    const parsed = new URL(url);
    const hostParts = parsed.hostname.split('.');
    if (hostParts.length > 0) {
      return hostParts[0];
    }
  } catch {
    // fallback
  }
  return 'ensvdjrepgfgkywspzhf';
}

const initialConfig = getStoredSupabaseConfig();

export let SUPABASE_URL = initialConfig.url;
export let SUPABASE_ANON_KEY = initialConfig.key;

// Initialize Supabase Client
export let supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export function saveSupabaseConfig(url: string, key: string) {
  const cleanUrl = normalizeSupabaseUrl(url);
  const cleanKey = key.trim();

  if (typeof window !== 'undefined') {
    localStorage.setItem('GVCN_SUPABASE_URL', cleanUrl);
    localStorage.setItem('GVCN_SUPABASE_KEY', cleanKey);
  }

  SUPABASE_URL = cleanUrl;
  SUPABASE_ANON_KEY = cleanKey;

  supabase = createClient(cleanUrl, cleanKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export function resetSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('GVCN_SUPABASE_URL');
    localStorage.removeItem('GVCN_SUPABASE_KEY');
  }

  const defUrl = normalizeSupabaseUrl(DEFAULT_RAW_URL);
  SUPABASE_URL = defUrl;
  SUPABASE_ANON_KEY = DEFAULT_KEY;

  supabase = createClient(defUrl, DEFAULT_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export const SQL_SCHEMA_SCRIPT = `-- ==============================================================
-- SQL KHỞI TẠO BẢNG QUẢN LÝ LỚP HỌC CHO SUPABASE
-- Chạy đoạn mã này tại: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================

-- 1. Bảng lưu trữ trạng thái tổng hợp (Đồng bộ nhanh nhất)
CREATE TABLE IF NOT EXISTS public.classroom_state (
  key text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Bảng Học sinh
CREATE TABLE IF NOT EXISTS public.students (
  id text PRIMARY KEY,
  order_number integer,
  full_name text NOT NULL,
  gender text,
  dob text,
  parent_phone text,
  parent_name text,
  role text,
  group_number integer,
  address text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Bảng Điểm danh hằng ngày
CREATE TABLE IF NOT EXISTS public.attendance (
  date text PRIMARY KEY,
  records jsonb NOT NULL DEFAULT '{}'::jsonb,
  present_count integer DEFAULT 0,
  absent_permitted_count integer DEFAULT 0,
  absent_unpermitted_count integer DEFAULT 0,
  late_count integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Bảng Đánh giá nề nếp
CREATE TABLE IF NOT EXISTS public.conduct (
  id text PRIMARY KEY,
  student_id text,
  period_type text,
  period_value text,
  rank text,
  feedback text,
  created_date text
);

-- 5. Bảng Thu chi quỹ lớp
CREATE TABLE IF NOT EXISTS public.finance (
  id text PRIMARY KEY,
  type text NOT NULL,
  title text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  date text NOT NULL,
  category text,
  notes text,
  payer_or_receiver text
);

-- 6. Bảng Sổ liên lạc phụ huynh
CREATE TABLE IF NOT EXISTS public.contacts (
  id text PRIMARY KEY,
  student_id text,
  date text NOT NULL,
  content text NOT NULL,
  parent_feedback text,
  status text DEFAULT 'pending',
  notes text
);

-- 7. Bảng Khen thưởng & Kỷ luật
CREATE TABLE IF NOT EXISTS public.awards (
  id text PRIMARY KEY,
  type text NOT NULL,
  student_id text,
  title text NOT NULL,
  date text NOT NULL,
  content text,
  points integer DEFAULT 0,
  notes text
);

-- 8. Bảng Lịch công tác chủ nhiệm
CREATE TABLE IF NOT EXISTS public.schedule (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text,
  date text NOT NULL,
  time text,
  location text,
  content text,
  completed boolean DEFAULT false
);

-- 9. Bảng Thông tin lớp học (Metadata)
CREATE TABLE IF NOT EXISTS public.class_metadata (
  id text PRIMARY KEY,
  school_name text,
  class_name text,
  teacher_name text,
  head_teacher text,
  academic_year text,
  teacher_avatar text,
  banner_background text,
  updated_at timestamp with time zone DEFAULT now()
);

-- BẬT ROW LEVEL SECURITY (RLS) VÀ CẤP QUYỀN TRUY CẬP CHO ANON/PUBLISHABLE KEY
ALTER TABLE public.classroom_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conduct ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_metadata ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách cho phép ứng dụng đọc và ghi dữ liệu
DROP POLICY IF EXISTS "Allow anon all on classroom_state" ON public.classroom_state;
CREATE POLICY "Allow anon all on classroom_state" ON public.classroom_state FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on students" ON public.students;
CREATE POLICY "Allow anon all on students" ON public.students FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on attendance" ON public.attendance;
CREATE POLICY "Allow anon all on attendance" ON public.attendance FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on conduct" ON public.conduct;
CREATE POLICY "Allow anon all on conduct" ON public.conduct FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on finance" ON public.finance;
CREATE POLICY "Allow anon all on finance" ON public.finance FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on contacts" ON public.contacts;
CREATE POLICY "Allow anon all on contacts" ON public.contacts FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on awards" ON public.awards;
CREATE POLICY "Allow anon all on awards" ON public.awards FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on schedule" ON public.schedule;
CREATE POLICY "Allow anon all on schedule" ON public.schedule FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on class_metadata" ON public.class_metadata;
CREATE POLICY "Allow anon all on class_metadata" ON public.class_metadata FOR ALL TO anon USING (true) WITH CHECK (true);
`;

/**
 * Kiểm tra kết nối tới Supabase và tình trạng bảng
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  tableReady: boolean;
  message: string;
}> {
  try {
    const { error } = await supabase.from('classroom_state').select('key').limit(1);

    if (!error) {
      return {
        connected: true,
        tableReady: true,
        message: 'Kết nối Supabase thành công và bảng dữ liệu đã sẵn sàng!',
      };
    }

    // Nếu mã lỗi PGRST205: bảng chưa được tạo
    if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
      return {
        connected: true,
        tableReady: false,
        message: 'Đã kết nối được máy chủ Supabase, nhưng bảng dữ liệu chưa được khởi tạo trong SQL Editor.',
      };
    }

    return {
      connected: false,
      tableReady: false,
      message: `Lỗi kết nối: ${error.message}`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    return {
      connected: false,
      tableReady: false,
      message,
    };
  }
}

/**
 * Lưu toàn bộ trạng thái vào bảng classroom_state trên Supabase,
 * đồng thời đồng bộ metadata và danh sách học sinh vào các bảng riêng để tra cứu
 */
export async function uploadAppStateToSupabase(state: AppState): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      key: 'primary_classroom_data',
      data: state,
      updated_at: new Date().toISOString(),
    };

    // 1. Lưu snapshot toàn diện vào classroom_state
    const { error: stateError } = await supabase.from('classroom_state').upsert(payload);

    if (stateError) {
      return { success: false, error: stateError.message };
    }

    // 2. Đồng thời cập nhật bảng class_metadata (để lưu thông tin GVCN, ảnh đại diện, ảnh bìa độc lập)
    try {
      const meta = state.metadata || ({} as Partial<ClassMetadata>);
      await supabase.from('class_metadata').upsert({
        id: 'primary',
        school_name: meta.schoolName || 'THCS Phan Bội Châu',
        class_name: meta.className || 'Lớp 9A2',
        teacher_name: meta.teacherName || 'Dương Thành Tín',
        head_teacher: meta.headTeacher || 'Dương Thành Tín',
        academic_year: meta.academicYear || '2026–2027',
        teacher_avatar: meta.teacherAvatar || null,
        banner_background: meta.bannerBackground || null,
        updated_at: new Date().toISOString(),
      });
    } catch (metaErr) {
      console.warn('Lỗi phụ khi cập nhật class_metadata (không ảnh hưởng chính):', metaErr);
    }

    // 3. Đồng thời cập nhật danh sách học sinh vào bảng students nếu có
    if (state.students && state.students.length > 0) {
      try {
        const studentRows = state.students.map((s) => ({
          id: s.id,
          order_number: s.orderNumber,
          full_name: s.fullName,
          gender: s.gender,
          dob: s.dob,
          parent_phone: s.parentPhone || '',
          parent_name: s.parentName || '',
          role: s.role || 'Thành viên',
          group_number: s.groupNumber || 1,
          address: s.address || '',
          notes: s.notes || '',
        }));
        await supabase.from('students').upsert(studentRows);
      } catch (stuErr) {
        console.warn('Lỗi phụ khi cập nhật bảng students (không ảnh hưởng chính):', stuErr);
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Lỗi không xác định khi tải lên Supabase';
    return { success: false, error };
  }
}

/**
 * Tải toàn bộ trạng thái từ Supabase về
 */
export async function fetchAppStateFromSupabase(): Promise<{
  success: boolean;
  data?: AppState;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('classroom_state')
      .select('data')
      .eq('key', 'primary_classroom_data')
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data || !data.data) {
      return { success: false, error: 'Chưa có dữ liệu nào được lưu trên Supabase' };
    }

    return { success: true, data: data.data as AppState };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Lỗi không xác định khi tải từ Supabase';
    return { success: false, error };
  }
}
