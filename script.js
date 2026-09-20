// ---------- SHARED NAV + FOOTER (single source of truth) ----------
// Injected into every page via #site-nav / #site-footer placeholders so
// future section additions only need to change the NAV_GROUPS list here.

// One ordered list of top-level nav entries. An entry with `items` renders
// as a dropdown; an entry without renders as a plain link that navigates
// straight there. Order here is the order on the page.
const NAV_ITEMS = [
  { label: 'Home', section: 'home' },
  {
    label: 'About',
    items: [
      { text: "Meaghan's Story", href: 'about-meaghan.html' },
      { text: 'Testimonials', href: 'testimonials.html' },
      { text: 'Documents', href: 'documents.html' },
    ],
  },
  {
    label: 'Contact',
    items: [
      { text: 'Send a Message', href: 'send-a-message.html' },
      { text: 'FAQ', href: 'faq.html' },
    ],
  },
  { label: 'Book a Session', href: 'book-a-session.html' },
];

// A "section" link scrolls within the current page if that section
// exists here, otherwise it navigates to the homepage and scrolls there.
// window.SITE_HOME_PAGE lets a page override the homepage URL (e.g. a
// hosted preview where "index.html" isn't a real sibling file); it
// defaults to the normal relative link used on the live site.
function resolveHref(item) {
  if (item.href) return item.href;
  const onThisPage = document.getElementById(item.section);
  const homePage = window.SITE_HOME_PAGE || 'index.html';
  return onThisPage ? `#${item.section}` : `${homePage}#${item.section}`;
}

