// Sample events data with online images
const events = [
    {
        id: 1,
        title: "Tech Conference 2024",
        date: "2024-06-15",
        location: "San Francisco, CA",
        price: 299,
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop",
        description: "Annual technology conference featuring AI, blockchain, and cloud computing experts",
        capacity: 500,
        registered: 350
    },
    {
        id: 2,
        title: "Music Festival",
        date: "2024-07-20",
        location: "Austin, TX",
        price: 149,
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop",
        description: "3-day music festival with international artists",
        capacity: 10000,
        registered: 8500
    },
    {
        id: 3,
        title: "Startup Workshop",
        date: "2024-05-30",
        location: "New York, NY",
        price: 99,
        image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=200&fit=crop",
        description: "Hands-on workshop for aspiring entrepreneurs",
        capacity: 100,
        registered: 65
    },
    {
        id: 4,
        title: "Art Exhibition",
        date: "2024-06-10",
        location: "Chicago, IL",
        price: 49,
        image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&h=200&fit=crop",
        description: "Contemporary art exhibition featuring local artists",
        capacity: 300,
        registered: 120
    }
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Load events
    loadEvents();
    
    // Populate event dropdown
    populateEventDropdown();
    
    // Load user registrations
    loadRegistrations();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize mobile menu
    initMobileMenu();
});

function loadEvents() {
    const container = document.getElementById('eventsContainer');
    container.innerHTML = '';
    
    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card fade-in';
        
        // Calculate available spots
        const availableSpots = event.capacity - event.registered;
        
        eventCard.innerHTML = `
            <img src="${event.image}" alt="${event.title}" class="event-image">
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <p class="event-description">${event.description}</p>
                <div class="event-date">
                    <i class="far fa-calendar"></i>
                    ${new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
                <div class="event-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${event.location}
                </div>
                <div class="event-capacity">
                    <i class="fas fa-users"></i>
                    ${availableSpots} spots remaining
                </div>
                <div class="event-price">$${event.price}</div>
                <button class="btn-register" onclick="selectEvent(${event.id})">
                    Register Now
                </button>
            </div>
        `;
        
        container.appendChild(eventCard);
    });
}

function populateEventDropdown() {
    const select = document.getElementById('eventSelect');
    select.innerHTML = '<option value="">Choose an event</option>';
    
    events.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = `${event.title} - $${event.price}`;
        select.appendChild(option);
    });
}

function selectEvent(eventId) {
    const select = document.getElementById('eventSelect');
    select.value = eventId;
    document.getElementById('register').scrollIntoView({ behavior: 'smooth' });
}

function setupEventListeners() {
    // Registration form
    const form = document.getElementById('registrationForm');
    form.addEventListener('submit', handleRegistration);
    
    // Search functionality
    const searchInput = document.getElementById('searchEvents');
    searchInput.addEventListener('input', searchEvents);
}

function handleRegistration(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        eventId: parseInt(document.getElementById('eventSelect').value),
        tickets: parseInt(document.getElementById('tickets').value),
        date: new Date().toISOString(),
        status: 'confirmed'
    };
    
    // Validate event selection
    if (!formData.eventId) {
        alert('Please select an event');
        return;
    }
    
    // Get selected event
    const selectedEvent = events.find(e => e.id === formData.eventId);
    
    // Generate registration ID
    formData.id = Date.now();
    formData.event = selectedEvent;
    
    // Save to localStorage
    saveRegistration(formData);
    
    // Show confirmation
    showConfirmation(formData);
    
    // Reset form
    form.reset();
    
    // Reload registrations
    loadRegistrations();
}

function saveRegistration(registration) {
    let registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
    registrations.push(registration);
    localStorage.setItem('eventRegistrations', JSON.stringify(registrations));
    
    // Update event registration count
    const eventIndex = events.findIndex(e => e.id === registration.eventId);
    if (eventIndex > -1) {
        events[eventIndex].registered += registration.tickets;
        loadEvents(); // Refresh events display
    }
}

function loadRegistrations() {
    const container = document.getElementById('ticketsContainer');
    const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
    
    if (registrations.length === 0) {
        container.innerHTML = `
            <div class="no-registrations">
                <i class="fas fa-ticket-alt"></i>
                <h3>No registrations yet</h3>
                <p>Register for an event to see your tickets here</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    registrations.forEach(reg => {
        const ticketCard = document.createElement('div');
        ticketCard.className = 'ticket-card fade-in';
        
        ticketCard.innerHTML = `
            <div class="ticket-info">
                <h3>${reg.event.title}</h3>
                <p><strong>Name:</strong> ${reg.name}</p>
                <p><strong>Email:</strong> ${reg.email}</p>
                <p><strong>Tickets:</strong> ${reg.tickets}</p>
                <p><strong>Registered on:</strong> ${new Date(reg.date).toLocaleDateString()}</p>
                <div class="ticket-status status-${reg.status}">
                    ${reg.status.toUpperCase()}
                </div>
            </div>
            <div class="qr-code">
                <i class="fas fa-qrcode fa-2x"></i>
            </div>
        `;
        
        container.appendChild(ticketCard);
    });
}

function showConfirmation(registration) {
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 10px; max-width: 500px; text-align: center;">
            <i class="fas fa-check-circle" style="color: var(--success); font-size: 4rem; margin-bottom: 1rem;"></i>
            <h2>Registration Successful!</h2>
            <p>You've registered for <strong>${registration.event.title}</strong></p>
            <p><strong>Registration ID:</strong> ${registration.id}</p>
            <p><strong>Tickets:</strong> ${registration.tickets}</p>
            <p>A confirmation email has been sent to ${registration.email}</p>
            <button onclick="this.closest('.confirmation-modal').remove()" 
                    style="margin-top: 2rem; background: var(--primary); color: white; border: none; padding: 10px 30px; border-radius: 5px; cursor: pointer;">
                Close
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 5000);
}

function searchEvents() {
    const searchTerm = document.getElementById('searchEvents').value.toLowerCase();
    const eventCards = document.querySelectorAll('.event-card');
    
    eventCards.forEach(card => {
        const title = card.querySelector('.event-title').textContent.toLowerCase();
        const description = card.querySelector('.event-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });
}

// Export functions for admin panel
window.loadEvents = loadEvents;
window.loadRegistrations = loadRegistrations;
