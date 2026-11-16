# Leaf — Góc đọc cá nhân

App reading chạy local, không cần tài khoản hay API key. React + TypeScript + Vite cho giao diện, Node HTTP + SQLite cho lưu trữ. Không gửi bài đọc tới dịch vụ bên ngoài.

## Cài và chạy trên Windows

Cần Node.js **22.13 trở lên** (khuyến nghị Node 24 LTS). Node SQLite hiện có thể in cảnh báo experimental trên Node 22; đây không phải lỗi.

Mở terminal trong thư mục dự án:

```powershell
npm.cmd install
npm.cmd run dev
```

Mở **http://127.0.0.1:5173**. API dùng cổng 4318. Giữ terminal đang chạy, Ctrl+C để dừng. Dùng `npm.cmd` để tránh PowerShell chặn `npm.ps1`. Nếu cổng 5173 bận, hãy dừng phiên Leaf cũ trước khi chạy lại.

Chạy bản build:

```powershell
npm.cmd run build
npm.cmd start
```

Mở **http://127.0.0.1:4318**. Bản này chỉ cần kết nối local sau khi cài dependency. Không cần mạng để đọc và ghi chú.

## Cách dùng

1. Thêm bài đọc bằng cách dán văn bản, đặt tiêu đề, nguồn và thẻ chủ đề. Có một bài mẫu để thử ngay.
2. Mở bài, bôi chọn từ/câu rồi chọn **Ghi chú & highlight**. Chọn từ vựng, cụm từ, ngữ pháp hoặc ghi chú; ghi cách hiểu và ví dụ.
3. Nhấn highlight hoặc ghi chú ở lề để chỉnh sửa/xóa. Các highlight không chồng lên nhau. Nội dung bài đã có highlight được khóa sửa để giữ đúng vị trí; tiêu đề, nguồn và thẻ vẫn sửa được.
4. Đọc tập trung ẩn lề ghi chú, nút Aa đổi cỡ chữ. Đánh dấu tiến độ để theo dõi thư viện.
5. **Sổ kiến thức** tìm kiếm từ, nghĩa và giải thích; quay lại bài gốc bất kỳ lúc nào.
6. **Ôn tập** dùng thẻ che nghĩa, kèm ngữ cảnh. Chưa nhớ → 10 phút; hơi khó → ít nhất 1 ngày; đã nhớ → ít nhất 1 ngày, sau đó nhân 2,5; rất dễ → ít nhất 4 ngày, sau đó nhân 4. Giới hạn 365 ngày. Đây là lịch ôn đơn giản, chưa phải thuật toán FSRS. Ghi chú thông thường không vào ôn tập. Mỗi phiên lấy các thẻ đến hạn khi mở; chuyển tab rồi mở lại để làm mới.
7. **Sao lưu** xuất JSON, **Khôi phục** nhập JSON và thay thế toàn bộ thư viện sau xác nhận. Nên xuất bản hiện tại trước khi khôi phục.

## Dữ liệu & giới hạn

- SQLite nằm tại `data/leaf.sqlite`, tự tạo khi khởi động. Các file WAL/SHM do SQLite quản lý. Khi sao chép trực tiếp thư mục `data`, dừng app trước; xuất JSON khi app chạy là cách sao lưu thuận tiện hơn.
- Chỉ lắng nghe `127.0.0.1`. Không thiết kế cho triển khai internet hoặc nhiều người dùng.
- Dữ liệu chưa mã hóa. Được bảo vệ bởi quyền truy cập tài khoản Windows của bạn.
- Nhập bài dạng văn bản; chưa trích xuất PDF, OCR hoặc tự tải trang web. Chưa có dịch/giải thích tự động, đồng bộ thiết bị hay câu hỏi TOEIC.
- URL giữ màn hình hiện tại và bài đang đọc khi tải lại, hỗ trợ Back/Forward của trình duyệt. Vị trí cuộn, cỡ chữ và chế độ tập trung lưu theo bài trong tab hiện tại bằng sessionStorage; nếu trình duyệt chặn storage, vẫn đọc và lưu ghi chú bình thường nhưng không nhớ các thiết lập này.
- Backend giới hạn request JSON 12 MB. Nội dung mỗi bài tối đa 500.000 ký tự, tối đa 30 thẻ; mỗi thẻ tối đa 80 ký tự.
- SQLite đang lưu snapshot thư viện trong một hàng với kiểm tra toàn vẹn trước khi ghi; phù hợp thư viện cá nhân nhỏ. Khi thư viện lớn, nên migrate thành bảng passages/annotations có index.

## Cấu trúc

```text
src/
  components/       Dialog dùng chung
  features/         Reader, form bài đọc/ghi chú, ôn tập
  lib/              Kiểu dữ liệu và API client
  App.tsx           Điều phối màn hình và dữ liệu
  styles.css        Design tokens, layout, responsive
server/
  index.mjs         Local API và phục vụ bản build
  store.mjs         SQLite, validation, lịch ôn
  dev.mjs           Khởi động API + Vite
tests/              Kiểm tra tính toàn vẹn lưu trữ và lịch ôn
docs/               Quyết định thiết kế và hướng phát triển
```

## Kiểm tra

```powershell
npm.cmd test
npm.cmd run build
```

Trạng thái kiểm tra: 5 test lưu trữ/lịch ôn đã pass. Người dùng đã chạy thành công TypeScript + Vite production build và dev server. Đã xem ảnh màn thư viện ở desktop, sau đó chỉnh cách xuống dòng sidebar và độ tương phản chữ phụ. Chưa xác minh giao diện sau chỉnh sửa hoặc thao tác highlight/ôn tập trong trình duyệt; công cụ điều khiển trình duyệt dừng vì không xác định được URL hiện tại.
