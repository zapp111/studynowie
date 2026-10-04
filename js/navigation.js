const PAGE_TITLES = {
  dashboard: 'Dashboard',
  'study-sessions': 'Study Sessions',
  'question-bank': 'Question Bank',
  'previous-year-papers': 'Previous Year Papers',
  progress: 'Progress',
  'completed-sessions': 'Completed Sessions',
  settings: 'Settings',
};

function getPageElements() {
  return {
    navItems: Array.from(document.querySelectorAll('.nav-item')),
    pages: Array.from(document.querySelectorAll('.page')),
    pageTitle: document.getElementById('page-title'),
    menuToggle: document.getElementById('menu-toggle'),
    sidebar: document.getElementById('sidebar'),
    backdrop: document.getElementById('sidebar-backdrop'),
    currentDate: document.getElementById('current-date'),
  };
}

function setActivePage(pageId) {
  const { navItems, pages, pageTitle } = getPageElements();

  navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });

  pages.forEach((page) => {
    page.classList.toggle('active', page.id === `${pageId}-page`);
  });

  if (pageTitle) {
    pageTitle.textContent = PAGE_TITLES[pageId] || 'Dashboard';
  }
}

function closeSidebar() {
  const { sidebar, backdrop } = getPageElements();
  document.body.classList.remove('sidebar-open');
  sidebar?.classList.remove('open');
  backdrop?.classList.remove('open');
}

function toggleSidebar() {
  const { sidebar, backdrop } = getPageElements();
  const isOpen = document.body.classList.toggle('sidebar-open');
  sidebar?.classList.toggle('open', isOpen);
  backdrop?.classList.toggle('open', isOpen);
}

export function initNavigation() {
  const { navItems, currentDate, menuToggle, backdrop } = getPageElements();

  if (currentDate) {
    currentDate.textContent = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      setActivePage(item.dataset.page);
      if (window.innerWidth <= 900) {
        closeSidebar();
      }
    });
  });

  menuToggle?.addEventListener('click', toggleSidebar);
  backdrop?.addEventListener('click', closeSidebar);

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      closeSidebar();
    }
  });

  setActivePage('dashboard');
}
