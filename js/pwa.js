// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install prompt
    const installPrompt = document.getElementById('installPrompt');
    installPrompt.style.display = 'block';
    
    // Install button
    document.getElementById('installBtn').addEventListener('click', () => {
        installPrompt.style.display = 'none';
        deferredPrompt.prompt();
        
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted install');
            }
            deferredPrompt = null;
        });
    });
    
    // Cancel button
    document.getElementById('cancelInstall').addEventListener('click', () => {
        installPrompt.style.display = 'none';
    });
});

// Check if app is installed
window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    document.getElementById('installPrompt').style.display = 'none';
});

// Offline detection
window.addEventListener('online', () => {
    showNotification('You are back online!', 'success');
});

window.addEventListener('offline', () => {
    showNotification('You are offline. Some features may be limited.', 'warning');
});

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#10b981' : '#f59e0b'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
