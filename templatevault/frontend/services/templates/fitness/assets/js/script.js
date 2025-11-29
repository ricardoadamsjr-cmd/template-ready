
// FitLife Pro - Interactive JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeLoadingScreen();
    initializeNavigation();
    initializeScrollAnimations();
    initializeMembershipToggle();
    initializeBookingModal();
    initializeContactForm();
    initializeScrollIndicator();
    initializeSmoothScrolling();
    
    // Set minimum date for booking
    setMinimumBookingDate();
});

// Loading Screen
function initializeLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    // Hide loading screen after page loads
    window.addEventListener('load', function() {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            // Remove from DOM after animation
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }, 1500); // Show loading for at least 1.5 seconds
    });
}

// Navigation
function initializeNavigation() {
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Update active nav link
        updateActiveNavLink();
    });
    
    // Mobile menu functionality
    window.toggleMobileMenu = function() {
        const mobileMenu = document.getElementById('mobileMenu');
        mobileMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (mobileMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        
        if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Update active navigation link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Global scroll to section function
    window.scrollToSection = function(sectionId) {
        const target = document.getElementById(sectionId);
        if (target) {
            const headerHeight = document.getElementById('header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    };
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Add scroll animation class to elements
    const animateElements = document.querySelectorAll('.trainer-card, .class-card, .membership-card, .feature-item, .contact-item');
    animateElements.forEach(el => {
        el.classList.add('scroll-animate');
        observer.observe(el);
    });
}

// Scroll Indicator
function initializeScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = aboutSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
        
        // Hide scroll indicator after scrolling
        window.addEventListener('scroll', function() {
            if (window.scrollY > 200) {
                scrollIndicator.style.opacity = '0';
            } else {
                scrollIndicator.style.opacity = '1';
            }
        });
    }
}

// Membership Toggle
function initializeMembershipToggle() {
    window.toggleMembershipPricing = function() {
        const toggle = document.getElementById('membershipToggle');
        const priceAmounts = document.querySelectorAll('.price-amount');
        
        priceAmounts.forEach(amount => {
            const monthlyPrice = amount.getAttribute('data-monthly');
            const yearlyPrice = amount.getAttribute('data-yearly');
            
            if (toggle.checked) {
                amount.textContent = `$${yearlyPrice}`;
            } else {
                amount.textContent = `$${monthlyPrice}`;
            }
        });
    };
}

// Membership Selection
window.selectMembership = function(plan) {
    const membershipData = {
        basic: {
            name: 'Basic Membership',
            service: 'membership',
            notes: 'Interested in Basic membership plan'
        },
        premium: {
            name: 'Premium Membership',
            service: 'membership',
            notes: 'Interested in Premium membership plan'
        },
        elite: {
            name: 'Elite Membership',
            service: 'membership',
            notes: 'Interested in Elite membership plan'
        }
    };
    
    const data = membershipData[plan];
    if (data) {
        openBookingModal();
        
        // Pre-fill form with membership data
        setTimeout(() => {
            const serviceSelect = document.getElementById('bookingService');
            const notesTextarea = document.getElementById('bookingNotes');
            const titleElement = document.getElementById('bookingTitle');
            const subtitleElement = document.getElementById('bookingSubtitle');
            
            if (serviceSelect) {
                // Add membership option if it doesn't exist
                let membershipOption = serviceSelect.querySelector('option[value="membership"]');
                if (!membershipOption) {
                    membershipOption = document.createElement('option');
                    membershipOption.value = 'membership';
                    membershipOption.textContent = 'Membership Consultation';
                    serviceSelect.appendChild(membershipOption);
                }
                serviceSelect.value = 'membership';
            }
            
            if (notesTextarea) {
                notesTextarea.value = data.notes;
            }
            
            if (titleElement) {
                titleElement.textContent = `Book ${data.name}`;
            }
            
            if (subtitleElement) {
                subtitleElement.textContent = 'Schedule a consultation to get started';
            }
        }, 100);
    }
};

// Booking Modal
function initializeBookingModal() {
    const modal = document.getElementById('bookingModal');
    
    // Global functions for modal control
    window.openBookingModal = function(trainer = null, service = null) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Pre-fill trainer if specified
        if (trainer) {
            setTimeout(() => {
                const trainerSelect = document.getElementById('bookingTrainer');
                if (trainerSelect) {
                    trainerSelect.value = trainer;
                }
            }, 100);
        }
        
        // Pre-fill service if specified
        if (service) {
            setTimeout(() => {
                const serviceSelect = document.getElementById('bookingService');
                if (serviceSelect) {
                    serviceSelect.value = service;
                }
            }, 100);
        }
        
        // Update modal title based on context
        updateBookingModalTitle(trainer, service);
    };
    
    window.closeBookingModal = function() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form
        const form = modal.querySelector('.booking-form');
        if (form) {
            form.reset();
        }
        
        // Reset modal title
        const titleElement = document.getElementById('bookingTitle');
        const subtitleElement = document.getElementById('bookingSubtitle');
        if (titleElement) titleElement.textContent = 'Book Your Session';
        if (subtitleElement) subtitleElement.textContent = 'Choose your preferred time and trainer';
    };
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeBookingModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeBookingModal();
        }
    });
}

