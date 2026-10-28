    // Respect prefers-reduced-motion: collapse every GSAP-driven animation on the
    // page to near-instant instead of disabling each of the ~40 call sites individually.
    if (window.gsap && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.globalTimeline.timeScale(70);
    }

    // Page Preloader — hides once the page (and its assets) has fully loaded,
    // with a simple fade-out.
    const pageLoaderStart = Date.now();
    function hidePageLoader() {
      const loader = document.getElementById('cp-loader');
      if (!loader || loader.dataset.hidden) return;
      loader.dataset.hidden = 'true';
      const elapsed = Date.now() - pageLoaderStart;
      const wait = Math.max(0, 500 - elapsed);
      setTimeout(() => {
        loader.classList.add('cp-loader-hidden');
        setTimeout(() => loader.remove(), 500);
      }, wait);
    }
    if (document.readyState === 'complete') {
      hidePageLoader();
    }
    setTimeout(hidePageLoader, 6000);

    // Hero headline word-cycle: SMART -> BETTER -> FASTER, fading in/out on a loop
    function initHeroWordCycle() {
      const el = document.getElementById('hero-cycle-word');
      if (!el) return;
      const words = ['SMART', 'BETTER', 'FASTER'];

      // Measure the widest word up front and lock it in, so swapping text
      // never reflows "software" / the line wrap next to it.
      const measurer = el.cloneNode(true);
      measurer.style.cssText = 'position:absolute; visibility:hidden; pointer-events:none; white-space:nowrap;';
      el.parentNode.appendChild(measurer);
      let maxWidth = 0;
      words.forEach(w => {
        measurer.textContent = w;
        maxWidth = Math.max(maxWidth, measurer.offsetWidth);
      });
      measurer.remove();
      el.style.minWidth = maxWidth + 'px';

      let i = 0;
      setInterval(() => {
        el.classList.add('is-swapping');
        setTimeout(() => {
          i = (i + 1) % words.length;
          el.textContent = words[i];
          el.classList.remove('is-swapping');
        }, 900);
      }, 2600);
    }

    // Initialize Lucide Icons, 3D Particle Canvas, and Trionn Vision Animation
    function initAllInteractive() {
      lucide.createIcons();
      initDribbble3D();
      initNeuralBrain();
      initHeroWordCycle();

      // Cross-page deep link: index.html#about jumps straight to that page-view
      const hash = window.location.hash.replace('#', '');
      if (hash && document.getElementById(`page-${hash}`)) {
        navigateTo(hash);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAllInteractive);
    } else {
      initAllInteractive();
    }

    window.addEventListener('load', () => {
      initDribbble3D();
      initNeuralBrain();
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
      hidePageLoader();
    });

    // Neural Network Brain — live synapse geometry + pointer parallax.
    // The SVG synapse paths are redrawn every frame so their endpoints stay glued to
    // the drifting neurons, and the normalized pointer position (--px / --py,
    // range -1..1) lets the grid, aurora and rings lean at different depths.
    // Star topology: every outer neuron connects to the central hub.
    function initNeuralBrain() {
      const scene = document.querySelector('.nn-brain-scene');
      if (!scene || scene.dataset.neuralBrainReady === 'true') return;
      scene.dataset.neuralBrainReady = 'true';

      const svg = scene.querySelector('.nn-brain-synapses');
      const stageOf = key => scene.querySelector('.nn-neuron-' + key + ' .nn-neuron-stage');
      const host = scene.parentElement || scene;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const parallaxEnabled = !reduceMotion && finePointer;

      // Multi-layer neural mesh: hub connects to inner tier, inner connects to outer tier + lateral links
      const edges = [
        // Hub radiating to inner & bridge nodes (filling middle space)
        ['hub', 'g', 'nn-synapse-warm'],    // Hub ↔ Voice Translator (rose)
        ['hub', 'h', 'nn-synapse-cool'],    // Hub ↔ Autonomous Agents (sky)
        ['hub', 'i', ''],                   // Hub ↔ Neural RAG (purple)
        ['hub', 'j', 'nn-synapse-gold'],    // Hub ↔ Model Tuning (amber)
        ['hub', 'k', 'nn-synapse-mint'],    // Hub ↔ Deep Learning (emerald)
        ['hub', 'l', 'nn-synapse-warm'],    // Hub ↔ Realtime Inference (pink)

        // Inner nodes connecting outward to primary capability nodes
        ['g', 'a', 'nn-synapse-cool'],      // Voice Translator ↔ LLM Engine
        ['g', 'e', 'nn-synapse-mint'],      // Voice Translator ↔ Gen AI
        ['h', 'b', 'nn-synapse-warm'],      // Autonomous Agents ↔ Voice AI
        ['h', 'f', 'nn-synapse-ice'],       // Autonomous Agents ↔ Edge ML
        ['i', 'e', 'nn-synapse-mint'],      // Neural RAG ↔ Gen AI
        ['i', 'c', ''],                     // Neural RAG ↔ NLP Engine
        ['j', 'f', 'nn-synapse-ice'],       // Model Tuning ↔ Edge ML
        ['j', 'd', 'nn-synapse-gold'],      // Model Tuning ↔ Computer Vision

        // Vertical bridge links
        ['k', 'a', 'nn-synapse-cool'],      // Deep Learning ↔ LLM Engine
        ['k', 'b', 'nn-synapse-warm'],      // Deep Learning ↔ Voice AI
        ['l', 'c', ''],                     // Realtime Inference ↔ NLP Engine
        ['l', 'd', 'nn-synapse-gold'],      // Realtime Inference ↔ Computer Vision

        // Hub direct anchor connections
        ['hub', 'a', 'nn-synapse-cool'],    // Hub ↔ LLM Engine
        ['hub', 'b', 'nn-synapse-warm'],    // Hub ↔ Voice AI
        ['hub', 'e', 'nn-synapse-mint'],    // Hub ↔ Gen AI
        ['hub', 'f', 'nn-synapse-ice'],     // Hub ↔ Edge ML
      ];

      const svgNS = 'http://www.w3.org/2000/svg';
      const paths = [];

      edges.forEach(([from, to, variant], index) => {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('class', ('nn-synapse ' + variant).trim());
        path.setAttribute('id', 'nn-synapse-' + index);
        svg.appendChild(path);

        if (!reduceMotion) {
          const packet = document.createElementNS(svgNS, 'circle');
          packet.setAttribute('class', 'nn-brain-packet');
          packet.setAttribute('r', '2.5');
          const motion = document.createElementNS(svgNS, 'animateMotion');
          motion.setAttribute('dur', (4.6 + index * 0.6).toFixed(1) + 's');
          motion.setAttribute('repeatCount', 'indefinite');
          motion.setAttribute('begin', (-index * 0.8).toFixed(1) + 's');
          const mpath = document.createElementNS(svgNS, 'mpath');
          mpath.setAttribute('href', '#' + path.id);
          motion.appendChild(mpath);
          packet.appendChild(motion);
          svg.appendChild(packet);
        }

        paths.push({ path, from: stageOf(from), to: stageOf(to) });
      });

      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let frame = 0;
      let visible = true;

      const drawLinks = () => {
        const sceneRect = scene.getBoundingClientRect();
        paths.forEach(({ path, from, to }) => {
          if (!from || !to) return;
          const a = from.getBoundingClientRect();
          const b = to.getBoundingClientRect();
          const x1 = a.left + a.width / 2 - sceneRect.left;
          const y1 = a.top + a.height / 2 - sceneRect.top;
          const x2 = b.left + b.width / 2 - sceneRect.left;
          const y2 = b.top + b.height / 2 - sceneRect.top;
          const mx = (x1 + x2) / 2 + (y2 - y1) * 0.08;
          const my = (y1 + y2) / 2 - (x2 - x1) * 0.08;
          path.setAttribute('d', `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
        });
      };

      const loop = () => {
        frame = 0;
        if (!visible || document.hidden) return;
        if (parallaxEnabled) {
          currentX += (targetX - currentX) * 0.06;
          currentY += (targetY - currentY) * 0.06;
          scene.style.setProperty('--px', currentX.toFixed(4));
          scene.style.setProperty('--py', currentY.toFixed(4));
        }
        drawLinks();
        if (!reduceMotion) frame = requestAnimationFrame(loop);
      };

      const start = () => {
        if (!frame) frame = requestAnimationFrame(loop);
      };

      if (parallaxEnabled) {
        const onMove = (e) => {
          const rect = host.getBoundingClientRect();
          targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
          targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
          start();
        };

        host.addEventListener('pointermove', onMove);
        host.addEventListener('pointerleave', () => {
          targetX = 0;
          targetY = 0;
          start();
        });
      }

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          visible = entries[0].isIntersecting;
          if (visible) start();
        }, { threshold: 0.01 });
        observer.observe(scene);
      }

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) start();
      });

      window.addEventListener('resize', () => {
        drawLinks();
      });

      drawLinks();
      start();
    }

    // 3D Perspective Card Tilt
    function handleTilt(e, card) {
      // Skip while a mouse button is held (e.g. dragging to select text) so the
      // constant transform reassignment doesn't cancel the browser's selection.
      if (e.buttons) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;
      
      card.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    }

    function resetTilt(card) {
      card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    }

        // Multipage View Navigation
    function navigateTo(pageId) {
      document.querySelectorAll('.page-view').forEach(el => el.classList.add('hidden'));
      
      const targetPage = document.getElementById(`page-${pageId}`);
      if (targetPage) {
        targetPage.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (typeof ScrollTrigger !== 'undefined') {
          setTimeout(() => ScrollTrigger.refresh(), 100);
        }
      }

      document.querySelectorAll('.nav-item').forEach(btn => {
        if (btn.textContent.trim().toLowerCase().includes(pageId)) {
          btn.classList.add('text-white');
          btn.classList.remove('text-neutral-300');
        } else {
          btn.classList.remove('text-white');
          btn.classList.add('text-neutral-300');
        }
      });
      showToast(`Navigated to ${pageId.toUpperCase()}`);
    }

    function toggleMobileMenu() {
      const menu = document.getElementById('mobile-menu');
      menu.classList.toggle('hidden');
    }

    // Portfolio Category Filtering
    function filterPortfolio(category, btn) {
      document.querySelectorAll('.portfolio-filter-btn').forEach(b => {
        b.className = 'portfolio-filter-btn px-5 py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider bg-white text-neutral-700 hover:text-black border border-[#D5D5D8] hover:border-black transition-all';
      });
      btn.className = 'portfolio-filter-btn px-5 py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider bg-black text-white border border-black transition-all';

      const items = document.querySelectorAll('.portfolio-item');
      items.forEach(item => {
        if (category === 'all' || item.classList.contains(category)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    }

    // Pricing Billing Switcher (Monthly / Yearly)
    let isYearly = false;
    function setBilling(mode) {
      const btnMonthly = document.getElementById('btn-monthly');
      const btnYearly = document.getElementById('btn-yearly');
      isYearly = (mode === 'yearly');

      if (isYearly) {
        btnYearly.className = 'px-5 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider bg-black text-white transition-all';
        btnMonthly.className = 'px-5 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black transition-all';
      } else {
        btnMonthly.className = 'px-5 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider bg-black text-white transition-all';
        btnYearly.className = 'px-5 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black transition-all';
      }

      document.querySelectorAll('.price-val').forEach(el => {
        const base = parseInt(el.getAttribute('data-base'));
        const newPrice = isYearly ? Math.round(base * 0.8) : base;
        el.textContent = `$${newPrice.toLocaleString()}`;
      });

      document.querySelectorAll('.period-val').forEach(el => {
        el.textContent = isYearly ? '/ month (billed yearly)' : '/ month';
      });
    }

    function selectPlan(planName) {
      showToast(`Selected ${planName} Plan. Proceeding to consultation.`);
      openContactModal();
    }

    // Testimonial Carousel — real client quotes, mirrored from cloudproductionltd.com "Our Clients Say"
    const testimonials = [
      {
        quote: "I wanted to express our sincere gratitude for the long-standing collaboration with CPL technical team. Over the years, your team has consistently demonstrated professionalism and excellence, delivering results that exceeded our expectations. Your technical expertise, timely deliveries, effective communication, problem-solving skills, and proficiency in Japanese support have made our partnership invaluable. We look forward to continuing this successful collaboration in future projects.",
        author: "Mr. Takuya Sato",
        role: "CEO, Arousal Tech Japan",
        avatar: "assets/images/testimonial-takuya-sato.jpg"
      },
      {
        quote: "I was looking to take my retail business online, and Cloud Production Ltd. made it a breeze. They created a beautiful e-commerce website for us, and our online sales have skyrocketed since then. The design is modern, and the user experience is seamless. Highly recommended!",
        author: "Funai Minayasu Hayaki",
        role: "CEO, Cloud Production Japan (Main Branch)",
        avatar: "assets/images/testimonial-funai-minayasu-hayaki.jpg"
      }
    ];

    let currentTestimonial = 0;
    function updateTestimonialUI() {
      const box = document.getElementById('testimonial-box');
      box.style.opacity = '0';
      box.style.transform = 'translateY(10px)';

      setTimeout(() => {
        const item = testimonials[currentTestimonial];
        document.getElementById('testimonial-text').textContent = `"${item.quote}"`;
        document.getElementById('testimonial-author').textContent = item.author;
        document.getElementById('testimonial-role').textContent = item.role;
        document.getElementById('testimonial-avatar').src = item.avatar;
        
        box.style.opacity = '1';
        box.style.transform = 'translateY(0px)';
      }, 200);
    }

    function nextTestimonial() {
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
      updateTestimonialUI();
    }

    function prevTestimonial() {
      currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
      updateTestimonialUI();
    }

    // Modal Control Functions
    function openContactModal() {
      const modal = document.getElementById('contact-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeContactModal() {
      const modal = document.getElementById('contact-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function resetFooterForm() {
      const form = document.getElementById('direct-business-form');
      if (form) form.reset();
      showToast('Form cleared');
    }

    // Header Search — click the icon to reveal an inline field, submit (or click away) to hide it again
    function toggleSearchField(forceClose) {
      const input = document.getElementById('search-input');
      if (!input) return;
      const isOpen = input.classList.contains('search-open');
      if (forceClose || isOpen) {
        input.classList.remove('search-open', 'scale-100', 'opacity-100', 'pointer-events-auto');
        input.classList.add('scale-95', 'opacity-0', 'pointer-events-none');
        input.blur();
        input.value = '';
      } else {
        input.classList.remove('scale-95', 'opacity-0', 'pointer-events-none');
        input.classList.add('search-open', 'scale-100', 'opacity-100', 'pointer-events-auto');
        setTimeout(() => input.focus(), 50);
      }
    }

    function handleSearchSubmit(e) {
      e.preventDefault();
      const input = document.getElementById('search-input');
      const query = input ? input.value.trim() : '';
      if (query) {
        showToast(`Searching for "${query}"...`);
      }
      toggleSearchField(true);
    }

    document.addEventListener('click', (e) => {
      const wrap = document.getElementById('search-wrap');
      const input = document.getElementById('search-input');
      if (!wrap || !input || !input.classList.contains('search-open')) return;
      if (!wrap.contains(e.target)) toggleSearchField(true);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const input = document.getElementById('search-input');
        if (input && input.classList.contains('search-open')) toggleSearchField(true);
      }
    });

    function handleContactSubmit(e) {
      e.preventDefault();
      closeContactModal();
      showToast('Thank you! Cloud Production Ltd will reach out within 24 hours.');
      e.target.reset();
    }

    function handleNewsletter(e) {
      e.preventDefault();
      showToast('Subscribed to the Cloud Production Weekly Digest.');
      e.target.reset();
    }

    // Initialize Trionn Dribbble Design In Motion 3D Curved Cards & Dark Stripes Transition
    const dribbleProjectsData = [
      {
        title: 'Floor Inventory',
        headline: 'SALES FLOOR ERP',
        category: 'Retail Enterprise',
        badge: '01 / RETAIL INVENTORY',
        code: 'CPL #025',
        desc: 'Real-time stock tracking and sales floor inventory management built to cut shortages and manual reconciliation.',
        desc1: 'REAL-TIME STOCK TRACKING',
        desc2: 'AUTOMATED RECONCILIATION',
        client: 'Cloud Production LTD Product',
        year: 'Production Verified',
        role: 'Enterprise Web & Mobile • Retail Systems',
        metrics: 'Reduced Manual Reconciliation',
        overview: 'A real-time inventory management system built for sales floors, tracking stock levels as they move and cutting down on shortages and manual stock reconciliation across locations.',
        deliverables: ['Real-Time Stock Dashboard', 'Low-Stock & Shortage Alerts', 'Multi-Location Tracking', 'Reconciliation Reporting'],
        accentColor: '#16A34A',
        accentDark: '#15803D',
        imgUrl: 'assets/images/portfolio-live/inventory-management.png'
      },
      {
        title: 'Cloud HR Track',
        headline: 'WORKFORCE CLOUD',
        category: 'HR & Workforce Tech',
        badge: '02 / HR MANAGEMENT PLATFORM',
        code: 'CPL #026',
        desc: 'Cloud-based HR platform for simpler employee management, workflow transparency, and team alignment.',
        desc1: 'CUSTOMIZABLE HR WORKFLOWS',
        desc2: 'RECRUITMENT & PERFORMANCE TRACKING',
        client: 'Cloud Production LTD Product',
        year: 'Production Verified',
        role: 'Full-Stack Web • Node.js / Next.js / PostgreSQL',
        metrics: 'Lightweight, Fully Customizable Platform',
        overview: 'A modern cloud-based HR Management platform built from scratch to replace complex enterprise HR tools with a lightweight, fully customizable solution — covering employee data, recruitment and candidate tracking, performance management, and team collaboration.',
        deliverables: ['Centralized Employee Database', 'Recruitment & Candidate Tracking', 'Performance & KPI Management', 'Team Communication & Collaboration'],
        accentColor: '#0891B2',
        accentDark: '#0E7490',
        imgUrl: 'assets/images/portfolio-live/cloud-hr-track.png'
      },
      {
        title: 'Floor Inventory',
        headline: 'SALES FLOOR ERP',
        category: 'Retail Enterprise',
        badge: '03 / RETAIL INVENTORY',
        code: 'CPL #027',
        desc: 'Real-time stock tracking and sales floor inventory management built to cut shortages and manual reconciliation.',
        desc1: 'REAL-TIME STOCK TRACKING',
        desc2: 'AUTOMATED RECONCILIATION',
        client: 'Cloud Production LTD Product',
        year: 'Production Verified',
        role: 'Enterprise Web & Mobile • Retail Systems',
        metrics: 'Reduced Manual Reconciliation',
        overview: 'A real-time inventory management system built for sales floors, tracking stock levels as they move and cutting down on shortages and manual stock reconciliation across locations.',
        deliverables: ['Real-Time Stock Dashboard', 'Low-Stock & Shortage Alerts', 'Multi-Location Tracking', 'Reconciliation Reporting'],
        accentColor: '#16A34A',
        accentDark: '#15803D',
        imgUrl: 'assets/images/portfolio-live/inventory-management.png'
      },
      {
        title: 'Online Learning',
        headline: 'STUDENT ELEARNING',
        category: 'Education Technology',
        badge: '04 / ELEARNING PLATFORM',
        code: 'CPL #028',
        desc: 'A web-based eLearning platform with course management, student progress tracking, and interactive lessons.',
        desc1: 'COURSE & CONTENT MANAGEMENT',
        desc2: 'STUDENT PROGRESS TRACKING',
        client: 'Cloud Production LTD Product',
        year: 'Production Verified',
        role: 'Full-Stack Web Development • Education Platform',
        metrics: 'Interactive Course Delivery',
        overview: 'A web-based eLearning platform for students, covering course management, student progress tracking, and interactive lessons from one dashboard.',
        deliverables: ['Course Management Dashboard', 'Student Progress Tracking', 'Interactive Lesson Delivery', 'Enrollment & Access Control'],
        accentColor: '#2563EB',
        accentDark: '#1D4ED8',
        imgUrl: 'assets/images/portfolio-live/online-learning-platform.png'
      },
      {
        title: 'Health Tracker App',
        headline: 'WELLNESS MOBILE',
        category: 'Healthcare Mobile',
        badge: '05 / HEALTH TRACKING APP',
        code: 'CPL #029',
        desc: 'A personal health tracking app for monitoring vitals, appointments, and wellness goals on the go.',
        desc1: 'VITALS & APPOINTMENT TRACKING',
        desc2: 'PERSONAL WELLNESS GOALS',
        client: 'Cloud Production LTD Product',
        year: 'Production Verified',
        role: 'Cross-Platform Mobile Development',
        metrics: 'On-the-Go Health Monitoring',
        overview: 'A personal health management mobile app that lets users monitor vitals, track appointments, and stay on top of wellness goals from their phone.',
        deliverables: ['Vitals Monitoring Dashboard', 'Appointment Scheduling', 'Wellness Goal Tracking', 'Reminders & Notifications'],
        accentColor: '#E11D48',
        accentDark: '#BE123C',
        imgUrl: 'assets/images/portfolio-live/health-management.svg'
      },
      {
        title: 'Ecommerce Storefront',
        headline: 'CUSTOM STOREFRONT',
        category: 'E-Commerce Platform',
        badge: '06 / ONLINE STOREFRONT',
        code: 'CPL #030',
        desc: 'A custom online storefront with product catalogs, secure checkout, and order management built for growth.',
        desc1: 'PRODUCT CATALOG & CHECKOUT',
        desc2: 'ORDER MANAGEMENT BUILT FOR GROWTH',
        client: 'Cloud Production LTD Product',
        year: 'Production Verified',
        role: 'Full-Stack Web Development • E-Commerce',
        metrics: 'Secure Checkout & Order Management',
        overview: 'A custom e-commerce site built with product catalogs, secure checkout, and order management designed to scale as the storefront grows.',
        deliverables: ['Product Catalog & Search', 'Secure Checkout Flow', 'Order Management Dashboard', 'Inventory & Pricing Controls'],
        accentColor: '#D97706',
        accentDark: '#B45309',
        imgUrl: 'assets/images/portfolio-live/ecommerce-site.png'
      },
      {
        title: 'Colle Pochi',
        headline: 'CLIENT OPERATIONS',
        category: 'Custom Web Application',
        badge: '07 / CLIENT WEB APP',
        code: 'CPL #031',
        desc: 'A custom web application built for Colle Pochi to streamline day-to-day operations and client interactions.',
        desc1: 'STREAMLINED DAILY OPERATIONS',
        desc2: 'CLIENT INTERACTION MANAGEMENT',
        client: 'Colle Pochi',
        year: 'Production Verified',
        role: 'Full-Stack Web Development • Custom Business App',
        metrics: 'Streamlined Operations Workflow',
        overview: 'A custom web application built for Colle Pochi to streamline day-to-day operations and client interactions in one connected system.',
        deliverables: ['Operations Dashboard', 'Client Interaction Management', 'Custom Workflow Tools', 'Role-Based Access'],
        accentColor: '#0D9488',
        accentDark: '#0F766E',
        imgUrl: 'assets/images/portfolio-live/colle-pochi.png'
      },
      {
        title: 'WordPress eLearning',
        headline: 'ELEARNING THEME',
        category: 'WordPress eLearning',
        badge: '08 / WORDPRESS THEME',
        code: 'CPL #032',
        desc: 'A WordPress eLearning theme built for course listings, student enrollment, and content delivery.',
        desc1: 'COURSE LISTINGS & ENROLLMENT',
        desc2: 'FLEXIBLE CONTENT DELIVERY',
        client: 'Cloud Production LTD Product',
        year: 'Production Verified',
        role: 'WordPress Theme Development • Education',
        metrics: 'Course Listing & Enrollment Ready',
        overview: 'An education-focused WordPress theme built for eLearning websites, covering course listings, student enrollment, and content delivery out of the box.',
        deliverables: ['Course Listing Templates', 'Student Enrollment Flow', 'Content Delivery Layout', 'WordPress Customizer Options'],
        accentColor: '#4F46E5',
        accentDark: '#4338CA',
        imgUrl: 'assets/images/portfolio-live/elearning-website.png'
      }
    ];

    window.openCardInspect = function(idx) {
      const p = dribbleProjectsData[idx];
      if (!p) return;

      const countEl = document.getElementById('inspect-counter');
      const codeEl = document.getElementById('inspect-code');
      const catEl = document.getElementById('inspect-category');
      const titleEl = document.getElementById('inspect-title');
      const headEl = document.getElementById('inspect-headline');
      const descEl = document.getElementById('inspect-desc');
      const overEl = document.getElementById('inspect-overview');
      const roleEl = document.getElementById('inspect-role');
      const clientEl = document.getElementById('inspect-client');
      const metricsEl = document.getElementById('inspect-metrics');
      const yearEl = document.getElementById('inspect-year');
      const imageEl = document.getElementById('inspect-image');

      if (countEl) countEl.textContent = `CASE STUDY 0${idx + 1} / 0${dribbleProjectsData.length}`;
      if (codeEl) codeEl.textContent = p.code;
      if (catEl) catEl.textContent = p.category;
      if (titleEl) titleEl.textContent = p.title.toUpperCase();
      if (headEl) headEl.textContent = p.headline;
      if (descEl) descEl.textContent = p.desc;
      if (overEl) overEl.textContent = p.overview || p.desc;
      if (roleEl) roleEl.textContent = p.role || 'Production Architecture';
      if (clientEl) clientEl.textContent = p.client || 'Cloud Production Lab';
      if (metricsEl) metricsEl.textContent = p.metrics || 'Production Verified';
      if (yearEl) yearEl.textContent = p.year || 'Production Verified';
      if (imageEl) {
        imageEl.src = p.imgUrl || 'assets/images/fallback-ai-rag.svg';
        imageEl.alt = p.title || 'Case study visual';
      }

      const overlay = document.getElementById('dribbble-inspect-overlay');
      const panel = document.getElementById('dribbble-inspect-content');
      if (overlay && panel) {
        overlay.style.pointerEvents = 'auto';
        overlay.style.opacity = '1';
        panel.style.pointerEvents = 'auto';
        panel.style.transform = 'translateX(0)';
        panel.style.opacity = '1';
      }
    };

    window.closeCardInspect = function() {
      const overlay = document.getElementById('dribbble-inspect-overlay');
      const panel = document.getElementById('dribbble-inspect-content');
      if (overlay && panel) {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        panel.style.pointerEvents = 'none';
        panel.style.transform = 'translateX(50px)';
        panel.style.opacity = '0';
      }
    };

    // Insights & Articles reader modal (same left-image/right-content drawer as the case-study inspector)
    const cpArticles = [
      {
        category: 'Gen AI & LLM',
        img: 'assets/images/article-rag-llm.svg',
        title: 'Building Context-Aware Enterprise RAG Systems with LLMs and Vector Databases',
        date: 'October 2026',
        readTime: '5 min read',
        body: [
          'Enterprise teams keep running into the same wall with off-the-shelf chatbots: the model answers confidently even when it has no idea what it\'s talking about. Retrieval-Augmented Generation fixes this by grounding every response in your own documents instead of the model\'s memory alone.',
          'Our stack combines LangChain for orchestration, Pinecone for hybrid vector search, and Claude or OpenAI for generation — with a strict guardrail layer that refuses to answer when retrieval confidence is low. The result is a Q&A system that cites its sources and knows when to say "I don\'t know."',
          'For clients handling internal policy documents, compliance manuals, or large product catalogs, this means faster, more trustworthy answers without the hallucination risk that comes with a plain LLM wrapper.'
        ]
      },
      {
        category: 'Offshore Engineering',
        img: 'assets/images/team-collaboration-alt.jpg',
        title: 'Bridging Dhaka to Tokyo: The Blueprint for High-Velocity Offshore Collaboration',
        date: 'October 2026',
        readTime: '6 min read',
        body: [
          'Offshore partnerships fail for predictable reasons: timezone drag, lost context between handoffs, and communication that only happens in status meetings. Our Dhaka-Tokyo model is built specifically to remove those failure points.',
          'Every engagement runs on overlapping working hours, daily async standups in both languages, and a shared source of truth for specs so nothing gets lost in translation — literally. Japanese-language support sits inside the delivery team, not bolted on as a separate liaison layer.',
          'The payoff shows up in the numbers: zero-defect delivery rates and sprint cycles that keep pace with in-house teams, even across a 3-hour time difference.'
        ]
      },
      {
        category: 'Cloud & Mobile',
        img: 'assets/images/portfolio-cloud-architecture.jpg',
        title: 'Architecting Scalable Microservices with Flutter, Next.js, and Cloud-Native Backends',
        date: 'September 2026',
        readTime: '4 min read',
        body: [
          'High-concurrency products break for one of two reasons: the frontend can\'t keep up with real-time state, or the backend buckles the moment traffic spikes. We design around both from day one.',
          'On the client side, Flutter and Next.js share a single design-token system so web and mobile stay visually and behaviorally consistent without duplicating UI logic. On the backend, event-driven microservices behind a message queue absorb traffic bursts instead of forwarding them straight to the database.',
          'The architecture has held sub-50ms transaction latency in production for mission-critical retail and fintech workloads, even during peak-hour load.'
        ]
      }
    ];

    window.openArticleModal = function(idx) {
      const a = cpArticles[idx];
      if (!a) return;

      const counterEl = document.getElementById('article-counter');
      const readtimeEl = document.getElementById('article-readtime');
      const imageEl = document.getElementById('article-image');
      const categoryEl = document.getElementById('article-category');
      const titleEl = document.getElementById('article-title');
      const dateEl = document.getElementById('article-date');
      const bodyEl = document.getElementById('article-body');

      if (counterEl) counterEl.textContent = `ARTICLE 0${idx + 1} / 0${cpArticles.length}`;
      if (readtimeEl) readtimeEl.textContent = a.readTime;
      if (imageEl) { imageEl.src = a.img; imageEl.alt = a.title; }
      if (categoryEl) categoryEl.textContent = a.category;
      if (titleEl) titleEl.textContent = a.title;
      if (dateEl) dateEl.textContent = a.date;
      if (bodyEl) bodyEl.innerHTML = a.body.map(p => `<p>${p}</p>`).join('');

      const overlay = document.getElementById('article-modal-overlay');
      const panel = document.getElementById('article-modal-content');
      if (overlay && panel) {
        overlay.style.pointerEvents = 'auto';
        overlay.style.opacity = '1';
        panel.style.pointerEvents = 'auto';
        panel.style.transform = 'translateX(0)';
        panel.style.opacity = '1';
      }
    };

    window.closeArticleModal = function() {
      const overlay = document.getElementById('article-modal-overlay');
      const panel = document.getElementById('article-modal-content');
      if (overlay && panel) {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        panel.style.pointerEvents = 'none';
        panel.style.transform = 'translateX(50px)';
        panel.style.opacity = '0';
      }
    };

    function createEditorialCardTexture(cfg, index, total) {
      const c = document.createElement('canvas');
      c.width = 800;
      c.height = 520;
      const ctx = c.getContext('2d');

      // Card Base
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 800, 520);

      // Left split for photography / visual art
      const splitW = 370;
      const grad = ctx.createLinearGradient(0, 0, splitW, 520);
      grad.addColorStop(0, cfg.accentColor);
      grad.addColorStop(1, cfg.accentDark);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, splitW, 520);

      // Decorative focal circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(splitW / 2, 260, 105, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();
      ctx.restore();

      // Project number & badge
      const numStr = `0${index + 1} / 0${total}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = 'bold 15px "Martian Mono", monospace';
      ctx.fillText(`${numStr} • ${cfg.badge.toUpperCase()}`, 28, 48);

      // Left Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 40px "Familjen Grotesk", sans-serif';
      const words = cfg.title.split(' ');
      let ty = 210;
      words.forEach(w => {
        ctx.fillText(w.toUpperCase(), 28, ty);
        ty += 44;
      });

      // Left Category
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.font = 'bold 14px "Martian Mono", monospace';
      ctx.fillText(cfg.category.toUpperCase(), 28, 385);

      // Right split: Swiss Editorial Content
      ctx.fillStyle = '#1A1A1A';
      ctx.font = 'bold 14px "Martian Mono", monospace';
      ctx.fillText('FEATURED EXPLORATION', splitW + 40, 50);

      ctx.fillStyle = '#666666';
      ctx.font = '13px "Martian Mono", monospace';
      ctx.fillText(cfg.code, splitW + 40, 82);

      ctx.fillStyle = '#111111';
      ctx.font = 'bold 46px "Familjen Grotesk", sans-serif';
      ctx.fillText(cfg.headline, splitW + 40, 165);

      // Technical crosshair
      ctx.strokeStyle = '#AAAAAA';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(splitW + 40, 210); ctx.lineTo(splitW + 75, 210);
      ctx.moveTo(splitW + 57, 193); ctx.lineTo(splitW + 57, 227);
      ctx.stroke();

      // Description lines
      ctx.fillStyle = '#444444';
      ctx.font = '15px "Martian Mono", monospace';
      ctx.fillText(cfg.desc1, splitW + 40, 268);
      ctx.fillText(cfg.desc2, splitW + 40, 296);

      // Concept summary
      ctx.fillStyle = '#777777';
      ctx.font = '13px "Martian Mono", monospace';
      ctx.fillText(cfg.desc.slice(0, 42), splitW + 40, 360);
      if (cfg.desc.length > 42) {
        ctx.fillText(cfg.desc.slice(42, 85) + '...', splitW + 40, 382);
      }

      // Footer
      ctx.fillStyle = '#888888';
      ctx.font = '12px "Martian Mono", monospace';
      ctx.fillText('© CLOUD PRODUCTION LAB', splitW + 40, 435);

      ctx.fillStyle = '#111111';
      ctx.font = 'bold 16px "Martian Mono", monospace';
      ctx.fillText('✦ VIEW ON DRIBBBLE ↗', splitW + 40, 478);

      // High-Gloss Clearcoat Specular Sheen (Collector's Acetate Finish)
      const glossGrad = ctx.createLinearGradient(0, 0, 800, 520);
      glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
      glossGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.12)');
      glossGrad.addColorStop(0.48, 'rgba(255, 255, 255, 0.0)');
      glossGrad.addColorStop(0.72, 'rgba(255, 255, 255, 0.07)');
      glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0.22)');
      ctx.fillStyle = glossGrad;
      ctx.fillRect(0, 0, 800, 520);

      // Top Specular Highlight Edge
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(2, 2); ctx.lineTo(798, 2);
      ctx.stroke();

      // Left Specular Highlight Edge
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.60)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(2, 2); ctx.lineTo(2, 518);
      ctx.stroke();

      // Outer Card Hairline
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, 800, 520);

      const texture = new THREE.CanvasTexture(c);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      if (cfg.imgUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, 0, 0, splitW, 520);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
          ctx.fillRect(0, 0, splitW, 520);
          
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 15px "Martian Mono", monospace';
          ctx.fillText(`${numStr} • ${cfg.badge.toUpperCase()}`, 28, 48);
          
          ctx.font = 'bold 40px "Familjen Grotesk", sans-serif';
          let ty2 = 210;
          words.forEach(w => {
            ctx.fillText(w.toUpperCase(), 28, ty2);
            ty2 += 44;
          });
          
          ctx.font = 'bold 14px "Martian Mono", monospace';
          ctx.fillText(cfg.category.toUpperCase(), 28, 385);

          // Re-apply gloss sheen over loaded image
          const imgGloss = ctx.createLinearGradient(0, 0, splitW, 520);
          imgGloss.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
          imgGloss.addColorStop(0.35, 'rgba(255, 255, 255, 0.08)');
          imgGloss.addColorStop(0.60, 'rgba(255, 255, 255, 0.0)');
          imgGloss.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
          ctx.fillStyle = imgGloss;
          ctx.fillRect(0, 0, splitW, 520);

          // Top highlight
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.80)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(2, 2); ctx.lineTo(splitW, 2);
          ctx.stroke();

          texture.needsUpdate = true;
        };
        img.src = cfg.imgUrl;
      }

      return texture;
    }

        let isDribbbleInitialized = false;

    function initDribbble3D() {
      if (isDribbbleInitialized) return;
      const canvas = document.getElementById('dribbble-canvas');
      const section = document.getElementById('dribbble-section');
      if (!canvas || !section) return;
      if (typeof THREE === 'undefined' || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

      isDribbbleInitialized = true;
      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.id === "dribbble-pin") st.kill();
      });

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, 11.5);

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Commanding Ultra-Large 3D Cards: 3.50 x 2.28 (55% larger area than original)
      const cardGeo = new THREE.PlaneGeometry(3.50, 2.28);
      const cardMeshes = [];

      dribbleProjectsData.forEach((data, index) => {
        const texture = createEditorialCardTexture(data, index, dribbleProjectsData.length);
        const mat = new THREE.MeshBasicMaterial({ 
          map: texture, 
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.0
        });
        const mesh = new THREE.Mesh(cardGeo, mat);
        mesh.visible = false;
        scene.add(mesh);

        cardMeshes.push({ 
          mesh, 
          data,
          index,
          row: Math.floor(index / 4), // Row 0 or Row 1
          slot: index % 4,            // Slot 0 (Left Out), 1 (Right Out), 2 (Left In), 3 (Right In)
          state: {
            x: 0,
            y: -4.0,
            z: -0.8,
            rotX: 0.12,
            rotY: 0,
            rotZ: 0,
            scale: 0.88,
            opacity: 0.0
          }
        });
      });
      window.cardMeshes = cardMeshes;
      window.dribbbleScene = scene;
      window.dribbbleCamera = camera;

      let mouseX = 0, mouseY = 0;
      let isInspecting = false;
      let inspectedIndex = -1;
      let hoveredIndex = -1;

      window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      });

      // Raycaster for Hover & Click Detection
      const raycaster = new THREE.Raycaster();
      const mouseVec = new THREE.Vector2();

      function getIntersectedCardIndex(e) {
        const rect = canvas.getBoundingClientRect();
        mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseVec, camera);
        const activeCardObjects = cardMeshes
          .filter(c => c.mesh.visible && c.state.opacity > 0.3)
          .map(c => c.mesh);
        const intersects = raycaster.intersectObjects(activeCardObjects);
        if (intersects.length > 0) {
          const hitMesh = intersects[0].object;
          return cardMeshes.findIndex(c => c.mesh === hitMesh);
        }
        return -1;
      }

      // Hover feedback
      canvas.addEventListener('mousemove', (e) => {
        if (isInspecting) {
          hoveredIndex = -1;
          return;
        }
        const hitIdx = getIntersectedCardIndex(e);
        hoveredIndex = hitIdx;
        canvas.style.cursor = (hitIdx !== -1) ? 'pointer' : 'default';
        if (hitIdx !== -1) {
          updateQuickPillState(hitIdx);
        }
      });

      canvas.addEventListener('mouseleave', () => {
        hoveredIndex = -1;
      });

      // Quick switcher pills & inspection trigger
      window.selectDribbbleCard = function(idx) {
        if (idx >= 0 && idx < dribbleProjectsData.length) {
          if (cardMeshes[idx]) {
            cardMeshes[idx].state.opacity = 1.0;
            cardMeshes[idx].state.scale = 1.0;
            cardMeshes[idx].mesh.visible = true;
          }
          openCardInspection(idx);
        }
      };

      function updateQuickPillState(idx) {
        document.querySelectorAll('.dribbble-pill').forEach((btn, i) => {
          if (i === idx) {
            btn.className = 'dribbble-pill w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono text-[10px] sm:text-xs font-bold bg-[#111113] text-white shadow-xs cursor-pointer transition-all';
          } else {
            btn.className = 'dribbble-pill w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono text-[10px] sm:text-xs font-bold text-[#111113] hover:bg-[#111113] hover:text-white transition-all cursor-pointer';
          }
        });
      }

      function updatePillsByProgress(progress) {
        if (progress < 0.12) {
          updateQuickPillState(-1);
        } else if (progress < 0.18) {
          updateQuickPillState(0);
        } else if (progress < 0.24) {
          updateQuickPillState(1);
        } else if (progress < 0.30) {
          updateQuickPillState(2);
        } else if (progress < 0.54) {
          updateQuickPillState(3);
        } else if (progress < 0.63) {
          updateQuickPillState(4);
        } else if (progress < 0.69) {
          updateQuickPillState(5);
        } else if (progress < 0.75) {
          updateQuickPillState(6);
        } else if (progress <= 0.91) {
          updateQuickPillState(7);
        } else {
          updateQuickPillState(-1);
        }
      }

      function populateInspectData(idx) {
        const p = dribbleProjectsData[idx];
        if (!p) return;

        const countEl = document.getElementById('inspect-counter');
        const codeEl = document.getElementById('inspect-code');
        const catEl = document.getElementById('inspect-category');
        const titleEl = document.getElementById('inspect-title');
        const headEl = document.getElementById('inspect-headline');
        const descEl = document.getElementById('inspect-desc');
        const overEl = document.getElementById('inspect-overview');
        const roleEl = document.getElementById('inspect-role');
        const clientEl = document.getElementById('inspect-client');
        const metricsEl = document.getElementById('inspect-metrics');
        const yearEl = document.getElementById('inspect-year');
        const linkEl = document.getElementById('inspect-link');

        if (countEl) countEl.textContent = `PROJECT 0${idx + 1} / 0${dribbleProjectsData.length}`;
        if (codeEl) codeEl.textContent = p.code;
        if (catEl) catEl.textContent = p.category;
        if (titleEl) titleEl.textContent = p.title.toUpperCase();
        if (headEl) headEl.textContent = p.headline;
        if (descEl) descEl.textContent = p.desc;
        if (overEl) overEl.textContent = p.overview || p.desc;
        if (roleEl) roleEl.textContent = p.role || '3D WebGL • Digital Product';
        if (clientEl) clientEl.textContent = p.client || 'Cloud Production Lab';
        if (metricsEl) metricsEl.textContent = p.metrics || '60 FPS WebGL';
        if (yearEl) yearEl.textContent = p.year || '2026 Archive';
        if (linkEl) linkEl.href = 'https://dribbble.com';

        if (typeof lucide !== 'undefined') lucide.createIcons();
      }

      function openCardInspection(idx) {
        if (isInspecting) {
          if (inspectedIndex === idx) return;
          const prevItem = cardMeshes[inspectedIndex];
          if (prevItem) {
            gsap.to(prevItem.mesh.position, { x: prevItem.state.x, y: prevItem.state.y, z: prevItem.state.z, duration: 0.45 });
            gsap.to(prevItem.mesh.rotation, { x: prevItem.state.rotX, y: prevItem.state.rotY, z: prevItem.state.rotZ, duration: 0.45 });
            gsap.to(prevItem.mesh.scale, { x: prevItem.state.scale, y: prevItem.state.scale, z: 1, duration: 0.45 });
            gsap.to(prevItem.mesh.material, { opacity: 0.0, duration: 0.3, onComplete: () => { prevItem.mesh.visible = false; } });
          }
          inspectedIndex = idx;
          populateInspectData(idx);
          const targetItem = cardMeshes[idx];
          targetItem.mesh.visible = true;
          gsap.to(targetItem.mesh.material, { opacity: 1.0, duration: 0.3 });
          gsap.to(targetItem.mesh.position, { x: -2.25, y: 0.0, z: 3.3, duration: 0.6, ease: 'power3.out' });
          gsap.to(targetItem.mesh.rotation, { x: 0, y: 0, z: 0, duration: 0.6, ease: 'power3.out' });
          gsap.to(targetItem.mesh.scale, { x: 1.08, y: 1.08, z: 1, duration: 0.6, ease: 'power3.out' });
          updateQuickPillState(idx);
          return;
        }
        isInspecting = true;
        inspectedIndex = idx;
        updateQuickPillState(idx);

        populateInspectData(idx);

        // 1. Activate Ambient Bokeh Studio Blur Backdrop (Blurs all background elements)
        const blurEl = document.getElementById('dribbble-inspection-blur');
        if (blurEl) {
          blurEl.style.opacity = '1';
          blurEl.style.pointerEvents = 'auto';
        }

        // 2. Hide all other 7 cards immediately so ONLY the inspected card remains
        cardMeshes.forEach((item, i) => {
          if (i !== idx) {
            item.mesh.visible = false;
            item.mesh.material.opacity = 0.0;
          }
        });

        // 3. Slide in the Luxury Glassmorphic Description Card from the right
        const overlay = document.getElementById('dribbble-inspect-overlay');
        const panel = document.getElementById('dribbble-inspect-content');

        if (overlay && panel) {
          overlay.style.pointerEvents = 'auto';
          gsap.to(overlay, { opacity: 1, duration: 0.45 });
          gsap.fromTo(panel, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: 'power3.out' });
        }

        const targetItem = cardMeshes[idx];
        const targetMesh = targetItem.mesh;
        targetMesh.visible = true;
        targetMesh.material.opacity = 1.0;
        gsap.killTweensOf(targetMesh.position);
        gsap.killTweensOf(targetMesh.rotation);
        gsap.killTweensOf(targetMesh.scale);

        // Fade bottom row UI completely
        gsap.to('#dribbble-bottom-row', { opacity: 0, duration: 0.45 });

        // Bring inspected card to sharp focus on left side
        gsap.to(targetMesh.position, {
          x: -2.25,
          y: 0.0,
          z: 3.3,
          duration: 0.8,
          ease: 'power3.out'
        });

        // Straighten rotation to 0 for pure reading clarity
        gsap.to(targetMesh.rotation, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.8,
          ease: 'power3.out'
        });

        gsap.to(targetMesh.scale, {
          x: 1.08,
          y: 1.08,
          z: 1,
          duration: 0.8,
          ease: 'power3.out'
        });

        // Dim background marquee words to soft blur bokeh
        gsap.to(['#dribbble-top-word', '#dribbble-bottom-word', '#dribbble-subtitle'], { opacity: 0.06, duration: 0.5 });
      }

      function closeCardInspection() {
        if (!isInspecting) return;
        updateQuickPillState(-1);

        // 1. Fade out the studio blur backdrop
        const blurEl = document.getElementById('dribbble-inspection-blur');
        if (blurEl) {
          blurEl.style.opacity = '0';
          blurEl.style.pointerEvents = 'none';
        }

        const overlay = document.getElementById('dribbble-inspect-overlay');
        const panel = document.getElementById('dribbble-inspect-content');

        if (overlay && panel) {
          overlay.style.pointerEvents = 'none';
          gsap.to(overlay, { opacity: 0, duration: 0.35 });
          gsap.to(panel, { x: 40, opacity: 0, duration: 0.35 });
        }

        // Restore background words and bottom row
        gsap.to(['#dribbble-top-word', '#dribbble-bottom-word'], { opacity: 1.0, duration: 0.5 });
        gsap.to('#dribbble-subtitle', { opacity: 1.0, duration: 0.5 });
        gsap.to('#dribbble-bottom-row', { opacity: 1.0, duration: 0.5 });

        // Animate inspected card back into its place in the row
        const idx = inspectedIndex;
        const targetItem = cardMeshes[idx];

        if (targetItem) {
          const spreadRatio = Math.min(1.0, window.innerWidth / 1520);
          const responsiveScale = Math.min(1.0, Math.max(0.72, window.innerWidth / 1440));

          gsap.to(targetItem.mesh.position, {
            x: targetItem.state.x * spreadRatio,
            y: targetItem.state.y,
            z: targetItem.state.z,
            duration: 0.7,
            ease: 'power3.out',
            onComplete: () => {
              isInspecting = false;
              inspectedIndex = -1;
            }
          });

          gsap.to(targetItem.mesh.rotation, {
            x: targetItem.state.rotX,
            y: targetItem.state.rotY,
            z: targetItem.state.rotZ,
            duration: 0.7,
            ease: 'power3.out'
          });

          gsap.to(targetItem.mesh.scale, {
            x: targetItem.state.scale * responsiveScale,
            y: targetItem.state.scale * responsiveScale,
            z: 1,
            duration: 0.7,
            ease: 'power3.out'
          });
        } else {
          isInspecting = false;
          inspectedIndex = -1;
        }

        // Smoothly fade in all other cards
        cardMeshes.forEach((item, i) => {
          if (i !== idx) {
            item.mesh.visible = (item.state.opacity > 0.01);
            gsap.fromTo(item.mesh.material, { opacity: 0 }, { opacity: item.state.opacity, duration: 0.5 });
          }
        });
      }

      // Handle card click on canvas
      canvas.addEventListener('click', (e) => {
        if (!isInspecting) {
          const hitIdx = getIntersectedCardIndex(e);
          if (hitIdx !== -1) {
            openCardInspection(hitIdx);
          }
        }
      });

      // Close button listener
      const closeBtn = document.getElementById('inspect-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          closeCardInspection();
        });
      }

      // Close on clicking backdrop outside description card
      const overlayEl = document.getElementById('dribbble-inspect-overlay');
      if (overlayEl) {
        overlayEl.addEventListener('click', (e) => {
          const panel = document.getElementById('dribbble-inspect-content');
          if (panel && !panel.contains(e.target)) {
            closeCardInspection();
          }
        });
      }

      // Keyboard Escape to close
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isInspecting) {
          closeCardInspection();
        }
      });

      // Automatically return card to row on scroll
      window.addEventListener('wheel', () => {
        if (isInspecting) closeCardInspection();
      }, { passive: true });

      window.addEventListener('touchmove', () => {
        if (isInspecting) closeCardInspection();
      }, { passive: true });

      function updateCards() {
        const spreadRatio = Math.min(1.0, window.innerWidth / 1520);
        const responsiveScale = Math.min(1.0, Math.max(0.72, window.innerWidth / 1440));

        if (isInspecting) {
          // Strictly ensure ONLY the inspected card is visible during inspection
          cardMeshes.forEach((item, i) => {
            if (i !== inspectedIndex) {
              item.mesh.visible = false;
              item.mesh.material.opacity = 0;
            }
          });
        } else {
          cardMeshes.forEach((item, i) => {
            const isHovered = (i === hoveredIndex && item.state.opacity > 0.4);
            const hoverZ = isHovered ? 0.65 : 0;
            const hoverScale = isHovered ? 1.05 : 1.0;

            item.mesh.position.set(
              item.state.x * spreadRatio,
              item.state.y,
              item.state.z + hoverZ
            );

            item.mesh.rotation.set(
              item.state.rotX * (isHovered ? 0.2 : 1.0),
              item.state.rotY * (isHovered ? 0.2 : 1.0),
              item.state.rotZ * (isHovered ? 0.2 : 1.0)
            );

            item.mesh.scale.set(
              item.state.scale * responsiveScale * hoverScale,
              item.state.scale * responsiveScale * hoverScale,
              1
            );

            item.mesh.visible = (item.state.opacity > 0.01);
            item.mesh.material.opacity = item.state.opacity;
          });
        }

        // Parallax camera (subtle when inspecting, responsive when browsing)
        const pFactor = isInspecting ? 0.08 : 0.35;
        camera.position.x += (mouseX * pFactor - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * (pFactor * 0.7) - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      }

      let isRunning = true;
      function animate() {
        if (!isRunning) return;
        requestAnimationFrame(animate);
        updateCards();
      }
      animate();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      const stripes = section.querySelectorAll('.dribble-stripe-item');
      const topWord = document.getElementById('dribbble-top-word');
      const bottomWord = document.getElementById('dribbble-bottom-word');
      const subtitle = document.getElementById('dribbble-subtitle');
      const bottomRow = document.getElementById('dribbble-bottom-row');

      // ScrollTrigger timeline: Ultra-smooth, comfortable 2-stage row alternating entrance
      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'dribbble-pin',
          trigger: section,
          start: 'top top',
          end: '+=850%',
          pin: true,
          anticipatePin: 1,
          scrub: 1.2,
          pinSpacing: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (isInspecting && Math.abs(self.getVelocity()) > 30) closeCardInspection();
            if (!isInspecting && hoveredIndex === -1) {
              updatePillsByProgress(self.progress);
            }
          }
        },
        defaults: { ease: 'none' }
      });

      // 1. Initial State Setup
      gsap.set(topWord, { x: -550, opacity: 0 });
      gsap.set(bottomWord, { x: 550, opacity: 0 });
      if (subtitle) gsap.set(subtitle, { opacity: 0, y: 20 });
      if (bottomRow) gsap.set(bottomRow, { opacity: 0, y: 15 });
      gsap.set(stripes, { scaleY: 0, transformOrigin: 'bottom center' });

      // 2. Phase 1: Entrance of 'Design in ... motion' typography (0.0 to 0.12)
      tl.fromTo(topWord, { x: -550, opacity: 0 }, { x: -50, opacity: 1, duration: 0.12, ease: 'sine.out' }, 0);
      tl.fromTo(bottomWord, { x: 550, opacity: 0 }, { x: 50, opacity: 1, duration: 0.12, ease: 'sine.out' }, 0);
      if (subtitle) {
        tl.fromTo(subtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.10, ease: 'sine.out' }, 0.02);
      }
      if (bottomRow) {
        tl.fromTo(bottomRow, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.10, ease: 'power2.out' }, 0.03);
      }

      // Continuous Typography Parallax Glide (0.12 to 0.90)
      tl.to(topWord, { x: 280, duration: 0.78, ease: 'none' }, 0.12);
      tl.to(bottomWord, { x: -280, duration: 0.78, ease: 'none' }, 0.12);

      // 3. Phase 2: Row 1 Entrance (Cards 0, 1, 2, 3) - Extra Large 3.50x2.28 cards
      // Card 0 -> Outer Left (-5.45)
      tl.fromTo(cardMeshes[0].state,
        { x: 0, y: -4.0, z: -0.8, rotX: 0.12, rotY: 0, rotZ: 0, scale: 0.88, opacity: 0 },
        { x: -5.45, y: 0.05, z: -0.10, rotX: 0.04, rotY: 0.06, rotZ: -0.015, scale: 1.0, opacity: 1, duration: 0.14, ease: 'sine.out' },
        0.12
      );

      // Card 1 -> Outer Right (+5.45)
      tl.fromTo(cardMeshes[1].state,
        { x: 0, y: -4.0, z: -0.8, rotX: 0.12, rotY: 0, rotZ: 0, scale: 0.88, opacity: 0 },
        { x: 5.45, y: 0.05, z: -0.10, rotX: 0.04, rotY: -0.06, rotZ: 0.015, scale: 1.0, opacity: 1, duration: 0.14, ease: 'sine.out' },
        0.17
      );

      // Card 2 -> Inner Left (-1.82)
      tl.fromTo(cardMeshes[2].state,
        { x: 0, y: -4.0, z: -0.8, rotX: 0.12, rotY: 0, rotZ: 0, scale: 0.88, opacity: 0 },
        { x: -1.82, y: 0.05, z: 0.20, rotX: 0.02, rotY: 0.02, rotZ: -0.008, scale: 1.0, opacity: 1, duration: 0.14, ease: 'sine.out' },
        0.22
      );

      // Card 3 -> Inner Right (+1.82)
      tl.fromTo(cardMeshes[3].state,
        { x: 0, y: -4.0, z: -0.8, rotX: 0.12, rotY: 0, rotZ: 0, scale: 0.88, opacity: 0 },
        { x: 1.82, y: 0.05, z: 0.20, rotX: 0.02, rotY: -0.02, rotZ: 0.008, scale: 1.0, opacity: 1, duration: 0.14, ease: 'sine.out' },
        0.27
      );

      // Row 1 interact & resting window: 0.41 to 0.52

      // 4. Phase 3: Row 1 Exits Upward (0.52 to 0.62)
      [0, 1, 2, 3].forEach((idx, i) => {
        tl.to(cardMeshes[idx].state, {
          y: 4.2,
          opacity: 0,
          scale: 0.92,
          duration: 0.10,
          ease: 'sine.inOut'
        }, 0.52 + i * 0.012);
      });

      // 5. Phase 3b: Row 2 Entrance (Cards 4, 5, 6, 7) - Extra Large 3.50x2.28 cards
      // Card 4 -> Outer Left (-5.45)
      tl.fromTo(cardMeshes[4].state,
        { x: 0, y: -4.0, z: -0.8, rotX: 0.12, rotY: 0, rotZ: 0, scale: 0.88, opacity: 0 },
        { x: -5.45, y: 0.05, z: -0.10, rotX: 0.04, rotY: 0.06, rotZ: -0.015, scale: 1.0, opacity: 1, duration: 0.14, ease: 'sine.out' },
        0.57
      );

      // Card 5 -> Outer Right (+5.45)
      tl.fromTo(cardMeshes[5].state,
        { x: 0, y: -4.0, z: -0.8, rotX: 0.12, rotY: 0, rotZ: 0, scale: 0.88, opacity: 0 },
        { x: 5.45, y: 0.05, z: -0.10, rotX: 0.04, rotY: -0.06, rotZ: 0.015, scale: 1.0, opacity: 1, duration: 0.14, ease: 'sine.out' },
        0.62
      );

      // Card 6 -> Inner Left (-1.82)
      tl.fromTo(cardMeshes[6].state,
        { x: 0, y: -4.0, z: -0.8, rotX: 0.12, rotY: 0, rotZ: 0, scale: 0.88, opacity: 0 },
        { x: -1.82, y: 0.05, z: 0.20, rotX: 0.02, rotY: 0.02, rotZ: -0.008, scale: 1.0, opacity: 1, duration: 0.14, ease: 'sine.out' },
        0.67
      );

      // Card 7 -> Inner Right (+1.82)
      tl.fromTo(cardMeshes[7].state,
        { x: 0, y: -4.0, z: -0.8, rotX: 0.12, rotY: 0, rotZ: 0, scale: 0.88, opacity: 0 },
        { x: 1.82, y: 0.05, z: 0.20, rotX: 0.02, rotY: -0.02, rotZ: 0.008, scale: 1.0, opacity: 1, duration: 0.14, ease: 'sine.out' },
        0.72
      );

      // Row 2 interact & resting window: 0.86 to 0.92

      // 6. Phase 4: Cascade 5 dark stripes from bottom (0.91 to 1.00)
      for (let i = 0; i < 5; i++) {
        const startTime = 0.91 + 0.06 * (4 - i) / 4;
        const endTime = startTime + 0.09;
        tl.to(stripes[i], {
          scaleY: 1,
          duration: endTime - startTime,
          ease: 'none'
        }, startTime);
      }

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }

    // Auto-invoke Dribbble 3D Initialization
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDribbble3D);
    } else {
      initDribbble3D();
    }
    window.addEventListener('load', initDribbble3D);


    // Toast Notification helper
    function showToast(msg) {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'px-4 py-3 rounded-xl bg-[#0C0C0C]/95 border border-cyan-400/30 text-white text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 transform transition-all duration-300 translate-y-4 opacity-0 pointer-events-auto';
      toast.innerHTML = `<span class="w-2 h-2 rounded-full bg-white animate-pulse"></span> <span>${msg}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
      }, 50);

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    // Custom Cursor — ring + dot (monochrome brand palette, skipped on touch devices)
    function initCustomCursor() {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

      const dot = document.createElement('div');
      dot.className = 'cp-cursor-dot';
      const ring = document.createElement('div');
      ring.className = 'cp-cursor-ring';
      document.body.append(dot, ring);

      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let ringX = mouseX;
      let ringY = mouseY;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
        dot.classList.add('is-visible');
        ring.classList.add('is-visible');
      });

      document.addEventListener('mouseleave', () => {
        dot.classList.remove('is-visible');
        ring.classList.remove('is-visible');
      });

      document.addEventListener('mousedown', () => ring.classList.add('is-active'));
      document.addEventListener('mouseup', () => ring.classList.remove('is-active'));

      (function tick() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(tick);
      })();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCustomCursor);
    } else {
      initCustomCursor();
    }

    function initStickyHeaderBg() {
      const header = document.getElementById('main-header-bg');
      if (!header) return;
      const applyState = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
      applyState();
      window.addEventListener('scroll', applyState, { passive: true });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initStickyHeaderBg);
    } else {
      initStickyHeaderBg();
    }
