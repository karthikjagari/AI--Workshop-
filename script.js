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
  updateWebsiteBootcampDates();
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
  initMobileScrollPopups();
  initBackgroundSyncWorker();
  updateDynamicWhatsAppCommunityLink();
  initRealtimeCutoffChecker();
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

// Official Google Apps Script Web App Endpoint for Direct Sheet Submission
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbycADgXAKOh10sHsPWjWwZm0vLvT4RDImIJktx33k6M4o0dPzOlKNlgYNw9OzOjm54L/exec";

// Global student registration state (populated strictly from verified registration response)
const registeredStudentState = {
  name: '',
  mobile: '',
  email: '',
  school: '',
  slot: '',
  city: 'Hyderabad',
  passId: '',
  date: '',
  venue: 'Nanakramguda, Hyderabad'
};

// ============================================================================
// DYNAMIC UPCOMING SUNDAYS GENERATOR (Asia/Kolkata timezone)
// ============================================================================
const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getOrdinalSuffix(day) {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1:  return 'st';
    case 2:  return 'nd';
    case 3:  return 'rd';
    default: return 'th';
  }
}

function formatSlotDate(dateObj) {
  const day = dateObj.getDate();
  const suffix = getOrdinalSuffix(day);
  const monthName = MONTH_NAMES_FULL[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `Sunday, ${day}${suffix} ${monthName}, ${year}`;
}

function formatPassDateFromSlot(slotString) {
  if (!slotString) return 'OFFLINE BOOTCAMP';
  const cleaned = slotString.replace(/^Sunday,\s*/i, '').replace(/(\d+)(st|nd|rd|th)/gi, '$1');
  const parts = cleaned.trim().split(/[\s,]+/);
  if (parts.length >= 3) {
    const day = parts[0];
    const month = parts[1].toUpperCase();
    const year = parts[2];
    return `${day} ${month} ${year} · OFFLINE`;
  }
  return `${slotString.toUpperCase()} · OFFLINE`;
}

// Extracts exact year, month, day, hour (0-23), minute, second in Asia/Kolkata (IST)
function getISTDateComponents(baseDate) {
  let dateToUse = baseDate;
  const isDate = dateToUse && (dateToUse instanceof Date || Object.prototype.toString.call(dateToUse) === '[object Date]');
  if (!isDate || isNaN(dateToUse.getTime())) {
    dateToUse = new Date();
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hourCycle: 'h23'
    });

    const parts = formatter.formatToParts(dateToUse);
    const partMap = {};
    for (const p of parts) {
      if (p.type !== 'literal') {
        partMap[p.type] = parseInt(p.value, 10);
      }
    }

    const year = partMap.year;
    const month = partMap.month - 1; // 0-indexed
    const day = partMap.day;
    const hour = partMap.hour % 24;
    const minute = partMap.minute;
    const second = partMap.second;
    const dayOfWeek = new Date(year, month, day).getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    return {
      year,
      month,
      day,
      hour,
      minute,
      second,
      dayOfWeek,
      calendarDate: new Date(year, month, day)
    };
  } catch (e) {
    const now = dateToUse;
    const dayOfWeek = now.getDay();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
      dayOfWeek,
      calendarDate: new Date(now.getFullYear(), now.getMonth(), now.getDate())
    };
  }
}

// ============================================================================
// DYNAMIC REGISTRATION AVAILABLE SLOTS LOGIC (Asia/Kolkata timezone)
// Manager feedback: No bootcamp on 27th September, 2026.
// For this week, 27th September is removed and only 4th October slot is available.
// ============================================================================
function getUpcomingSundays(baseDate) {
  const ist = getISTDateComponents(baseDate);

  // For this week leading up to or on Sep 27, 2026:
  // 27th September is removed, keeping only 1 slot: Sunday, 4th October, 2026
  const isSep27Week = (ist.year === 2026 && ist.month === 8) ||
                      (ist.year === 2026 && ist.month === 9 && ist.day <= 3 && (ist.day < 3 || ist.hour < 13));

  if (isSep27Week) {
    const oct4Date = new Date(2026, 9, 4); // Sunday, 4th October, 2026
    return [formatSlotDate(oct4Date)];
  }

  // Next upcoming Sunday
  const daysToSunday = ist.dayOfWeek === 0 ? 7 : (7 - ist.dayOfWeek);
  const nextSunday = new Date(ist.year, ist.month, ist.day + daysToSunday);
  return [formatSlotDate(nextSunday)];
}

function populateDynamicSlots() {
  const slotSelect = document.getElementById("reg_slot");
  if (!slotSelect) return;

  const currentVal = slotSelect.value;
  const slots = getUpcomingSundays();

  slotSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.disabled = true;
  placeholder.selected = !currentVal || !slots.includes(currentVal);
  placeholder.textContent = "Select an available slot";
  slotSelect.appendChild(placeholder);

  slots.forEach(slotText => {
    const opt = document.createElement("option");
    opt.value = slotText;
    opt.textContent = slotText;
    if (currentVal === slotText) {
      opt.selected = true;
    }
    slotSelect.appendChild(opt);
  });
}

// CHANGE 2 — WHATSAPP COMMUNITY LINK (Community 5)
const WHATSAPP_COMMUNITY_4 = "https://chat.whatsapp.com/EPkGdY9aiQB3R92UoTCUAQ";
const WHATSAPP_COMMUNITY_5 = "https://chat.whatsapp.com/EPkGdY9aiQB3R92UoTCUAQ";

function getActiveWhatsAppCommunityLink(baseDate) {
  return WHATSAPP_COMMUNITY_5;
}

