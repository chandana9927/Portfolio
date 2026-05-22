(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-menu a");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");
  const animateEls = document.querySelectorAll("[data-animate]");
  const statValues = document.querySelectorAll(".stat-value[data-count]");
  const cursorGlow = document.querySelector(".cursor-glow");
  const yearEl = document.getElementById("year");
  const progressBar = document.querySelector(".scroll-progress-bar");
  const galaxyBg = document.querySelector(".galaxy-bg");
  const nebulae = document.querySelectorAll(".nebula");
  const backTopLink = document.querySelector(".back-top");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Back to top smooth scroll */
  if (backTopLink) {
    backTopLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const sections = [...document.querySelectorAll("main section[id]")];

  /* Scroll: progress, header, nav */
  function onScroll() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    if (progressBar) progressBar.style.width = `${progress}%`;
    if (header) header.classList.toggle("scrolled", scrollY > 40);

    if (window.GalaxyBg) window.GalaxyBg.setScroll(scrollY);

    let current = "";
    sections.forEach((section) => {
      if (scrollY >= section.offsetTop - 140) current = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav */
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Project filters with animation */
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });

      projectCards.forEach((card, index) => {
        const categories = (card.dataset.category || "").split(" ");
        const show =
          filter === "all" ||
          categories.includes(filter) ||
          (filter === "wip" && card.classList.contains("wip"));

        if (show) {
          card.classList.remove("hidden");
          card.style.animationDelay = `${index * 0.05}s`;
          card.classList.add("filter-in");
          setTimeout(() => card.classList.remove("filter-in"), 500);
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });

  /* Scroll-triggered animations */
  const staggerGroups = document.querySelectorAll(".stagger-group");

  staggerGroups.forEach((group) => {
    const children = group.querySelectorAll("[data-animate]");
    children.forEach((child, i) => {
      if (!child.dataset.delay) {
        child.dataset.delay = String(Math.min(i, 8));
      }
    });
  });

  function getDelay(el) {
    const d = parseInt(el.dataset.delay, 10);
    return Number.isNaN(d) ? 0 : d * 80;
  }

  const animateObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = getDelay(el);

        setTimeout(() => {
          el.classList.add("in-view");
        }, prefersReduced ? 0 : delay);

        animateObserver.unobserve(el);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
  );

  animateEls.forEach((el) => animateObserver.observe(el));

  /* Hero: animate immediately on load */
  const heroEls = document.querySelectorAll(".hero [data-animate]");
  if (!prefersReduced) {
    heroEls.forEach((el) => {
      const delay = getDelay(el);
      setTimeout(() => el.classList.add("in-view"), 120 + delay);
    });
  } else {
    heroEls.forEach((el) => el.classList.add("in-view"));
  }

  /* Stat counters */
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    if (Number.isNaN(target)) return;
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statValues.forEach((el) => statsObserver.observe(el));

  /* Cursor glow */
  if (cursorGlow && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let x = 0, y = 0, cx = 0, cy = 0;
    document.addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
    });
    function loop() {
      cx += (x - cx) * 0.1;
      cy += (y - cy) * 0.1;
      cursorGlow.style.left = `${cx}px`;
      cursorGlow.style.top = `${cy}px`;
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* Subtle tilt on glass cards (desktop) */
  if (!prefersReduced && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".glass-panel").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }
})();