function renderNav() {
  const cornerItems = NAV_ITEMS.map((entry) => {
    if (!entry.items) {
      return `
        <div class="menu-col">
          <a class="dropdown-toggle nav-plain-link" href="${resolveHref(entry)}">${entry.label}</a>
        </div>
      `;
    }
    return `
      <div class="menu-col dropdown">
        <button class="dropdown-toggle" type="button" aria-expanded="false">
          ${entry.label}
          <svg class="chev" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1 L5 5 L9 1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <ul class="dropdown-panel">
          ${entry.items.map((item) => `<li><a href="${resolveHref(item)}">${item.text}</a></li>`).join('')}
        </ul>
      </div>
    `;
  }).join('');

  const mobileItems = NAV_ITEMS.map((entry) => {
    if (!entry.items) {
      return `<a class="mobile-menu-link" href="${resolveHref(entry)}">${entry.label}</a>`;
    }
    return `
      <h4>${entry.label}</h4>
      <ul>
        ${entry.items.map((item) => `<li><a href="${resolveHref(item)}">${item.text}</a></li>`).join('')}
      </ul>
    `;
  }).join('');

  return `
    <div class="mobile-nav">
      <button class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="mobile-menu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>
      <nav class="mobile-menu" id="mobile-menu" hidden>
        ${mobileItems}
      </nav>
    </div>

    <nav class="corner-menu" aria-label="Primary">
      ${cornerItems}
    </nav>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="site-footer-inner">
        <p class="footer-copyright">Copyright &copy; 2026 Eagle Point Coaching LLC. All Rights Reserved.</p>
        <p class="footer-credit">Website developed by Justin Farajollah. Email <a href="mailto:farajollahjustin@gmail.com" class="footer-link">farajollahjustin@gmail.com</a> to make your website vision a reality.</p>
      </div>
    </footer>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const navSlot = document.getElementById('site-nav');
  if (navSlot) navSlot.innerHTML = renderNav();

  const footerSlot = document.getElementById('site-footer');
  if (footerSlot) footerSlot.innerHTML = renderFooter();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document.body.classList.add('reduced-motion');
  }

  // Vertical edge label: tracks whichever section is in view, and stays
  // readable by splitting its ink at the exact pixel where the band behind
  // it changes — the navy copy shows over ivory, the ivory copy over navy,
  // so a word straddling a boundary is half one colour and half the other.
  const sectionLabel = document.getElementById('section-label');
  const sections = document.querySelectorAll('[data-label]');

  if (sectionLabel) {
    const labelTexts = sectionLabel.querySelectorAll('.vertical-label-text');
    const navyLayer = sectionLabel.querySelector('.vertical-label-navy');
    const ivoryLayer = sectionLabel.querySelector('.vertical-label-ivory');
    // every navy band on the page, the injected footer included
    const darkBands = document.querySelectorAll('.section-dark, .site-footer');

    const clipTo = (layer, top, bottom) => {
      layer.style.clipPath = `inset(${top}px 0 ${bottom}px 0)`;
    };

    const updateLabelSplit = () => {
      if (!navyLayer || !ivoryLayer) return;
      const rect = sectionLabel.getBoundingClientRect();
      const height = rect.height;
      if (!height) return;

      // how much of the label's own box sits over a navy band
      let darkTop = null;
      let darkBottom = null;
      darkBands.forEach((band) => {
        const b = band.getBoundingClientRect();
        const top = Math.max(rect.top, b.top);
        const bottom = Math.min(rect.bottom, b.bottom);
        if (bottom <= top) return;
        darkTop = darkTop === null ? top : Math.min(darkTop, top);
        darkBottom = darkBottom === null ? bottom : Math.max(darkBottom, bottom);
      });

      if (darkTop === null) {
        clipTo(ivoryLayer, height / 2, height / 2);  // nothing showing
        clipTo(navyLayer, 0, 0);
        return;
      }

      const insetTop = darkTop - rect.top;
      const insetBottom = rect.bottom - darkBottom;
      clipTo(ivoryLayer, insetTop, insetBottom);

      // the navy copy takes the remainder — whichever side the boundary
      // left room on (a band shorter than the label can't happen here,
      // so at most one edge falls inside)
      if (insetTop >= insetBottom) {
        clipTo(navyLayer, 0, height - insetTop);
      } else {
        clipTo(navyLayer, height - insetBottom, 0);
      }
    };

    let pending = false;
    const scheduleLabelUpdate = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        updateLabelSplit();
      });
    };

    window.addEventListener('scroll', scheduleLabelUpdate, { passive: true });
    window.addEventListener('resize', scheduleLabelUpdate);

    if (sections.length && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          // a longer or shorter word changes the label's height, so the
          // split has to be remeasured alongside the text swap
          labelTexts.forEach((node) => { node.textContent = entry.target.dataset.label; });
          updateLabelSplit();
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      sections.forEach((section) => observer.observe(section));
    }

    updateLabelSplit();
  }

  // Corner-menu dropdowns
  const dropdowns = document.querySelectorAll('.corner-menu .dropdown');
  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    toggle.addEventListener('click', () => {
      const wasOpen = dropdown.classList.contains('open');
      dropdowns.forEach((d) => {
        d.classList.remove('open');
        d.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        dropdown.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.corner-menu .dropdown')) {
      dropdowns.forEach((d) => {
        d.classList.remove('open');
        d.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Hamburger menu (narrow screens)
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = !mobileMenu.hasAttribute('hidden');
      if (isOpen) {
        mobileMenu.setAttribute('hidden', '');
      } else {
        mobileMenu.removeAttribute('hidden');
      }
      navToggle.setAttribute('aria-expanded', String(!isOpen));
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.setAttribute('hidden', '');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenu.hasAttribute('hidden') && !e.target.closest('.mobile-nav')) {
        mobileMenu.setAttribute('hidden', '');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---------- THE HEADER ROW NEVER WRAPS ----------
  // The menu items hold their natural width, so a header with too little
  // room overflows measurably instead of breaking onto a second line.
  // That overflow is the signal to swap in the hamburger. It's measured
  // rather than guessed at a breakpoint because the menu has different
  // room on the homepage's half-width panel than in a subpage header.
  const cornerMenu = document.querySelector('.corner-menu');

  const fitNav = () => {
    if (!cornerMenu) return;

    // Measure expanded: the question is whether the full menu *would*
    // fit, which can't be read while it's display:none. Removing the
    // class and reading scrollWidth forces that layout synchronously,
    // and the class is restored before the browser paints.
    document.body.classList.remove('nav-collapsed');
    // clientWidth 0 means the narrow-screen media query is already hiding
    // the menu; agree with it rather than reporting a bogus "it fits"
    const overflows = cornerMenu.clientWidth === 0
      || cornerMenu.scrollWidth > cornerMenu.clientWidth + 1;
    document.body.classList.toggle('nav-collapsed', overflows);

    // going back to the full menu leaves no hamburger to close
    if (!overflows && mobileMenu && !mobileMenu.hasAttribute('hidden')) {
      mobileMenu.setAttribute('hidden', '');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }
  };

  let fitPending = false;
  let lastWidth = -1;
  const scheduleFitNav = () => {
    // only width can change the answer; ignoring height keeps the
    // ResizeObserver from re-firing on the reflow fitNav itself causes
    const width = document.documentElement.clientWidth;
    if (width === lastWidth || fitPending) return;
    lastWidth = width;
    fitPending = true;
    requestAnimationFrame(() => {
      fitPending = false;
      fitNav();
    });
  };

  window.addEventListener('resize', scheduleFitNav);
  if ('ResizeObserver' in window) {
    new ResizeObserver(scheduleFitNav).observe(document.documentElement);
  }
  // webfonts land after first paint and change every label's width
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitNav);
  }
  fitNav();

  // ---------- SEND A MESSAGE: mailto hand-off ----------
  // There's no backend, so "submitting" this form means building a
  // mailto: link from the field values and navigating to it — the visitor's
  // own email client sends the actual message from their own account.
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const nameField = document.getElementById('contact-name');
    const emailField = document.getElementById('contact-email');
    const messageField = document.getElementById('contact-message');
    const statusEl = document.getElementById('contact-status');

    const showStatus = (text) => {
      statusEl.textContent = text;
      statusEl.hidden = !text;
    };

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = nameField.value.trim();
      const email = emailField.value.trim();
      const message = messageField.value.trim();

      // Email is intentionally not required: the mailto opens from the
      // visitor's own account regardless of what they type here.
      const missing = [];
      if (!name) missing.push(nameField);
      if (!message) missing.push(messageField);

      [nameField, messageField].forEach((f) => f.closest('.form-field').classList.remove('invalid'));

      if (missing.length) {
        missing.forEach((f) => f.closest('.form-field').classList.add('invalid'));
        showStatus('Please fill in your name and message before sending.');
        missing[0].focus();
        return;
      }

      showStatus('');

      const nameLine = email
        ? `My name is ${name} (${email}), and I'm reaching out through your website.`
        : `My name is ${name}, and I'm reaching out through your website.`;

      const body = [
        'Hi Meaghan,',
        '',
        nameLine,
        '',
        message,
        '',
        'Looking forward to hearing from you.',
      ].join('\n');

      const subject = 'New Message from Eagle Point Coaching Website';
      const mailto = `mailto:meaghanjanedis@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.location.href = mailto;
    });
  }
});
