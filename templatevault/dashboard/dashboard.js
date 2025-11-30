
        // Template data

        const firebaseConfig = {
  apiKey: "AIzaSyBhsMRHyuWF-R9MyRKKjzGQC0p-eznYILE",
  authDomain: "uplift-local.firebaseapp.com",
  projectId: "uplift-local",
  storageBucket: "uplift-local.firebasestorage.app",
  messagingSenderId: "615612260052",
  appId: "1:615612260052:web:c7cac371c0698314e36541"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// Grab DOM elements
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

// Check if user is logged in
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    userEmail.textContent = `Logged in as: ${user.email}`;
  } else {
    // No user → redirect to login
    window.location.href = "login.html";
  }
});

// Handle logout
logoutBtn.addEventListener('click', () => {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  }).catch((error) => {
    console.error("Logout error:", error);
  });
});




 
        // Template data
        const templates = [
            {
                id: 1,
                title: "Corporate Pro",
                description: "Professional business template with modern design and responsive layout",
                category: "business",
                tags: ["Corporate", "Professional", "Responsive"],
                downloads: 1250,
                rating: 4.8,
                icon: "fas fa-building"
            },
            {
                id: 2,
                title: "Creative Portfolio",
                description: "Stunning portfolio template for designers and creative professionals",
                category: "portfolio",
                tags: ["Creative", "Portfolio", "Modern"],
                downloads: 890,
                rating: 4.9,
                icon: "fas fa-palette"
            },
            {
                id: 3,
                title: "E-Shop Master",
                description: "Complete e-commerce solution with shopping cart and payment integration",
                category: "ecommerce",
                tags: ["E-commerce", "Shopping", "Payment"],
                downloads: 2100,
                rating: 4.7,
                icon: "fas fa-shopping-cart"
            },
            {
                id: 4,
                title: "Blog Central",
                description: "Clean and minimal blog template with SEO optimization",
                category: "blog",
                tags: ["Blog", "SEO", "Minimal"],
                downloads: 750,
                rating: 4.6,
                icon: "fas fa-blog"
            },
            {
                id: 5,
                title: "Landing Master",
                description: "High-converting landing page template with call-to-action focus",
                category: "landing",
                tags: ["Landing", "Conversion", "CTA"],
                downloads: 1680,
                rating: 4.8,
                icon: "fas fa-rocket"
            },
            {
                id: 6,
                title: "Tech Startup",
                description: "Modern startup template with innovative design elements",
                category: "business",
                tags: ["Startup", "Tech", "Innovation"],
                downloads: 920,
                rating: 4.7,
                icon: "fas fa-lightbulb"
            },
            {
                id: 7,
                title: "Artist Showcase",
                description: "Beautiful gallery template for artists and photographers",
                category: "portfolio",
                tags: ["Gallery", "Art", "Photography"],
                downloads: 650,
                rating: 4.9,
                icon: "fas fa-camera"
            },
            {
                id: 8,
                title: "Fashion Store",
                description: "Elegant e-commerce template for fashion and lifestyle brands",
                category: "ecommerce",
                tags: ["Fashion", "Lifestyle", "Elegant"],
                downloads: 1450,
                rating: 4.8,
                icon: "fas fa-tshirt"
            },
            {
                id: 9,
                title: "News Hub",
                description: "Professional news and magazine template with article management",
                category: "blog",
                tags: ["News", "Magazine", "Articles"],
                downloads: 580,
                rating: 4.5,
                icon: "fas fa-newspaper"
            },
            {
                id: 10,
                title: "App Landing",
                description: "Mobile app landing page with app store integration",
                category: "landing",
                tags: ["App", "Mobile", "Download"],
                downloads: 1320,
                rating: 4.7,
                icon: "fas fa-mobile-alt"
            },
            {
                id: 11,
                title: "Restaurant Deluxe",
                description: "Appetizing restaurant template with menu and reservation system",
                category: "business",
                tags: ["Restaurant", "Menu", "Booking"],
                downloads: 890,
                rating: 4.6,
                icon: "fas fa-utensils"
            },
            {
                id: 12,
                title: "Freelancer Pro",
                description: "Personal branding template for freelancers and consultants",
                category: "portfolio",
                tags: ["Freelancer", "Personal", "Branding"],
                downloads: 720,
                rating: 4.8,
                icon: "fas fa-user-tie"
            }
        ];

        // Generate background particles
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = 50;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
                particlesContainer.appendChild(particle);
            }
        }

        // Generate template cards
        function generateTemplateCard(template) {
            return `
                <div class="template-card" data-category="${template.category}">
                    <div class="card-image">
                        <i class="${template.icon}"></i>
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${template.title}</h3>
                        <p class="card-description">${template.description}</p>
                        <div class="card-tags">
                            ${template.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <div class="card-footer">
                            <a href="#" class="download-btn" onclick="downloadTemplate(${template.id})">
                                <i class="fas fa-download"></i>
                                Download
                            </a>
                            <div class="card-stats">
                                <div class="stat">
                                    <i class="fas fa-download"></i>
                                    <span>${template.downloads}</span>
                                </div>
                                <div class="stat">
                                    <i class="fas fa-star"></i>
                                    <span>${template.rating}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Render templates
        function renderTemplates(templatesToRender = templates) {
            const grid = document.getElementById('templateGrid');
            grid.innerHTML = templatesToRender.map(generateTemplateCard).join('');
        }

        // Filter templates by category
        function filterTemplates(category) {
            const filtered = category === 'all' ? templates : templates.filter(t => t.category === category);
            renderTemplates(filtered);
        }

        // Search functionality
        function searchTemplates(query) {
            const filtered = templates.filter(template => 
                template.title.toLowerCase().includes(query.toLowerCase()) ||
                template.description.toLowerCase().includes(query.toLowerCase()) ||
                template.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
            );
            renderTemplates(filtered);
        }

        // Download template function
        function downloadTemplate(templateId) {
            const template = templates.find(t => t.id === templateId);
            if (template) {
                // Show loading
                const loading = document.getElementById('loading');
                loading.style.display = 'block';
                
                // Simulate download process
                setTimeout(() => {
                    loading.style.display = 'none';
                    alert(`Downloading ${template.title}...`);
                    // In a real application, this would trigger the actual download
                }, 1500);
            }
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            // Create particles
            createParticles();
            
            // Render initial templates
            renderTemplates();

            // Navigation tabs
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Update active tab
                    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Filter templates
                    const category = this.getAttribute('data-category');
                    filterTemplates(category);
                });
            });

            // Search functionality
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', function() {
                const query = this.value.trim();
                if (query) {
                    searchTemplates(query);
                } else {
                    const activeCategory = document.querySelector('.nav-tab.active').getAttribute('data-category');
                    filterTemplates(activeCategory);
                }
            });
        });

        // Smooth scroll for better UX
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
