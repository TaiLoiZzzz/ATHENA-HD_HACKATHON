# 🎯 ATHENA Demo System - Hướng dẫn Test

## 🚀 **Khởi động Hệ thống**

### 1. **Backend Demo Server**
```bash
cd backend
node demo-server.js
```
✅ **Server chạy tại:** `http://localhost:3000`

### 2. **Frontend Development**
```bash
cd web
pnpm dev
```
✅ **Web app chạy tại:** `http://localhost:3001`

---

## 👥 **User Demo sẵn sàng Test**

### 💎 **Diamond Rank Users** (Bonus cao nhất: 25+ SOV)
- **📧** `diamond1@athena.com` | **🔑** `diamond123`
  - 👤 Nguyễn Minh Đức
  - ⭐ **28,500 điểm** | 💰 **2,580.5 SOV**
  
- **📧** `diamond2@athena.com` | **🔑** `diamond123`  
  - 👤 Trần Thị Kim Anh
  - ⭐ **22,000 điểm** | 💰 **1,950.75 SOV**

### 🥇 **Gold Rank Users** (Bonus trung bình: 15+ SOV)
- **📧** `gold1@athena.com` | **🔑** `gold123`
  - 👤 Phạm Văn Hùng  
  - ⭐ **12,500 điểm** | 💰 **850.25 SOV**
  
- **📧** `gold2@athena.com` | **🔑** `gold123`
  - 👤 Lê Thị Mai
  - ⭐ **8,750 điểm** | 💰 **650 SOV**

### 🥈 **Silver Rank Users** (Bonus thấp: 10+ SOV)
- **📧** `silver1@athena.com` | **🔑** `silver123`
  - 👤 Hoàng Thanh Tùng
  - ⭐ **3,200 điểm** | 💰 **320.8 SOV**
  
- **📧** `silver2@athena.com` | **🔑** `silver123`
  - 👤 Vũ Thị Lan  
  - ⭐ **2,100 điểm** | 💰 **275.4 SOV**

### 🥉 **Bronze Rank User** (Bonus thấp nhất: 5+ SOV)
- **📧** `bronze1@athena.com` | **🔑** `bronze123`
  - 👤 Nguyễn Văn Nam
  - ⭐ **850 điểm** | 💰 **125.5 SOV**

### 🔐 **Admin Account**
- **📧** `admin@sovico.com` | **🔑** `admin123`

---

## 🎨 **Kiểm tra UI/UX Cá nhân hóa**

### **1. 🏠 Trang chính sau Login**
- ✅ **Navbar**: Hiển thị rank badge với dropdown chi tiết
- ✅ **Profile link**: Chuyển đến trang profile với huy hiệu đầy đủ

### **2. 👤 Trang Profile (`/profile`)**
- ✅ **Rank Badge lớn** với animation
- ✅ **Progress bar** thăng hạng với gradient màu
- ✅ **Thống kê chi tiết**: điểm, giao dịch, multiplier  
- ✅ **Thành tựu**: Hiển thị achievements với icon đẹp
- ✅ **Sử dụng dịch vụ**: Vietjet, HDBank, Sovico

### **3. ✈️ Trang Vietjet (`/vietjet`)**
- ✅ **Bonus Preview**: Hiển thị bên cạnh giá vé
- ✅ **Cá nhân hóa**: Bonus khác nhau theo rank
  - Diamond: ~50 SOV (2x multiplier)
  - Gold: ~22 SOV (1.5x multiplier)  
  - Silver: ~12 SOV (1.2x multiplier)
  - Bronze: ~5 SOV (1x multiplier)

### **4. 🔐 Trang Admin (`/admin`)**
- ✅ **CRUD Users**: Quản lý user demo
- ✅ **CRUD Products**: HDBank, Vietjet, Sovico
- ✅ **Dashboard**: Thống kê tổng quan

---

## 🧪 **Test Scenarios**

### **Scenario 1: So sánh Trải nghiệm theo Rank**
1. **Login Diamond** → Thấy bonus cao nhất
2. **Login Silver** → Thấy bonus thấp hơn  
3. **So sánh UI**: Màu sắc, animation khác biệt

### **Scenario 2: Navigation Persistence**  
1. **Login demo user** 
2. **Chuyển trang**: `/profile` → `/vietjet` → `/marketplace`
3. **✅ Kiểm tra**: Không bị logout, rank badge persistent

### **Scenario 3: Admin Management**
1. **Login admin**
2. **Truy cập** `/admin`  
3. **Test CRUD**: Thêm/sửa/xóa users và products

---

## 🎯 **Expected Results**

### **✅ Cá nhân hóa cực cao:**
- Mỗi rank có màu sắc, icon, bonus khác biệt
- UI/UX thay đổi theo level user
- Animation và progress bars theo rank

### **✅ Persistence:**
- Demo users không bị logout khi chuyển trang
- Rank data được maintain across pages
- Cookie và AuthContext hoạt động ổn định

### **✅ Responsive:**
- UI đẹp trên mobile và desktop  
- Components animation mượt mà
- Loading states và error handling tốt

---

## 🐛 **Troubleshooting**

### **Lỗi: User bị logout khi chuyển trang**
- ✅ **Fixed**: Demo users được whitelist trong AuthContext
- ✅ **Fixed**: API interceptor không auto-logout demo users

### **Lỗi: Rank không hiển thị**  
- ✅ **Fixed**: Safe checking cho undefined values
- ✅ **Fixed**: UserRanking interface updated

### **Lỗi: Backend connection**
- Đảm bảo demo-server.js đang chạy port 3000
- Kiểm tra CORS settings

---

## 🌟 **Demo Highlights**

1. **🏆 Hệ thống Ranking** hoàn chỉnh với 4 levels
2. **🎁 Bonus System** cá nhân hóa theo rank  
3. **🎨 UI/UX Components** đẹp với animation
4. **📱 Responsive Design** cho mọi device
5. **🔐 Admin Panel** quản lý toàn diện
6. **⚡ Performance** tối ưu với Next.js

**🎯 Kết quả: Trải nghiệm cá nhân hóa cực cao như yêu cầu!**

