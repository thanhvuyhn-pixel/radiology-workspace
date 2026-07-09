# Radiology Workspace

Portal nội bộ cho BS Thanh Vũ, Viện Điện Quang, Bệnh viện Bạch Mai.

## Mục tiêu

Radiology Workspace là màn hình Home khi mở máy, dùng để truy cập nhanh toàn bộ các phần mềm nội bộ tự phát triển. Project được thiết kế để mở rộng dần thành hơn 30 ứng dụng.

## Tech stack

- HTML
- CSS
- Vanilla JavaScript
- Static deploy trên Netlify

Không dùng React, Vue, Angular, Bootstrap hoặc Tailwind.

## Cấu trúc

```text
RadiologyWorkspace/
├── index.html
├── style.css
├── script.js
├── apps.json
├── README.md
├── assets/
├── apps/
├── docs/
└── portal/
```

## Thêm ứng dụng mới

Thêm một object mới vào mảng `apps` trong `apps.json`.

```json
{
  "id": "ten-ung-dung",
  "name": "Tên ứng dụng",
  "description": "Mô tả ngắn",
  "url": "https://example.netlify.app/",
  "icon": "📌",
  "category": "Điều hành",
  "color": "blue",
  "badge": "Operations"
}
```

Các màu hiện có: `blue`, `green`, `orange`, `red`.

## Roadmap

- Version 1.0: Portal
- Version 1.1: Favorite Apps, Search, Dark Mode, Notification
- Version 2: Đổi ca, Nghỉ phép, Thông báo
- Version 3: Registry Nốt phổi, Lung-RADS, GGN Registry
- Version 4: Research Workspace, Đề tài cơ sở, NCS, Bài báo, Quản lý nghiên cứu
- Version 5: AI Workspace