function updateDynamicWhatsAppCommunityLink() {
  const activeLink = getActiveWhatsAppCommunityLink();
  const communityBtns = document.querySelectorAll('.btn-whatsapp-community');
  communityBtns.forEach(btn => {
    btn.href = activeLink;
  });
}

// Live real-time cutoff checker (if page remains open across cutoff)
function initRealtimeCutoffChecker() {
  setInterval(() => {
    populateDynamicSlots();
    updateDynamicWhatsAppCommunityLink();
    updateWebsiteBootcampDates();
  }, 30000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      populateDynamicSlots();
      updateDynamicWhatsAppCommunityLink();
      updateWebsiteBootcampDates();
    }
  });
}

// Attach helpers to window for easy inspection and testing
if (typeof window !== 'undefined') {
  window.WHATSAPP_COMMUNITY_4 = WHATSAPP_COMMUNITY_4;
  window.WHATSAPP_COMMUNITY_5 = WHATSAPP_COMMUNITY_5;
  window.getUpcomingSundays = getUpcomingSundays;
  window.getActiveWhatsAppCommunityLink = getActiveWhatsAppCommunityLink;
  window.populateDynamicSlots = populateDynamicSlots;
  window.updateDynamicWhatsAppCommunityLink = updateDynamicWhatsAppCommunityLink;
}

// ============================================================================
// DYNAMIC WEBSITE BOOTCAMP DATE REPLACER (Asia/Kolkata timezone)
// Calculates the next upcoming Sunday and updates all website content automatically
// ============================================================================
function getNextBootcampSundayDate(baseDate) {
  const ist = getISTDateComponents(baseDate);
  const dayOfWeek = ist.dayOfWeek;
  const daysToSunday = dayOfWeek === 0 ? 7 : (7 - dayOfWeek);
  const nextSunday = new Date(ist.year, ist.month, ist.day + daysToSunday);
  // Manager feedback: No bootcamp on 27th September, 2026 -> next bootcamp is 4th October, 2026
  if (nextSunday.getFullYear() === 2026 && nextSunday.getMonth() === 8 && nextSunday.getDate() === 27) {
    return new Date(ist.year, ist.month, ist.day + daysToSunday + 7);
  }
  return nextSunday;
}

function updateWebsiteBootcampDates() {
  const nextSunday = getNextBootcampSundayDate();
  const dayNum = nextSunday.getDate();
  const monthFull = MONTH_NAMES_FULL[nextSunday.getMonth()];
  const monthShort = monthFull.substring(0, 3);
  const year = nextSunday.getFullYear();

  const formatUppercase = `${dayNum} ${monthFull.toUpperCase()} ${year}`;
  const formatNormal = `${dayNum} ${monthFull} ${year}`;
  const formatSundayFull = `Sunday, ${dayNum} ${monthFull} ${year}`;
  const formatShort = `${dayNum} ${monthShort} ${year}`;
  const formatMobileSticky = `${dayNum} ${monthShort} · Nanakramguda, Hyderabad`;

  // 1. Hero Spec Badge
  const heroSpecBadge = document.querySelector('.hero-event-specs .spec-item .spec-text');
  if (heroSpecBadge && (heroSpecBadge.textContent.includes('AUGUST') || heroSpecBadge.textContent.includes('SEPTEMBER') || /\d{1,2}\s+[A-Z]+\s+\d{4}/.test(heroSpecBadge.textContent))) {
    heroSpecBadge.textContent = formatUppercase;
  }

  // 2. Marquee Ticker
  document.querySelectorAll('.marquee-item').forEach(el => {
    if (el.textContent.includes('📅') && el.textContent.includes('(SUNDAY)')) {
      const dot = el.querySelector('.marquee-dot');
      el.innerHTML = `📅 ${formatUppercase} (SUNDAY) `;
      if (dot) el.appendChild(dot);
      else {
        const newDot = document.createElement('span');
        newDot.className = 'marquee-dot';
        newDot.textContent = '●';
        el.appendChild(newDot);
      }
    }
  });

  // 3. Event Details Grid Card: Date
  document.querySelectorAll('.detail-card').forEach(card => {
    const label = card.querySelector('.detail-card-label');
    const val = card.querySelector('.detail-card-value');
    if (label && label.textContent.includes('DATE') && val) {
      val.textContent = formatNormal;
    }
  });

  // 4. FAQ Section Venue & Timing Answer
  document.querySelectorAll('.faq-item, .faq-answer-content').forEach(faq => {
    if (faq.innerHTML.includes('Nanakramguda, Hyderabad')) {
      faq.innerHTML = faq.innerHTML.replace(
        /Sunday,\s*\d{1,2}\s+[A-Za-z]+\s+\d{4}/gi,
        formatSundayFull
      ).replace(
        /\d{1,2}\s+August\s+2026/gi,
        formatNormal
      );
    }
  });

  // 5. Closing Experience CTA Info Pill Bar
  document.querySelectorAll('.exp-info-pill-item').forEach(el => {
    if (el.textContent.includes('📅') && (el.textContent.includes('Aug') || el.textContent.includes('Sep') || /\d{1,2}\s+[A-Za-z]{3}\s+\d{4}/.test(el.textContent))) {
      el.innerHTML = `<span>📅</span> ${formatShort}`;
    }
  });

  // 6. Mobile Sticky Footer Subtext
  const mobileStickySub = document.querySelector('.mobile-sticky-sub');
  if (mobileStickySub) {
    mobileStickySub.textContent = formatMobileSticky;
  }

  // 7. Initial Entry Pass Date Display if not registered yet
  if (!registeredStudentState.slot && !registeredStudentState.name) {
    const initialPassDates = document.querySelectorAll('.dynamic-pass-date, .pass-date-val');
    initialPassDates.forEach(el => {
      el.textContent = `${formatUppercase} · OFFLINE`;
    });
  }
}

