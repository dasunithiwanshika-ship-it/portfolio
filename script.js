/**
 * Dasuni Thiwanshika — AI & ML Engineer Portfolio
 * Core Interactive Architecture & Canvas Computation Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initProjectFiltering();
  initNavigation();
  initClipboardFeatures();
  initScrollSpy();
});

/* --------------------------------------------------------------------------
   01. Subtle Ambient Node-Network Canvas Background
   -------------------------------------------------------------------------- */
function initBackgroundCanvas() {
  const canvas = document.getElementById('hero-matrix-canvas');
  if (!canvas) return;

  // Check prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let mouse = { x: -1000, y: -1000, radius: 140 };
  let nodes = [];
  const nodeCount = Math.min(Math.floor((width * height) / 18000), 55);

  class Node {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 1.5 + 1;
      this.baseAlpha = Math.random() * 0.35 + 0.15;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse attraction / interaction
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius && dist > 0) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 1.2;
        this.y -= (dy / dist) * force * 1.2;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${this.baseAlpha})`;
      ctx.fill();
    }
  }

  function initNodes() {
    nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new Node());
    }
  }

  function connectNodes() {
    const maxDist = 130;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.18;
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
  }

  let animationFrameId;
  let isPageVisible = true;

  function animate() {
    if (!isPageVisible) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < nodes.length; i++) {
      nodes[i].update();
      nodes[i].draw();
    }
    connectNodes();

    animationFrameId = requestAnimationFrame(animate);
  }

  initNodes();
  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initNodes();
  });

  // Track mouse
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Pause animation when tab is inactive to save battery
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    if (isPageVisible) {
      animate();
    } else {
      cancelAnimationFrame(animationFrameId);
    }
  });
}

/* --------------------------------------------------------------------------
   02. Project Category Filtering Engine
   -------------------------------------------------------------------------- */
function initProjectFiltering() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterButtons.length || !projectCards.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filterValue = btn.getAttribute('data-filter');

      // Update active state on buttons
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter cards
      projectCards.forEach((card) => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'block';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(8px)';
          setTimeout(() => {
            if (!categories.includes(btn.getAttribute('data-filter')) && btn.getAttribute('data-filter') !== 'all') {
              card.style.display = 'none';
            }
          }, 200);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   03. Mobile Navigation & Sticky Header Behavior
   -------------------------------------------------------------------------- */
function initNavigation() {
  const header = document.getElementById('site-header');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // Sticky Header scroll styling
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu toggle
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      mobileNav.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }
}

/* --------------------------------------------------------------------------
   04. Copy to Clipboard with Toast Notification
   -------------------------------------------------------------------------- */
function initClipboardFeatures() {
  const copyButtons = document.querySelectorAll('.btn-copy-email');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  let toastTimeout;

  function showToast(message) {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = message;
    
    toast.classList.add('show');
    toast.setAttribute('aria-hidden', 'false');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
      toast.setAttribute('aria-hidden', 'true');
    }, 2800);
  }

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const email = btn.getAttribute('data-email') || 'dasunithiwanshika@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        const originalText = btn.querySelector('.copy-text');
        if (originalText) {
          const prev = originalText.textContent;
          originalText.textContent = 'Copied!';
          setTimeout(() => { originalText.textContent = prev; }, 2000);
        }
        showToast(`Email copied: ${email}`);
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`Email copied: ${email}`);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   05. ScrollSpy for Navigation Links
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');

  if (!sections.length || !navLinks.length) return;

  function updateActiveLink() {
    let currentSectionId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id') || '';
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}
