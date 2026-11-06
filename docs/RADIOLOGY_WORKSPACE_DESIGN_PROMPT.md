# Radiology Workspace Design System

Tài liệu này dùng để đồng bộ giao diện các phần mềm nội bộ của Viện Điện Quang. Có thể sao nguyên phần **Prompt mẫu** vào Codex, ChatGPT hoặc công cụ lập trình AI, sau đó thay các nội dung trong dấu ngoặc vuông.

## Nhận diện chung

- Cảm giác: calm, premium, minimal, professional, medical, modern.
- Tham chiếu: Apple Human Interface, Microsoft Fluent, Notion, Linear và Raycast.
- Ưu tiên desktop, nhưng phải responsive đầy đủ cho tablet và mobile.
- Nhiều khoảng trắng, glassmorphism nhẹ, blur vừa phải, shadow mềm và chuyển động 200-300 ms.
- Không dùng hiệu ứng quá rực, gradient tím, card lồng card hoặc trang trí gây nhiễu.

## Design tokens

```css
:root {
  --primary: #2563eb;
  --accent: #06b6d4;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --background: #f6f8fc;
  --surface: #ffffff;
  --text: #0f172a;
  --secondary: #64748b;
  --border: rgba(255, 255, 255, 0.35);
  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 24px;
  --radius-xl: 30px;
  --shadow-sm: 0 12px 30px rgba(15, 23, 42, 0.08);
  --shadow-md: 0 22px 55px rgba(15, 23, 42, 0.12);
}
```

- Font: Inter, fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Body: 16px, line-height 1.5-1.65.
- Tiêu đề trang: đậm, rõ, không dùng letter-spacing âm.
- Label nhỏ: 12-13px, font-weight 700-850, uppercase khi cần.
- Icon: Lucide Icons, nét đồng nhất, không trộn emoji trong các control chính.

## Cấu trúc màn hình

1. Sidebar trái dạng glass, cố định trên desktop.
2. Header gọn gồm lời chào/tên module, tìm kiếm và các action toàn cục.
3. Main workspace là vùng nội dung chính, dùng grid rõ ràng và khoảng cách 20-24px.
4. Right panel chỉ dùng khi có widget hỗ trợ thực sự; ẩn hoặc chuyển xuống dưới trên tablet/mobile.
5. Footer rất nhỏ, chỉ chứa tên hệ thống, version và đơn vị.

Sidebar có logo tròn, tên sản phẩm, version, menu chính và nhóm liên kết nhanh. Mục đang chọn có nền trắng mờ, viền sáng và shadow nhẹ. Khi thu gọn chỉ hiển thị icon kèm tooltip.

## Component chuẩn

### Card

- Nền trắng hoặc glass sáng; dark mode dùng bề mặt navy đậm.
- Border 1px mờ, bo góc 18-24px.
- Padding 20-24px.
- Hover trong 250 ms: `translateY(-4px)`, scale rất nhẹ và shadow tăng vừa phải.
- Nội dung: icon, tiêu đề, mô tả, badge/status và action rõ ràng.
- Không dùng card lồng trong card.

### Button

- Icon button cho thao tác quen thuộc; icon + text cho lệnh cần giải thích.
- Chiều cao 40-46px, bo góc 12-16px.
- Có trạng thái hover, active, focus-visible, disabled và loading.
- Focus ring phải rõ để hỗ trợ bàn phím.

### Form và bảng

- Input cao 42-46px, border nhẹ, focus ring màu primary.
- Label luôn rõ nghĩa; lỗi hiển thị ngay dưới trường.
- Bảng dữ liệu ưu tiên khả năng quét: header cố định khi phù hợp, row hover nhẹ, action ở cuối dòng.
- Mobile chuyển bảng phức tạp thành list/card hoặc cho phép cuộn ngang có kiểm soát.

### Trạng thái

- Loading: skeleton hoặc spinner nhỏ, không làm layout nhảy.
- Empty state: icon Lucide, tiêu đề ngắn, mô tả và một action chính.
- Error: giải thích ngắn gọn và có nút thử lại khi phù hợp.
- Success/Warning/Danger dùng đúng token, không chỉ dựa vào màu mà cần icon hoặc text.

## Responsive

- Desktop `>= 1200px`: sidebar đầy đủ, content rộng, có thể có right panel.
- Tablet `821-1199px`: sidebar thu gọn thành icon; right panel chuyển xuống dưới.
- Mobile `<= 820px`: sidebar thành drawer hoặc vùng menu gọn; layout một cột; button và input không tràn.
- Không để text chồng lấn, card đổi kích thước khi hover, hoặc tên dài phá layout.
- Mọi vùng tương tác tối thiểu khoảng 40x40px.

## Dark mode

- Background gần `#08111f` hoặc `#0b1220`; surface `#111c2e`.
- Tiêu đề card màu trắng; mô tả khoảng `rgba(255,255,255,.82)`.
- Border và badge sáng hơn nền nhưng vẫn tinh tế.
- Giữ tương phản WCAG; không chỉ đảo màu cơ học.

## Prompt mẫu