// 1. Capture UTM params the moment the page loads and cache in sessionStorage
function getParam(name, fallback = "") {
  const params = new URLSearchParams(window.location.search);
  const val = params.get(name);
  if (val && val.trim() !== '') {
    try {
      sessionStorage.setItem(`niat_utm_${name}`, val.trim());
    } catch (e) {}
    return val.trim();
  }
  try {
    const cached = sessionStorage.getItem(`niat_utm_${name}`);
    if (cached && cached.trim() !== '') return cached.trim();
  } catch (e) {}
  return fallback;
}

function populateHiddenFields() {
  const sourceEl = document.getElementById("reg_utm_source");
  const mediumEl = document.getElementById("reg_utm_medium");
  const campaignEl = document.getElementById("reg_utm_campaign");
  const termEl = document.getElementById("reg_utm_term");
  const contentEl = document.getElementById("reg_utm_content");
  const urlEl = document.getElementById("reg_landing_url");

  if (sourceEl) sourceEl.value = getParam("utm_source", "direct");
  if (mediumEl) mediumEl.value = getParam("utm_medium", "direct");
  if (campaignEl) campaignEl.value = getParam("utm_campaign", "none");
  if (termEl) termEl.value = getParam("utm_term", "");
  if (contentEl) contentEl.value = getParam("utm_content", "");
  if (urlEl) urlEl.value = window.location.href;

  // Cache invite_code if present in URL
  getParam("invite_code", "");
}

// Opens the Native Embedded Registration Form Modal
function openRegistrationFormModal() {
  const modal = document.getElementById('registration-modal');
  const stepForm = document.getElementById('modal-step-form');
  const stepSuccess = document.getElementById('modal-step-success');
  const exitModal = document.getElementById('exit-popup-modal');
  const popup2 = document.getElementById('mobile-popup-2');

  // Close any popups currently open
  if (exitModal) exitModal.classList.remove('open');
  if (popup2) popup2.classList.remove('open');

  // Refresh dynamic slots & WhatsApp link on modal open
  populateDynamicSlots();
  updateDynamicWhatsAppCommunityLink();

  if (modal) {
    if (stepForm) stepForm.style.display = 'block';
    if (stepSuccess) stepSuccess.style.display = 'none';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Auto-focus first input field for convenience
    const firstInput = document.getElementById('reg_name');
    if (firstInput) setTimeout(() => firstInput.focus(), 150);
  }
}

// 5. Exit-Intent Popup Handler
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

  if (acceptBtn) {
    acceptBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeExitPopup();
      openRegistrationFormModal();
    });
  }

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

// Normalizes Indian mobile number to 10 digits
function normalizeMobile(raw) {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  } else if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  return digits;
}

function getRegisteredMobiles() {
  try {
    const list = JSON.parse(localStorage.getItem('niat_registered_mobiles') || '[]');
    const backups = JSON.parse(localStorage.getItem('niat_registrations') || '[]');
    backups.forEach(b => {
      const m = normalizeMobile(b.mobile);
      if (m && !list.includes(m)) list.push(m);
    });
    return list;
  } catch (e) {
    return [];
  }
}

function saveRegisteredMobile(mobile) {
  try {
    const list = getRegisteredMobiles();
    if (mobile && !list.includes(mobile)) {
      list.push(mobile);
      localStorage.setItem('niat_registered_mobiles', JSON.stringify(list));
    }
  } catch (e) {}
}

function showDuplicateRegistrationMessage() {
  const errorBox = document.getElementById("regFormError");
  const mobileInput = document.getElementById("reg_mobile");
  const btn = document.getElementById("regSubmitBtn");

  if (errorBox) {
    errorBox.innerHTML = '<div style="font-weight:700; font-size:0.96rem; margin-bottom:4px;">⚠️ You’re Already Registered!</div> <div style="font-size:0.88rem; color:#7F1D1D;">This mobile number is already registered for the AI Bootcamp.</div>';
    errorBox.style.display = 'block';
    errorBox.style.background = '#FEF2F2';
    errorBox.style.borderColor = '#FECACA';
    errorBox.style.color = '#991B1B';
    errorBox.style.padding = '0.75rem 1rem';
    errorBox.style.borderRadius = '8px';
    errorBox.style.textAlign = 'center';
    errorBox.style.lineHeight = '1.4';
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = "<span>Reserve My Free Seat →</span>";
  }

  if (mobileInput) {
    mobileInput.focus();
  }
}

