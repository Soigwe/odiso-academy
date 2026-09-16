/**
 * Odiso Leadership Academy (OLA) - Interactive Experience Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initLucideIcons();
  initScrollReveal();
  initMobileMenu();
  initLifeAtOdisoSlideshow();
  initAccordions();
  initEligibilityChecker();
  initInquiryForms();
});

// 1. Lucide Icons Initializer
function initLucideIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

// 2. Scroll Reveal Animations via Intersection Observer
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!revealElements.length) return;

  document.documentElement.classList.add('js-ready');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.05
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= windowHeight + 150) {
      el.classList.add('active');
    } else {
      observer.observe(el);
    }
  });

  setTimeout(() => {
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= windowHeight + 200) {
        el.classList.add('active');
      }
    });
  }, 500);
}

// 3. Mobile Navigation Menu Toggle
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  const backdrop = document.getElementById('mobile-menu-backdrop');

  if (!toggleBtn || !mobileMenu) return;

  const openMenu = () => {
    mobileMenu.classList.remove('hidden');
    setTimeout(() => {
      mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
    }, 10);
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    mobileMenu.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      mobileMenu.classList.add('hidden');
    }, 300);
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// 4. Life at Odiso Carousel / Slideshow
function initLifeAtOdisoSlideshow() {
  const carousel = document.getElementById('life-slideshow');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = carousel.querySelectorAll('.carousel-slide');
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  const indicatorsContainer = carousel.querySelector('[data-carousel-indicators]');
  
  if (!track || !slides.length) return;

  let currentIndex = 0;
  let autoPlayTimer = null;
  const slideCount = slides.length;

  if (indicatorsContainer) {
    indicatorsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `h-2.5 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-ola-gold-500 w-8' : 'bg-white/40 hover:bg-white/80 w-2.5'}`;
      dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
      dot.addEventListener('click', () => goToSlide(idx));
      indicatorsContainer.appendChild(dot);
    });
  }

  function updateSlidePosition() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    if (indicatorsContainer) {
      const dots = indicatorsContainer.querySelectorAll('button');
      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.className = 'h-2.5 w-8 rounded-full bg-ola-gold-500 transition-all duration-300';
        } else {
          dot.className = 'h-2.5 w-2.5 rounded-full bg-white/40 hover:bg-white/80 transition-all duration-300';
        }
      });
    }
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slideCount;
    updateSlidePosition();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slideCount) % slideCount;
    updateSlidePosition();
  }

  function goToSlide(index) {
    currentIndex = index;
    updateSlidePosition();
    resetAutoplay();
  }

  function startAutoplay() {
    stopAutoplay();
    autoPlayTimer = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);
  carousel.addEventListener('touchstart', stopAutoplay, { passive: true });
  carousel.addEventListener('touchend', startAutoplay, { passive: true });

  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carousel.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 40) {
      nextSlide();
      resetAutoplay();
    } else if (touchEndX - touchStartX > 40) {
      prevSlide();
      resetAutoplay();
    }
  }, { passive: true });

  startAutoplay();
}

// 5. Accordions (FAQs)
function initAccordions() {
  const accordionButtons = document.querySelectorAll('[data-accordion-toggle]');
  accordionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-accordion-toggle');
      const targetContent = document.getElementById(targetId);
      const icon = btn.querySelector('.accordion-icon');

      if (!targetContent) return;

      const isOpen = !targetContent.classList.contains('hidden');

      const group = btn.closest('[data-accordion-group]');
      if (group) {
        group.querySelectorAll('[data-accordion-content]').forEach(c => c.classList.add('hidden'));
        group.querySelectorAll('.accordion-icon').forEach(ic => ic.classList.remove('rotate-180'));
      }

      if (isOpen) {
        targetContent.classList.add('hidden');
        if (icon) icon.classList.remove('rotate-180');
      } else {
        targetContent.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
      }
    });
  });
}

// 6. Interactive 36-State Equity & 100% Free Scholarship Eligibility Evaluator
function initEligibilityChecker() {
  const stateSelect = document.getElementById('eval-state');
  const backgroundSelect = document.getElementById('eval-background');
  const trackSelect = document.getElementById('eval-track');
  const resultCard = document.getElementById('eval-result-card');
  const statusBadge = document.getElementById('eval-status-badge');
  const detailsText = document.getElementById('eval-details-text');

  if (!stateSelect || !resultCard) return;

  function evaluateCandidate() {
    const state = stateSelect.value;
    const bg = backgroundSelect ? backgroundSelect.value : 'nsr';
    const track = trackSelect ? trackSelect.value : 'cs';

    if (!state) {
      resultCard.classList.add('hidden');
      return;
    }

    resultCard.classList.remove('hidden');

    if (bg === 'nsr' || bg === 'low-income') {
      statusBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      statusBadge.innerHTML = '✓ 100% Fully-Funded Scholarship Eligible (Free Admission & Full Boarding)';
      detailsText.innerHTML = `Candidates from <strong>${state} State</strong> meeting socioeconomic equity criteria receive 100% free tuition, full residential room & board, all laboratory equipment, college credit transfer coursework, and guaranteed placement in the 2026 Pilot Cohort.`;
    } else {
      statusBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-ola-gold-500/20 text-ola-gold-300 border border-ola-gold-500/30';
      statusBadge.innerHTML = 'Special Consideration / Community Partner Nomination';
      detailsText.innerHTML = `All admissions to Odiso Leadership Academy are <strong>100% free of charge</strong>. Priority is allocated by law to talented deserving female scholars from Nigeria’s 36 states documented in the National Social Register (NSR).`;
    }
  }

  [stateSelect, backgroundSelect, trackSelect].forEach(el => {
    if (el) el.addEventListener('change', evaluateCandidate);
  });
}

// 7. Forms Handling with User-Friendly Toast
function initInquiryForms() {
  const forms = document.querySelectorAll('form[data-ola-form]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="inline-flex items-center gap-2">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Submitting Nomination...
          </span>
        `;
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        showToast('Nomination / application submitted successfully! 100% fully funded by OLA & IRAWCC.', 'success');
        form.reset();
      }, 900);
    });
  });
}

function showToast(message, type = 'success') {
  let toast = document.getElementById('ola-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ola-toast';
    toast.className = 'fixed bottom-6 right-6 z-50 transform transition-all duration-300 translate-y-20 opacity-0 max-w-md bg-ola-purple-950 text-white p-4 rounded-xl shadow-2xl border border-ola-gold-500/50 flex items-start gap-3';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-ola-gold-500/20 text-ola-gold-400 flex items-center justify-center shrink-0 mt-0.5">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
    </div>
    <div>
      <div class="text-sm font-semibold text-white">Application Received</div>
      <div class="text-xs text-slate-300 mt-0.5">${message}</div>
    </div>
  `;

  toast.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 4500);
}
