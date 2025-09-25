# Hướng dẫn Thanh toán và Lịch sử Giao dịch

## 📋 Tổng quan
Hệ thống ATHENA sử dụng SOV tokens để thanh toán cho tất cả các dịch vụ. Tài liệu này hướng dẫn cách thực hiện thanh toán và xem lịch sử giao dịch.

## 💳 Các phương thức thanh toán

### 1. Thanh toán bằng SOV Tokens
- **Chính**: Sử dụng SOV tokens từ ví của bạn
- **Ưu điểm**: 
  - Nhận bonus theo rank (Diamond: 2x, Gold: 1.5x, Silver: 1.2x)
  - Không phí giao dịch
  - Tích lũy điểm loyalty

### 2. Thanh toán kết hợp
- **SOV + VND**: Thanh toán một phần bằng SOV, phần còn lại bằng VND
- **Linh hoạt**: Chọn tỷ lệ thanh toán phù hợp

## 🚀 Cách thực hiện thanh toán

### Bước 1: Kiểm tra số dư SOV
```typescript
// Kiểm tra số dư hiện tại
const wallet = sovTokenService.getWallet();
console.log('Số dư SOV:', wallet.balance);
console.log('Tổng đã chi:', wallet.totalSpent);
```

### Bước 2: Chọn dịch vụ
1. **Chuyến bay Vietjet**: `/vietjet`
2. **Dịch vụ ngân hàng HD Bank**: `/hdbank`
3. **Resort Sovico**: `/sovico`
4. **Bảo hiểm**: `/insurance`
5. **Marketplace**: `/marketplace`

### Bước 3: Thực hiện thanh toán
```typescript
// Ví dụ thanh toán chuyến bay
const paymentData = {
  serviceType: 'vietjet',
  baseAmountVnd: 2000000, // 2 triệu VND
  tokenAmount: 200, // 200 SOV tokens
  description: 'Vietjet flight booking',
  serviceReferenceId: 'VJ123456'
};

// Xử lý thanh toán
const result = await apiService.processPayment(paymentData);
```

## 📊 Xem lịch sử giao dịch

### 1. Truy cập trang lịch sử
- **URL**: `/transactions`
- **Tính năng**: Xem tất cả giao dịch SOV tokens

### 2. Thông tin hiển thị
```typescript
interface Transaction {
  id: string;
  type: 'earn' | 'spend' | 'transfer' | 'stake' | 'unstake';
  amount: number;
  description: string;
  serviceType?: string;
  serviceReferenceId?: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}
```

### 3. Bộ lọc giao dịch
- **Loại giao dịch**: Tất cả, Nhận token, Chi tiêu, Chuyển khoản
- **Thời gian**: 7 ngày, 30 ngày, 90 ngày, 1 năm
- **Trạng thái**: Hoàn thành, Đang xử lý, Thất bại
- **Dịch vụ**: Vietjet, HD Bank, Resort, Bảo hiểm, Marketplace

### 4. Thống kê giao dịch
```typescript
interface TransactionAnalytics {
  totalEarned: number;      // Tổng nhận
  totalSpent: number;       // Tổng chi
  netGain: number;          // Lãi/lỗ
  transactionCount: number; // Số giao dịch
  averageTransaction: number; // Trung bình
  topServiceType: string;   // Dịch vụ sử dụng nhiều nhất
}
```

## 💰 Các loại giao dịch

### 1. Giao dịch Nhận (Earn)
- **Welcome bonus**: Token chào mừng
- **Service rewards**: Thưởng từ sử dụng dịch vụ
- **Referral bonus**: Thưởng giới thiệu
- **Staking rewards**: Lãi từ staking

### 2. Giao dịch Chi tiêu (Spend)
- **Flight booking**: Đặt vé máy bay
- **Banking services**: Dịch vụ ngân hàng
- **Resort booking**: Đặt resort
- **Insurance**: Mua bảo hiểm
- **Marketplace**: Mua sắm