// 6. Registration Flow & Native Form Submission Handler
function initRegistrationModal() {
  const modal = document.getElementById('registration-modal');
  const closeButtons = document.querySelectorAll('.close-modal-btn');
  const form = document.getElementById("workshopRegForm");
  const btn = document.getElementById("regSubmitBtn");
  const errorBox = document.getElementById("regFormError");

  // Populate dynamic upcoming Sunday slots
  populateDynamicSlots();

  // Populate hidden UTM fields immediately
  populateHiddenFields();

  // Check URL params if student landed with verified registration (?registered=true&name=...)
  checkVerifiedRegistrationResponse();

  if (!modal) return;

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  closeButtons.forEach(btnEl => {
    btnEl.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Wire up all CTA buttons across the page to open the native registration form modal
  document.querySelectorAll('.open-reg-modal, a[href*="docs.google.com/forms"]').forEach(cta => {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      openRegistrationFormModal();
    });
  });

  // Live duplicate checking on mobile input
  const mobileInputEl = document.getElementById("reg_mobile");
  if (mobileInputEl) {
    mobileInputEl.addEventListener("input", function () {
      if (errorBox && (errorBox.innerHTML.includes("Already Registered") || errorBox.innerHTML.includes("already registered"))) {
        errorBox.style.display = "none";
      }
    });
    mobileInputEl.addEventListener("blur", function () {
      const norm = normalizeMobile(mobileInputEl.value.trim());
      if (norm.length === 10 && getRegisteredMobiles().includes(norm)) {
        showDuplicateRegistrationMessage();
      }
    });
  }

  // Handle Form Submission directly to Apps Script Web App
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (errorBox) {
        errorBox.style.display = "none";
        errorBox.innerHTML = "";
      }

      // Honeypot check — if filled, silently no-op success (bot submission)
      const websiteField = document.getElementById("reg_website");
      if (websiteField && websiteField.value.trim() !== "") {
        showSuccessModal("Friend", "BOOTCAMP-XXXX");
        return;
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const mobileInput = document.getElementById("reg_mobile");
      const rawMobile = mobileInput ? mobileInput.value.trim() : "";
      const normalizedMobile = normalizeMobile(rawMobile);

      if (normalizedMobile.length !== 10) {
        if (errorBox) {
          errorBox.innerHTML = "Please enter a valid 10-digit mobile number.";
          errorBox.style.display = "block";
        }
        if (mobileInput) mobileInput.focus();
        return;
      }

      // Check if mobile number already registered in local records
      if (getRegisteredMobiles().includes(normalizedMobile)) {
        showDuplicateRegistrationMessage();
        return;
      }

      const nameInput = document.getElementById("reg_name");
      const collegeInput = document.getElementById("reg_college");
      const locationInput = document.getElementById("reg_location");
      const standardRadio = form.querySelector('input[name="standard"]:checked');
      const streamSelect = document.getElementById("reg_stream");
      const slotSelect = document.getElementById("reg_slot");
      const slotVal = slotSelect ? slotSelect.value.trim() : "";
      const locationVal = locationInput ? locationInput.value.trim() : "";
      const streamVal = streamSelect ? streamSelect.value.trim() : "";

      if (!streamVal) {
        if (errorBox) {
          errorBox.innerHTML = "Please select your educational stream.";
          errorBox.style.display = "block";
        }
        if (streamSelect) streamSelect.focus();
        return;
      }

      if (!slotVal) {
        if (errorBox) {
          errorBox.innerHTML = "Please select an available slot.";
          errorBox.style.display = "block";
        }
        if (slotSelect) slotSelect.focus();
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const inviteCode = params.get("invite_code") || getParam("invite_code", "") || "";

      const payload = {
        name: nameInput ? nameInput.value.trim() : "",
        mobile: normalizedMobile,
        college: collegeInput ? collegeInput.value.trim() : "",
        college_location: locationVal,
        location: locationVal,
        address: locationVal,
        standard: standardRadio ? standardRadio.value : "",
        educational_stream: streamVal,
        stream: streamVal,
        available_slot: slotVal,
        slot: slotVal,
        utm_source: (document.getElementById("reg_utm_source") || {}).value || "",
        utm_medium: (document.getElementById("reg_utm_medium") || {}).value || "",
        utm_campaign: (document.getElementById("reg_utm_campaign") || {}).value || "",
        invite_code: inviteCode,
        landing_url: (document.getElementById("reg_landing_url") || {}).value || window.location.href,
        submitted_at: new Date().toISOString()
      };

      // Dynamic Sequential Progress Experience Timers
      const progressTimeouts = [];
      function clearProgressTimers() {
        while (progressTimeouts.length > 0) {
          clearTimeout(progressTimeouts.pop());
        }
      }

      function startProgressExperience() {
        clearProgressTimers();
        if (!btn) return;
        btn.disabled = true;

        // Step 1: Immediate confirmation
        btn.innerHTML = "<span>Confirming your registration...</span>";

        // Step 2 (~1.4s): Generating entry pass
        progressTimeouts.push(setTimeout(() => {
          if (btn && btn.disabled) {
            btn.innerHTML = "<span>Generating your entry pass...</span>";
          }
        }, 1400));

        // Step 3 (~3.0s): Almost done
        progressTimeouts.push(setTimeout(() => {
          if (btn && btn.disabled) {
            btn.innerHTML = "<span>Almost done...</span>";
          }
        }, 3000));
      }

      startProgressExperience();

      // Helper to store registration in localStorage
      function saveLocalBackup(record) {
        try {
          const list = JSON.parse(localStorage.getItem('niat_registrations') || '[]');
          list.push(record);
          localStorage.setItem('niat_registrations', JSON.stringify(list));
        } catch (e) {
          console.warn('LocalStorage backup error:', e);
        }
      }

      // POST to Apps Script Web App URL with Content-Type text/plain to avoid CORS preflight
      const submitPromise = fetch(APPS_SCRIPT_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      })
        .then(res => {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(data => {
          if (data && (data.duplicate || (data.message && data.message.includes("Already Registered")) || (data.error && data.error.includes("Already Registered")))) {
            saveRegisteredMobile(normalizedMobile);
            showDuplicateRegistrationMessage();
            return { isDuplicate: true };
          }
          if (data && data.success && data.passId) {
            saveRegisteredMobile(normalizedMobile);
            return { isDuplicate: false, passId: data.passId };
          }
          throw new Error((data && (data.message || data.error)) || "Unable to confirm spreadsheet record");
        });

      // 25-second timeout for Apps Script cold starts & multi-tab writes
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Network timeout")), 25000);
      });

      Promise.race([submitPromise, timeoutPromise])
        .then(async result => {
          clearProgressTimers();
          if (result && result.isDuplicate) {
            if (btn) {
              btn.disabled = false;
              btn.innerHTML = "<span>Reserve My Free Seat →</span>";
            }
            return;
          }
          if (result && result.passId) {
            const finalPassId = result.passId;
            saveRegisteredMobile(normalizedMobile);
            saveLocalBackup({ ...payload, passId: finalPassId, synced: true });

            // Visual confirmation ONLY after server confirmed successful registration
            if (btn) {
              btn.innerHTML = "<span>Registration confirmed ✓</span>";
            }

            // Short visual feedback before displaying the official digital pass
            await new Promise(r => setTimeout(r, 600));

            showSuccessModal(payload.name, finalPassId, slotVal);
            form.reset();
            populateHiddenFields();
            if (btn) {
              btn.disabled = false;
              btn.innerHTML = "<span>Reserve My Free Seat →</span>";
            }
          } else {
            throw new Error("Missing confirmed pass ID from registration server.");
          }
        })
        .catch(err => {
          clearProgressTimers();
          console.error("Apps Script registration error:", err);
          if (err && err.message && (err.message.includes("Already Registered") || err.message.includes("already registered") || err.message.includes("duplicate"))) {
            saveRegisteredMobile(normalizedMobile);
            showDuplicateRegistrationMessage();
            return;
          }
          if (errorBox) {
            errorBox.innerHTML = "Unable to complete registration with the server. Please check your internet connection and click 'Reserve My Free Seat' to retry.";
            errorBox.style.display = "block";
          }
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = "<span>Reserve My Free Seat →</span>";
          }
        });
    });
  }
}

