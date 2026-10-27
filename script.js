const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Opening wipe */
const dismissWipe = () => {
  const wipe = $(".intro-wipe");
  window.setTimeout(() => {
    wipe?.classList.add("is-hidden");
    window.setTimeout(() => { if (wipe) wipe.hidden = true; }, reducedMotion ? 0 : 1100);
  }, reducedMotion ? 0 : 520);
};

if (document.readyState === "complete") {
  dismissWipe();
} else {
  window.addEventListener("load", dismissWipe);
}

/* Mobile navigation & Minimal Overlay Menu */
const menuToggle = $(".menu-toggle");
const minimalMenuToggle = $("#minimalMenuToggle");
const mobileMenuClose = $("#mobileMenuClose");
const mobileMenu = $(".mobile-menu");

const setMenu = (open) => {
  menuToggle?.classList.toggle("is-open", open);
  mobileMenu?.classList.toggle("is-open", open);
  minimalMenuToggle?.setAttribute("aria-expanded", String(open));
  menuToggle?.setAttribute("aria-expanded", String(open));
  menuToggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  mobileMenu?.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("menu-open", open);
};

menuToggle?.addEventListener("click", () => setMenu(!mobileMenu?.classList.contains("is-open")));
minimalMenuToggle?.addEventListener("click", () => setMenu(true));
mobileMenuClose?.addEventListener("click", () => setMenu(false));
$$('.mobile-menu a').forEach((link) => link.addEventListener("click", () => setMenu(false)));
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

/* Copy Email Button with Animated Toast */
const copyEmailBtn = $("#copyEmailBtn");
const copyToast = $("#copyToast");
if (copyEmailBtn) {
  let toastTimeout = null;
  copyEmailBtn.addEventListener("click", async () => {
    const email = copyEmailBtn.dataset.email || "nandanamahalakshmi@gmail.com";
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch (err) {
      const input = document.createElement("input");
      input.value = email;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.focus();
      input.select();
      try {
        document.execCommand("copy");
      } catch (e) {}
      document.body.removeChild(input);
    }
    if (copyToast) {
      copyToast.classList.add("is-shown");
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        copyToast.classList.remove("is-shown");
      }, 2200);
    }
  });
}

/* Butter-smooth momentum scrolling (Lenis) across the complete page */
let lenis = null;
if (typeof Lenis !== "undefined" && !reducedMotion) {
  lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* Smooth scroll to all anchor links with Lenis */
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (targetId && targetId !== "#") {
        const target = $(targetId);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -30, duration: 1.35 });
          if (history.pushState) history.pushState(null, null, targetId);
        }
      }
    });
  });
}

/* Header scroll state: reveal floating header after leaving hero on landing page, keep permanently visible on work pages */
const siteHeader = $(".site-header");
const isLandingPage = !!$(".hero-editorial");
if (siteHeader) {
  if (!isLandingPage) {
    siteHeader.classList.add("scrolled", "always-visible");
  } else {
    const onScroll = (y) => {
      siteHeader.classList.toggle("scrolled", y > 80);
    };
    if (lenis) {
      lenis.on('scroll', ({ scroll }) => onScroll(scroll));
    } else {
      window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });
      onScroll(window.scrollY);
    }
  }
}

/* Refined scroll reveal observer with smooth cascading entry */
const revealItems = $$(".reveal, .reveal-lines");
if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  revealItems.forEach((item, index) => {
    const delay = Math.min((index % 4) * 65, 200);
    item.style.transitionDelay = `${delay}ms`;
    revealObserver.observe(item);
  });
}

/* ==========================================================================
   Interactive Animated Mouse Pointer with "View" Disc
   ========================================================================== */
const cursor = $(".cursor");
const cursorText = cursor ? $(".cursor-text", cursor) : null;
let cursorX = -100;
let cursorY = -100;
let cursorRenderX = -100;
let cursorRenderY = -100;

