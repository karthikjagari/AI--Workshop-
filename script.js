/**
 * NIAT Offline AI Workshop — Script
 * Features:
 * - Exit-Intent Telugu Popup ("Bro, neekosame! Sunday intlo em chesthav?...")
 * - Exact Image Canvas Pass Exporter with Custom Student Name & Unique ID
 * - Sticky Header Navigation & Smooth Scrolling
 * - Scroll Animations
 * - Single Unified Registration & Dynamic Pass Generation
 * - WhatsApp Community Join & Calendar Integrations
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileNavigation();
  initScrollAnimations();
  initFaqAccordion();
  initRegistrationModal();
  initExitIntentPopup();
  initPassCanvasExporter();
  initCalendarGenerator();
  initWhatsAppShare();
  initInteractiveHeroDemo();
  initHorizontalCurriculumSlider();
  initMobileAttentionMoments();
});

// 1. Sticky Header Scroll Indicator
function initNavbarScroll() {
  const header = document.querySelector('.sticky-header-group');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// 2. Mobile Navigation Toggle
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const navMenu = document.getElementById('header-nav-menu');
  const navLinks = document.querySelectorAll('.header-nav-menu a');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
      });
    });
  }
}

// 3. Scroll Intersection Observer Animations
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');
  if (!animatedElements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  } else {
    animatedElements.forEach(el => el.classList.add('is-visible'));
  }
}

// 4. FAQ Accordion
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    const panel = item.querySelector('.faq-answer-panel');
    
    if (!btn || !panel) return;

    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          const otherPanel = otherItem.querySelector('.faq-answer-panel');
          if (otherPanel) otherPanel.style.maxHeight = null;
        }
      });

      if (isActive) {
        item.classList.remove('active');
        panel.style.maxHeight = null;
      } else {
        item.classList.add('active');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
}

// Official Google Form Registration URL
const OFFICIAL_GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdCW5LqJ5uj2ncGyCQ9v-V45vjHXROGF5RAUO5l7odzAgYpdA/viewform';

// Global student registration state (populated strictly from verified registration response)
const registeredStudentState = {
  name: '',
  mobile: '',
  email: '',
  school: '',
  city: 'Hyderabad',
  passId: '',
  date: '30 August 2026',
  venue: 'Kapil Kavuri Hub (KKH), Nanakramguda, Financial District, Hyderabad'
};

// 5. Exit-Intent Telugu / English Popup Handler
function initExitIntentPopup() {
  const exitModal = document.getElementById('exit-popup-modal');
  const acceptBtn = document.getElementById('btn-exit-accept');
  const dismissBtn = document.getElementById('btn-exit-dismiss');
  let hasTriggered = false;

  if (!exitModal) return;

  const showExitPopup = () => {
    if (hasTriggered || sessionStorage.getItem('niat_exit_shown')) return;
    hasTriggered = true;
    sessionStorage.setItem('niat_exit_shown', 'true');
    exitModal.classList.add('open');
  };

  const closeExitPopup = () => {
    exitModal.classList.remove('open');
  };

  // Mouseleave on desktop (moving cursor towards tab bar / close button)
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 15) {
      showExitPopup();
    }
  });

  if (dismissBtn) {
    dismissBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeExitPopup();
    });
  }

  exitModal.addEventListener('click', (e) => {
    if (e.target === exitModal) {
      closeExitPopup();
    }
  });
}

// 6. Registration Flow & Verified Entry Pass Display
function initRegistrationModal() {
  const modal = document.getElementById('registration-modal');
  const closeButtons = document.querySelectorAll('.close-modal-btn');

  // ONLY check if student returned with verified registration query params (?registered=true&name=...)
  checkVerifiedRegistrationResponse();

  if (!modal) return;

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

// Stage 2: Read verified registration response parameters passed from Google Forms / Google Sheets / Apps Script
function checkVerifiedRegistrationResponse() {
  const urlParams = new URLSearchParams(window.location.search);
  const hasRegistered = urlParams.get('registered') || urlParams.get('status') === 'success';
  const studentName = urlParams.get('name') || urlParams.get('student_name');
  const passId = urlParams.get('pass_id') || urlParams.get('id');

  if (hasRegistered && studentName) {
    const verifiedName = decodeURIComponent(studentName).trim().toUpperCase();
    const verifiedPassId = passId ? decodeURIComponent(passId).trim().toUpperCase() : generateRandomPassId();

    registeredStudentState.name = verifiedName;
    registeredStudentState.passId = verifiedPassId;

    updatePassDisplay(verifiedName, verifiedPassId);

    const modal = document.getElementById('registration-modal');
    const stepForm = document.getElementById('modal-step-form');
    const stepSuccess = document.getElementById('modal-step-success');

    if (modal && stepSuccess) {
      if (stepForm) stepForm.style.display = 'none';
      stepSuccess.style.display = 'block';
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      triggerConfetti();
    }
  }
}

// Generate unique collision-safe Workshop-XXXX ID
function generateRandomPassId() {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return `Workshop-${code}`;
}

// Updates entry pass DOM and renders dynamic QR code
function updatePassDisplay(name, passId) {
  const cleanName = (name || 'CLASS 12 PARTICIPANT').trim().toUpperCase();
  const cleanId = (passId || 'Workshop-A7K9').trim().toUpperCase();

  const nameHolders = document.querySelectorAll('.dynamic-student-name');
  nameHolders.forEach(el => {
    el.textContent = cleanName;
  });

  const passIdHolders = document.querySelectorAll('.dynamic-pass-id');
  passIdHolders.forEach(el => {
    el.textContent = cleanId;
  });

  // Render Dynamic QR Code to canvas
  const qrCanvas = document.getElementById('pass-qr-canvas');
  if (qrCanvas && window.drawQRCodeToCanvas) {
    const verifyUrl = `${window.location.origin}/verify.html?id=${encodeURIComponent(cleanId)}&name=${encodeURIComponent(cleanName)}`;
    window.drawQRCodeToCanvas(qrCanvas, verifyUrl, {
      margin: 1,
      fgColor: '#0B1730',
      bgColor: '#FFFFFF'
    });
  }
}

// 7. Canvas High-Definition 1080 x 1350 Pass Exporter (4:5 Aspect Ratio)
function initPassCanvasExporter() {
  const downloadBtns = document.querySelectorAll('.btn-download-pass-png');

  downloadBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentName = registeredStudentState.name || 'CLASS 12 PARTICIPANT';
      const currentId = registeredStudentState.passId || generateRandomPassId();
      generateAndDownloadPassPNG(currentName, currentId);
    });
  });
}

function generateAndDownloadPassPNG(name, passId) {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#FAF8F5';
  ctx.fillRect(0, 0, width, height);

  // Subtle grid pattern
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.03)';
  ctx.lineWidth = 1;
  const gridSize = 36;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Outer Card Boundary
  const margin = 50;
  const cardW = width - margin * 2;
  const cardH = height - margin * 2;
  const cardR = 36;

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, margin, margin, cardW, cardH, cardR);
  ctx.stroke();

  // Top Header Row (Logo + Valid Badge)
  const headerY = margin + 55;

  // Header Title
  ctx.fillStyle = '#9F1239';
  ctx.font = '900 36px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('NIAT', margin + 45, headerY);

  ctx.fillStyle = '#475569';
  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('NxtWave Institute of Advanced Technologies', margin + 145, headerY - 5);

  // VALID ENTRY PASS Pill on Header Right
  const badgeW = 240;
  const badgeH = 46;
  const badgeX = width - margin - 45 - badgeW;
  const badgeY = headerY - 34;
  ctx.fillStyle = '#ECFDF5';
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 23);
  ctx.fill();
  ctx.strokeStyle = '#A7F3D0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#065F46';
  ctx.font = '800 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('✓ VALID ENTRY PASS', badgeX + badgeW / 2, badgeY + 29);

  // Dashed separator
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(margin + 45, headerY + 45);
  ctx.lineTo(width - margin - 45, headerY + 45);
  ctx.stroke();
  ctx.setLineDash([]); // Reset

  // Event Banner Box (Y: 200 - 390)
  const bannerY = headerY + 75;
  const bannerH = 190;
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, margin + 45, bannerY, cardW - 90, bannerH, 20);
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#D97706';
  ctx.font = '900 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('AI WORKSHOP', width / 2, bannerY + 45);

  ctx.fillStyle = '#475569';
  ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('FOR CLASS 12 STUDENTS', width / 2, bannerY + 85);

  ctx.fillStyle = '#0B1730';
  ctx.font = '900 52px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('ENTRY PASS', width / 2, bannerY + 155);

  // Dynamic Participant Box (Y: 425 - 635)
  const partY = bannerY + bannerH + 30;
  const partH = 185;
  ctx.fillStyle = '#FFF1F2';
  drawRoundedRect(ctx, margin + 45, partY, cardW - 90, partH, 22);
  ctx.fill();
  ctx.strokeStyle = '#FECDD3';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#881337';
  ctx.font = '850 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PARTICIPANT', width / 2, partY + 45);

  ctx.fillStyle = '#9F1239';
  ctx.font = '900 44px "Space Grotesk", sans-serif';
  ctx.fillText(name.toUpperCase(), width / 2, partY + 115);

  // Pass ID & Date 2-Column Grid (Y: 675 - 845)
  const gridY = partY + partH + 25;
  const colW = (cardW - 90 - 25) / 2;
  const colH = 160;

  // Left Col: PASS ID
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, margin + 45, gridY, colW, colH, 18);
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#64748B';
  ctx.font = '850 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PASS ID', margin + 45 + colW / 2, gridY + 42);

  ctx.fillStyle = '#2563EB';
  ctx.font = '900 36px "JetBrains Mono", monospace';
  ctx.fillText(passId, margin + 45 + colW / 2, gridY + 105);

  // Right Col: DATE & MODE
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, margin + 45 + colW + 25, gridY, colW, colH, 18);
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#64748B';
  ctx.font = '850 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DATE & MODE', margin + 45 + colW + 25 + colW / 2, gridY + 42);

  ctx.fillStyle = '#0B1730';
  ctx.font = '800 24px "Space Grotesk", sans-serif';
  ctx.fillText('30 AUGUST 2026', margin + 45 + colW + 25 + colW / 2, gridY + 95);

  ctx.fillStyle = '#059669';
  ctx.font = '750 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('OFFLINE (10 AM – 4 PM)', margin + 45 + colW + 25 + colW / 2, gridY + 128);

  // Specs Strip (Y: 865 - 935)
  const stripY = gridY + colH + 20;
  const stripH = 65;
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, margin + 45, stripY, cardW - 90, stripH, 14);
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#334155';
  ctx.font = '750 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('🏛️ KAPIL KAVURI HUB (KKH)   •   HYDERABAD   •   OFFLINE   •   VALID ENTRY PASS', width / 2, stripY + 40);

  // Bottom QR Verification Zone (Y: 960 - 1240)
  const qrZoneY = stripY + stripH + 25;
  const qrZoneH = 225;
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, margin + 45, qrZoneY, cardW - 90, qrZoneH, 20);
  ctx.fill();
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Generate QR Code on temp canvas and draw onto high-res export
  const tempQr = document.createElement('canvas');
  tempQr.width = 175;
  tempQr.height = 175;
  const verifyUrl = `${window.location.origin}/verify.html?id=${encodeURIComponent(passId)}&name=${encodeURIComponent(name)}`;
  if (window.drawQRCodeToCanvas) {
    window.drawQRCodeToCanvas(tempQr, verifyUrl, { margin: 1 });
    ctx.drawImage(tempQr, margin + 75, qrZoneY + 25, 175, 175);
  }

  // Verification Instructions next to QR
  const textX = margin + 285;
  ctx.fillStyle = '#0B1730';
  ctx.font = '900 28px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SCAN TO VERIFY', textX, qrZoneY + 75);

  ctx.fillStyle = '#64748B';
  ctx.font = '700 19px "JetBrains Mono", monospace';
  ctx.fillText('PRESENT THIS PASS AT THE VENUE ENTRY', textX, qrZoneY + 120);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Kapil Kavuri Hub, Nanakramguda, Financial District, Hyderabad', textX, qrZoneY + 155);

  // Trigger Download
  const safeFileName = name.replace(/[^a-zA-Z0-9]/g, '_');
  const link = document.createElement('a');
  link.download = `NIAT_AI_Workshop_Pass_${passId}_${safeFileName}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// 8. Google Calendar Template
function initCalendarGenerator() {
  const calBtns = document.querySelectorAll('.btn-add-calendar');

  calBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = encodeURIComponent('NIAT Free Offline AI Workshop (Class 12)');
      const details = encodeURIComponent('Free Offline AI Workshop for Class 12 students. Learn practical AI for board exams, revision, NotebookLM, prompting, and build a hands-on project. Entry Pass ID: ' + registeredStudentState.passId);
      const location = encodeURIComponent('Kapil Kavuri Hub (KKH), Nanakramguda, Financial District, Hyderabad');
      
      const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20260830T043000Z/20260830T103000Z&details=${details}&location=${location}`;
      window.open(gCalUrl, '_blank');
    });
  });
}

// 9. WhatsApp Share
function initWhatsAppShare() {
  const shareBtns = document.querySelectorAll('.btn-share-whatsapp');

  shareBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const message = `Hey! I just registered for the free *NIAT Offline AI Workshop* for Class 12 students in Hyderabad (30 Aug 2026 at KKH Campus)! 🚀\n\nThey're teaching AI for board exams, revision, NotebookLM, and live project building. Register your free seat too: https://whatsapp.com/channel/0029VbBl4Yx8V0tfmX9Dhr38`;
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    });
  });
}

// 10. Interactive Multi-Mode Hero & Live Pass Personalizer
function initInteractiveHeroDemo() {
  // A. Real-time Name Input Personalizer
  const nameInput = document.getElementById('hero-quick-name-input');
  const passDisplayName = document.getElementById('hero-pass-display-name');
  const regNameInput = document.getElementById('student-name');
  const nameChips = document.querySelectorAll('.hero-name-chip-btn');

  function updateHeroPassName(name) {
    const formatted = (name || 'AARAV SHARMA').trim().toUpperCase();
    if (passDisplayName) {
      passDisplayName.textContent = `[ ${formatted} ]`;
      passDisplayName.style.transform = 'scale(1.05)';
      setTimeout(() => {
        passDisplayName.style.transform = 'scale(1)';
      }, 150);
    }
    if (regNameInput && name) {
      regNameInput.value = name;
    }
  }

  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      updateHeroPassName(e.target.value);
    });
  }

  nameChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const selectedName = chip.getAttribute('data-name');
      if (selectedName) {
        if (nameInput) nameInput.value = selectedName;
        updateHeroPassName(selectedName);
      }
    });
  });

  // B. Hero Mode Tabs Switcher
  const modeTabs = document.querySelectorAll('.hero-mode-tab');
  const modePanels = {
    pass: document.getElementById('hero-panel-pass'),
    'ai-sim': document.getElementById('hero-panel-ai-sim'),
    contrast: document.getElementById('hero-panel-contrast')
  };

  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetMode = tab.getAttribute('data-mode');
      modeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      Object.keys(modePanels).forEach(key => {
        if (modePanels[key]) {
          modePanels[key].classList.toggle('active', key === targetMode);
        }
      });
    });
  });

  // C. Interactive AI Study Simulator Topics
  const topicPills = document.querySelectorAll('.ai-sim-pill-btn');
  const simPromptText = document.getElementById('ai-sim-prompt-text');
  const simResponseList = document.getElementById('ai-sim-response-list');

  const topicData = {
    physics: {
      prompt: "Extract all key formulas & mental models for Electromagnetic Waves in 4 bullets",
      bullets: [
        "Speed of light: c = 1 / √(μ₀ε₀) = 3 × 10⁸ m/s",
        "E & B fields are in-phase & mutually perpendicular to wave propagation",
        "Energy density equality: u_E = u_B = ½ ε₀E² = B²/(2μ₀)",
        "Poynting Vector: S = (1/μ₀)(E × B) represents energy flux"
      ]
    },
    chemistry: {
      prompt: "Create a 3-step active recall cheat sheet for Organic Chemistry Named Reactions",
      bullets: [
        "Aldol Condensation: Reagent condition (dilute NaOH) + α-hydrogen check",
        "Cannizzaro Reaction: Non-enolizable aldehydes + conc. KOH",
        "Gabriel Phthalimide Synthesis: Prep of pure 1° aliphatic amines only"
      ]
    },
    coding: {
      prompt: "Generate working Python/JS code for an AI Study Flashcard web app in 1 minute",
      bullets: [
        "HTML/CSS responsive study card interface with smooth 3D flip animation",
        "State management for flashcard decks and spaced-repetition accuracy scores",
        "Perplexity & NotebookLM prompt pipeline for auto-generating NCERT mock questions"
      ]
    }
  };

  topicPills.forEach(pill => {
    pill.addEventListener('click', () => {
      topicPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const topic = pill.getAttribute('data-topic') || 'physics';
      const data = topicData[topic];

      if (data && simPromptText && simResponseList) {
        simPromptText.textContent = `"${data.prompt}"`;
        simResponseList.innerHTML = data.bullets
          .map(b => `<li><span class="bullet-icon">⚡</span> <span>${b}</span></li>`)
          .join('');
      }
    });
  });

  // D. 3D Card Parallax Mouse Movement
  const card3d = document.getElementById('hero-3d-pass-card');
  if (card3d) {
    const heroRightCol = document.querySelector('.hero-right-col');
    if (heroRightCol) {
      heroRightCol.addEventListener('mousemove', (e) => {
        const rect = card3d.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateX = (-y / 15).toFixed(2);
        const rotateY = (x / 15).toFixed(2);
        card3d.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      heroRightCol.addEventListener('mouseleave', () => {
        card3d.style.transform = 'perspective(1000px) rotateY(-4deg) rotateX(2deg)';
      });
    }
  }
}

// Confetti Effect
function triggerConfetti() {
  try {
    const count = 45;
    const colors = ['#7B1113', '#D4AF37', '#22C55E', '#FF5F56', '#9B1B26'];
    
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.zIndex = '99999';
      el.style.width = Math.random() * 8 + 6 + 'px';
      el.style.height = Math.random() * 8 + 6 + 'px';
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.top = '40%';
      el.style.left = '50%';
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      el.style.transform = 'translate(-50%, -50%)';
      el.style.pointerEvents = 'none';
      
      document.body.appendChild(el);
      
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 320 + 120;
      const x = Math.cos(angle) * velocity;
      const y = Math.sin(angle) * velocity - 120;
      
      el.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${Math.random() * 720}deg) scale(0)`, opacity: 0 }
      ], {
        duration: Math.random() * 1000 + 1000,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
      }).onfinish = () => el.remove();
    }
  } catch (e) {
    console.error('Confetti animation error', e);
  }
}

// 11. Horizontal Interactive Workshop Road Handler
function initHorizontalCurriculumSlider() {
  const track = document.getElementById('curriculum-track');
  const stations = document.querySelectorAll('.road-station-node');
  const prevBtn = document.getElementById('curr-btn-prev');
  const nextBtn = document.getElementById('curr-btn-next');
  const progressFill = document.getElementById('road-progress-fill');

  if (!track || !stations.length) return;

  let currentIndex = 0;

  function scrollToStation(index) {
    if (index < 0) index = 0;
    if (index >= stations.length) index = stations.length - 1;
    currentIndex = index;

    const targetNode = stations[index];
    if (targetNode) {
      const scrollOffset = targetNode.offsetLeft - track.offsetLeft - 30;
      track.scrollTo({
        left: scrollOffset,
        behavior: 'smooth'
      });
    }

    updateActiveState(index);
  }

  function updateActiveState(index) {
    stations.forEach((node, i) => {
      node.classList.toggle('active', i === index);
    });

    if (progressFill) {
      const percentage = Math.round(((index + 1) / stations.length) * 100);
      progressFill.style.width = percentage + '%';
    }
  }

  stations.forEach((node, i) => {
    node.addEventListener('click', () => {
      scrollToStation(i);
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      scrollToStation(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      scrollToStation(currentIndex + 1);
    });
  }

  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const trackLeft = track.scrollLeft;
      let closestIdx = 0;
      let minDiff = Infinity;

      stations.forEach((node, i) => {
        const diff = Math.abs(node.offsetLeft - track.offsetLeft - 30 - trackLeft);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      });

      currentIndex = closestIdx;
      updateActiveState(closestIdx);
    }, 60);
  });

  // Initialize progress
  updateActiveState(0);
}

// Mobile-Only Attention Moments (Ensures 100% immediate mobile visibility)
function initMobileAttentionMoments() {
  const attentionMoments = document.querySelectorAll('.mobile-attention-moment');
  if (!attentionMoments.length) return;
  attentionMoments.forEach(el => el.classList.add('in-view'));
}


