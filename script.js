// ---------- SHARED NAV + FOOTER (single source of truth) ----------
// Injected into every page via the #site-nav / #site-footer placeholders,
// so a change here updates all five pages at once.

// Booking lives on the practice's own site, so the CTA leaves this domain.
const BOOKING_URL = 'https://springstderm.com/physicians/dr-olamiju/';

// Her Amazon storefront of recommended products, also off-domain.
const RECOMMENDATIONS_URL = 'https://www.amazon.com/shop/docbrianna';

// One ordered list of top-level nav entries. An entry with `items` renders
// as a dropdown; everything else is a plain link. Order here is the order
// on the page.
const NAV_ITEMS = [
  { label: 'Home', href: 'index.html' },
  { label: 'About', href: 'about.html' },
  {
    label: 'Services',
    items: [
      { text: 'Medical', href: 'medical-services.html' },
      { text: 'Cosmetic', href: 'cosmetic-services.html' },
    ],
  },
  { label: 'Features', href: 'features.html' },
  { label: 'Recommendations', href: RECOMMENDATIONS_URL, external: true },
  { label: 'Book an Appointment', href: BOOKING_URL, external: true, cta: true },
];

const LOCATIONS = [
  {
    name: 'Spring Street Dermatology Uptown',
    address: '4 W 58th St, Floor 13, New York, NY',
    hours: ['Mondays, Tuesdays 9:00 AM &ndash; 6:00 PM', 'Select Saturdays 9:00 AM &ndash; 2:00 PM'],
  },
  {
    name: 'Park Avenue',
    address: '110 East 55th Street, Floor 19, New York, NY',
    hours: ['Thursdays 9:30 AM &ndash; 6:00 PM'],
  },
];

// Marks the entry matching the page being viewed. Pages are separate files
// here rather than sections of one scrolling homepage, so this is a plain
// filename comparison — no scroll tracking involved.
function currentFile() {
  const last = window.location.pathname.split('/').pop();
  return last === '' ? 'index.html' : last;
}

function linkAttrs(item) {
  return item.external ? ' target="_blank" rel="noopener noreferrer"' : '';
}

function renderNav() {
  const here = currentFile();

  const desktopItems = NAV_ITEMS.map((entry) => {
    if (!entry.items) {
      const classes = ['nav-link'];
      if (entry.cta) classes.push('nav-cta');
      if (!entry.external && entry.href === here) classes.push('is-current');
      const current = !entry.external && entry.href === here ? ' aria-current="page"' : '';
      return `<li><a class="${classes.join(' ')}" href="${entry.href}"${linkAttrs(entry)}${current}>${entry.label}</a></li>`;
    }
    const openHere = entry.items.some((item) => item.href === here);
    return `
      <li class="nav-dropdown">
        <button class="nav-dropdown-toggle${openHere ? ' is-current' : ''}" type="button" aria-expanded="false">
          ${entry.label}
          <svg class="chev" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1 L5 5 L9 1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <ul class="nav-dropdown-panel">
          ${entry.items.map((item) => `<li><a href="${item.href}"${item.href === here ? ' aria-current="page"' : ''}>${item.text}</a></li>`).join('')}
        </ul>
      </li>
    `;
  }).join('');

  const mobileItems = NAV_ITEMS.map((entry) => {
    if (!entry.items) {
      return `<a class="mobile-menu-link" href="${entry.href}"${linkAttrs(entry)}>${entry.label}</a>`;
    }
    return `
      <h4>${entry.label}</h4>
      <ul>
        ${entry.items.map((item) => `<li><a href="${item.href}">${item.text}</a></li>`).join('')}
      </ul>
    `;
  }).join('');

  return `
    <nav class="topnav" aria-label="Primary">
      <div class="topnav-inner">
        <a class="nav-brand" href="index.html">
          <img class="nav-logo" src="images/dr-brianna-logo.webp" alt="Dr. Brianna">
        </a>

        <ul class="nav-links">
          ${desktopItems}
        </ul>

        <div class="mobile-nav">
          <button class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="mobile-menu">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </button>
          <div class="mobile-menu" id="mobile-menu" hidden>
            ${mobileItems}
          </div>
        </div>
      </div>
    </nav>
  `;
}

function renderFooter() {
  const locations = LOCATIONS.map((loc) => `
    <div class="location">
      <h4>${loc.name}</h4>
      <address>${loc.address}</address>
      <ul class="location-hours">
        ${loc.hours.map((h) => `<li>${h}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  return `
    <footer class="site-footer">
      <div class="site-footer-inner">
        <div class="footer-block">
          <h3 class="footer-heading">Visit Us</h3>
          <div class="locations">
            ${locations}
          </div>
        </div>

        <div class="footer-block">
          <h3 class="footer-heading">Keep In Touch</h3>
          <ul class="footer-contact">
            <li><a class="footer-link" href="mailto:askdocbrianna@gmail.com">askdocbrianna@gmail.com</a></li>
            <li>Office: <a class="footer-link" href="tel:+16469069614">646-906-9614</a></li>
          </ul>
        </div>

        <p class="footer-credit">Copyright &copy; 2026 Brianna Olamiju, MD. All Rights Reserved.</p>
      </div>
    </footer>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const navSlot = document.getElementById('site-nav');
  if (navSlot) navSlot.innerHTML = renderNav();

  const footerSlot = document.getElementById('site-footer');
  if (footerSlot) footerSlot.innerHTML = renderFooter();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('reduced-motion');
  }

  // ---------- Services dropdown ----------
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  const closeDropdowns = () => {
    dropdowns.forEach((d) => {
      d.classList.remove('open');
      d.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
    });
  };

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector('.nav-dropdown-toggle');
    toggle.addEventListener('click', () => {
      const wasOpen = dropdown.classList.contains('open');
      closeDropdowns();
      if (!wasOpen) {
        dropdown.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) closeDropdowns();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDropdowns();
  });

  // ---------- Hamburger (narrow screens) ----------
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

  // ---------- THE NAV ROW NEVER WRAPS ----------
  // Menu items hold their natural width, so a viewport with too little room
  // overflows measurably instead of breaking onto a second line. That
  // overflow is the signal to swap in the hamburger — measured rather than
  // guessed at a breakpoint, since the brand mark and the five entries make
  // the crossover point a function of the rendered font, not the viewport.
  const navLinks = document.querySelector('.nav-links');

  const fitNav = () => {
    if (!navLinks) return;

    // Measure expanded: the question is whether the full menu *would* fit,
    // which can't be read while it's display:none. Removing the class and
    // reading scrollWidth forces that layout synchronously, and the class
    // is restored before the browser paints.
    document.body.classList.remove('nav-collapsed');
    const inner = navLinks.closest('.topnav-inner');
    const brand = inner ? inner.querySelector('.nav-brand') : null;
    // clientWidth 0 means the narrow-screen media query is already hiding
    // the menu; agree with it rather than reporting a bogus "it fits"
    let overflows = navLinks.clientWidth === 0;
    if (!overflows && inner && brand) {
      const styles = window.getComputedStyle(inner);
      const available = inner.clientWidth
        - parseFloat(styles.paddingLeft)
        - parseFloat(styles.paddingRight)
        - brand.offsetWidth
        - parseFloat(styles.columnGap || styles.gap || 0);
      overflows = navLinks.scrollWidth > available + 1;
    }
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
});