// Update booking modal title based on context
function updateBookingModalTitle(trainer, service) {
    const titleElement = document.getElementById('bookingTitle');
    const subtitleElement = document.getElementById('bookingSubtitle');
    
    const trainerNames = {
        sarah: 'Sarah Johnson',
        mike: 'Mike Rodriguez',
        emma: 'Emma Chen',
        david: 'David Thompson'
    };
    
    const serviceNames = {
        hiit: 'HIIT Training Class',
        strength: 'Strength Training Class',
        yoga: 'Yoga Flow Class',
        crossfit: 'CrossFit WOD Class'
    };
    
    if (trainer && trainerNames[trainer]) {
        titleElement.textContent = `Book with ${trainerNames[trainer]}`;
        subtitleElement.textContent = 'Schedule your personal training session';
    } else if (service && serviceNames[service]) {
        titleElement.textContent = `Join ${serviceNames[service]}`;
        subtitleElement.textContent = 'Reserve your spot in this group class';
    }
}

// Set minimum booking date to today
function setMinimumBookingDate() {
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const minDate = tomorrow.toISOString().split('T')[0];
        dateInput.setAttribute('min', minDate);
        dateInput.value = minDate;
    }
}

// Booking Form Submission
window.submitBooking = function(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const bookingData = Object.fromEntries(formData.entries());
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'service', 'date', 'time'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);
    
    if (missingFields.length > 0) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Simulate booking submission
    const submitButton = form.querySelector('.booking-submit');
    const originalText = submitButton.innerHTML;
    
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
    submitButton.disabled = true;
    
    setTimeout(() => {
        // Simulate successful booking
        console.log('Booking submitted:', bookingData);
        
        showToast('Booking request submitted successfully! We\'ll contact you soon to confirm.', 'success');
        closeBookingModal();
        
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // Send confirmation email (simulated)
        sendBookingConfirmation(bookingData);
        
    }, 2000);
};

// Send booking confirmation (simulated)
function sendBookingConfirmation(bookingData) {
    // In a real application, this would send an actual email
    console.log('Sending confirmation email to:', bookingData.email);
    console.log('Booking details:', {
        name: bookingData.name,
        service: bookingData.service,
        trainer: bookingData.trainer || 'Any available',
        date: bookingData.date,
        time: bookingData.time,
        notes: bookingData.notes || 'None'
    });
}

// Contact Form
function initializeContactForm() {
    window.submitContactForm = function(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const contactData = Object.fromEntries(formData.entries());
        
        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'interest', 'message'];
        const missingFields = requiredFields.filter(field => !contactData[field]);
        
        if (missingFields.length > 0) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactData.email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate form submission
        const submitButton = form.querySelector('.form-submit');
        const originalText = submitButton.innerHTML;
        
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            // Simulate successful submission
            console.log('Contact form submitted:', contactData);
            
            showToast('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
            form.reset();
            
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
        }, 2000);
    };
}

// Toast Notification System
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = toast.querySelector('i');
    
    // Set message
    toastMessage.textContent = message;
    
    // Set icon and color based on type
    toast.className = 'toast';
    if (type === 'success') {
        toast.style.background = 'var(--success)';
        toastIcon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        toast.style.background = 'var(--danger)';
        toastIcon.className = 'fas fa-exclamation-circle';
    } else if (type === 'warning') {
        toast.style.background = 'var(--warning)';
        toastIcon.className = 'fas fa-exclamation-triangle';
    } else if (type === 'info') {
        toast.style.background = 'var(--info)';
        toastIcon.className = 'fas fa-info-circle';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// Utility Functions
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

// Performance optimized scroll handler
const optimizedScrollHandler = debounce(function() {
    updateActiveNavLink();
}, 10);

window.addEventListener('scroll', optimizedScrollHandler);

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading if needed
// initializeLazyLoading();

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Tab navigation enhancement
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// Accessibility improvements
function initializeAccessibility() {
    // Add skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.focus();
                target.scrollIntoView();
            }
        });
    }
    
    // Announce page changes to screen readers
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
    
    window.announceToScreenReader = function(message) {
        announcer.textContent = message;
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    };
}

// Initialize accessibility features
initializeAccessibility();

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Service Worker registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment to register service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}

// Analytics tracking (placeholder)
function trackEvent(category, action, label = null) {
    // Placeholder for analytics tracking
    console.log('Analytics Event:', { category, action, label });
    
    // Example: Google Analytics 4
    // gtag('event', action, {
    //     event_category: category,
    //     event_label: label
    // });
}

// Track important user interactions
document.addEventListener('click', function(e) {
    const target = e.target.closest('button, a');
    if (!target) return;
    
    // Track CTA button clicks
    if (target.classList.contains('cta-button') || target.classList.contains('btn-primary')) {
        trackEvent('engagement', 'cta_click', target.textContent.trim());
    }
    
    // Track trainer bookings
    if (target.classList.contains('trainer-book-btn')) {
        const trainerCard = target.closest('.trainer-card');
        const trainerName = trainerCard?.querySelector('.trainer-name')?.textContent;
        trackEvent('booking', 'trainer_book_click', trainerName);
    }
    
    // Track class bookings
    if (target.classList.contains('class-book-btn')) {
        const classCard = target.closest('.class-card');
        const className = classCard?.querySelector('.class-name')?.textContent;
        trackEvent('booking', 'class_book_click', className);
    }
    
    // Track membership selections
    if (target.classList.contains('membership-btn')) {
        const membershipCard = target.closest('.membership-card');
        const membershipName = membershipCard?.querySelector('.membership-name')?.textContent;
        trackEvent('conversion', 'membership_select', membershipName);
    }
});

// Performance monitoring
function measurePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                
                console.log('Page load time:', loadTime + 'ms');
                trackEvent('performance', 'page_load_time', Math.round(loadTime));
            }, 0);
        });
    }
}

measurePerformance();

// Initialize all features when DOM is ready
console.log('FitLife Pro website initialized successfully!');
