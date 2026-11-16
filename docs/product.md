# Định hướng sản phẩm

Leaf là sổ đọc cá nhân: bài đọc là trung tâm; từ vựng, ngữ pháp, ghi chú giữ liên kết với ngữ cảnh thay vì thành danh sách rời rạc.

## Luồng chính

Thư viện → đọc tập trung → chọn nội dung → diễn giải bằng lời của mình → ôn chủ động → quay lại ngữ cảnh. Màu vàng cho từ vựng, xanh lá cho cụm từ, xanh xám cho ngữ pháp, cam nhạt cho ghi chú. Giao diện không cần ảnh trang trí: chữ, khoảng trống và đường phân cách tạo nhịp cho việc đọc lâu.

Thư viện dạng hàng để quét nhanh tiêu đề và tiến độ. Reader có lề ghi chú ở desktop, chuyển xuống cuối bài trên màn hình nhỏ. Luồng xóa bài và khôi phục dữ liệu có xác nhận. Dialog dùng native HTML dialog để khóa focus và hỗ trợ Escape.

## Các quyết định

- Lưu local SQLite: dữ liệu tách khỏi cache trình duyệt, không cần server dịch vụ hay tài khoản.
- Bản sao lưu có version và kiểm tra tham chiếu, vị trí, highlight chồng lấn trước khi thay thế.
- Không sửa nội dung bài đã có highlight: bản đầu ưu tiên giữ đúng liên kết. Bản sau có thể hỗ trợ version bài và re-anchor có kiểm tra.
- Không tạo nghĩa tự động giả lập. Người học chủ động nhập cách hiểu; AI sẽ là tích hợp tùy chọn có thông báo dữ liệu gửi đi nếu cần trong tương lai.
- Không điểm số và streak gây áp lực. Chỉ thể hiện số thẻ đến hạn, tiến độ bài, số ghi chú.

## Các bước phát triển tiếp theo

1. Sau khi cài dependency: build và kiểm thử trình duyệt cho chọn đoạn nhiều dòng, vùng chọn tiếng Việt, mở highlight bằng bàn phím, responsive và khôi phục JSON.
2. Tách store sang các bảng SQL, bổ sung migration trước khi dữ liệu tăng nhiều.
3. Lưu vị trí đang đọc, cỡ chữ, chế độ tập trung; shortcut có hướng dẫn.
4. Câu hỏi đọc hiểu do người học tự thêm, lưu đáp án và lý do sai.
5. Cloze trong ngữ cảnh, phân biệt nhận biết và sử dụng từ; có thể thay lịch đơn giản bằng FSRS.
6. Nhập Markdown, PDF có text; xem trước và làm sạch ngắt dòng trước khi lưu. Không mặc định OCR hoặc crawling phức tạp.
7. Tìm từ/cụm từ đã lưu trong các bài mới, báo các ngữ cảnh gặp lại.
