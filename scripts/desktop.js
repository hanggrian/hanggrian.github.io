let activeWindows = new Set();
let windowZIndex = 100;

Document.prototype.getWindow = function (windowId) {
    const appName = windowId.replace('Window', '');
    return this.querySelector('.dash-item[data-app="' + appName + '"]');
};

function openWindow(windowId) {
    const window = document.getElementById(windowId);
    window.classList.add('active');
    activeWindows.add(windowId);
    window.style.zIndex = ++windowZIndex;

    const dashItem = document.getWindow(windowId);
    if (dashItem) {
        dashItem.classList.add('active');
    }
}

function closeWindow(windowId) {
    const window = document.getElementById(windowId);
    window.classList.remove('active');
    activeWindows.delete(windowId);

    const dashItem = document.getWindow(windowId);
    if (dashItem) {
        dashItem.classList.remove('active');
    }

    if (windowId !== 'musicWindow' || !audioPlayer) {
        return;
    }
    audioPlayer.pause();
    document.getElementById('playIcon').style.display = 'block';
    document.getElementById('pauseIcon').style.display = 'none';
    isPlaying = false;
}

function bringToFront(windowEl) {
    windowZIndex++;
    windowEl.style.zIndex = windowZIndex;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = '<div class="notification-icon">ℹ️</div><div>' + message + '</div>';
    document.body.appendChild(notification);

    setTimeout(
        () => {
            notification.classList.add('fade-out');
            setTimeout(
                () => document.body.removeChild(notification),
                300,
            );
        },
        3000,
    );
}

function toggleActivities() {
    const overview = document.getElementById('activitiesOverview');
    const pill = document.getElementById('activitiesPill');

    if (overview.classList.contains('active')) {
        overview.classList.remove('active');
        pill.classList.remove('active');
        return;
    }
    overview.classList.add('active');
    pill.classList.add('active');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const lightIcon = document.getElementById('lightIcon');
    const darkIcon = document.getElementById('darkIcon');

    if (document.body.classList.contains('dark-mode')) {
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'block';
        localStorage.setItem('darkMode', 'enabled');
        return;
    }
    lightIcon.style.display = 'block';
    darkIcon.style.display = 'none';
    localStorage.setItem('darkMode', 'disabled');
}

if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('lightIcon').style.display = 'none';
    document.getElementById('darkIcon').style.display = 'block';
}

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') {
        return;
    }
    document.getElementById('activitiesOverview').classList.remove('active');
    document.getElementById('activitiesPill').classList.remove('active');
});

document.getElementById('activitiesOverview').addEventListener('click', (e) => {
    if (e.target.id !== 'activitiesOverview') {
        return;
    }
    toggleActivities();
});

document.querySelectorAll('.window').forEach(windowEl => {
    const titlebar = windowEl.querySelector('.window-titlebar');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    function dragStart(e) {
        if (e.target.closest('.window-control')) {
            return;
        }

        initialX = e.clientX - windowEl.offsetLeft;
        initialY = e.clientY - windowEl.offsetTop;
        isDragging = true;
        bringToFront(windowEl);
    }

    function drag(e) {
        if (!isDragging) {
            return;
        }
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        windowEl.style.left = currentX + 'px';
        windowEl.style.top = currentY + 'px';
    }

    function dragEnd() {
        isDragging = false;
    }

    windowEl.addEventListener('mousedown', () => bringToFront(windowEl));
    titlebar.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
});

document.querySelectorAll('.indicator').forEach(indicator => {
    indicator.addEventListener('click', () => {
        showNotification('Nothing to see here');
    });
});

function updateClock() {
    document.getElementById('clock').textContent =
        new Date().toLocaleDateString(
            'en-US',
            {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            },
        );
}

updateClock();
setInterval(updateClock, 1000);

let audioPlayer = null;
let isPlaying = false;
let currentTrack = 0;

const playlist = [
    {
        src: 'music/genxbeats-simple-hiphop-beat-20231218-182036.mp3',
        title: 'Simple Hip Hop Beat',
        artist: 'GenXBeats'
    },
    {
        src: 'music/genxbeats-dark-hiphop-20241223-351198.mp3',
        title: 'Dark Hip Hop',
        artist: 'GenXBeats'
    }
];

