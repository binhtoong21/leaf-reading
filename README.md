# Leaf — Góc đọc cá nhân

App reading chạy local, không cần tài khoản. React + TypeScript + Vite cho giao diện, Node HTTP + SQLite cho lưu trữ. Mặc định không gửi dữ liệu ra ngoài; chỉ tính năng **Tra từ bằng AI** (tùy chọn, cần API key) gửi cụm bạn chọn và câu chứa nó tới nhà cung cấp AI bạn cấu hình.

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
2. Mở bài, bôi chọn từ/câu rồi chọn **Ghi chú & highlight**. Chọn từ vựng, cụm từ, ngữ pháp hoặc ghi chú; ghi cách hiểu và ví dụ. Hoặc chọn **Tra từ** để AI giải thích nghĩa trong ngữ cảnh (phát âm, cách dùng, họ từ, ví dụ, phân biệt, mẹo nhớ), rồi **Lưu ghi chú…** để mở form đã điền sẵn, sửa lại và lưu. Vùng chọn trùng highlight cũ vẫn tra được nhưng không lưu được.
3. Nhấn highlight hoặc ghi chú ở lề để chỉnh sửa/xóa. Các highlight không chồng lên nhau. Nội dung bài đã có highlight được khóa sửa để giữ đúng vị trí; tiêu đề, nguồn và thẻ vẫn sửa được.
4. Đọc tập trung ẩn lề ghi chú, nút Aa đổi cỡ chữ. Đánh dấu tiến độ để theo dõi thư viện.
5. **Sổ kiến thức** tìm kiếm từ, nghĩa và giải thích; quay lại bài gốc bất kỳ lúc nào.
6. **Ôn tập** dùng thẻ che nghĩa, kèm ngữ cảnh. Chưa nhớ → 10 phút; hơi khó → ít nhất 1 ngày; đã nhớ → ít nhất 1 ngày, sau đó nhân 2,5; rất dễ → ít nhất 4 ngày, sau đó nhân 4. Giới hạn 365 ngày. Đây là lịch ôn đơn giản, chưa phải thuật toán FSRS. Ghi chú thông thường không vào ôn tập. Mỗi phiên lấy các thẻ đến hạn khi mở; chuyển tab rồi mở lại để làm mới.
7. **Sao lưu** xuất JSON, **Khôi phục** nhập JSON và thay thế toàn bộ thư viện sau xác nhận. Nên xuất bản hiện tại trước khi khôi phục.

## Tra từ bằng AI (tùy chọn)

Dùng được với mọi nhà cung cấp hỗ trợ chuẩn OpenAI `/chat/completions` (Gemini, OpenRouter, Ollama local…). Hiện cấu hình Gemini:

```powershell
Copy-Item .env.example .env
notepad .env
```

```
LOOKUP_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
LOOKUP_API_KEY=<key từ aistudio.google.com>
LOOKUP_MODEL=gemini-3.5-flash-lite
LOOKUP_FALLBACK_MODELS=gemini-3.1-flash-lite
```

Khởi động lại app sau khi sửa `.env`. Ghi chú:

- Key chỉ nằm ở server trong `.env` (đã nằm trong `.gitignore`), không gửi xuống trình duyệt, không có trong file sao lưu. Lộ key → xóa key trong AI Studio và tạo key mới.
- Chỉ gửi cụm đã chọn (tối đa 200 ký tự) và câu chứa nó, không gửi cả bài. Gói miễn phí của Gemini có thể dùng dữ liệu gửi lên để cải thiện sản phẩm: không tra từ trong tài liệu riêng tư.
- Kết quả được cache trong SQLite (bảng `lookup_cache`, tối đa 2.000 mục, không nằm trong bản sao lưu): tra lại cùng chỗ không tốn lượt và xem được khi mất mạng.
- Gemini free hay báo quá tải (503). Khi đó app chuyển ngay sang `LOOKUP_FALLBACK_MODELS`, rồi mới thử lại model chính một lần; hết lượt (429) thì không thử lại model chính. Tổng thời gian chờ tối đa 20 giây.
- Tối đa `LOOKUP_DAILY_LIMIT` lượt gọi AI mỗi ngày (mặc định 100), tính từng lần gọi, kể cả lần lỗi và lần dự phòng.
- Mặc định dùng structured output (`LOOKUP_RESPONSE_FORMAT=json_schema`): thử thật, chế độ `json_object` trả JSON hỏng 2/10 lần, json_schema 0 lần. Nhà cung cấp không hỗ trợ thì app báo rõ cần đặt `json_object` hoặc `none`.
- Nội dung do AI tạo có thể sai; bạn luôn sửa trước khi lưu. Gemini Flash (không Lite) thử ngày 16/11/2026 bị quá 30 giây vì suy nghĩ lâu, nên dùng bản Flash-Lite (~2 giây).
- Chưa cấu hình: nút Tra từ báo lỗi kèm lựa chọn ghi chú thủ công.

## Dữ liệu & giới hạn

- SQLite nằm tại `data/leaf.sqlite`, tự tạo khi khởi động. Các file WAL/SHM do SQLite quản lý. Khi sao chép trực tiếp thư mục `data`, dừng app trước; xuất JSON khi app chạy là cách sao lưu thuận tiện hơn.
- Chỉ lắng nghe `127.0.0.1`, kiểm tra Host/Origin; API tra từ cần thêm token sinh mỗi lần chạy server. Không thiết kế cho triển khai internet hoặc nhiều người dùng.
- Dữ liệu chưa mã hóa. Được bảo vệ bởi quyền truy cập tài khoản Windows của bạn.
- Nhập bài dạng văn bản; chưa trích xuất PDF, OCR hoặc tự tải trang web. Giải thích tự động chỉ có qua Tra từ bằng AI (tùy chọn); chưa có đồng bộ thiết bị hay câu hỏi TOEIC.
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
  lookup.mjs        Tra từ bằng AI: prompt v4, gọi nhà cung cấp, json_schema, thử lại/dự phòng, cache, giới hạn lượt
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

Trạng thái kiểm tra (16/11/2026): 32 test pass (lưu trữ, lịch ôn, điều hướng, tra từ). Tra từ đã chạy thật với Gemini qua cả `npm start` và proxy của `npm run dev`; người dùng đã thử hộp thoại Tra từ trong trình duyệt và xác nhận hoạt động ổn. Người dùng đã chạy thành công TypeScript + Vite production build và dev server. Đã xem ảnh màn thư viện ở desktop, sau đó chỉnh cách xuống dòng sidebar và độ tương phản chữ phụ. Chưa xác minh giao diện sau chỉnh sửa hoặc thao tác highlight/ôn tập trong trình duyệt; công cụ điều khiển trình duyệt dừng vì không xác định được URL hiện tại.
