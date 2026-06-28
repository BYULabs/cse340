export function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMobileMenu = document.getElementById('closeMobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');

    // Sticky Scroll Effect
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('nav-scrolled');
            } else {
                navbar.classList.remove('nav-scrolled');
            }
        });
    }

    // Mobile Drawer Actions
    function openMenu() {
        mobileMenu.classList.add('active');
        mobileOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    if (mobileMenuBtn && mobileMenu && closeMobileMenu && mobileOverlay) {
        mobileMenuBtn.addEventListener('click', openMenu);
        closeMobileMenu.addEventListener('click', closeMenu);
        mobileOverlay.addEventListener('click', closeMenu);

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    // Dropdown Interactions
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger, .lang-trigger');
        if (trigger) {
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.active').forEach(openDropdown => {
                openDropdown.classList.remove('active');
            });
        }
    });
}