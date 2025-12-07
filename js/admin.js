document.addEventListener('DOMContentLoaded', function() {
    loadAdminData();
    setupAdminEventListeners();
    
    // Navigation
    const navLinks = document.querySelectorAll('.admin-nav a');
    const sections = document.querySelectorAll('section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.style.display = section.id === targetId ? 'block' : 'none';
            });
        });
    });
});

function loadAdminData() {
    updateDashboardStats();
    loadRegistrationsTable();
    loadAdminEvents();
}

function updateDashboardStats() {
    const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
    
    // Total registrations
    document.getElementById('totalRegistrations').textContent = registrations.length;
    
    // Active events
    document.getElementById('activeEvents').textContent = window.events ? window.events.length : 0;
    
    // Total revenue
    let revenue = 0;
    registrations.forEach(reg => {
        if (reg.event && reg.event.price) {
            revenue += reg.tickets * reg.event.price;
        }
    });
    document.getElementById('totalRevenue').textContent = `$${revenue}`;
    
    // Attendance rate (assuming all confirmed registrations attend)
    const confirmedRegs = registrations.filter(r => r.status === 'confirmed').length;
    const attendanceRate = registrations.length > 0 ? 
        Math.round((confirmedRegs / registrations.length) * 100) : 0;
    document.getElementById('attendanceRate').textContent = `${attendanceRate}%`;
}

function loadRegistrationsTable() {
    const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
    const tbody = document.querySelector('#registrationsTable tbody');
    
    if (registrations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-inbox"></i>
                    <p>No registrations found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    // Show only recent registrations (last 10)
    const recentRegs = registrations.slice(-10).reverse();
    
    recentRegs.forEach(reg => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${reg.id}</td>
            <td>${reg.name}</td>
            <td>${reg.event ? reg.event.title : 'N/A'}</td>
            <td>${reg.tickets}</td>
            <td>${new Date(reg.date).toLocaleDateString()}</td>
            <td>
                <span class="status-badge status-${reg.status}">
                    ${reg.status}
                </span>
            </td>
            <td>
                <button class="btn-action btn-edit" onclick="editRegistration(${reg.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteRegistration(${reg.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function loadAdminEvents() {
    const container = document.getElementById('adminEventsContainer');
    
    if (!window.events || window.events.length === 0) {
        container.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-times"></i>
                <p>No events added yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    window.events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-admin-card';
        
        const filledPercentage = Math.round((event.registered / event.capacity) * 100);
        
        eventCard.innerHTML = `
            <div class="event-admin-info">
                <h3>${event.title}</h3>
                <p><i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString()}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                <p><i class="fas fa-users"></i> ${event.registered}/${event.capacity} (${filledPercentage}% filled)</p>
                <p><i class="fas fa-money-bill"></i> $${event.price}</p>
            </div>
            <div class="event-admin-actions">
                <button class="btn-action btn-edit" onclick="editEvent(${event.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-action btn-delete" onclick="deleteEvent(${event.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        container.appendChild(eventCard);
    });
}

function setupAdminEventListeners() {
    // Add event form
    const addEventForm = document.getElementById('addEventForm');
    if (addEventForm) {
        addEventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newEvent = {
                id: Date.now(),
                title: document.getElementById('newEventTitle').value,
                date: document.getElementById('newEventDate').value,
                location: document.getElementById('newEventLocation').value,
                price: parseFloat(document.getElementById('newEventPrice').value),
                description: document.getElementById('newEventDescription').value,
                capacity: parseInt(document.getElementById('newEventCapacity').value),
                image: document.getElementById('newEventImage').value || 
                       'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop',
                registered: 0
            };
            
            // Add to events array
            window.events.push(newEvent);
            
            // Reset form
            addEventForm.reset();
            
            // Reload events
            loadAdminEvents();
            updateDashboardStats();
            
            // Show success message
            showAdminNotification('Event added successfully!', 'success');
        });
    }
    
    // Export data button
    const exportBtn = document.querySelector('.btn-export');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
}

function editEvent(eventId) {
    const event = window.events.find(e => e.id === eventId);
    if (!event) return;
    
    // Pre-fill the form
    document.getElementById('newEventTitle').value = event.title;
    document.getElementById('newEventDate').value = event.date;
    document.getElementById('newEventLocation').value = event.location;
    document.getElementById('newEventPrice').value = event.price;
    document.getElementById('newEventDescription').value = event.description;
    document.getElementById('newEventCapacity').value = event.capacity;
    document.getElementById('newEventImage').value = event.image;
    
    // Change form to edit mode
    const form = document.getElementById('addEventForm');
    form.dataset.editing = eventId;
    
    // Change button text
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Event';
    
    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });
}

function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        const index = window.events.findIndex(e => e.id === eventId);
        if (index > -1) {
            window.events.splice(index, 1);
            loadAdminEvents();
            updateDashboardStats();
            showAdminNotification('Event deleted successfully!', 'success');
        }
    }
}

function editRegistration(regId) {
    const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
    const reg = registrations.find(r => r.id === regId);
    
    if (!reg) return;
    
    const newStatus = prompt('Change registration status (confirmed/pending/cancelled):', reg.status);
    if (newStatus && ['confirmed', 'pending', 'cancelled'].includes(newStatus.toLowerCase())) {
        reg.status = newStatus.toLowerCase();
        localStorage.setItem('eventRegistrations', JSON.stringify(registrations));
        loadRegistrationsTable();
        updateDashboardStats();
        showAdminNotification('Registration updated!', 'success');
    }
}

function deleteRegistration(regId) {
    if (confirm('Are you sure you want to delete this registration?')) {
        let registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
        registrations = registrations.filter(r => r.id !== regId);
        localStorage.setItem('eventRegistrations', JSON.stringify(registrations));
        loadRegistrationsTable();
        updateDashboardStats();
        showAdminNotification('Registration deleted!', 'success');
    }
}

function exportData() {
    const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
    
    if (registrations.length === 0) {
        alert('No data to export');
        return;
    }
    
    // Convert to CSV
    let csv = 'ID,Name,Email,Phone,Event,Tickets,Date,Status\n';
    
    registrations.forEach(reg => {
        csv += `${reg.id},${reg.name},${reg.email},${reg.phone},"${reg.event.title}",${reg.tickets},${reg.date},${reg.status}\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event-registrations.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showAdminNotification('Data exported successfully!', 'success');
}

function showAdminNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = 'admin-notification';
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#f59e0b'};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Export for main app
window.events = events;