```text
Bạn là Senior Product Designer và Senior Frontend Engineer.

Hãy thiết kế lại giao diện cho phần mềm [TÊN PHẦN MỀM] của Viện Điện Quang, Bệnh viện Bạch Mai, theo cùng design system với Radiology Workspace.

MỤC TIÊU
- Giao diện phải tạo cảm giác như một desktop workspace chuyên nghiệp, không giống landing page.
- Phong cách: Apple Human Interface + Microsoft Fluent + Notion + Linear + Raycast.
- Tính cách: calm, premium, minimal, professional, medical, modern.
- Giữ nguyên toàn bộ nghiệp vụ, dữ liệu, URL, API và logic hiện tại; chỉ tổ chức lại UI/UX khi cần.

TECH STACK
- [GHI TECH STACK HIỆN TẠI].
- Tôn trọng kiến trúc hiện có, không đổi framework nếu không được yêu cầu.
- Dùng Lucide Icons; không dùng emoji làm icon điều hướng hoặc action chính.

COLOR SYSTEM
- Primary: #2563EB
- Accent: #06B6D4
- Success: #10B981
- Warning: #F59E0B
- Danger: #EF4444
- Background: #F6F8FC
- Card: #FFFFFF
- Text: #0F172A
- Secondary text: #64748B
- Border: rgba(255,255,255,.35)

TYPOGRAPHY
- Inter; fallback system font.
- Body 16px, line-height thoáng.
- Heading đậm, rõ; không dùng letter-spacing âm.
- Text phải vừa container ở mọi viewport.

LAYOUT
- Sidebar trái dạng glass có logo, tên [TÊN PHẦN MỀM], version và menu nghiệp vụ.
- Header gọn kiểu desktop app: tên màn hình, breadcrumb hoặc subtitle, search và action toàn cục.
- Main workspace hiển thị nội dung thật ngay màn hình đầu tiên, không tạo hero marketing.
- Có thể dùng right panel chỉ khi có widget hữu ích.
- Footer nhỏ: [TÊN PHẦN MỀM] • Version • Viện Điện Quang.

VISUAL
- Background gradient rất nhẹ trên nền #F6F8FC.
- Glassmorphism vừa phải, blur 20-28px.
- Card nền trắng, border mờ, radius 18-24px, shadow mềm.
- Hover 250ms: nâng 4px, scale rất nhẹ, shadow tăng vừa phải.
- Khoảng cách theo hệ 4/8px; gap chính 20-24px.
- Không dùng gradient tím, orb trang trí, card lồng card hoặc hình minh họa không liên quan.

COMPONENTS
- Button có đủ hover/active/focus/disabled/loading.
- Form có label, validation và error rõ ràng.
- Bảng dữ liệu dễ quét, action nhất quán, responsive.
- Có loading, empty, error và success state.
- Tooltip cho icon không quen thuộc.

DARK MODE
- Background #08111F hoặc #0B1220; surface #111C2E.
- Tiêu đề trắng; mô tả rgba(255,255,255,.82).
- Border và badge đủ tương phản, vẫn giữ phong cách Apple/Linear.
- Lưu lựa chọn theme bằng localStorage nếu ứng dụng chưa có cơ chế riêng.

RESPONSIVE
- Desktop >=1200px: sidebar đầy đủ.
- Tablet 821-1199px: sidebar icon/compact, panel phụ chuyển xuống dưới.
- Mobile <=820px: drawer hoặc menu gọn, nội dung một cột.
- Không có overflow ngang, text chồng lấn hoặc control nhỏ hơn khoảng 40x40px.

ACCESSIBILITY VÀ QUALITY
- Semantic HTML, keyboard navigation, focus-visible, aria-label phù hợp.
- Không làm hỏng chức năng hiện tại.
- Không có lỗi console.
- Kiểm tra desktop, tablet, mobile và dark mode trước khi hoàn thành.

NỘI DUNG PHẦN MỀM
- Đối tượng người dùng: [NGƯỜI DÙNG CHÍNH].
- Menu: [DANH SÁCH MENU].
- Workflow chính: [CÁC QUY TRÌNH QUAN TRỌNG].
- Dashboard cần hiển thị: [CHỈ SỐ/WIDGET].

Trước khi sửa, hãy đọc code hiện tại và tái sử dụng component/pattern đang có. Sau khi hoàn thành, mô tả file đã thay đổi, kiểm tra responsive, kiểm tra console và chạy các test phù hợp.
```

## Cách dùng

1. Sao phần **Prompt mẫu** vào cuộc trò chuyện của project cần đồng bộ.
2. Thay các nội dung trong `[DẤU NGOẶC VUÔNG]`.
3. Đính kèm ảnh chụp Radiology Workspace nếu công cụ hỗ trợ ảnh tham chiếu.
4. Yêu cầu AI đọc code trước khi sửa để tránh thay đổi nghiệp vụ hoặc framework.
5. Triển khai từng module, kiểm tra responsive và console trước khi deploy.

## Lưu ý

Design system nên được dùng như một ngôn ngữ chung, không phải bản sao cứng. Mỗi phần mềm vẫn cần ưu tiên workflow thực tế của người dùng: dashboard vận hành nên cô đọng, registry nghiên cứu cần hỗ trợ dữ liệu dài, còn phần mềm đào tạo cần tập trung vào khóa học, học viên và thanh toán.
