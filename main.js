/* ============================================================
   BALBI — Main JavaScript
   IIFE pattern — no ES modules, no import/export
   ============================================================ */

(function () {
  "use strict";

  /* --- SAFE WRAPPER: one failing init won't break the rest --- */
  function safe(fn, name) {
    try { fn(); }
    catch (e) { console.warn("[Balbi::" + name + "]", e); }
  }

  /* ============================================================
     SPLASH
  ============================================================ */
  function initSplash() {
    var splash = document.querySelector("[data-splash]");
    if (!splash) return;

    var hide = function () {
      splash.classList.add("is-out");
    };

    // Primary: hide after page load
    if (document.readyState === "complete") {
      setTimeout(hide, 700);
    } else {
      window.addEventListener("load", function () {
        setTimeout(hide, 600);
      });
    }

    // Safety net: always hide at 3.8s
    setTimeout(hide, 3800);
  }

  /* ============================================================
     CUSTOM CURSOR (desktop only)
  ============================================================ */
  function initCursor() {
    if (matchMedia("(hover: none)").matches) return;

    var cursor = document.getElementById("cursor");
    if (!cursor) return;

    var dot  = cursor.querySelector(".cursor-dot");
    var ring = cursor.querySelector(".cursor-ring");
    var dx = 0, dy = 0, rx = 0, ry = 0;
    var firstMove = false;

    window.addEventListener("mousemove", function (e) {
      dx = e.clientX;
      dy = e.clientY;

      if (!firstMove) {
        firstMove = true;
        rx = dx; ry = dy;
        ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
        cursor.classList.add("is-ready");
      }

      if (dot) dot.style.transform = "translate3d(" + dx + "px," + dy + "px,0)";
    });

    // Smooth ring lerp
    var rafId;
    function animRing() {
      rx += (dx - rx) * 0.12;
      ry += (dy - ry) * 0.12;
      if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      rafId = requestAnimationFrame(animRing);
    }
    animRing();

    // Hover expand on interactive elements
    var interactives = "a, button, .collection-card, .gallery-item, .social-cell, .btn";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(interactives)) {
        cursor.classList.add("is-hovering");
      }
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(interactives)) {
        cursor.classList.remove("is-hovering");
      }
    });
  }

  /* ============================================================
     NAV — solidify on scroll + mobile menu
  ============================================================ */
  function initNav() {
    var nav        = document.getElementById("nav");
    var toggle     = document.getElementById("navToggle");
    var menu       = document.getElementById("navMenu");
    if (!nav) return;

    // Solidify on scroll
    var scrolled = false;
    function onScroll() {
      var past = window.scrollY > 50;
      if (past !== scrolled) {
        scrolled = past;
        nav.classList.toggle("is-scrolled", scrolled);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Mobile toggle
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var isOpen = menu.classList.toggle("is-open");
        toggle.classList.toggle("is-open", isOpen);
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        document.body.style.overflow = isOpen ? "hidden" : "";
      });

      // Close on link click
      menu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          menu.classList.remove("is-open");
          toggle.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });

      // Close on outside click
      document.addEventListener("click", function (e) {
        if (!nav.contains(e.target) && menu.classList.contains("is-open")) {
          menu.classList.remove("is-open");
          toggle.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        }
      });
    }
  }

  /* ============================================================
     SMOOTH ANCHOR SCROLL
  ============================================================ */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navOffset = 80;
      var top = target.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({
        top: top,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    });
  }

  /* ============================================================
     HERO PARALLAX
  ============================================================ */
  function initParallax() {
    var img = document.getElementById("heroImg");
    if (!img) return;

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          var sy = window.scrollY;
          var pct = sy / window.innerHeight;
          img.style.transform = "translateY(" + (pct * 12) + "%)";
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ============================================================
     REVEAL ON SCROLL — IntersectionObserver
  ============================================================ */
  function initReveals() {
    var elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.04,
      rootMargin: "0px 0px -2% 0px"
    });

    elements.forEach(function (el) {
      io.observe(el);
    });

    // Safety: force-reveal anything still hidden at 6s
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 200) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ============================================================
     COUNT UP NUMBERS
  ============================================================ */
  function initCountUp() {
    var els = document.querySelectorAll("[data-count-to]");
    if (!els.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el    = entry.target;
        var end   = parseInt(el.getAttribute("data-count-to"), 10);
        var dur   = 1800;
        var start = performance.now();
        io.unobserve(el);

        function tick(now) {
          var elapsed = now - start;
          var pct     = Math.min(elapsed / dur, 1);
          var eased   = 1 - Math.pow(1 - pct, 3);
          var val     = Math.round(eased * end);
          // Format thousands with dot separator
          el.textContent = val.toLocaleString("es-AR");
          if (pct < 1) requestAnimationFrame(tick);
          else el.textContent = end.toLocaleString("es-AR");
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.3 });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ============================================================
     TESTIMONIALS CAROUSEL
  ============================================================ */
  function initTestimonials() {
    var track  = document.getElementById("testimonialsTrack");
    var dotsEl = document.getElementById("tstDots");
    var prevBtn = document.getElementById("tstPrev");
    var nextBtn = document.getElementById("tstNext");
    if (!track) return;

    var cards  = Array.from(track.children);
    var total  = cards.length;
    if (total === 0) return;

    // On mobile show 1 card, on wider show 2
    function visibleCount() {
      return window.innerWidth < 768 ? 1 : 2;
    }

    var current = 0;
    var autoTimer = null;

    // Build dots
    if (dotsEl && total > 0) {
      cards.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.className = "tst-dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", "Testimonio " + (i + 1));
        dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
        dot.addEventListener("click", function () { goTo(i); });
        dotsEl.appendChild(dot);
      });
    }

    function updateDots(idx) {
      if (!dotsEl) return;
      var dots = dotsEl.querySelectorAll(".tst-dot");
      dots.forEach(function (d, i) {
        d.classList.toggle("is-active", i === idx);
        d.setAttribute("aria-selected", i === idx ? "true" : "false");
      });
    }

    function goTo(idx) {
      var vc = visibleCount();
      var maxIdx = Math.max(0, total - vc);
      current = Math.min(Math.max(idx, 0), maxIdx);

      var cardWidth = track.children[0].offsetWidth;
      var gap = 24; // 1.5rem
      var offset = current * (cardWidth + gap);
      track.style.transform = "translateX(-" + offset + "px)";
      updateDots(current);
    }

    if (prevBtn) prevBtn.addEventListener("click", function () {
      goTo(current - 1);
      resetAuto();
    });
    if (nextBtn) nextBtn.addEventListener("click", function () {
      var vc = visibleCount();
      var maxIdx = Math.max(0, total - vc);
      goTo(current >= maxIdx ? 0 : current + 1);
      resetAuto();
    });

    // Touch swipe
    var touchStart = 0;
    track.addEventListener("touchstart", function (e) {
      touchStart = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener("touchend", function (e) {
      var diff = touchStart - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        var vc = visibleCount();
        var maxIdx = Math.max(0, total - vc);
        if (diff > 0) goTo(current >= maxIdx ? 0 : current + 1);
        else          goTo(current - 1);
      }
      resetAuto();
    }, { passive: true });

    // Auto-play
    function startAuto() {
      autoTimer = setInterval(function () {
        var vc = visibleCount();
        var maxIdx = Math.max(0, total - vc);
        goTo(current >= maxIdx ? 0 : current + 1);
      }, 5000);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    startAuto();

    // Recalculate on resize
    window.addEventListener("resize", function () {
      goTo(current);
    });
  }

  /* ============================================================
     GSAP SCROLL ANIMATIONS (if GSAP available)
  ============================================================ */
  function initGSAP() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    // Subtle parallax on collection images
    document.querySelectorAll(".collection-img-wrap img").forEach(function (img) {
      gsap.fromTo(img,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: img.closest(".collection-card"),
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2
          }
        }
      );
    });

    // Gallery items parallax
    document.querySelectorAll(".gallery-item img").forEach(function (img) {
      gsap.fromTo(img,
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: img.closest(".gallery-item"),
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        }
      );
    });
  }

  /* ============================================================
     MAGNETIC BUTTONS (desktop only, subtle)
  ============================================================ */
  function initMagnetic() {
    if (matchMedia("(hover: none)").matches) return;

    document.querySelectorAll(".btn-primary, .btn-ghost").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect  = btn.getBoundingClientRect();
        var cx    = rect.left + rect.width  / 2;
        var cy    = rect.top  + rect.height / 2;
        var dx    = (e.clientX - cx) * 0.18;
        var dy    = (e.clientY - cy) * 0.18;
        btn.style.transform = "translate(" + dx + "px," + dy + "px) translateY(-1px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ============================================================
     BOOT
  ============================================================ */
  function boot() {
    safe(initSplash,      "splash");
    safe(initCursor,      "cursor");
    safe(initNav,         "nav");
    safe(initSmoothScroll,"smoothScroll");
    safe(initParallax,    "parallax");
    safe(initReveals,     "reveals");
    safe(initCountUp,     "countUp");
    safe(initTestimonials,"testimonials");
    safe(initGSAP,        "gsap");
    safe(initMagnetic,    "magnetic");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
