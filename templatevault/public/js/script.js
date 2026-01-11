// Global variables
let currentFilter = 'all';
let isYearlyPricing = false;
let favorites = JSON.parse(localStorage.getItem('templateFavorites')) || [];

// Template data
const templates = {
    saas: {
        icon: 'fas fa-rocket',
        title: 'TechFlow Pro - SaaS Template',
        description: 'A modern, conversion-focused template designed specifically for SaaS companies and tech startups. Features clean design, pricing tables, feature showcases, and customer testimonials.',
        features: [
            { icon: 'fas fa-mobile-alt', title: 'Responsive Design', desc: 'Looks perfect on all devices and screen sizes' },
            { icon: 'fas fa-chart-line', title: 'Conversion Optimized', desc: 'Built to turn visitors into paying customers' },
            { icon: 'fas fa-palette', title: 'Easy Customization', desc: 'Change colors, fonts, and content with ease' },
            { icon: 'fas fa-search', title: 'SEO Ready', desc: 'Optimized for search engines out of the box' }
        ]
    },
    ecommerce: {
        icon: 'fas fa-shopping-cart',
        title: 'ShopVibe - E-commerce Template',
        description: 'Stunning e-commerce template with product showcases, shopping cart integration, and mobile-optimized checkout process. Perfect for online stores and retail businesses.',
        features: [
            { icon: 'fas fa-credit-card', title: 'Payment Integration', desc: 'Multiple payment gateways supported' },
            { icon: 'fas fa-boxes', title: 'Product Management', desc: 'Easy inventory and catalog management' },
            { icon: 'fas fa-star', title: 'Review System', desc: 'Built-in customer review functionality' },
            { icon: 'fas fa-truck', title: 'Shipping Options', desc: 'Flexible shipping and delivery settings' }
        ]
    },
    agency: {
        icon: 'fas fa-briefcase',
        title: 'CreativeHub - Agency Template',
        description: 'Showcase your work with this portfolio template featuring smooth animations, project galleries, and client testimonials. Ideal for creative agencies and freelancers.',
        features: [
            { icon: 'fas fa-images', title: 'Portfolio Gallery', desc: 'Beautiful project showcase layouts' },
            { icon: 'fas fa-play', title: 'Video Integration', desc: 'Embed videos and interactive media' },
            { icon: 'fas fa-users', title: 'Team Profiles', desc: 'Highlight your team members' },
            { icon: 'fas fa-envelope', title: 'Contact Forms', desc: 'Advanced contact and quote forms' }
        ]
    },
    restaurant: {
        icon: 'fas fa-utensils',
        title: 'FoodieDelight - Restaurant Template',
        description: 'Appetizing design for restaurants and food businesses with menu displays, online ordering integration, and reservation systems.',
        features: [
            { icon: 'fas fa-list', title: 'Digital Menu', desc: 'Interactive menu with categories and pricing' },
            { icon: 'fas fa-calendar', title: 'Reservations', desc: 'Online table booking system' },
            { icon: 'fas fa-map-marker-alt', title: 'Location Info', desc: 'Maps and contact information' },
            { icon: 'fas fa-clock', title: 'Hours Display', desc: 'Operating hours and special events' }
        ]
    },
    fitness: {
        icon: 'fas fa-dumbbell',
        title: 'FitLife Pro - Fitness Template',
        description: 'Energetic template for gyms, trainers, and wellness businesses with class schedules, membership options, and trainer profiles.',
        features: [
            { icon: 'fas fa-calendar-alt', title: 'Class Schedules', desc: 'Interactive class timetables' },
            { icon: 'fas fa-id-card', title: 'Membership Plans', desc: 'Flexible pricing and packages' },
            { icon: 'fas fa-user-friends', title: 'Trainer Profiles', desc: 'Showcase your fitness experts' },
            { icon: 'fas fa-chart-bar', title: 'Progress Tracking', desc: 'Member progress and achievements' }
        ]
    },
    consulting: {
        icon: 'fas fa-user-tie',
        title: 'ConsultPro - Business Template',
        description: 'Professional template for consultants and business services with testimonials, service showcases, and client case studies.',
        features: [
            { icon: 'fas fa-handshake', title: 'Client Testimonials', desc: 'Showcase client success stories' },
            { icon: 'fas fa-chart-pie', title: 'Service Packages', desc: 'Clear service offerings and pricing' },
            { icon: 'fas fa-certificate', title: 'Credentials', desc: 'Display certifications and awards' },
            { icon: 'fas fa-phone', title: 'Consultation Booking', desc: 'Easy appointment scheduling' }
        ]
    }
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Initialize website
function initializeWebsite() {
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 1500);

    // Initialize scroll effects
    initializeScrollEffects();
    
    // Initialize template filtering
    initializeTemplateFiltering();
    
    // Initialize favorites
    initializeFavorites();
    
    // Initialize form handling
    initializeFormHandling();
    
    // Initialize parallax effects
    initializeParallaxEffects();
    
    // Initialize AOS (Animate On Scroll) alternative
    initializeScrollAnimations();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize mobile menu
    initializeMobileMenu();
}

