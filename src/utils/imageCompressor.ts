/**
 * Utility nén và tối ưu hóa hình ảnh trước khi lưu trữ
 * Giúp giảm dung lượng ảnh đại diện và ảnh bìa từ hàng MB xuống chỉ vài chục/trăm KB,
 * đảm bảo không bao giờ bị tràn dung lượng localStorage và lưu lên Supabase trong nháy mắt.
 */

export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Tệp không phải là định dạng hình ảnh hợp lệ'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Tính toán kích thước mới giữ nguyên tỉ lệ
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback nếu không khởi tạo được 2d canvas
          resolve(e.target?.result as string);
          return;
        }

        // Vẽ ảnh lên canvas với kích thước tối ưu
        ctx.drawImage(img, 0, 0, width, height);

        // Xuất ra định dạng JPEG với chất lượng nén cao
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch {
          resolve(e.target?.result as string);
        }
      };

      img.onerror = () => reject(new Error('Không thể đọc dữ liệu hình ảnh'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Lỗi khi đọc tệp từ thiết bị'));
    reader.readAsDataURL(file);
  });
}