### 3. Giao dịch Chuyển khoản (Transfer)
- **Peer-to-peer**: Chuyển cho người khác
- **Wallet transfer**: Chuyển giữa các ví

### 4. Giao dịch Staking
- **Stake tokens**: Khóa token để nhận lãi
- **Unstake tokens**: Rút token đã khóa

## 🎯 Bonus và Rewards

### 1. Rank Bonus
```typescript
const rankMultipliers = {
  'Diamond': 2.0,  // 2x earning bonus
  'Gold': 1.5,     // 1.5x earning bonus
  'Silver': 1.2,   // 1.2x earning bonus
  'Bronze': 1.0    // 1x earning bonus
};
```

### 2. Service Bonus
- **Vietjet**: +10% SOV tokens
- **HD Bank**: +15% SOV tokens
- **Sovico**: +20% SOV tokens
- **Insurance**: +25% SOV tokens

### 3. Loyalty Points
- **1 VND = 1 point**: Tích lũy điểm từ chi tiêu
- **Rank progression**: Thăng hạng dựa trên điểm
- **Exclusive benefits**: Quyền lợi đặc biệt theo rank

## 🔧 API Endpoints

### 1. Thanh toán
```typescript
// Xử lý thanh toán
POST /api/enhanced-payments/pay
{
  "serviceType": "vietjet",
  "baseAmountVnd": 2000000,
  "tokenAmount": 200,
  "description": "Flight booking",
  "serviceReferenceId": "VJ123456"
}
```

### 2. Lịch sử giao dịch
```typescript
// Lấy danh sách giao dịch
GET /api/transactions?page=1&limit=20&type=spend

// Lấy thống kê
GET /api/transactions/analytics?period=30
```

### 3. Ví SOV
```typescript
// Lấy thông tin ví
GET /api/sov-wallet

// Lấy giao dịch SOV
GET /api/sov-transactions

// Lấy thanh toán SOV
GET /api/sov-payments
```

## 📱 Giao diện người dùng

### 1. Trang thanh toán
- **Enhanced Payment Component**: Giao diện thanh toán nâng cao
- **Payment Preview**: Xem trước chi phí và bonus
- **Payment Breakdown**: Phân tích chi tiết thanh toán

### 2. Trang lịch sử
- **Transaction List**: Danh sách giao dịch với pagination
- **Analytics Cards**: Thống kê tổng quan
- **Filter System**: Bộ lọc linh hoạt
- **Export Function**: Xuất dữ liệu (nếu cần)

## 🛡️ Bảo mật

### 1. Xác thực
- **JWT Token**: Xác thực người dùng
- **Session Management**: Quản lý phiên đăng nhập
- **Permission Check**: Kiểm tra quyền truy cập

### 2. Validation
- **Amount Validation**: Kiểm tra số tiền hợp lệ
- **Balance Check**: Kiểm tra số dư đủ
- **Service Validation**: Xác thực dịch vụ

## 🚨 Xử lý lỗi

### 1. Lỗi thường gặp
```typescript
// Số dư không đủ
if (wallet.balance < amount) {
  throw new Error('Insufficient SOV token balance');
}

// Dịch vụ không hợp lệ
if (!isValidService(serviceType)) {
  throw new Error('Invalid service type');
}

// Thanh toán thất bại
if (payment.status === 'failed') {
  toast.error('Payment failed. Please try again.');
}
```

### 2. Retry Logic
- **Auto retry**: Tự động thử lại 3 lần
- **Fallback**: Chuyển sang phương thức khác
- **Error logging**: Ghi log lỗi để debug

## 📈 Monitoring

### 1. Real-time Updates
- **WebSocket**: Cập nhật real-time
- **Push Notifications**: Thông báo giao dịch
- **Email Alerts**: Cảnh báo qua email

### 2. Analytics
- **Transaction Volume**: Khối lượng giao dịch
- **User Behavior**: Hành vi người dùng
- **Performance Metrics**: Chỉ số hiệu suất

## 🔄 Workflow