function initAudioPlayer() {
    audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.addEventListener('loadedmetadata', () =>
        document.getElementById('duration').textContent = formatTime(audioPlayer.duration),
    );
    audioPlayer.addEventListener('timeupdate', () => {
        document.getElementById('progressFill').style.width =
            (audioPlayer.currentTime / audioPlayer.duration) * 100 + '%';
        document.getElementById('currentTime').textContent = formatTime(audioPlayer.currentTime);
    });
    audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        document.getElementById('playIcon').style.display = 'block';
        document.getElementById('pauseIcon').style.display = 'none';
    });
}

function loadTrack(index) {
    const track = playlist[index];
    const wasPlaying = isPlaying;

    audioPlayer.src = track.src;
    document.querySelector('.song-title').textContent = track.title;
    document.querySelector('.artist-name').textContent = track.artist;
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('currentTime').textContent = '0:00';

    if (wasPlaying) {
        audioPlayer.play();
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function togglePlayPause() {
    if (!audioPlayer) {
        initAudioPlayer();
    }

    if (isPlaying) {
        audioPlayer.pause();
        document.getElementById('playIcon').style.display = 'block';
        document.getElementById('pauseIcon').style.display = 'none';
        isPlaying = false;
        return;
    }
    audioPlayer.play();
    document.getElementById('playIcon').style.display = 'none';
    document.getElementById('pauseIcon').style.display = 'block';
    isPlaying = true;
}

function seekAudio(event) {
    if (!audioPlayer) {
        return;
    }
    const width = document.getElementById('progressBar').offsetWidth;
    const percentage = event.offsetX / width;
    audioPlayer.currentTime = audioPlayer.duration * percentage;
}

function previousTrack() {
    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrack);
    showNotification('Playing: ' + playlist[currentTrack].title);
}

function nextTrack() {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadTrack(currentTrack);
    showNotification('Playing: ' + playlist[currentTrack].title);
}

function showProject(index) {
    document.querySelectorAll('.project-sidebar-item').forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    document.querySelectorAll('.project-page').forEach((page, i) => {
        if (i === index) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });
}

const photos = [
    'images/showcase/collapsingtoolbarlayout-subtitle.jpg',
    'images/showcase/socialview.png',
    'images/showcase/countrypicker.jpg',
    'images/showcase/pinview.png',
    'images/showcase/portfolio.jpg',
    'images/showcase/prepress-adobe-scripts.jpg',
    'images/showcase/plano.jpg',
];

function loadGallery() {
    const grid = document.getElementById('galleryGrid');
    photos.forEach(img => {
        const item = document.createElement('div');
        item.className = 'photo-item';
        item.innerHTML = '<img src="' + img + '" alt="Gallery image" loading="lazy">';
        item.onclick = () => openLightbox(img);
        grid.appendChild(item);
    });
}

function openLightbox(imgSrc) {
    document.getElementById('lightboxImg').src = imgSrc;
    document.getElementById('lightbox').classList.add('active');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}

loadGallery();

function sendEmail() {
    const subject = document.getElementById('emailSubject').value;
    const body = document.getElementById('emailBody').value;

    if (!subject || !body) {
        showNotification('Please fill in both subject and message');
        return;
    }

    window.location.href =
        'mailto:hanggrian@proton.me?subject=' +
        encodeURIComponent(subject) +
        '&body=' +
        encodeURIComponent(body);

    showNotification('Opening your email client...');
}

function clearEmail() {
    document.getElementById('emailSubject').value = '';
    document.getElementById('emailBody').value = '';
    showNotification('Draft discarded');
}

let currentSlide = 0;
const totalSlides = 3;

function updateSlider() {
    document.getElementById('aboutSlides').style.transform =
        'translateX(-' + (currentSlide * 100) + '%)';

    document.querySelectorAll('.about-dot').forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
            return;
        }
        dot.classList.remove('active');
    });

    document.getElementById('aboutPrev').disabled = currentSlide === 0;
    document.getElementById('aboutNext').disabled = currentSlide === totalSlides - 1;
}

function nextSlide() {
    if (currentSlide >= totalSlides - 1) {
        return;
    }
    currentSlide++;
    updateSlider();
}

function previousSlide() {
    if (currentSlide <= 0) {
        return;
    }
    currentSlide--;
    updateSlider();
}

function goToSlide(index) {
    currentSlide = index;
    updateSlider();
}

window.addEventListener('load', () => initAudioPlayer());

openWindow('aboutWindow');