// Stage 2: Displays the Verified Entry Pass in the modal
function showSuccessModal(studentName, passId, slot) {
  const cleanName = (studentName || 'CLASS 12 PARTICIPANT').trim().toUpperCase();
  const cleanId = (passId || generateRandomPassId()).trim().toUpperCase();
  const cleanSlot = (slot || registeredStudentState.slot || getUpcomingSundays()[0] || '').trim();

  registeredStudentState.name = cleanName;
  registeredStudentState.passId = cleanId;
  registeredStudentState.slot = cleanSlot;
  registeredStudentState.date = formatPassDateFromSlot(cleanSlot).replace(/\s*·\s*OFFLINE/i, '');

  updatePassDisplay(cleanName, cleanId, cleanSlot);
  updateDynamicWhatsAppCommunityLink();

  const modal = document.getElementById('registration-modal');
  const stepForm = document.getElementById('modal-step-form');
  const stepSuccess = document.getElementById('modal-step-success');

  if (modal && stepSuccess) {
    if (stepForm) stepForm.style.display = 'none';
    stepSuccess.style.display = 'block';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    triggerConfetti();

    // Scroll modal to top
    const modalCard = modal.querySelector('.modal-card');
    if (modalCard) modalCard.scrollTop = 0;
  }
}

// Read verified registration response parameters if redirected or loaded with URL params
function checkVerifiedRegistrationResponse() {
  const urlParams = new URLSearchParams(window.location.search);
  const hasRegistered = urlParams.get('registered') || urlParams.get('status') === 'success';
  const studentName = urlParams.get('name') || urlParams.get('student_name');
  const passId = urlParams.get('pass_id') || urlParams.get('id');
  const slot = urlParams.get('available_slot') || urlParams.get('slot') || urlParams.get('available_slots');

  if (hasRegistered && studentName) {
    showSuccessModal(decodeURIComponent(studentName), passId ? decodeURIComponent(passId) : generateRandomPassId(), slot ? decodeURIComponent(slot) : '');
  }
}

// Generate unique collision-safe Workshop-XXXX ID fallback
function generateRandomPassId() {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return `BOOTCAMP-${code}`;
}

// Updates entry pass DOM with 100% dynamic registration data
function updatePassDisplay(name, passId, slot) {
  const cleanName = (name || registeredStudentState.name || 'CLASS 12 PARTICIPANT').trim().toUpperCase();
  const cleanId = (passId || registeredStudentState.passId || 'BOOTCAMP-A7K9').trim().toUpperCase();
  const chosenSlot = (slot || registeredStudentState.slot || getUpcomingSundays()[0] || '').trim();

  const displayDate = formatPassDateFromSlot(chosenSlot);

  const dateHolders = document.querySelectorAll('.dynamic-pass-date, .pass-date-val');
  dateHolders.forEach(el => {
    el.textContent = displayDate;
  });

  const nameHolders = document.querySelectorAll('.dynamic-student-name');
  nameHolders.forEach(el => {
    el.textContent = cleanName;
    
    // Dynamic text auto-scaling so short, medium, and long names stay balanced inside the box
    if (cleanName.length > 26) {
      el.style.fontSize = '0.90rem';
      el.style.lineHeight = '1.15';
    } else if (cleanName.length > 18) {
      el.style.fontSize = '1.05rem';
      el.style.lineHeight = '1.15';
    } else if (cleanName.length > 10) {
      el.style.fontSize = '1.18rem';
      el.style.lineHeight = '1.15';
    } else {
      el.style.fontSize = '1.34rem'; // Short names (e.g. JK)
      el.style.lineHeight = '1.2';
    }
  });

  const passIdHolders = document.querySelectorAll('.dynamic-pass-id');
  passIdHolders.forEach(el => {
    el.textContent = cleanId;
    if (cleanId.length > 15) {
      el.style.fontSize = '0.85rem';
    } else {
      el.style.fontSize = '0.98rem';
    }
  });
}

