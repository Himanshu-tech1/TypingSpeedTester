// confetti.js - Lightweight celebratory particle burst for level completion

class ConfettiLauncher {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'confettiCanvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.inset = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animId = null;
    document.body.appendChild(this.canvas);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(durationMs = 2500) {
    this.particles = [];
    const colors = ['#2563eb', '#38bdf8', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#f43f5e'];

    // Spawn 140 particles
    for (let i = 0; i < 140; i++) {
      this.particles.push({
        x: window.innerWidth / 2 + (Math.random() * 200 - 100),
        y: window.innerHeight * 0.45 + (Math.random() * 50 - 25),
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        alpha: 1,
        decay: Math.random() * 0.008 + 0.005
      });
    }

    if (this.animId) cancelAnimationFrame(this.animId);
    const startTime = Date.now();

    const loop = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let alive = false;
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98; // friction
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          alive = true;
          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, p.alpha);
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate((p.rotation * Math.PI) / 180);
          this.ctx.fillStyle = p.color;
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          this.ctx.restore();
        }
      });

      if (alive && Date.now() - startTime < durationMs + 2000) {
        this.animId = requestAnimationFrame(loop);
      } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    };

    loop();
  }
}
