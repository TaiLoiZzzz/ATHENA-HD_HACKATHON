# ATHENA Platform - Demo Mode

## Tổng quan

ATHENA Platform hiện đang chạy ở chế độ Demo với dữ liệu mock hoàn toàn. Tất cả các tính năng đều hoạt động bình thường nhưng sử dụng dữ liệu giả lập thay vì kết nối thực tế với backend và blockchain.

## Tính năng Demo

### 🔐 Authentication
- **Demo Users**: Có sẵn 3 tài khoản demo
  - `demo@athena.com` - Demo User (12,500 SOV tokens)
  - `admin@sovico.com` - Admin User (50,000 SOV tokens)  
  - `premium@athena.com` - Premium User (25,000 SOV tokens)
- **Password**: Bất kỳ mật khẩu nào có ít nhất 6 ký tự
- **Registration**: Tạo tài khoản mới với dữ liệu mock

### 💰 Token Management
- **Balance**: Hiển thị số dư token mock
- **Transactions**: Lịch sử giao dịch giả lập
- **Staking**: Tính năng stake token với APY mock
- **Redemption**: Đổi token với dữ liệu giả lập

### 🛒 Shopping Cart & Services
- **VietJet Flights**: Tìm kiếm chuyến bay với dữ liệu mock
- **HDBank Products**: Sản phẩm ngân hàng giả lập
- **Sovico Resorts**: Resort booking với dữ liệu mock
- **Insurance**: Sản phẩm bảo hiểm giả lập
- **Cart**: Giỏ hàng với tính năng đầy đủ

### 📊 Marketplace
- **Order Book**: Sổ lệnh mua/bán token
- **Trading**: Tạo và hủy lệnh giao dịch
- **Analytics**: Phân tích thị trường mock

### 🏆 Ranking System
- **User Ranks**: Bronze, Silver, Gold, Diamond
- **Leaderboard**: Bảng xếp hạng người dùng
- **Achievements**: Hệ thống thành tích
- **Service Bonus**: Bonus token theo rank

### 🎯 Personalization
- **Preferences**: Tùy chỉnh ngôn ngữ, tiền tệ, theme
- **Recommendations**: Gợi ý cá nhân hóa
- **Insights**: Phân tích hành vi người dùng
- **Dashboard**: Layout tùy chỉnh

## Cấu trúc Mock Data

### Users
```typescript
- Demo User: 12,500 SOV tokens, ATHENA Prime
- Admin User: 50,000 SOV tokens, Admin privileges
- Premium User: 25,000 SOV tokens, ATHENA Prime
```

### Services
- **VietJet**: 2 chuyến bay mẫu (SGN-HAN, HAN-SGN)
- **HDBank**: 3 sản phẩm (Savings, Loan, Credit Card)
- **Sovico**: 2 resort (Phu Quoc, Da Nang)
- **Insurance**: 2 sản phẩm (Travel, Health)

### Transactions
- 5 giao dịch mẫu với các loại: earn, spend, stake
- Metadata chi tiết cho từng giao dịch
- Trạng thái và thời gian thực tế

## Cách sử dụng

### 1. Đăng nhập
```
Email: demo@athena.com
Password: 123456 (hoặc bất kỳ mật khẩu nào >= 6 ký tự)
```

### 2. Khám phá tính năng
- **Dashboard**: Xem tổng quan tài khoản
- **Transactions**: Lịch sử giao dịch
- **Marketplace**: Giao dịch token
- **Services**: Đặt vé, ngân hàng, resort
- **Ranking**: Hệ thống xếp hạng
- **Personalization**: Tùy chỉnh cá nhân

### 3. Test các tính năng
- Tạo giao dịch mới
- Đặt vé máy bay
- Mua sản phẩm ngân hàng
- Đặt resort
- Giao dịch token
- Cập nhật thông tin cá nhân

## Lưu ý quan trọng

### ⚠️ Demo Mode
- Tất cả dữ liệu là giả lập
- Không có kết nối thực tế với backend
- Không có giao dịch blockchain thực
- Dữ liệu được lưu trong localStorage

### 🔄 Data Persistence
- Dữ liệu người dùng: Cookies
- Preferences: localStorage
- Cart: Session storage
- Không đồng bộ với server

### 🎨 UI/UX
- Giao diện hoàn chỉnh
- Animations và transitions
- Responsive design
- Dark/Light theme support

## Công nghệ sử dụng

### Frontend
- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **Heroicons**: Icons

### Mock Data
- **Local Storage**: User preferences
- **Cookies**: Authentication
- **Session Storage**: Cart data
- **Mock APIs**: Simulated backend calls

### Services
- **API Service**: Mock HTTP requests
- **Auth Service**: Mock authentication
- **Ranking Service**: Mock ranking system
- **Personalization Service**: User customization

## Phát triển thêm

### Thêm Mock Data
1. Cập nhật `web/src/lib/mockData.ts`
2. Thêm interface types
3. Cập nhật API service methods

### Thêm tính năng
1. Tạo component mới
2. Cập nhật mock data
3. Thêm API methods
4. Test với demo data

### Customization
- Thay đổi mock data
- Cập nhật UI components
- Thêm animations
- Cải thiện UX

## Troubleshooting

### Lỗi thường gặp
1. **Login failed**: Đảm bảo password >= 6 ký tự
2. **Data not loading**: Kiểm tra localStorage
3. **UI issues**: Clear browser cache
4. **Performance**: Check console for errors

### Debug
- Mở Developer Tools
- Kiểm tra Console logs
- Inspect localStorage
- Check Network tab

## Kết luận

ATHENA Platform Demo Mode cung cấp trải nghiệm đầy đủ của ứng dụng với dữ liệu mock. Tất cả tính năng chính đều hoạt động, cho phép người dùng khám phá và test ứng dụng mà không cần kết nối backend thực tế.

---

**Lưu ý**: Đây là phiên bản demo chỉ dành cho mục đích trình diễn và testing. Không sử dụng cho production.

