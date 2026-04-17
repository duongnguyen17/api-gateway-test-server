# API Gateway Test Server

Máy chủ Node.js/Express dùng để giả lập các API backend phục vụ việc kiểm thử tích hợp với API Gateway.

## 1. Cài đặt & Khởi chạy

### Yêu cầu

- Node.js >= 18

### Cách chạy nhanh nhất (Khuyên dùng)

Lệnh này sẽ khởi động cả server và tạo tunnel công khai qua Cloudflare, sau đó in URL ra màn hình:

```bash
npm run publish
```

### Cách chạy thủ công

1. **Cài đặt thư viện:** `npm install`
2. **Chạy server:** `npm start`
3. **Tạo tunnel:** `npx cloudflared tunnel --url http://localhost:3000`

---

## 2. Danh sách API

### Công khai (Không cần Auth)

- `GET /test`: Trả về thông tin request (Headers, Query).
- `POST /test`: Trả về thông tin request (Body, Headers).
- `POST /login`: Đăng nhập lấy Token.
  - Body: `{"username": "admin", "password": "123456"}`
- `GET /swagger.json`: Trả về nội dung Swagger JSON (Dùng để import vào Gateway).

### Yêu cầu Auth (JWT Bearer Token)

- `GET /profile`: Thông tin user admin.
- `POST /booking`: Xử lý booking giả lập.

---

## 3. Tài liệu API

- **Swagger UI:** `http://localhost:3000/docs` (hoặc `/docs` sau URL public)
- **Swagger JSON:** `http://localhost:3000/swagger.json` (hoặc `/swagger.json` sau URL public)

---

## 4. Các lệnh cURL mẫu (Local)

### Lấy Token đăng nhập

```bash
curl -X POST "http://localhost:3000/login" \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "123456"}'
```

### Gọi API bảo mật (Thay <TOKEN> bằng mã lấy được ở trên)

```bash
curl -X GET "http://localhost:3000/profile" \
     -H "Authorization: Bearer <TOKEN>"
```

---

## 5. Lưu ý cho API Gateway Testing

- **Base URL**: Khi sử dụng `npm run publish`, hãy copy URL public và thay vào phần `servers` trong cấu hình Gateway.
- **Forward Headers**: Gateway cần được cấu hình để chuyển tiếp header `Authorization`.