// 7. High-Definition Tightly-Cropped Entry Pass PNG Exporter (html2canvas with Canvas Fallback)
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
  const cleanName = (name || registeredStudentState.name || 'CLASS 12 PARTICIPANT').trim().toUpperCase();
  const cleanPassId = (passId || registeredStudentState.passId || 'BOOTCAMP-A7K9').trim().toUpperCase();
  const safeFileName = cleanName.replace(/[^a-zA-Z0-9]/g, '_');
  const sourceCard = document.getElementById('standard-entry-pass');

  if (!sourceCard) {
    fallbackDirectCanvasPNG(cleanName, cleanPassId, safeFileName);
    return;
  }

  // Ensure on-screen pass is synchronized with current participant details
  updatePassDisplay(cleanName, cleanPassId);

  // Isolate element in an un-transformed 430px staging container to prevent modal transform & mobile media query distortion
  const stagingWrapper = document.createElement('div');
  stagingWrapper.style.cssText = 'position: fixed; left: 0; top: 0; z-index: -9999; opacity: 0; pointer-events: none; width: 430px; max-width: 430px; margin: 0; padding: 0; background: transparent; transform: none;';
  
  const clone = sourceCard.cloneNode(true);
  clone.style.cssText = 'position: relative; width: 430px; max-width: 430px; min-width: 430px; margin: 0; box-shadow: none; transform: none; box-sizing: border-box;';
  
  // Ensure the dynamic name in the clone is updated and properly scaled
  const cloneName = clone.querySelector('.dynamic-student-name');
  if (cloneName) {
    cloneName.textContent = cleanName;
    if (cleanName.length > 26) {
      cloneName.style.fontSize = '0.90rem';
      cloneName.style.lineHeight = '1.15';
    } else if (cleanName.length > 18) {
      cloneName.style.fontSize = '1.05rem';
      cloneName.style.lineHeight = '1.15';
    } else if (cleanName.length > 10) {
      cloneName.style.fontSize = '1.18rem';
      cloneName.style.lineHeight = '1.15';
    } else {
      cloneName.style.fontSize = '1.34rem';
      cloneName.style.lineHeight = '1.2';
    }
  }
  const cloneId = clone.querySelector('.dynamic-pass-id');
  if (cloneId) {
    cloneId.textContent = cleanPassId;
    if (cleanPassId.length > 15) {
      cloneId.style.fontSize = '0.85rem';
    } else {
      cloneId.style.fontSize = '0.98rem';
    }
  }

  stagingWrapper.appendChild(clone);
  document.body.appendChild(stagingWrapper);

  const logoImg = clone.querySelector('.pass-brand-logo');

  const executeCapture = () => {
    if (typeof html2canvas === 'function') {
      html2canvas(clone, {
        scale: 3, // 3x high-definition rendering (1290px width)
        useCORS: true,
        allowTaint: true,
        backgroundColor: null, // Transparent outside rounded corners
        scrollX: 0,
        scrollY: 0,
        logging: false,
        imageTimeout: 6000
      }).then(canvas => {
        if (stagingWrapper.parentNode) document.body.removeChild(stagingWrapper);
        const link = document.createElement('a');
        link.download = `NIAT_AI_Bootcamp_Pass_${cleanPassId}_${safeFileName}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }).catch(err => {
        console.warn('html2canvas staging capture fallback:', err);
        if (stagingWrapper.parentNode) document.body.removeChild(stagingWrapper);
        fallbackDirectCanvasPNG(cleanName, cleanPassId, safeFileName);
      });
    } else {
      if (stagingWrapper.parentNode) document.body.removeChild(stagingWrapper);
      fallbackDirectCanvasPNG(cleanName, cleanPassId, safeFileName);
    }
  };

  // Ensure fonts and logo image are fully loaded before capturing
  const prepareAndCapture = () => {
    if (logoImg && !logoImg.complete) {
      logoImg.onload = () => setTimeout(executeCapture, 60);
      logoImg.onerror = () => setTimeout(executeCapture, 60);
    } else {
      setTimeout(executeCapture, 60);
    }
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(prepareAndCapture).catch(prepareAndCapture);
  } else {
    prepareAndCapture();
  }
}

// Fallback Canvas Exporter with NIAT Logo & Rounded Clipping
function fallbackDirectCanvasPNG(name, passId, safeFileName) {
  const width = 860;
  const height = 620;
  const radius = 24;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Clip canvas to rounded rectangle so corners are transparent
  ctx.save();
  drawRoundedRect(ctx, 1.5, 1.5, width - 3, height - 3, radius);
  ctx.clip();

  // Background Fill with Subtle Maroon Radial Gradient & Circular Ripples (Image 2 style)
  const grad = ctx.createRadialGradient(width / 2, height * 0.15, 10, width / 2, height * 0.5, width * 0.65);
  grad.addColorStop(0, '#FFF5F6');
  grad.addColorStop(0.5, '#FFFBFB');
  grad.addColorStop(1, '#FFF9F9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle concentric circular wave ripples radiating from top center
  ctx.strokeStyle = 'rgba(136, 19, 55, 0.035)';
  ctx.lineWidth = 1.5;
  for (let r = 30; r < width; r += 45) {
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.18, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Outer Border
  ctx.strokeStyle = '#FBCFE8';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 1.5, 1.5, width - 3, height - 3, radius);
  ctx.stroke();

  const padX = 32;
  const innerW = width - padX * 2; // 796px
  const headerY = 52;

  // Load and Draw NIAT Logo Image
  const logo = new Image();
  logo.crossOrigin = 'anonymous';
  logo.onload = () => {
    drawPassCanvasElements(ctx, logo, width, height, padX, innerW, headerY, name, passId, safeFileName, canvas);
  };
  logo.onerror = () => {
    drawPassCanvasElements(ctx, null, width, height, padX, innerW, headerY, name, passId, safeFileName, canvas);
  };
  logo.src = 'assets/niat_logo_workshop.png';
}

function drawPassCanvasElements(ctx, logoImg, width, height, padX, innerW, headerY, name, passId, safeFileName, canvas) {
  if (logoImg) {
    const logoAspect = logoImg.width / logoImg.height;
    const logoH = 34;
    const logoW = logoH * logoAspect;
    ctx.drawImage(logoImg, padX + 6, headerY - 24, logoW, logoH);
  } else {
    ctx.fillStyle = '#9F1239';
    ctx.font = '900 28px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('NIAT', padX + 6, headerY);
    ctx.fillStyle = '#475569';
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NxtWave Institute of Advanced Technologies', padX + 90, headerY - 3);
  }

  // VALID ENTRY PASS Pill Badge on Header Right
  const badgeW = 200;
  const badgeH = 38;
  const badgeX = width - padX - badgeW - 6;
  const badgeY = headerY - 26;
  ctx.fillStyle = '#ECFDF5';
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 19);
  ctx.fill();
  ctx.strokeStyle = '#A7F3D0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#065F46';
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('✓ VALID ENTRY PASS', badgeX + badgeW / 2, badgeY + 24);

  // Dashed separator beneath header
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(padX + 6, headerY + 18);
  ctx.lineTo(width - padX - 6, headerY + 18);
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash

  // 2. Event Title & Target Banner Box
  const bannerY = headerY + 34;
  const bannerH = 135;
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, padX, bannerY, innerW, bannerH, 14);
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#D97706';
  ctx.font = '900 17px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('AI BOOTCAMP', width / 2, bannerY + 32);

  ctx.fillStyle = '#475569';
  ctx.font = '750 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('FOR CLASS 12 STUDENTS', width / 2, bannerY + 62);

  ctx.fillStyle = '#0B1730';
  ctx.font = '900 36px "Space Grotesk", sans-serif';
  ctx.fillText('ENTRY PASS', width / 2, bannerY + 112);

  // 3. Dynamic Participant Box
  const partY = bannerY + bannerH + 16;
  const partH = 130;
  ctx.fillStyle = '#FFF1F2';
  drawRoundedRect(ctx, padX, partY, innerW, partH, 14);
  ctx.fill();
  ctx.strokeStyle = '#FECDD3';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#881337';
  ctx.font = '850 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PARTICIPANT', width / 2, partY + 32);

  // Dynamic Student Name with Font Scaling
  let nameFontSize = 34;
  if (name.length > 28) {
    nameFontSize = 22;
  } else if (name.length > 20) {
    nameFontSize = 26;
  } else if (name.length > 14) {
    nameFontSize = 30;
  }
  ctx.fillStyle = '#9F1239';
  ctx.font = `900 ${nameFontSize}px "Space Grotesk", sans-serif`;
  ctx.fillText(name, width / 2, partY + 86);

  // 4. Dynamic Pass ID & Event Details 2-Column Grid
  const gridY = partY + partH + 16;
  const colGap = 16;
  const colW = (innerW - colGap) / 2;
  const colH = 130;

  // Left Box: PASS ID
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, padX, gridY, colW, colH, 12);
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#64748B';
  ctx.font = '850 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PASS ID', padX + colW / 2, gridY + 34);

  ctx.fillStyle = '#2563EB';
  ctx.font = '900 28px "JetBrains Mono", monospace';
  ctx.fillText(passId, padX + colW / 2, gridY + 88);

  // Right Box: DATE & MODE
  const rightX = padX + colW + colGap;
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, rightX, gridY, colW, colH, 12);
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#64748B';
  ctx.font = '850 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DATE & MODE', rightX + colW / 2, gridY + 34);

  ctx.fillStyle = '#0B1730';
  ctx.font = '800 18px "Space Grotesk", sans-serif';
  const canvasPassDate = formatPassDateFromSlot(registeredStudentState.slot || getUpcomingSundays()[0]);
  ctx.fillText(canvasPassDate, rightX + colW / 2, gridY + 74);

  ctx.fillStyle = '#059669';
  ctx.font = '750 15px "JetBrains Mono", monospace';
  ctx.fillText('10:00 AM - 5:00 PM', rightX + colW / 2, gridY + 102);

  // 5. Venue & Status Strip
  const stripY = gridY + colH + 16;
  const stripH = 50;
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, padX, stripY, innerW, stripH, 10);
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#334155';
  ctx.font = '750 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('🏛️ Nanakramguda, Hyderabad   •   VALID ENTRY PASS', width / 2, stripY + 31);

  ctx.restore();

  // Download Trigger
  const link = document.createElement('a');
  link.download = `NIAT_AI_Bootcamp_Pass_${passId}_${safeFileName}.png`;
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
      const title = encodeURIComponent('NIAT Free Offline AI Bootcamp (Class 12)');
      const details = encodeURIComponent('Free Offline AI Bootcamp for Class 12 students. Learn practical AI for board exams, revision, NotebookLM, prompting, and build a hands-on project. Timing: 10:00 AM - 5:00 PM. Entry Pass ID: ' + registeredStudentState.passId);
      const location = encodeURIComponent('Nanakramguda, Hyderabad');
      
      const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
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
      const shareDateStr = registeredStudentState.date || formatPassDateFromSlot(getUpcomingSundays()[0]).replace(/\s*·\s*OFFLINE/i, '');
      const activeCommunity = getActiveWhatsAppCommunityLink();
      const message = `Hey! I just registered for the free *NIAT Offline AI Bootcamp* for Class 12 students in Hyderabad (${shareDateStr} at Nanakramguda, Hyderabad)! 🚀\n\nThey're teaching AI for board exams, revision, NotebookLM, and live project building. Join the WhatsApp Community here: ${activeCommunity}`;
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

// Mobile-Only Scroll Popups (Triggered naturally on scroll < 768px)
function initMobileScrollPopups() {
  const popup1 = document.getElementById('mobile-popup-1');
  const popup2 = document.getElementById('mobile-popup-2');
  const closeBtn1 = document.getElementById('btn-close-popup-1');
  const closeBtn2 = document.getElementById('btn-close-popup-2');
  const dismissBtn1 = document.getElementById('btn-dismiss-popup-1');
  const dismissBtn2 = document.getElementById('btn-dismiss-popup-2');
  const ctaBtn1 = document.getElementById('btn-popup-1-cta');
  const ctaBtn2 = document.getElementById('btn-popup-2-cta');

  const closePopup1 = () => {
    if (popup1) popup1.classList.remove('open');
    sessionStorage.setItem('popup_1_shown', 'true');
  };

  const closePopup2 = () => {
    if (popup2) popup2.classList.remove('open');
    sessionStorage.setItem('popup_2_shown', 'true');
  };

  if (closeBtn1) closeBtn1.addEventListener('click', closePopup1);
  if (closeBtn2) closeBtn2.addEventListener('click', closePopup2);
  if (dismissBtn1) dismissBtn1.addEventListener('click', closePopup1);
  if (dismissBtn2) dismissBtn2.addEventListener('click', closePopup2);

  if (popup1) {
    popup1.addEventListener('click', (e) => {
      if (e.target === popup1) closePopup1();
    });
  }
  if (popup2) {
    popup2.addEventListener('click', (e) => {
      if (e.target === popup2) closePopup2();
    });
  }

  if (ctaBtn1) {
    ctaBtn1.addEventListener('click', (e) => {
      e.preventDefault();
      closePopup1();
      const curriculumSection = document.getElementById('curriculum');
      if (curriculumSection) {
        const headerOffset = 70;
        const elementPosition = curriculumSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      }
    });
  }

  if (ctaBtn2) {
    ctaBtn2.addEventListener('click', () => {
      closePopup2();
    });
  }

  // Exact Trigger Elements:
  // 1. Bottom of the section containing “I Want to Learn AI ⚡” (#why-attend bottom edge / .why-highlight-banner)
  const section1End = document.querySelector('.why-highlight-banner') || document.querySelector('#why-attend');

  // 2. Bottom of the roadmap section / Recognition & Rewards (.finish-gate / Station 08)
  const section2End = document.querySelector('.finish-gate') || document.querySelector('.theme-8') || document.querySelector('.landscape-track-container') || document.querySelector('#takeaways');

  let triggered1 = false;
  let triggered2 = false;

  // Viewport Scroll Detection (Only active below 768px)
  const checkScrollTriggers = () => {
    if (window.innerWidth >= 768) return;

    // Trigger 1: When user reaches the bottom edge of "I Want to Learn AI ⚡" section
    if (!triggered1 && !sessionStorage.getItem('popup_1_shown') && section1End) {
      const rect = section1End.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.75) {
        triggered1 = true;
        sessionStorage.setItem('popup_1_shown', 'true');
        if (popup1) popup1.classList.add('open');
      }
    }

    // Trigger 2: When user reaches the bottom edge of "A Bootcamp Designed to Help You Learn AI the Right Way" section
    if (!triggered2 && !sessionStorage.getItem('popup_2_shown') && section2End) {
      const rect = section2End.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.75) {
        triggered2 = true;
        sessionStorage.setItem('popup_2_shown', 'true');
        if (popup2) popup2.classList.add('open');
      }
    }
  };

  window.addEventListener('scroll', checkScrollTriggers, { passive: true });

  // IntersectionObserver Trigger
  if ('IntersectionObserver' in window) {
    if (section1End) {
      const observer1 = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !triggered1 && window.innerWidth < 768 && !sessionStorage.getItem('popup_1_shown')) {
            triggered1 = true;
            sessionStorage.setItem('popup_1_shown', 'true');
            if (popup1) popup1.classList.add('open');
          }
        });
      }, {
        threshold: 0.2
      });
      observer1.observe(section1End);
    }

    if (section2End) {
      const observer2 = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !triggered2 && window.innerWidth < 768 && !sessionStorage.getItem('popup_2_shown')) {
            triggered2 = true;
            sessionStorage.setItem('popup_2_shown', 'true');
            if (popup2) popup2.classList.add('open');
          }
        });
      }, {
        threshold: 0.2
      });
      observer2.observe(section2End);
    }
  }
}

// 13. Background Auto-Sync Worker for offline/unsynced registrations
function initBackgroundSyncWorker() {
  function syncPending() {
    try {
      const records = JSON.parse(localStorage.getItem('niat_registrations') || '[]');
      const unsynced = records.filter(r => r && r.synced === false);
      if (unsynced.length === 0) return;

      console.log(`[AutoSync] Found ${unsynced.length} unsynced registration(s). Syncing with Google Sheets...`);
      unsynced.forEach(record => {
        fetch(APPS_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(record)
        })
          .then(res => res.json())
          .then(data => {
            if (data && (data.success || data.duplicate)) {
              record.synced = true;
              if (data.passId) record.passId = data.passId;
              localStorage.setItem('niat_registrations', JSON.stringify(records));
              console.log(`[AutoSync] Synced registration for ${record.mobile} successfully.`);
            }
          })
          .catch(e => console.warn(`[AutoSync] Retry failed for ${record.mobile}:`, e));
      });
    } catch (err) {
      console.warn('[AutoSync] Error reading local backup:', err);
    }
  }

  // Trigger on page load and when internet connection returns
  syncPending();
  window.addEventListener('online', syncPending);
}