if (cursor && window.matchMedia("(pointer: fine)").matches && !reducedMotion) {
  window.addEventListener("pointermove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    cursor.classList.add("is-visible");
  }, { passive: true });

  document.addEventListener("mouseleave", () => {
    cursor.classList.remove("is-visible");
  });

  window.addEventListener("pointerdown", () => {
    cursor.classList.add("is-down");
  });

  window.addEventListener("pointerup", () => {
    cursor.classList.remove("is-down");
  });

  /* Smooth momentum lerp */
  const renderCursor = () => {
    const isView = cursor.classList.contains("is-view");
    const lerpFactor = isView ? 0.22 : 0.28;
    cursorRenderX += (cursorX - cursorRenderX) * lerpFactor;
    cursorRenderY += (cursorY - cursorRenderY) * lerpFactor;
    cursor.style.left = `${cursorRenderX.toFixed(1)}px`;
    cursor.style.top = `${cursorRenderY.toFixed(1)}px`;
    window.requestAnimationFrame(renderCursor);
  };
  renderCursor();

  /* "View" disc targets: work snippet cards, project cards, case preview media */
  const viewTargets = $$(
    '.work-snippet-card, .snippet-media-container, .snippet-img-wrap, .case-gallery-item, .project-card, .case-study-hero, .viewport'
  );
  viewTargets.forEach((target) => {
    target.addEventListener("pointerenter", () => {
      if (cursorText) cursorText.textContent = "View";
      cursor.classList.add("is-view");
    });
    target.addEventListener("pointerleave", () => {
      cursor.classList.remove("is-view");
    });
  });

  /* General clickable elements: buttons, links, etc. */
  const interactiveTargets = $$(
    'a:not(.work-snippet-card), button, [role="button"], input, .hero-illust-card, .about-avatar-wrapper, .about-avatar-stage, .header-contact'
  );
  interactiveTargets.forEach((item) => {
    item.addEventListener("pointerenter", () => {
      if (!cursor.classList.contains("is-view")) {
        cursor.classList.add("is-hover");
      }
    });
    item.addEventListener("pointerleave", () => {
      cursor.classList.remove("is-hover");
    });
  });

  /* Invert over dark sections (footer, etc.) */
  const darkElements = $$('.footer, footer, [data-theme="dark"], .intro-wipe');
  darkElements.forEach((el) => {
    el.addEventListener("pointerenter", () => cursor.classList.add("is-dark"));
    el.addEventListener("pointerleave", () => cursor.classList.remove("is-dark"));
  });
}



/* ==========================================================================
   EXVIA INTERACTIVE FOCUS LENS & BLUR SYSTEM
   ========================================================================== */
const heroStage = $("#heroPortraitStage");
const heroLens = $("#heroFocusLens");
const heroLensImg = $("#heroLensImg");
const lensToggleBtn = $("#lensToggleBtn");
const lensHintText = lensToggleBtn ? lensToggleBtn.querySelector(".hint-text") : null;