// Scroll effects
function initializeScrollEffects() {
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Fade in animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// Template filtering
function initializeTemplateFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const templateCards = document.querySelectorAll('.template-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter templates
            filterTemplates(filter);
        });
    });
}

function filterTemplates(filter) {
    const templateCards = document.querySelectorAll('.template-card');
    
    templateCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
            card.classList.remove('hidden');
            // Add stagger animation
            setTimeout(() => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.opacity = '1';
            }, Math.random() * 200);
        } else {
            card.classList.add('hidden');
        }
    });
    
    currentFilter = filter;
}

// Favorites functionality
function initializeFavorites() {
    updateFavoriteButtons();
}
/*
function toggleFavorite(button) {
    const templateCard = button.closest('.template-card');
    const templateTitle = templateCard.querySelector('.template-title').textContent;
    const icon = button.querySelector('i');
    
    if (favorites.includes(templateTitle)) {
        // Remove from favorites
        favorites = favorites.filter(fav => fav !== templateTitle);
        icon.className = 'far fa-heart';
        button.classList.remove('active');
        showToast('Removed from favorites');
    } else {
        // Add to favorites
        favorites.push(templateTitle);
        icon.className = 'fas fa-heart';
        button.classList.add('active');
        showToast('Added to favorites');
    }
    
    // Save to localStorage
    localStorage.setItem('templateFavorites', JSON.stringify(favorites));
}

function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(button => {
        const templateCard = button.closest('.template-card');
        const templateTitle = templateCard.querySelector('.template-title').textContent;
        const icon = button.querySelector('i');
        
        if (favorites.includes(templateTitle)) {
            icon.className = 'fas fa-heart';
            button.classList.add('active');
        }
    });
}
*/
// Form handling
function initializeFormHandling() {
    // Contact form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', submitContactForm);
    }
}

function submitContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Simulate form submission
    showToast('Message sent successfully!');
    
    // Reset form
    event.target.reset();
    
    // In a real application, you would send this data to your server
    console.log('Contact form data:', data);
}

// Parallax effects
function initializeParallaxEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelectorAll('.floating-element');
        const speed = 0.5;

        parallax.forEach(element => {
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// Scroll animations (AOS alternative)
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animationType = element.getAttribute('data-aos');
                const delay = element.getAttribute('data-aos-delay') || 0;
                
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, delay);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        animationObserver.observe(el);
    });
}

