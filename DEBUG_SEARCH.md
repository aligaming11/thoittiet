# 🔍 Hướng Dẫn Debug Chức Năng Tìm Kiếm - AliWeather

## ✅ Đã Sửa Các Vấn Đề:

### 1. **Thiếu CSS cho `.search-container`**
- **Vấn đề:** Dropdown không hiện vì thiếu `position: relative`
- **Đã sửa:** Thêm CSS cho `.search-container`

### 2. **Conflict class `.hidden`**
- **Vấn đề:** `display: none !important` ngăn animations
- **Đã sửa:** Dùng `opacity` và `visibility` cho search results

### 3. **Thiếu error handling**
- **Đã sửa:** Thêm hiển thị lỗi chi tiết khi API fail

---

## 🧪 Cách Test Tìm Kiếm:

### **Bước 1: Mở DevTools (F12)**
```
1. Nhấn F12 trong trình duyệt
2. Chuyển sang tab "Console"
3. Chuyển sang tab "Network"
```

### **Bước 2: Thử Tìm Kiếm**
```
1. Nhập ít nhất 3 ký tự vào ô tìm kiếm (ví dụ: "Han")
2. Đợi 500ms (debounce delay)
3. Kiểm tra Console xem có lỗi gì không
4. Kiểm tra Network tab xem API call có thành công không
```

### **Bước 3: Kiểm Tra API Response**
```
1. Trong Network tab, tìm request đến: api.weatherapi.com/v1/search.json
2. Click vào request đó
3. Xem tab "Response" - phải có array kết quả
4. Xem tab "Headers" - Status phải là 200 OK
```

---

## 🐛 Các Lỗi Thường Gặp:

### **Lỗi 1: Dropdown không hiện**

**Nguyên nhân:**
- CSS chưa load đúng
- Class `.hidden` vẫn đang active

**Kiểm tra trong Console:**
```javascript
// Kiểm tra element có tồn tại không
console.log(document.getElementById('searchResults'));

// Kiểm tra classes
console.log(document.getElementById('searchResults').className);

// Force hiện dropdown (test)
document.getElementById('searchResults').classList.remove('hidden');
document.getElementById('searchResults').innerHTML = '<div class="search-result-item">Test Item</div>';
```

**Giải pháp:**
```
1. Hard refresh: Ctrl + Shift + R
2. Xóa cache: Ctrl + Shift + Delete
3. Kiểm tra file CSS đã load: DevTools > Sources > css/style.css
```

---

### **Lỗi 2: API Key không hoạt động**

**Thông báo lỗi:**
```
Error: API key invalid or not activated
```

**Kiểm tra:**
```javascript
// Kiểm tra API key trong console
console.log(CONFIG.API_KEY);

// Test API trực tiếp
fetch('https://api.weatherapi.com/v1/search.json?key=80a64dd9bada4e08b85152132252810&q=Hanoi')
  .then(r => r.json())
  .then(d => console.log('API Response:', d))
  .catch(e => console.error('API Error:', e));
```

**Giải pháp:**
```
1. Đợi 1-2 giờ sau khi đăng ký API key
2. Lấy API key mới từ https://www.weatherapi.com/my/
3. Cập nhật trong js/config.js
```

---

### **Lỗi 3: CORS Error**

**Thông báo lỗi:**
```
Access to fetch at 'https://api.weatherapi.com' has been blocked by CORS policy
```

**Nguyên nhân:**
- Đang mở file trực tiếp (file://)
- Không dùng HTTP server

**Giải pháp:**
```bash
# Chạy HTTP server (Python)
python -m http.server 8000

# Hoặc Node.js
npx http-server -p 8000

# Sau đó truy cập: http://localhost:8000
```

---

### **Lỗi 4: Kết quả tìm kiếm không có data**

**Kiểm tra response:**
```javascript
// Trong app.js, thêm log
async searchLocations(query) {
    try {
        console.log('Searching for:', query);
        const results = await weatherAPI.searchLocations(query);
        console.log('Search results:', results); // ← THÊM DÒNG NÀY
        this.displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
        this.displaySearchError(error.message);
    }
}
```

---

## 🔧 Debug Commands (Copy vào Console):

### **1. Kiểm tra toàn bộ search system:**
```javascript
// Check search elements
const searchInput = document.getElementById('locationSearch');
const searchResults = document.getElementById('searchResults');
const searchContainer = document.querySelector('.search-container');

console.log('Search Input:', searchInput);
console.log('Search Results:', searchResults);
console.log('Search Container:', searchContainer);
console.log('Search Container position:', window.getComputedStyle(searchContainer).position);
console.log('Search Results classes:', searchResults.className);
```

### **2. Force hiện search results với test data:**
```javascript
const results = [
    {name: 'Hanoi', region: '', country: 'Vietnam', lat: 21.0285, lon: 105.8542},
    {name: 'Ho Chi Minh', region: '', country: 'Vietnam', lat: 10.8231, lon: 106.6297}
];

const container = document.getElementById('searchResults');
container.innerHTML = results.map(loc => `
    <div class="search-result-item">
        <i class="fas fa-map-marker-alt" style="color: var(--accent-primary); margin-right: 8px;"></i>
        ${loc.name}, ${loc.country}
    </div>
`).join('');
container.classList.remove('hidden');
```

### **3. Test API call trực tiếp:**
```javascript
// Test search API
async function testSearch(query) {
    const url = `https://api.weatherapi.com/v1/search.json?key=80a64dd9bada4e08b85152132252810&q=${query}`;
    console.log('URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Data:', data);
    
    return data;
}

// Chạy
testSearch('Hanoi');
```

---

## ✅ Checklist Khắc Phục:

- [ ] Hard refresh (Ctrl + Shift + R)
- [ ] Xóa cache browser
- [ ] Kiểm tra Console có lỗi không
- [ ] Kiểm tra Network tab - API call thành công chưa
- [ ] Kiểm tra CSS đã load: `.search-container` có `position: relative`
- [ ] Kiểm tra `.search-results.hidden` có đúng opacity/visibility
- [ ] Test API key bằng cách gọi trực tiếp trong Console
- [ ] Đang chạy từ HTTP server (không phải file://)
- [ ] Nhập ít nhất 3 ký tự để trigger search

---

## 📞 Hỗ Trợ:

Nếu vẫn không hoạt động:

1. Mở file `test-search.html` để test riêng chức năng tìm kiếm
2. Copy toàn bộ Console errors và gửi
3. Chụp ảnh Network tab khi search
4. Kiểm tra phiên bản browser (khuyến nghị: Chrome/Edge mới nhất)

---

**AliWeather** 🌤️

