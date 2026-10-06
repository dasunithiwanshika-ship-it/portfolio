/**
 * Dasuni Thiwanshika — AI & Machine Learning Portfolio
 * Editorial Script Engine: Ambient Canvas, Filtering, Navigation & Clipboard
 */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientCanvas();
  initCaseStudyFiltering();
  initNavigation();
  initClipboardFeatures();
  initScrollSpy();
});

/* --------------------------------------------------------------------------
   01. Subtle Ambient Background Particles / Grid
   -------------------------------------------------------------------------- */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let nodes = [];
  const nodeCount = Math.min(Math.floor((width * height) / 22000), 40);

  class SubtleNode {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.radius = Math.random() * 1.5 + 1;
      this.alpha = Math.random() * 0.25 + 0.1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(114, 47, 55, ${this.alpha})`;
      ctx.fill();
    }
  }

  function initNodes() {
    nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new SubtleNode());
    }
  }

  function connectNodes() {
    const maxDist = 140;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.12;
          ctx.strokeStyle = `rgba(201, 122, 130, ${alpha})`;
          ctx.lineWidth = 0.6;
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

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initNodes();
  });

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
   02. Case Study Category Filtering
   -------------------------------------------------------------------------- */
function initCaseStudyFiltering() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const caseCards = document.querySelectorAll('.case-study-card');

  if (!filterTabs.length || !caseCards.length) return;

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filterValue = tab.getAttribute('data-filter');

      // Update active state
      filterTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      // Filter cards
      caseCards.forEach((card) => {
        const categories = (card.getAttribute('data-category') || '').split(' ');

        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'block';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            if (!categories.includes(tab.getAttribute('data-filter')) && tab.getAttribute('data-filter') !== 'all') {
              card.style.display = 'none';
            }
          }, 200);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   03. Sticky Header & Mobile Navigation
   -------------------------------------------------------------------------- */
function initNavigation() {
  const header = document.getElementById('site-header');
  const toggleBtn = document.getElementById('mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      toggleBtn.classList.toggle('active', isOpen);
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
      drawer.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        toggleBtn.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        toggleBtn.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
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
        const copyTextSpan = btn.querySelector('.copy-text');
        if (copyTextSpan) {
          const original = copyTextSpan.textContent;
          copyTextSpan.textContent = 'Copied!';
          setTimeout(() => { copyTextSpan.textContent = original; }, 2000);
        }
        showToast(`Email copied: ${email}`);
      } catch (err) {
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
  const navItems = document.querySelectorAll('.desktop-nav .nav-item');

  if (!sections.length || !navItems.length) return;

  function updateActiveLink() {
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id') || '';
      }
    });

    navItems.forEach((item) => {
      item.classList.remove('active');
      const href = item.getAttribute('href');
      if (href === `#${currentId}`) {
        item.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}
