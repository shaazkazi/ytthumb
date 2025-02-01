// Enhanced version without API dependency
function getThumbnail() {
    const videoUrl = document.getElementById('videoUrl').value;
    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) {
        showToast('Please enter a valid YouTube URL');
        return;
    }
    showLoading(true);
    
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    thumbnailContainer.innerHTML = '';

    const qualities = [
        { name: 'Maximum Resolution (HD)', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, size: '1280x720' },
        { name: 'High Quality', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, size: '480x360' },
        { name: 'Medium Quality', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, size: '320x180' },
        { name: 'Standard Quality', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, size: '640x480' },
        { name: 'Default Thumbnail', url: `https://img.youtube.com/vi/${videoId}/default.jpg`, size: '120x90' },
        { name: 'Thumbnail 1', url: `https://img.youtube.com/vi/${videoId}/1.jpg`, size: '120x90' },
        { name: 'Thumbnail 2', url: `https://img.youtube.com/vi/${videoId}/2.jpg`, size: '120x90' },
        { name: 'Thumbnail 3', url: `https://img.youtube.com/vi/${videoId}/3.jpg`, size: '120x90' }
    ];

    qualities.forEach(quality => {
        createThumbnailItem(quality, thumbnailContainer, videoId);
    });

    addToHistory(videoId);
    showToast('Thumbnails loaded successfully!');
    showLoading(false);
}

function createThumbnailItem(quality, container, videoId) {
    const thumbnailItem = document.createElement('div');
    thumbnailItem.className = 'thumbnail-item';
    
    thumbnailItem.innerHTML = `
        <div class="thumbnail-header">
            <h4>${quality.name}</h4>
            <span class="size-badge">${quality.size}</span>
        </div>
        <div class="thumbnail-preview">
            <img src="${quality.url}" alt="${quality.name}" 
                onerror="this.parentElement.classList.add('not-available')"
                onload="this.parentElement.classList.add('available')">
            <div class="overlay">
                <span class="status-text">Checking availability...</span>
            </div>
        </div>
        <div class="button-group">
            <a href="${quality.url}" class="download-btn" download="youtube_thumb_${videoId}_${quality.name.toLowerCase().replace(/\s/g, '_')}.jpg">
                <i class="fas fa-download"></i> Download
            </a>
            <button class="copy-btn" onclick="copyImageUrl('${quality.url}')">
                <i class="fas fa-copy"></i>
            </button>
            <button class="preview-btn" onclick="previewImage('${quality.url}')">
                <i class="fas fa-eye"></i>
            </button>
        </div>
    `;
    
    container.appendChild(thumbnailItem);
}
function addToHistory(videoId) {
    let history = JSON.parse(localStorage.getItem('thumbnailHistory') || '[]');
    if (!history.includes(videoId)) {
        history.unshift(videoId);
        history = history.slice(0, 10); // Keep last 10 items
        localStorage.setItem('thumbnailHistory', JSON.stringify(history));
        updateHistoryDisplay();
    }
}

function updateHistoryDisplay() {
    const history = JSON.parse(localStorage.getItem('thumbnailHistory') || '[]');
    const historyContainer = document.getElementById('historyContainer');
    
    if (historyContainer) {
        historyContainer.innerHTML = history.map(videoId => `
            <div class="history-item" onclick="loadFromHistory('${videoId}')">
                <img src="https://img.youtube.com/vi/${videoId}/default.jpg">
                <div class="history-overlay">
                    <i class="fas fa-redo"></i>
                </div>
            </div>
        `).join('');
    }
}

function loadFromHistory(videoId) {
    document.getElementById('videoUrl').value = `https://youtu.be/${videoId}`;
    getThumbnail();
}

function copyImageUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
        showToast('URL copied to clipboard!');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('URL copied to clipboard!');
    });
}

function previewImage(url) {
    const modal = document.getElementById('previewModal');
    const previewImage = document.getElementById('previewImage');
    const modalDownload = document.getElementById('modalDownload');
    const modalCopy = document.getElementById('modalCopy');
    const resolutionBadge = document.querySelector('.resolution-badge');
    
    previewImage.src = url;
    modalDownload.href = url;
    
    // Show modal with animation
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 50);
    
    // Update resolution badge when image loads
    previewImage.onload = () => {
        resolutionBadge.textContent = `${previewImage.naturalWidth} × ${previewImage.naturalHeight}`;
    };
    
    modalCopy.onclick = () => copyImageUrl(url);
}

// Add this to your existing close modal functionality
document.querySelector('.close-modal').onclick = function() {
    const modal = document.getElementById('previewModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

function clearInput() {
    document.getElementById('videoUrl').value = '';
    document.getElementById('videoUrl').focus();
}
function downloadAllThumbnails() {
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach((button, index) => {
        setTimeout(() => button.click(), index * 500);
    });
    showToast('Starting batch download...');
}

function clearHistory() {
    localStorage.removeItem('thumbnailHistory');
    updateHistoryDisplay();
    showToast('History cleared successfully');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoading(show) {
    const button = document.querySelector('button');
    button.classList.toggle('loading', show);
    button.disabled = show;
}

function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([^#\&\?]*)/,
        /(?:youtube\.com\/(?:v|vi|e|embed|shorts|live)\/([^#\&\?]*))/
    ];

    for (let pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1].length === 11) {
            return match[1];
        }
    }
    return null;
}

// Auto-process URL on input
document.getElementById('videoUrl').addEventListener('input', function(e) {
    const input = e.target.value;
    if (extractVideoId(input)) {
        getThumbnail();
    }
});

// Handle paste event
document.getElementById('videoUrl').addEventListener('paste', function(e) {
    setTimeout(() => {
        const input = e.target.value;
        if (extractVideoId(input)) {
            getThumbnail();
        }
    }, 100);
});

// Add these event listeners for modal closing
window.onclick = function(event) {
    const modal = document.getElementById('previewModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.getElementById('previewModal').style.display = 'none';
    }
});

// Make sure the close button works
document.querySelector('.close-modal').onclick = function() {
    document.getElementById('previewModal').style.display = 'none';
}

function downloadThumbnail(url, videoId, quality) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const a = document.createElement('a');
            a.href = window.URL.createObjectURL(blob);
            a.download = `youtube_thumb_${videoId}_${quality.toLowerCase().replace(/\s/g, '_')}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(a.href);
        });
}