### 1. Quy trình thanh toán
```
1. User chọn dịch vụ
2. System tính toán chi phí
3. User xác nhận thanh toán
4. System kiểm tra số dư
5. System xử lý thanh toán
6. System cập nhật ví
7. System ghi giao dịch
8. System gửi thông báo
```

### 2. Quy trình xem lịch sử
```
1. User truy cập /transactions
2. System load giao dịch từ localStorage
3. System áp dụng bộ lọc
4. System hiển thị danh sách
5. System tính toán thống kê
6. System hiển thị analytics
```

## 🎨 UI Components

### 1. Payment Components
- `EnhancedPayment.tsx`: Giao diện thanh toán chính
- `PaymentPreview.tsx`: Xem trước thanh toán
- `PaymentBreakdown.tsx`: Phân tích chi phí

### 2. Transaction Components
- `TransactionList.tsx`: Danh sách giao dịch
- `TransactionCard.tsx`: Card giao dịch
- `TransactionFilters.tsx`: Bộ lọc
- `TransactionAnalytics.tsx`: Thống kê

### 3. Wallet Components
- `SOVWallet.tsx`: Ví SOV chính
- `EnhancedSOVWallet.tsx`: Ví nâng cao
- `WalletStats.tsx`: Thống kê ví

## 📚 Examples

### 1. Thanh toán chuyến bay
```typescript
const bookFlight = async (flightData) => {
  try {
    const payment = await apiService.processPayment({
      serviceType: 'vietjet',
      baseAmountVnd: flightData.price,
      tokenAmount: Math.floor(flightData.price / 10000),
      description: `Flight ${flightData.flightNumber}`,
      serviceReferenceId: flightData.id
    });
    
    toast.success('Flight booked successfully!');
    return payment;
  } catch (error) {
    toast.error('Payment failed: ' + error.message);
    throw error;
  }
};
```

### 2. Xem lịch sử với bộ lọc
```typescript
const fetchFilteredTransactions = async (filters) => {
  const data = await apiService.getTokenTransactions(
    pagination.page,
    pagination.limit,
    filters.type !== 'all' ? filters.type : undefined
  );
  
  let filtered = data.transactions;
  
  if (filters.status !== 'all') {
    filtered = filtered.filter(t => t.status === filters.status);
  }
  
  if (filters.serviceType !== 'all') {
    filtered = filtered.filter(t => t.serviceType === filters.serviceType);
  }
  
  return filtered;
};
```

## 🎯 Best Practices

### 1. Thanh toán
- Luôn kiểm tra số dư trước khi thanh toán
- Hiển thị preview chi phí rõ ràng
- Xử lý lỗi gracefully
- Gửi thông báo xác nhận

### 2. Lịch sử
- Sử dụng pagination cho danh sách dài
- Cung cấp bộ lọc linh hoạt
- Hiển thị thống kê tổng quan
- Tối ưu performance

### 3. UX
- Loading states cho tất cả operations
- Error handling với thông báo rõ ràng
- Responsive design
- Accessibility support

## 🔧 Development

### 1. Local Development
```bash
# Start development server
npm run dev

# Test payment flow
npm run test:payment

# Test transaction history
npm run test:transactions
```

### 2. Testing
```typescript
// Test payment processing
describe('Payment Processing', () => {
  it('should process payment successfully', async () => {
    const result = await processPayment(mockPaymentData);
    expect(result.status).toBe('completed');
  });
});

// Test transaction history
describe('Transaction History', () => {
  it('should load transactions correctly', async () => {
    const transactions = await loadTransactions();
    expect(transactions.length).toBeGreaterThan(0);
  });
});
```

## 📞 Support

### 1. Troubleshooting
- **Payment Issues**: Kiểm tra số dư và kết nối mạng
- **History Issues**: Clear cache và reload trang
- **Performance**: Kiểm tra localStorage size

### 2. Contact
- **Technical Support**: support@athena.com
- **Documentation**: docs.athena.com
- **Community**: community.athena.com

---

*Tài liệu này được cập nhật thường xuyên. Vui lòng kiểm tra phiên bản mới nhất.*