if (heroStage && heroLens && heroLensImg) {
  let isHovered = false;
  let isPinned = false;
  let animId = null;

  // Track positions
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const updateStageDimensions = () => {
    const rect = heroStage.getBoundingClientRect();
    const stageW = rect.width;
    const stageH = rect.height;
    const lensW = heroLens.offsetWidth || 180;
    const lensH = heroLens.offsetHeight || 220;

    // Default face coordinates: ~53.8% width, ~37.1% height
    const defaultX = stageW * 0.538 - lensW / 2;
    const defaultY = stageH * 0.371 - lensH / 2;

    heroLensImg.style.width = `${stageW}px`;
    heroLensImg.style.height = `${stageH}px`;

    return { stageW, stageH, lensW, lensH, defaultX, defaultY };
  };

  let dims = updateStageDimensions();
  currentX = dims.defaultX;
  currentY = dims.defaultY;
  targetX = dims.defaultX;
  targetY = dims.defaultY;

  window.addEventListener("resize", () => {
    dims = updateStageDimensions();
    if (!isHovered && !isPinned) {
      targetX = dims.defaultX;
      targetY = dims.defaultY;
      currentX = dims.defaultX;
      currentY = dims.defaultY;
      renderLens();
    }
  }, { passive: true });

  const renderLens = () => {
    // Smooth lerp (0.16)
    currentX += (targetX - currentX) * 0.16;
    currentY += (targetY - currentY) * 0.16;

    heroLens.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0)`;
    heroLensImg.style.transform = `translate3d(${-currentX.toFixed(1)}px, ${-currentY.toFixed(1)}px, 0)`;

    if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
      animId = requestAnimationFrame(renderLens);
    } else {
      animId = null;
    }
  };

  const startAnimation = () => {
    if (!animId) {
      animId = requestAnimationFrame(renderLens);
    }
  };

  // Pointer move: track cursor within portrait stage
  const onPointerMove = (e) => {
    isHovered = true;
    heroStage.classList.add("is-hovered");
    if (!isPinned && lensHintText) {
      lensHintText.textContent = "Focus Active";
    }

    const rect = heroStage.getBoundingClientRect();
    const x = e.clientX - rect.left - dims.lensW / 2;
    const y = e.clientY - rect.top - dims.lensH / 2;

    // Gentle bounds clamping allowing exploration near edges
    targetX = Math.max(-dims.lensW * 0.25, Math.min(dims.stageW - dims.lensW * 0.75, x));
    targetY = Math.max(-dims.lensH * 0.25, Math.min(dims.stageH - dims.lensH * 0.75, y));

    startAnimation();
  };

  heroStage.addEventListener("pointerenter", (e) => {
    dims = updateStageDimensions();
    onPointerMove(e);
  });

  heroStage.addEventListener("pointermove", onPointerMove);

  heroStage.addEventListener("pointerleave", () => {
    isHovered = false;
    if (!isPinned) {
      heroStage.classList.remove("is-hovered");
      if (lensHintText) lensHintText.textContent = "Hover to Focus";
      // Glide back to default face coordinates
      targetX = dims.defaultX;
      targetY = dims.defaultY;
      startAnimation();
    }
  });

  // Toggle button (click to pin / unpin focus lens)
  if (lensToggleBtn) {
    lensToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      isPinned = !isPinned;
      heroStage.classList.toggle("is-pinned", isPinned);
      if (isPinned) {
        heroStage.classList.add("is-hovered");
        if (lensHintText) lensHintText.textContent = "Focus Pinned";
        targetX = dims.defaultX;
        targetY = dims.defaultY;
        startAnimation();
      } else {
        if (!isHovered) {
          heroStage.classList.remove("is-hovered");
          if (lensHintText) lensHintText.textContent = "Hover to Focus";
        }
      }
    });
  }

  // Initial setup: position lens on face
  renderLens();
}

/* Project carousel: auto-play, arrows, keyboard, mouse and touch drag */
const carousel = $(".carousel");
const viewport = $(".carousel-viewport");
const track = $(".carousel-track");
const slides = $$(".project-slide");
const prevButton = $(".carousel-prev");
const nextButton = $(".carousel-next");
const progress = $(".carousel-progress span");
const currentCount = $(".carousel-count strong");

let activeSlide = 0;
let dragStart = 0;
let dragDelta = 0;
let isDragging = false;
let carouselTimer;

const updateCarousel = (animate = true) => {
  if (!track || !slides.length) return;
  track.classList.toggle("is-dragging", !animate);
  track.style.transform = `translate3d(-${activeSlide * 100}%, 0, 0)`;
  if (progress) progress.style.transform = `translateX(${activeSlide * 100}%)`;
  if (currentCount) currentCount.textContent = String(activeSlide + 1).padStart(2, "0");
  slides.forEach((slide, index) => slide.setAttribute("aria-hidden", String(index !== activeSlide)));
};

const goToSlide = (index) => {
  activeSlide = (index + slides.length) % slides.length;
  updateCarousel();
  restartCarousel();
};

const stopCarousel = () => window.clearInterval(carouselTimer);
const startCarousel = () => {
  stopCarousel();
  if (reducedMotion || document.hidden) return;
  carouselTimer = window.setInterval(() => {
    activeSlide = (activeSlide + 1) % slides.length;
    updateCarousel();
  }, 5200);
};
const restartCarousel = () => startCarousel();

prevButton?.addEventListener("click", () => goToSlide(activeSlide - 1));
nextButton?.addEventListener("click", () => goToSlide(activeSlide + 1));

carousel?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") goToSlide(activeSlide - 1);
  if (event.key === "ArrowRight") goToSlide(activeSlide + 1);
});
carousel?.setAttribute("tabindex", "0");

viewport?.addEventListener("pointerdown", (event) => {
  isDragging = true;
  dragStart = event.clientX;
  dragDelta = 0;
  viewport.setPointerCapture?.(event.pointerId);
  viewport.classList.add("is-dragging");
  track.classList.add("is-dragging");
  stopCarousel();
});

viewport?.addEventListener("pointermove", (event) => {
  if (!isDragging) return;
  dragDelta = event.clientX - dragStart;
  const width = viewport.clientWidth || 1;
  const offset = activeSlide * width - dragDelta;
  track.style.transform = `translate3d(-${offset}px, 0, 0)`;
});

const finishDrag = () => {
  if (!isDragging) return;
  isDragging = false;
  viewport.classList.remove("is-dragging");
  track.classList.remove("is-dragging");
  const threshold = Math.min(110, viewport.clientWidth * .16);
  if (Math.abs(dragDelta) > threshold) activeSlide += dragDelta < 0 ? 1 : -1;
  activeSlide = (activeSlide + slides.length) % slides.length;
  dragDelta = 0;
  updateCarousel();
  startCarousel();
};

viewport?.addEventListener("pointerup", finishDrag);
viewport?.addEventListener("pointercancel", finishDrag);
viewport?.addEventListener("lostpointercapture", finishDrag);
carousel?.addEventListener("mouseenter", stopCarousel);
carousel?.addEventListener("mouseleave", startCarousel);
document.addEventListener("visibilitychange", startCarousel);
window.addEventListener("resize", () => updateCarousel(false));

updateCarousel(false);
startCarousel();

/* Live India time */
const timeElement = $("#localTime");
const updateTime = () => {
  if (!timeElement) return;
  timeElement.textContent = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
};
updateTime();
window.setInterval(updateTime, 30000);

/* ==========================================================================
   Dynamic Animated "clarity" Typographic Morphing (Strictly 3 Styles)
   ========================================================================== */
const clarityElement = $("#clarityMorph");
if (clarityElement) {
  const clarityStyles = [
    { className: "style-serif-italic", text: "clarity" },
    { className: "style-sans-bold", text: "clarity" },
    { className: "style-outline", text: "clarity" },
  ];

  let currentStyleIndex = 0;
  let isMorphing = false;
  let morphTimer = null;

  const setClarityStyle = (nextIndex) => {
    if (isMorphing) return;
    isMorphing = true;

    // Phase 1: smooth dissolve out
    clarityElement.classList.add("is-morphing-out");

    setTimeout(() => {
      // Phase 2: swap to next font class
      clarityStyles.forEach((s) => clarityElement.classList.remove(s.className));
      currentStyleIndex = nextIndex % clarityStyles.length;
      const nextStyle = clarityStyles[currentStyleIndex];

      clarityElement.classList.add(nextStyle.className);
      clarityElement.textContent = nextStyle.text;

      clarityElement.classList.remove("is-morphing-out");
      clarityElement.classList.add("is-morphing-in");

      // Force layout calculation for seamless transition
      void clarityElement.offsetWidth;

      // Phase 3: silky glide into view
      requestAnimationFrame(() => {
        clarityElement.classList.remove("is-morphing-in");
        setTimeout(() => {
          isMorphing = false;
        }, 420);
      });
    }, 220);
  };

  const nextClarity = () => {
    setClarityStyle((currentStyleIndex + 1) % clarityStyles.length);
  };

  const startMorphLoop = () => {
    stopMorphLoop();
    if (!reducedMotion) {
      morphTimer = window.setInterval(nextClarity, 2800);
    }
  };

  const stopMorphLoop = () => {
    if (morphTimer) {
      clearInterval(morphTimer);
      morphTimer = null;
    }
  };

  // Click or tap to cycle styles immediately
  clarityElement.addEventListener("click", () => {
    stopMorphLoop();
    nextClarity();
    startMorphLoop();
  });

  // Pause on hover
  clarityElement.addEventListener("mouseenter", stopMorphLoop);
  clarityElement.addEventListener("mouseleave", startMorphLoop);

  // Initial start with pleasant reveal delay
  setTimeout(startMorphLoop, 1600);
}
