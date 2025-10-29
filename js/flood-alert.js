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
        this.audioContextUnlocked = false;
        this.pendingSound = null; // Store alert level if sound was blocked
        
        this.setupEventListeners();
        this.unlockAudioContext();
    }
    
    /**
     * Unlock audio context on first user interaction
     */
    unlockAudioContext() {
        const unlock = () => {
            if (!this.audioContextUnlocked) {
                try {
                    // Create a dummy audio context to unlock
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = ctx.createOscillator();
                    const gainNode = ctx.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(ctx.destination);
                    gainNode.gain.setValueAtTime(0, ctx.currentTime);
                    
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.001);
                    
                    this.audioContextUnlocked = true;
                    
                    // If there was a pending sound, play it now
                    if (this.pendingSound) {
                        setTimeout(() => {
                            this.playAlertSound();
                            this.pendingSound = null;
                        }, 100);
                    }
                } catch (error) {
                    console.log('Audio unlock failed:', error);
                }
            }
        };
        
        // Try to unlock on various user interactions
        ['click', 'touchstart', 'keydown', 'mousedown'].forEach(event => {
            document.addEventListener(event, unlock, { once: true, passive: true });
        });
    }

    setupEventListeners() {
        // Badge click - show banner
        this.badge.addEventListener('click', () => {
            this.unlockAudioContext();
            this.showBanner();
        });
        
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
        
        // Unlock audio on any user interaction with the page
        ['click', 'touchstart', 'keydown'].forEach(event => {
            document.addEventListener(event, () => {
                if (this.pendingSound && this.currentAlerts.length > 0) {
                    // Small delay to ensure audio context is ready
                    setTimeout(() => {
                        this.playAlertSound();
                        this.pendingSound = null;
                    }, 100);
                }
            }, { once: false, passive: true });
        });
    }

    /**
     * Check weather data for flood risks
     */
    checkFloodRisk(weatherData) {
        const alerts = [];
        const current = weatherData.current;
        const forecast = weatherData.forecast;
        
        // Check 1: Weather API Alerts - Phân loại theo mức độ nghiêm trọng
        if (weatherData.alerts && weatherData.alerts.alert && weatherData.alerts.alert.length > 0) {
            weatherData.alerts.alert.forEach(alert => {
                // Phân loại dựa trên severity từ API
                let level = 'danger';
                const severity = alert.severity?.toLowerCase() || '';
                const event = alert.event?.toLowerCase() || '';
                
                if (severity.includes('extreme') || event.includes('hurricane') || event.includes('typhoon') || event.includes('tornado')) {
                    level = 'extreme';
                } else if (severity.includes('severe') || event.includes('flood') || event.includes('flash flood')) {
                    level = 'extreme';
                } else if (event.includes('warning')) {
                    level = 'danger';
                } else {
                    level = 'warning';
                }
                
                alerts.push({
                    level: level,
                    title: alert.event,
                    description: alert.headline,
                    details: alert.desc,
                    source: 'WeatherAPI Alert'
                });
            });
        }
        
        // Check 2: Heavy Rain Detection - Phân loại theo lượng mưa
        const condition = current.condition.text.toLowerCase();
        const rainfall = current.precip_mm || 0;
        
        if (condition.includes('heavy rain') || condition.includes('torrential') || 
            condition.includes('mưa to') || condition.includes('mưa lớn')) {
            
            if (rainfall > 100) {
                // EXTREME: Mưa cực lớn
                alerts.push({
                    level: 'extreme',
                    title: 'Cảnh Báo Cực Kỳ Nguy Hiểm: Mưa Cực Lớn',
                    description: `🚨 Mưa cực lớn với lượng mưa ${rainfall}mm! Nguy cơ lũ quét và ngập úng nghiêm trọng!`,
                    details: 'NƯỚC CÓ THỂ DÂNG CAO RẤT NHANH! Di chuyển ngay lập tức đến nơi cao, tránh xa sông suối. Gọi 113 nếu cần cứu hộ!',
                    source: 'Hệ thống phát hiện tự động'
                });
            } else if (rainfall > 70) {
                // DANGER: Mưa rất to
                alerts.push({
                    level: 'danger',
                    title: 'Cảnh Báo Nguy Hiểm: Mưa Rất To',
                    description: `Đang có mưa rất to với lượng mưa ${rainfall}mm. Nguy cơ lũ lụt cao!`,
                    details: 'Lượng mưa vượt ngưỡng nguy hiểm. Hãy di chuyển đến nơi an toàn ngay lập tức.',
                    source: 'Hệ thống phát hiện tự động'
                });
            } else if (rainfall > 50) {
                // DANGER: Mưa to
                alerts.push({
                    level: 'danger',
                    title: 'Cảnh Báo: Mưa Lớn',
                    description: `Đang có mưa lớn với lượng mưa ${rainfall}mm. Có nguy cơ ngập lụt.`,
                    details: 'Lượng mưa cao. Hãy chuẩn bị phương án di chuyển và theo dõi tình hình.',
                    source: 'Hệ thống phát hiện tự động'
                });
            } else if (rainfall > 30) {
                // WARNING: Mưa vừa
                alerts.push({
                    level: 'warning',
                    title: 'Cảnh Báo: Mưa To',
                    description: `Đang có mưa to với lượng mưa ${rainfall}mm. Có nguy cơ ngập úng.`,
                    details: 'Cần theo dõi tình hình và chuẩn bị phương án di chuyển.',
                    source: 'Hệ thống phát hiện tự động'
                });
            }
        }
        
        // Check 3: Forecast Heavy Rain - Phân loại theo lượng mưa dự báo
        if (forecast && forecast.forecastday) {
            forecast.forecastday.forEach((day, index) => {
                const dayRainfall = day.day.totalprecip_mm || 0;
                const rainChance = day.day.daily_chance_of_rain || 0;
                const maxWind = day.day.maxwind_kph || 0;
                
                if (dayRainfall > 150 && rainChance > 80 && maxWind > 80) {
                    // EXTREME: Dự báo bão lớn
                    const date = new Date(day.date);
                    const dateStr = date.toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    
                    alerts.push({
                        level: 'extreme',
                        title: 'Dự Báo Cực Kỳ Nguy Hiểm: Bão Lớn',
                        description: `${dateStr}: Dự báo bão lớn với mưa ${dayRainfall}mm, gió ${Math.round(maxWind)} km/h (${rainChance}% khả năng)`,
                        details: 'DỰ BÁO THIÊN TAI NGHIÊM TRỌNG! Chuẩn bị sẵn sàng di chuyển đến nơi an toàn. Theo dõi cảnh báo chính thức.',
                        source: 'Dự báo WeatherAPI'
                    });
                } else if (dayRainfall > 120 && rainChance > 75) {
                    // DANGER: Dự báo mưa rất lớn
                    const date = new Date(day.date);
                    const dateStr = date.toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    
                    alerts.push({
                        level: 'danger',
                        title: 'Dự Báo Nguy Hiểm: Mưa Rất Lớn',
                        description: `${dateStr}: Dự báo mưa rất lớn với lượng mưa ${dayRainfall}mm (${rainChance}% khả năng mưa)`,
                        details: 'Nguy cơ lũ lụt và ngập úng rất cao. Hãy chuẩn bị phương án di chuyển và theo dõi sát tình hình.',
                        source: 'Dự báo WeatherAPI'
                    });
                } else if (dayRainfall > 80 && rainChance > 70) {
                    // WARNING: Dự báo mưa lớn
                    const date = new Date(day.date);
                    const dateStr = date.toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    
                    alerts.push({
                        level: 'warning',
                        title: 'Dự Báo: Mưa Lớn',
                        description: `${dateStr}: Dự báo mưa lớn với lượng mưa ${dayRainfall}mm (${rainChance}% khả năng mưa)`,
                        details: 'Nguy cơ lũ lụt và ngập úng cao trong những ngày tới. Hãy theo dõi sát tình hình.',
                        source: 'Dự báo WeatherAPI'
                    });
                }
            });
        }
        
        // Check 4: Thunder + Heavy Rain = Storm Risk - Phân loại theo cường độ gió
        if (condition.includes('thunder') && 
            (condition.includes('rain') || condition.includes('mưa'))) {
            
            const windSpeed = current.wind_kph || 0;
            
            if (windSpeed > 100 && rainfall > 50) {
                // EXTREME: Bão mạnh
                alerts.push({
                    level: 'extreme',
                    title: 'Cảnh Báo Cực Kỳ Nguy Hiểm: Bão Mạnh',
                    description: `🚨 ĐANG CÓ BÃO MẠNH! Gió ${Math.round(windSpeed)} km/h + mưa ${rainfall}mm. RẤT NGUY HIỂM!`,
                    details: 'CỰC KỲ NGUY HIỂM! Ở trong nhà kiên cố, tránh xa cửa sổ và cửa ra vào. Không ra ngoài trong mọi trường hợp!',
                    source: 'Hệ thống phát hiện tự động'
                });
            } else if (windSpeed > 70 && rainfall > 30) {
                // DANGER: Bão
                alerts.push({
                    level: 'danger',
                    title: 'Cảnh Báo Nguy Hiểm: Giông Bão',
                    description: `Đang có giông bão với gió mạnh ${Math.round(windSpeed)} km/h và mưa ${rainfall}mm`,
                    details: 'Nguy hiểm! Hãy ở trong nhà và tránh xa cửa sổ. Không ra ngoài khi không cần thiết.',
                    source: 'Hệ thống phát hiện tự động'
                });
            } else if (windSpeed > 50) {
                // WARNING: Giông tố
                alerts.push({
                    level: 'warning',
                    title: 'Cảnh Báo: Giông Tố',
                    description: `Có giông tố với gió ${Math.round(windSpeed)} km/h`,
                    details: 'Cẩn thận khi ra ngoài. Tránh ở dưới cây cao và các vật dụng có thể bị gió thổi bay.',
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
        
        // Find highest level alert
        let highestLevel = 'WARNING';
        alerts.forEach(alert => {
            const level = this.getDisasterLevel(alert);
            const levels = ['INFO', 'WARNING', 'DANGER', 'EXTREME'];
            if (levels.indexOf(level) > levels.indexOf(highestLevel)) {
                highestLevel = level;
            }
        });
        
        // Show banner with first/most important alert
        const mainAlert = alerts[0];
        const levelInfo = CONFIG.DISASTER_LEVELS[highestLevel] || CONFIG.DISASTER_LEVELS.WARNING;
        const levelText = `${levelInfo.emoji} ${levelInfo.label.toUpperCase()}`;
        
        this.alertTitle.textContent = levelText;
        this.alertMessage.textContent = mainAlert.description;
        
        // Prepare modal content
        let html = '';
        alerts.forEach((alert, index) => {
            const alertLevel = this.getDisasterLevel(alert);
            const levelInfo = CONFIG.DISASTER_LEVELS[alertLevel] || CONFIG.DISASTER_LEVELS.WARNING;
            const levelText = `${levelInfo.emoji} ${levelInfo.label.toUpperCase()}`;
            
            html += `
                ${index > 0 ? '<hr style="margin: 20px 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">' : ''}
                <div class="alert-item">
                    <div class="alert-level ${levelInfo.class}">${levelText}</div>
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
        
        // Play alert sound with proper disaster level
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
     * Check if alert sound is enabled
     */
    isSoundEnabled() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.ALERT_SOUND_ENABLED);
        if (saved !== null) {
            return saved === 'true';
        }
        return CONFIG.ALERT_SOUND.ENABLED;
    }


    /**
     * Get disaster level from alert
     */
    getDisasterLevel(alert) {
        const level = alert.level || 'warning';
        if (level === 'extreme') return 'EXTREME';
        if (level === 'danger') return 'DANGER';
        if (level === 'warning') return 'WARNING';
        return 'INFO';
    }

    /**
     * Play advanced alert sound with multi-level disaster patterns
     */
    playAlertSound() {
        // Check if sound is enabled
        if (!this.isSoundEnabled()) {
            return;
        }

        if (!this.currentAlerts || this.currentAlerts.length === 0) {
            return;
        }

        // Store pending sound if audio context not unlocked yet
        if (!this.audioContextUnlocked) {
            this.pendingSound = true;
            // Try to unlock by creating a silent click event
            try {
                const clickEvent = new MouseEvent('click', { bubbles: true });
                document.dispatchEvent(clickEvent);
            } catch (e) {
                // Silent fail
            }
            return;
        }

        // Determine the highest alert level
        let maxLevel = 'WARNING';
        this.currentAlerts.forEach(alert => {
            const level = this.getDisasterLevel(alert);
            const levels = ['INFO', 'WARNING', 'DANGER', 'EXTREME'];
            if (levels.indexOf(level) > levels.indexOf(maxLevel)) {
                maxLevel = level;
            }
        });
        
        try {
            // Create or reuse audio context
            let audioContext;
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (error) {
                console.log('Audio context creation failed:', error);
                this.pendingSound = true;
                return;
            }
            
            // Resume audio context if suspended (required for autoplay policy)
            if (audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    console.log('Audio context resumed');
                    // Retry playing sound after resume
                    setTimeout(() => {
                        if (this.currentAlerts && this.currentAlerts.length > 0) {
                            this.playAlertSound();
                        }
                    }, 50);
                }).catch(err => {
                    console.log('Audio context resume failed:', err);
                    this.pendingSound = true;
                });
                return; // Exit early, will retry after resume
            }
            
            // Select pattern based on disaster level
            let pattern;
            switch(maxLevel) {
                case 'EXTREME':
                    pattern = CONFIG.ALERT_SOUND.EXTREME_PATTERN;
                    break;
                case 'DANGER':
                    pattern = CONFIG.ALERT_SOUND.DANGER_PATTERN;
                    break;
                case 'WARNING':
                    pattern = CONFIG.ALERT_SOUND.WARNING_PATTERN;
                    break;
                default:
                    pattern = CONFIG.ALERT_SOUND.INFO_PATTERN;
            }
            
            const volume = CONFIG.ALERT_SOUND.VOLUME;
            let currentTime = audioContext.currentTime;

            // Create multiple oscillator nodes for polyphonic sound
            pattern.tones.forEach((tone, toneIndex) => {
                for (let rep = 0; rep < pattern.repetitions; rep++) {
                    const repDelay = rep * (pattern.duration + pattern.pause) * pattern.tones.length;
                    const toneDelay = toneIndex * (pattern.duration + pattern.pause);
                    const startTime = currentTime + repDelay + toneDelay;

                    // Create oscillator for this tone
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    // Configure oscillator - use pattern waveType or default based on level
                    oscillator.frequency.value = tone;
                    oscillator.type = pattern.waveType || (maxLevel === 'EXTREME' || maxLevel === 'DANGER' ? 'square' : 'sine');
                    
                    // Create envelope for smooth attack and release
                    const attackTime = 0.005;
                    const sustainLevel = volume * (maxLevel === 'EXTREME' ? 1.0 : maxLevel === 'DANGER' ? 0.8 : 0.6);
                    const releaseTime = pattern.duration * 0.25;
                    
                    gainNode.gain.setValueAtTime(0, startTime);
                    gainNode.gain.linearRampToValueAtTime(sustainLevel, startTime + attackTime);
                    gainNode.gain.setValueAtTime(sustainLevel, startTime + pattern.duration - releaseTime);
                    gainNode.gain.linearRampToValueAtTime(0, startTime + pattern.duration);
                    
                    oscillator.start(startTime);
                    oscillator.stop(startTime + pattern.duration);
                }
            });

            // Add low-frequency rumble for danger/extreme alerts
            if (pattern.hasRumble && (maxLevel === 'DANGER' || maxLevel === 'EXTREME')) {
                const rumbleOsc = audioContext.createOscillator();
                const rumbleGain = audioContext.createGain();
                const rumbleFilter = audioContext.createBiquadFilter();
                
                rumbleOsc.type = 'sawtooth';
                rumbleOsc.frequency.value = maxLevel === 'EXTREME' ? 60 : 80; // Lower for extreme
                
                rumbleFilter.type = 'lowpass';
                rumbleFilter.frequency.value = maxLevel === 'EXTREME' ? 150 : 200;
                
                rumbleOsc.connect(rumbleFilter);
                rumbleFilter.connect(rumbleGain);
                rumbleGain.connect(audioContext.destination);
                
                const rumbleVolume = maxLevel === 'EXTREME' ? volume * 0.4 : volume * 0.3;
                
                rumbleGain.gain.setValueAtTime(0, currentTime);
                rumbleGain.gain.linearRampToValueAtTime(rumbleVolume, currentTime + 0.1);
                rumbleGain.gain.setValueAtTime(rumbleVolume, currentTime + pattern.totalTime - 0.2);
                rumbleGain.gain.linearRampToValueAtTime(0, currentTime + pattern.totalTime);
                
                rumbleOsc.start(currentTime);
                rumbleOsc.stop(currentTime + pattern.totalTime);
            }

            // Add siren effect for EXTREME level (rising/falling tone)
            if (pattern.hasSiren && maxLevel === 'EXTREME') {
                const sirenOsc = audioContext.createOscillator();
                const sirenGain = audioContext.createGain();
                const sirenLFO = audioContext.createOscillator(); // Low frequency oscillator for modulation
                const sirenGainMod = audioContext.createGain();
                
                // Main siren oscillator
                sirenOsc.type = 'square';
                sirenOsc.frequency.value = 600;
                
                // LFO modulates the frequency for siren effect
                sirenLFO.type = 'sine';
                sirenLFO.frequency.value = 2; // 2 Hz modulation
                
                sirenGainMod.gain.value = 400; // Modulation depth
                
                sirenLFO.connect(sirenGainMod);
                sirenGainMod.connect(sirenOsc.frequency);
                
                sirenOsc.connect(sirenGain);
                sirenGain.connect(audioContext.destination);
                
                sirenGain.gain.setValueAtTime(0, currentTime);
                sirenGain.gain.linearRampToValueAtTime(volume * 0.5, currentTime + 0.2);
                sirenGain.gain.setValueAtTime(volume * 0.5, currentTime + pattern.totalTime - 0.3);
                sirenGain.gain.linearRampToValueAtTime(0, currentTime + pattern.totalTime);
                
                sirenLFO.start(currentTime);
                sirenOsc.start(currentTime);
                sirenLFO.stop(currentTime + pattern.totalTime);
                sirenOsc.stop(currentTime + pattern.totalTime);
            }

        } catch (error) {
            // Silent fail if Web Audio API not supported
            console.log('Audio alert not available:', error);
            // Store as pending sound - will try again on user interaction
            if (this.isSoundEnabled()) {
                this.pendingSound = true;
            }
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

