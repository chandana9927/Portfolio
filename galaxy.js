(function () {
  "use strict";

  const canvas = document.getElementById("stars-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let stars = [];
  let shootingStars = [];
  let scrollY = 0;
  let animationId = null;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initStars();
  }

  function initStars() {
    const count = Math.min(320, Math.floor((width * height) / 4500));
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 + 0.2,
        r: Math.random() * 1.4 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.008,
        hue: Math.random() > 0.85 ? 45 : Math.random() > 0.7 ? 180 : 0,
      });
    }
  }

  function spawnShootingStar() {
    if (prefersReduced || shootingStars.length > 2) return;
    shootingStars.push({
      x: Math.random() * width * 0.6,
      y: Math.random() * height * 0.35,
      len: Math.random() * 80 + 60,
      speed: Math.random() * 6 + 8,
      angle: Math.PI / 4 + (Math.random() * 0.3 - 0.15),
      life: 1,
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, width, height);

    const parallax = scrollY * 0.00015;

    stars.forEach((s) => {
      const drift = prefersReduced ? 0 : Math.sin(t * 0.001 + s.twinkle) * 0.15;
      const px = s.x;
      const py = ((s.y + scrollY * s.z * 0.08) % (height + 20)) - 10 + drift;

      const twinkle = 0.55 + Math.sin(t * s.speed * 60 + s.twinkle) * 0.45;
      const alpha = twinkle * (0.35 + s.z * 0.35);

      if (s.hue === 45) {
        ctx.fillStyle = `rgba(255, 220, 150, ${alpha})`;
      } else if (s.hue === 180) {
        ctx.fillStyle = `rgba(120, 220, 255, ${alpha * 0.9})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      }

      ctx.beginPath();
      ctx.arc(px, py, s.r * (0.8 + s.z * 0.3), 0, Math.PI * 2);
      ctx.fill();

      if (!prefersReduced && s.z > 1.5 && twinkle > 0.9) {
        ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.25})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(px - 3, py);
        ctx.lineTo(px + 3, py);
        ctx.moveTo(px, py - 3);
        ctx.lineTo(px, py + 3);
        ctx.stroke();
      }
    });

    shootingStars = shootingStars.filter((ss) => {
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.life -= 0.018;

      const grad = ctx.createLinearGradient(
        ss.x,
        ss.y,
        ss.x - Math.cos(ss.angle) * ss.len,
        ss.y - Math.sin(ss.angle) * ss.len
      );
      grad.addColorStop(0, `rgba(200, 240, 255, ${ss.life * 0.9})`);
      grad.addColorStop(1, "rgba(200, 240, 255, 0)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(
        ss.x - Math.cos(ss.angle) * ss.len,
        ss.y - Math.sin(ss.angle) * ss.len
      );
      ctx.stroke();

      return ss.life > 0;
    });

    if (!prefersReduced && Math.random() < 0.002) spawnShootingStar();

    animationId = requestAnimationFrame(draw);
  }

  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
  }, { passive: true });

  window.addEventListener("resize", resize);
  resize();
  animationId = requestAnimationFrame(draw);

  window.GalaxyBg = {
    setScroll(y) {
      scrollY = y;
    },
  };
})();