// Smooth scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Mobile menu
function initializeMobileMenu() {
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const mobileMenu = document.getElementById('mobileMenuOverlay');
        const toggle = document.querySelector('.mobile-menu-toggle');
        
        if (!mobileMenu.contains(e.target) && !toggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

function openMobileMenu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Demo modal functions
function openDemoModal() {
    const modal = document.getElementById('demoModal');
    const modalTitle = document.getElementById('demoModalTitle');
    const modalSubtitle = document.getElementById('demoModalSubtitle');
    const modalBody = document.getElementById('demoModalBody');
    
    modalTitle.textContent = 'TemplateVault Demo';
    modalSubtitle.textContent = 'See how our templates work';
    
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 0;">
            <div style="width: 100px; height: 100px; background: var(--gradient-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0; font-size: 2.5rem; color: white;">
                <i class="fas fa-play"></i>
            </div>
            <h3 style="margin-bottom: 1rem; color: var(--text-dark);">Interactive Template Demos</h3>
            <p style="color: var(--text-light); line-height: 1.6; margin-bottom: 2rem;">
                Experience our templates in action with live, interactive demos. See exactly how your website will look and function before you subscribe.
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem;">
                <div style="padding: 0; background: #f8f9ff; border-radius: 10px; text-align: center;">
                    <i class="fas fa-rocket" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 0.5rem;"></i>
                    <h4>SaaS Templates</h4>
                    <p style="font-size: 0.9rem; color: var(--text-light);">Conversion-focused designs</p>
                </div>
                <div style="padding: 0; background: #f8f9ff; border-radius: 10px; text-align: center;">
                    <i class="fas fa-shopping-cart" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 0.5rem;"></i>
                    <h4>E-commerce</h4>
                    <p style="font-size: 0.9rem; color: var(--text-light);">Complete online stores</p>
                </div>
                <div style="padding: 0; background: #f8f9ff; border-radius: 10px; text-align: center;">
                    <i class="fas fa-briefcase" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 0.5rem;"></i>
                    <h4>Agency</h4>
                    <p style="font-size: 0.9rem; color: var(--text-light);">Portfolio showcases</p>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openTemplateDemo(templateType, templateName) {
    const modal = document.getElementById('demoModal');
    const modalTitle = document.getElementById('demoModalTitle');
    const modalSubtitle = document.getElementById('demoModalSubtitle');
    const modalBody = document.getElementById('demoModalBody');
    
    const template = templates[templateType];
    
    modalTitle.textContent = templateName;
    modalSubtitle.textContent = 'Interactive Template Demo';
    
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 0;">
            <div style="width: 80px; height: 80px; background: var(--gradient-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0; font-size: 2rem; color: white;">
                <i class="${template.icon}"></i>
            </div>
            <h3 style="margin-bottom: 1rem; color: var(--text-dark);">${template.title}</h3>
            <p style="color: var(--text-light); line-height: 1.6; margin-bottom: 2rem;">
                ${template.description}
            </p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem;">
                ${template.features.map(feature => `
                    <div style="padding: 0; background: #f8f9ff; border-radius: 10px; text-align: center;">
                        <i class="${feature.icon}" style="font-size: 1.5rem; color: var(--primary-color); margin-bottom: 0.5rem;"></i>
                        <h4 style="margin-bottom: 0.5rem; font-size: 1rem;">${feature.title}</h4>
                        <p style="font-size: 0.9rem; color: var(--text-light);">${feature.desc}</p>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 2rem; padding: 0; background: linear-gradient(135deg, #f8f9ff 0%, #fff5f0 100%); border-radius: 15px;">
                <h4 style="color: var(--text-dark); margin-bottom: 1rem;">What's Included:</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; text-align: left;">
                    <div><i class="fas fa-check" style="color: var(--primary-color); margin-right: 0.5rem;"></i> HTML/CSS Files</div>
                    <div><i class="fas fa-check" style="color: var(--primary-color); margin-right: 0.5rem;"></i> JavaScript Components</div>
                    <div><i class="fas fa-check" style="color: var(--primary-color); margin-right: 0.5rem;"></i> Documentation</div>
                    <div><i class="fas fa-check" style="color: var(--primary-color); margin-right: 0.5rem;"></i> Support</div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDemoModal() {
    const modal = document.getElementById('demoModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Pricing toggle
function togglePricing() {
    const toggle = document.getElementById('pricingToggle');
    const priceAmount = document.getElementById('priceAmount');
    const pricePeriod = document.getElementById('pricePeriod');
    
    isYearlyPricing = toggle.checked;
    
    if (isYearlyPricing) {
        priceAmount.textContent = '$23';
        pricePeriod.textContent = 'per month, billed yearly';
    } else {
        priceAmount.textContent = '$29';
        pricePeriod.textContent = 'per month, billed monthly';
    }
}

// Subscription function
function startSubscription() {
    showToast('🎉 Starting your free trial! Redirecting to checkout...');
    
    // Simulate subscription process
    setTimeout(() => {
        const subscriptionData = {
            plan: isYearlyPricing ? 'yearly' : 'monthly',
            price: isYearlyPricing ? 23 : 29,
            timestamp: new Date().toISOString()
        };
        
        console.log('Subscription data:', subscriptionData);
        
        // In a real application, you would redirect to your payment processor
        showToast('Demo mode: In production, this would redirect to secure checkout');
    }, 2000);
}

// Toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Interactive hover effects
document.addEventListener('DOMContentLoaded', function() {
    // Feature cards hover effect
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Template cards advanced hover
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            const preview = this.querySelector('.template-preview-bg');
            if (preview) {
                preview.style.transform = 'scale(1.05)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const preview = this.querySelector('.template-preview-bg');
            if (preview) {
                preview.style.transform = 'scale(1)';
            }
        });
    });
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Close modal with Escape key
    if (e.key === 'Escape') {
        closeDemoModal();
        closeMobileMenu();
    }
    
    // Navigate templates with arrow keys
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const activeFilter = document.querySelector('.filter-btn.active');
        const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
        const currentIndex = filterButtons.indexOf(activeFilter);
        
        let newIndex;
        if (e.key === 'ArrowLeft') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : filterButtons.length - 1;
        } else {
            newIndex = currentIndex < filterButtons.length - 1 ? currentIndex + 1 : 0;
        }
        
        filterButtons[newIndex].click();
    }
});

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll handler
const optimizedScrollHandler = debounce(() => {
    // Scroll-based animations and effects
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    // Parallax effect for floating elements
    document.querySelectorAll('.floating-element').forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
}, 10);

window.addEventListener('scroll', optimizedScrollHandler);

// Lazy loading for images (if any are added)
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
initializeLazyLoading();

// Service Worker registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Analytics tracking (placeholder)
function trackEvent(eventName, eventData) {
    // In a real application, you would send this to your analytics service
    console.log('Analytics Event:', eventName, eventData);
}

// Track user interactions
document.addEventListener('click', function(e) {
    if (e.target.matches('.demo-button')) {
        trackEvent('template_demo_viewed', {
            template: e.target.closest('.template-card').querySelector('.template-title').textContent
        });
    }
    
    if (e.target.matches('.favorite-btn')) {
        trackEvent('template_favorited', {
            template: e.target.closest('.template-card').querySelector('.template-title').textContent
        });
    }
    
    if (e.target.matches('.pricing-button')) {
        trackEvent('subscription_started', {
            plan: isYearlyPricing ? 'yearly' : 'monthly'
        });
    }
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Unhandled promise rejection handling
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    // In production, you might want to send this to an error tracking service
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        filterTemplates,
        toggleFavorite,
        showToast,
        startSubscription
    };
}