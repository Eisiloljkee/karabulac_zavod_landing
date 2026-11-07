import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import './styles.css';
import './typography-review.css';

document.documentElement.classList.add('js');

const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const progress = document.querySelector('[data-progress]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mapContainer = document.querySelector('[data-map-container]');
const mapFrame = document.querySelector('[data-map-frame]');
const mapToggle = document.querySelector('[data-map-toggle]');
const mapToggleLabel = document.querySelector('[data-map-toggle-label]');

function setMapActive(isActive) {
  mapContainer.classList.toggle('is-active', isActive);
  mapFrame.tabIndex = isActive ? 0 : -1;
  mapToggle.setAttribute('aria-pressed', String(isActive));
  mapToggle.setAttribute('aria-label', isActive ? 'Вернуть прокрутку страницы' : 'Активировать интерактивную карту');
  mapToggleLabel.textContent = isActive ? 'Вернуть прокрутку страницы' : 'Активировать карту';
}

setMapActive(false);
mapToggle.addEventListener('click', () => {
  setMapActive(!mapContainer.classList.contains('is-active'));
});

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
  menu.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}

function toggleMenu() {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
  menu.classList.toggle('is-open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
}

menuToggle.addEventListener('click', toggleMenu);
menu.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
    setMapActive(false);
  }
});

document.addEventListener('click', (event) => {
  if (menu.classList.contains('is-open') && !event.target.closest('.header-inner')) closeMenu();
  if (mapContainer.classList.contains('is-active') && !event.target.closest('[data-map-container]')) {
    setMapActive(false);
  }
});

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle('is-scrolled', scrollTop > 16);
  progress.style.transform = `scaleX(${scrollRange > 0 ? scrollTop / scrollRange : 0})`;
}

window.addEventListener('scroll', updateScrollUI, { passive: true });
window.addEventListener('resize', () => {
  updateScrollUI();
  if (window.innerWidth >= 1024) closeMenu();
});
updateScrollUI();

if ('IntersectionObserver' in window) {
  const mapObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) setMapActive(false);
  });
  mapObserver.observe(mapContainer);
}

const revealElements = document.querySelectorAll('[data-reveal]');

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

const sectionLinks = [...document.querySelectorAll('[data-nav-link]')];
const linkedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (!visibleEntry) return;
      sectionLinks.forEach((link) => {
        const isCurrent = link.getAttribute('href') === `#${visibleEntry.target.id}`;
        link.classList.toggle('is-current', isCurrent);
        if (isCurrent) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    },
    { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.1, 0.25] },
  );

  linkedSections.forEach((section) => sectionObserver.observe(section));
}

const filterButtons = document.querySelectorAll('[data-filter]');
const productCards = document.querySelectorAll('[data-category]');
const filterStatus = document.querySelector('[data-filter-status]');
const filterNames = {
  all: 'вся продукция',
  preserves: 'консервы и соусы',
  juices: 'соки',
};

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedFilter = button.dataset.filter;
    let visibleCount = 0;

    filterButtons.forEach((filterButton) => {
      const isSelected = filterButton === button;
      filterButton.classList.toggle('is-active', isSelected);
      filterButton.setAttribute('aria-pressed', String(isSelected));
    });

    productCards.forEach((card) => {
      const isVisible = selectedFilter === 'all' || card.dataset.category === selectedFilter;
      card.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
        card.classList.add('is-visible');
      }
    });

    filterStatus.textContent = `Показано: ${filterNames[selectedFilter]}, ${visibleCount} позиций.`;
  });
});
