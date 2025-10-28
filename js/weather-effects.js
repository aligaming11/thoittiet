// Weather Effects Animation System

class WeatherEffects {
    constructor() {
        this.canvas = document.getElementById('weatherCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.currentEffect = null;
        this.animationFrame = null;
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = [];
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        // Remove all weather classes
        document.body.classList.remove(
            'weather-sunny', 'weather-cloudy', 'weather-rainy', 
            'weather-snowy', 'weather-stormy', 'weather-night', 'weather-mist'
        );
    }

    /**
     * Set weather effect based on condition
     */
    setWeather(condition, isNight = false) {
        this.clear();
        
        const conditionLower = condition.toLowerCase();
        
        // Night time
        if (isNight) {
            document.body.classList.add('weather-night');
            this.createStars();
            return;
        }
        
        // Rain
        if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
            document.body.classList.add('weather-rainy');
            this.createRain();
            
            // Thunder/Storm
            if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
                document.body.classList.remove('weather-rainy');
                document.body.classList.add('weather-stormy');
            }
        }
        // Snow
        else if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) {
            document.body.classList.add('weather-snowy');
            this.createSnow();
        }
        // Fog/Mist
        else if (conditionLower.includes('mist') || conditionLower.includes('fog')) {
            document.body.classList.add('weather-mist');
        }
        // Cloudy
        else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
            document.body.classList.add('weather-cloudy');
            this.createClouds();
        }
        // Sunny/Clear
        else if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
            document.body.classList.add('weather-sunny');
            this.createSunParticles();
        }
        // Default
        else {
            document.body.classList.add('weather-sunny');
        }
    }

    /**
     * Create rain effect
     */
    createRain() {
        const rainCount = 150;
        
        for (let i = 0; i < rainCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                length: Math.random() * 20 + 10,
                speed: Math.random() * 3 + 5,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
        
        this.animateRain();
    }

    animateRain() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
        this.ctx.lineWidth = 1;
        this.ctx.lineCap = 'round';
        
        this.particles.forEach(drop => {
            this.ctx.beginPath();
            this.ctx.globalAlpha = drop.opacity;
            this.ctx.moveTo(drop.x, drop.y);
            this.ctx.lineTo(drop.x, drop.y + drop.length);
            this.ctx.stroke();
            
            drop.y += drop.speed;
            
            if (drop.y > this.canvas.height) {
                drop.y = -drop.length;
                drop.x = Math.random() * this.canvas.width;
            }
        });
        
        this.ctx.globalAlpha = 1;
        this.animationFrame = requestAnimationFrame(() => this.animateRain());
    }

    /**
     * Create snow effect
     */
    createSnow() {
        const snowCount = 100;
        
        for (let i = 0; i < snowCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 3 + 1,
                speed: Math.random() * 1 + 0.5,
                drift: Math.random() * 0.5 - 0.25,
                opacity: Math.random() * 0.6 + 0.4
            });
        }
        
        this.animateSnow();
    }

    animateSnow() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        
        this.particles.forEach(flake => {
            this.ctx.beginPath();
            this.ctx.globalAlpha = flake.opacity;
            this.ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            flake.y += flake.speed;
            flake.x += flake.drift;
            
            if (flake.y > this.canvas.height) {
                flake.y = -10;
                flake.x = Math.random() * this.canvas.width;
            }
            
            if (flake.x > this.canvas.width) {
                flake.x = 0;
            } else if (flake.x < 0) {
                flake.x = this.canvas.width;
            }
        });
        
        this.ctx.globalAlpha = 1;
        this.animationFrame = requestAnimationFrame(() => this.animateSnow());
    }

    /**
     * Create sun particles effect
     */
    createSunParticles() {
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.3 + 0.1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }
        
        this.animateSunParticles();
    }

    animateSunParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = '#FFD700';
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.y > this.canvas.height) particle.y = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
        });
        
        this.ctx.globalAlpha = 1;
        this.animationFrame = requestAnimationFrame(() => this.animateSunParticles());
    }

    /**
     * Create clouds effect
     */
    createClouds() {
        const cloudCount = 8;
        
        for (let i = 0; i < cloudCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height / 2),
                width: Math.random() * 150 + 100,
                height: Math.random() * 40 + 30,
                speed: Math.random() * 0.3 + 0.1,
                opacity: Math.random() * 0.15 + 0.05
            });
        }
        
        this.animateClouds();
    }

    animateClouds() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(cloud => {
            this.ctx.globalAlpha = cloud.opacity;
            this.ctx.fillStyle = 'white';
            
            // Draw cloud using multiple circles
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.height / 2, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.width / 3, cloud.y - cloud.height / 4, cloud.height / 1.5, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.width * 2 / 3, cloud.y, cloud.height / 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            cloud.x += cloud.speed;
            
            if (cloud.x > this.canvas.width + cloud.width) {
                cloud.x = -cloud.width;
                cloud.y = Math.random() * (this.canvas.height / 2);
            }
        });
        
        this.ctx.globalAlpha = 1;
        this.animationFrame = requestAnimationFrame(() => this.animateClouds());
    }

    /**
     * Create stars for night
     */
    createStars() {
        const starCount = 100;
        
        for (let i = 0; i < starCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height / 2,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinkleDirection: Math.random() > 0.5 ? 1 : -1
            });
        }
        
        this.animateStars();
    }

    animateStars() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(star => {
            this.ctx.beginPath();
            this.ctx.globalAlpha = star.opacity;
            this.ctx.fillStyle = 'white';
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Twinkle effect
            star.opacity += star.twinkleSpeed * star.twinkleDirection;
            if (star.opacity >= 1 || star.opacity <= 0.2) {
                star.twinkleDirection *= -1;
            }
        });
        
        this.ctx.globalAlpha = 1;
        this.animationFrame = requestAnimationFrame(() => this.animateStars());
    }
}

// Create global weather effects instance
const weatherEffects = new WeatherEffects();

