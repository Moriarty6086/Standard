/**
 * 新年倒计时网页 - JavaScript 逻辑
 * 功能：实时倒计时、粒子效果、烟花动画
 */

// 目标日期：2026年1月1日
const targetDate = new Date('2026-01-01T00:00:00').getTime();

// DOM 元素
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const celebrationElement = document.getElementById('celebration');

// 画布元素
const particlesCanvas = document.getElementById('particles-canvas');
const fireworksCanvas = document.getElementById('fireworks-canvas');
const particlesCtx = particlesCanvas.getContext('2d');
const fireworksCtx = fireworksCanvas.getContext('2d');

// 粒子系统
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.life = Math.random() * 100 + 100;
        this.maxLife = this.life;
        this.size = Math.random() * 2 + 1;
        this.color = `hsl(${Math.random() * 60 + 40}, 70%, 60%)`;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.size = (this.life / this.maxLife) * 2;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // 确保半径为正数
        const radius = Math.max(0.1, this.size);
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// 烟花系统
class Firework {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.colors = ['#ff6b6b', '#ffd700', '#4ecdc4', '#45b7d1', '#ff9ff3'];
        
        // 创建烟花粒子
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            const velocity = Math.random() * 5 + 2;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 60,
                maxLife: 60,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                size: Math.random() * 3 + 2
            });
        }
    }

    update() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // 重力效果
            particle.vx *= 0.98; // 阻力
            particle.life--;
            return particle.life > 0;
        });
    }

    draw(ctx) {
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life / particle.maxLife;
            ctx.fillStyle = particle.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = particle.color;
            ctx.beginPath();
            // 确保半径为正数
            const radius = Math.max(0.1, particle.size);
            ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    isDead() {
        return this.particles.length === 0;
    }
}

// 全局变量
let particles = [];
let fireworks = [];
let isNewYear = false;

// 初始化画布尺寸
function resizeCanvas() {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
}

// 创建背景粒子
function createBackgroundParticles() {
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle(
            Math.random() * particlesCanvas.width,
            Math.random() * particlesCanvas.height
        ));
    }
}

// 更新倒计时显示
function updateCountdown() {
    const now = new Date().getTime();
    const timeLeft = targetDate - now;

    if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        // 更新显示，添加翻页动画效果
        updateNumberWithAnimation(daysElement, days);
        updateNumberWithAnimation(hoursElement, hours);
        updateNumberWithAnimation(minutesElement, minutes);
        updateNumberWithAnimation(secondsElement, seconds);
    } else {
        // 新年到了！
        if (!isNewYear) {
            isNewYear = true;
            showCelebration();
            startFireworks();
        }
    }
}

// 带动画效果的数字更新
function updateNumberWithAnimation(element, newValue) {
    const currentValue = parseInt(element.textContent);
    const formattedValue = newValue.toString().padStart(2, '0');
    
    if (currentValue !== newValue) {
        element.classList.add('number-flip');
        setTimeout(() => {
            element.textContent = formattedValue;
            element.classList.remove('number-flip');
        }, 300);
    }
}

// 显示庆祝信息
function showCelebration() {
    document.querySelector('.countdown-container').style.display = 'none';
    celebrationElement.style.display = 'block';
}

// 启动烟花效果
function startFireworks() {
    setInterval(() => {
        if (fireworks.length < 5) {
            fireworks.push(new Firework(
                Math.random() * fireworksCanvas.width,
                Math.random() * (fireworksCanvas.height / 2) + fireworksCanvas.height / 4
            ));
        }
    }, 1000);
}

// 动画循环
function animate() {
    // 清空画布
    particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    // 更新和绘制背景粒子
    particles = particles.filter(particle => {
        particle.update();
        particle.draw(particlesCtx);
        return !particle.isDead();
    });

    // 补充背景粒子
    if (particles.length < 50) {
        particles.push(new Particle(
            Math.random() * particlesCanvas.width,
            Math.random() * particlesCanvas.height
        ));
    }

    // 更新和绘制烟花
    fireworks = fireworks.filter(firework => {
        firework.update();
        firework.draw(fireworksCtx);
        return !firework.isDead();
    });

    requestAnimationFrame(animate);
}

// 添加粒子效果（鼠标交互）
function addInteractiveParticles(event) {
    const rect = particlesCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (let i = 0; i < 5; i++) {
        particles.push(new Particle(x, y));
    }
}

// 事件监听器
window.addEventListener('resize', resizeCanvas);
particlesCanvas.addEventListener('mousemove', addInteractiveParticles);
particlesCanvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    addInteractiveParticles(touch);
});

// 初始化
function init() {
    resizeCanvas();
    createBackgroundParticles();
    
    // 启动倒计时更新
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // 启动动画循环
    animate();
    
    console.log('新年倒计时页面已初始化');
    console.log(`目标时间: ${new Date(targetDate).toLocaleString('zh-CN')}`);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// 性能优化：节流函数
function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
        const currentTime = Date.now();
        
        if (currentTime - lastExecTime > delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
}

// 优化鼠标移动事件
particlesCanvas.addEventListener('mousemove', throttle(addInteractiveParticles, 50));