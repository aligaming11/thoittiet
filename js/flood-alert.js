// Flood Alert System for Vietnam

class FloodAlertSystem {
    constructor() {
        this.badge = document.getElementById('floatingAlertBadge');
        this.banner = document.getElementById('floodAlertBanner');
        this.modal = document.getElementById('floodAlertModal');
        this.alertTitle = document.getElementById('alertTitle');
        this.alertMessage = document.getElementById('alertMessage');
        this.messageContainer = document.getElementById('floodAlertMessage');
        this.badgeCount = document.getElementById('badgeCount');
        
        this.currentAlerts = [];
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Badge click - show banner
        this.badge.addEventListener('click', () => this.showBanner());
        
        // Banner buttons
        document.getElementById('closeAlert').addEventListener('click', () => this.hideBanner());
        document.getElementById('viewAlertDetails').addEventListener('click', () => this.showModal());
        
        // Modal buttons
        document.getElementById('closeFloodModal').addEventListener('click', () => this.hideModal());
        document.getElementById('confirmFloodAlert').addEventListener('click', () => {
            this.hideModal();
            this.hideBanner();
            this.hideBadge();
        });
        
        // Click outside modal to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal || e.target.classList.contains('flood-alert-overlay')) {
                this.hideModal();
            }
        });
    }

    /**
     * Check weather data for flood risks
     */
    checkFloodRisk(weatherData) {
        const alerts = [];
        const current = weatherData.current;
        const forecast = weatherData.forecast;
        
        // Check 1: Weather API Alerts
        if (weatherData.alerts && weatherData.alerts.alert && weatherData.alerts.alert.length > 0) {
            weatherData.alerts.alert.forEach(alert => {
                alerts.push({
                    level: 'danger',
                    title: alert.event,
                    description: alert.headline,
                    details: alert.desc,
                    source: 'WeatherAPI Alert'
                });
            });
        }
        
        // Check 2: Heavy Rain Detection
        const condition = current.condition.text.toLowerCase();
        if (condition.includes('heavy rain') || condition.includes('torrential') || 
            condition.includes('mưa to') || condition.includes('mưa lớn')) {
            
            const rainfall = current.precip_mm || 0;
            
            if (rainfall > 50) {
                alerts.push({
                    level: 'danger',
                    title: 'Cảnh Báo Mưa Lớn',
                    description: `Đang có mưa rất to với lượng mưa ${rainfall}mm. Nguy cơ lũ lụt cao!`,
                    details: 'Lượng mưa vượt ngưỡng nguy hiểm. Hãy di chuyển đến nơi an toàn.',
                    source: 'Hệ thống phát hiện tự động'
                });
            } else if (rainfall > 30) {
                alerts.push({
                    level: 'warning',
                    title: 'Cảnh Báo Mưa To',
                    description: `Đang có mưa to với lượng mưa ${rainfall}mm. Có nguy cơ ngập úng.`,
                    details: 'Cần theo dõi tình hình và chuẩn bị phương án di chuyển.',
                    source: 'Hệ thống phát hiện tự động'
                });
            }
        }
        
        // Check 3: Forecast Heavy Rain
        if (forecast && forecast.forecastday) {
            forecast.forecastday.forEach((day, index) => {
                const dayRainfall = day.day.totalprecip_mm || 0;
                const rainChance = day.day.daily_chance_of_rain || 0;
                
                if (dayRainfall > 100 && rainChance > 70) {
                    const date = new Date(day.date);
                    const dateStr = date.toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    
                    alerts.push({
                        level: 'warning',
                        title: 'Dự Báo Mưa Lớn',
                        description: `${dateStr}: Dự báo mưa rất to với lượng mưa ${dayRainfall}mm (${rainChance}% khả năng mưa)`,
                        details: 'Nguy cơ lũ lụt và ngập úng cao trong những ngày tới. Hãy theo dõi sát tình hình.',
                        source: 'Dự báo WeatherAPI'
                    });
                }
            });
        }
        
        // Check 4: Thunder + Heavy Rain = Storm Risk
        if (condition.includes('thunder') && 
            (condition.includes('rain') || condition.includes('mưa'))) {
            
            if (current.wind_kph > 50) {
                alerts.push({
                    level: 'danger',
                    title: 'Cảnh Báo Bão',
                    description: `Đang có giông bão với gió mạnh ${Math.round(current.wind_kph)} km/h và mưa to`,
                    details: 'Nguy hiểm! Hãy ở trong nhà và tránh xa cửa sổ. Không ra ngoài khi không cần thiết.',
                    source: 'Hệ thống phát hiện tự động'
                });
            }
        }
        
        // Check 5: Special conditions for Vietnam regions
        const location = weatherData.location.name.toLowerCase();
        const vietnamFloodProneAreas = [
            'hà nội', 'hanoi', 'hồ chí minh', 'ho chi minh', 'đà nẵng', 'da nang',
            'huế', 'hue', 'quảng nam', 'quang nam', 'quảng ngãi', 'quang ngai',
            'nghệ an', 'nghe an', 'hà tĩnh', 'ha tinh', 'quảng bình', 'quang binh',
            'thừa thiên huế', 'thua thien hue', 'cần thơ', 'can tho'
        ];
        
        const isFloodProneArea = vietnamFloodProneAreas.some(area => 
            location.includes(area)
        );
        
        if (isFloodProneArea && current.precip_mm > 20) {
            alerts.push({
                level: 'warning',
                title: 'Cảnh Báo Khu Vực Dễ Ngập',
                description: `${weatherData.location.name} là khu vực thường xuyên có nguy cơ ngập úng. Hiện đang có mưa ${current.precip_mm}mm.`,
                details: 'Đây là khu vực dễ bị ảnh hưởng bởi lũ lụt. Hãy chuẩn bị sẵn sàng.',
                source: 'Dữ liệu khu vực Việt Nam'
            });
        }
        
        // Show alert if any risks detected
        if (alerts.length > 0) {
            this.showAlert(alerts);
        }
        
        return alerts;
    }

    /**
     * Show flood alert banner (compact notification)
     */
    showAlert(alerts) {
        this.currentAlerts = alerts;
        
        // Update badge count
        this.badgeCount.textContent = alerts.length;
        
        // Show banner with first/most important alert
        const mainAlert = alerts[0];
        const levelText = mainAlert.level === 'danger' ? '🚨 NGUY HIỂM' : '⚠️ CẢNH BÁO';
        
        this.alertTitle.textContent = levelText;
        this.alertMessage.textContent = mainAlert.description;
        
        // Prepare modal content
        let html = '';
        alerts.forEach((alert, index) => {
            const levelClass = alert.level === 'danger' ? 'danger' : 'warning';
            const levelText = alert.level === 'danger' ? '🚨 NGUY HIỂM' : '⚠️ CẢNH BÁO';
            
            html += `
                ${index > 0 ? '<hr style="margin: 20px 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">' : ''}
                <div class="alert-item">
                    <div class="alert-level ${levelClass}">${levelText}</div>
                    <h3 style="font-size: 1.3rem; font-weight: 800; margin: 10px 0; color: var(--text-primary);">
                        ${alert.title}
                    </h3>
                    <p style="margin: 10px 0;">${alert.description}</p>
                    ${alert.details ? `
                        <div class="alert-details">
                            <strong>Chi tiết:</strong> ${alert.details}
                        </div>
                    ` : ''}
                    <p style="margin-top: 10px; font-size: 0.9rem; color: var(--text-secondary);">
                        <i class="fas fa-broadcast-tower"></i> ${alert.source}
                    </p>
                </div>
            `;
        });
        
        this.messageContainer.innerHTML = html;
        
        // ONLY show banner, NOT badge (badge appears when banner is closed)
        this.badge.classList.add('hidden');
        this.banner.classList.remove('hidden');
        
        // Play alert sound
        this.playAlertSound();
    }

    /**
     * Show banner (from badge click)
     */
    showBanner() {
        this.banner.classList.remove('hidden');
        // Hide badge when banner is shown
        this.badge.classList.add('hidden');
    }

    /**
     * Hide banner (show badge as reminder)
     */
    hideBanner() {
        this.banner.classList.add('hidden');
        // Show badge with smooth animation
        this.showBadgeWithAnimation();
    }
    
    /**
     * Show badge with smooth slide-in animation
     */
    showBadgeWithAnimation() {
        // Remove hidden class
        this.badge.classList.remove('hidden');
        
        // Force reflow to restart animation
        void this.badge.offsetWidth;
        
        // Add animation class
        this.badge.style.animation = 'none';
        setTimeout(() => {
            this.badge.style.animation = 'badgeFloat 3s ease-in-out infinite, badgeSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }, 10);
    }

    /**
     * Hide badge (when user acknowledges alert)
     */
    hideBadge() {
        this.badge.classList.add('hidden');
    }

    /**
     * Show modal with details
     */
    showModal() {
        this.modal.classList.remove('hidden');
    }

    /**
     * Hide modal
     */
    hideModal() {
        this.modal.classList.add('hidden');
    }

    /**
     * Play alert sound
     */
    playAlertSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            // Silent fail if Web Audio API not supported
            console.log('Audio alert not available');
        }
    }

    /**
     * Get safety tips based on alert level
     */
    getSafetyTips(level) {
        if (level === 'danger') {
            return [
                'DI CHUYỂN NGAY đến nơi cao và an toàn',
                'Tắt điện và gas trước khi rời khỏi nhà',
                'Mang theo tài liệu quan trọng và thuốc men cần thiết',
                'KHÔNG đi qua vùng nước chảy xiết',
                'Gọi 113 hoặc 114 nếu cần cứu hộ khẩn cấp'
            ];
        } else {
            return [
                'Theo dõi tin tức thời tiết thường xuyên',
                'Chuẩn bị đồ dùng cần thiết và di chuyển đến nơi an toàn',
                'Không đi qua vùng ngập nước sâu',
                'Liên hệ cơ quan chức năng khi cần hỗ trợ: 113',
                'Chuẩn bị lương thực, nước uống và đèn pin dự phòng'
            ];
        }
    }
}

// Create global flood alert instance
const floodAlertSystem = new FloodAlertSystem();

