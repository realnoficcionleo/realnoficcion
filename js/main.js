document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a');

    links.forEach(link => {
        link.addEventListener('click', e => {
            // If it's the back button, allow default behavior
            if (e.currentTarget.id === 'back-button') {
                return;
            }

            // If it's the stream button, allow default behavior (target="_blank" handles new tab)
            if (e.currentTarget.id === 'stream-button') {
                return;
            }

            // For all other links, simply navigate
            window.location.href = e.currentTarget.href;
        });
    });

    // Function to get the actual rendered dimensions and position of the video
    function getVideoContentRect() {
        const video = document.getElementById('bg-video');
        if (!video || video.readyState < 2) return null; // Ensure video metadata is loaded

        const videoAspectRatio = video.videoWidth / video.videoHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const viewportAspectRatio = viewportWidth / viewportHeight;

        let contentWidth, contentHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (viewportAspectRatio > videoAspectRatio) {
            // Viewport is wider than video, video is limited by height
            contentHeight = viewportHeight;
            contentWidth = viewportHeight * videoAspectRatio;
            offsetX = (viewportWidth - contentWidth) / 2; // Black bars on sides
        } else {
            // Viewport is taller than video, video is limited by width
            contentWidth = viewportWidth;
            contentHeight = viewportWidth / videoAspectRatio;
            offsetY = (viewportHeight - contentHeight) / 2; // Black bars on top/bottom
        }

        return {
            width: contentWidth,
            height: contentHeight,
            left: offsetX,
            top: offsetY
        };
    }

    // Store initial relative positions of elements (calculated once)
    const positionedElements = [];

    // Index page navigation buttons
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        positionedElements.push({
            element: button,
            initialRelativeLeft: parseFloat(button.style.left) / 100,
            initialRelativeTop: parseFloat(button.style.top) / 100,
            initialRelativeWidth: parseFloat(button.style.width) / 100,
            initialRelativeHeight: parseFloat(button.style.height) / 100,
            type: 'nav-button'
        });
    });

    function repositionElements() {
        const videoRect = getVideoContentRect();
        if (!videoRect) return;

        positionedElements.forEach(item => {
            const { element, type } = item;

            if (type === 'nav-button') {
                element.style.left = `${videoRect.left + item.initialRelativeLeft * videoRect.width}px`;
                element.style.top = `${videoRect.top + item.initialRelativeTop * videoRect.height}px`;
                element.style.width = `${item.initialRelativeWidth * videoRect.width}px`;
                element.style.height = `${item.initialRelativeHeight * videoRect.height}px`;
            }
        });
    }

    // Initial positioning on load for nav buttons
    const videoElement = document.getElementById('bg-video');
    if (videoElement) {
        videoElement.addEventListener('loadedmetadata', () => {
            repositionElements();
        });
    }

    // Reposition nav buttons on window resize
    window.addEventListener('resize', repositionElements);

    // Music Player Logic
    const musicPlayer = document.getElementById('wmp-player');
    const currentSongTitle = document.getElementById('current-song-title');
    const prevBtn = document.getElementById('wmp-prev-btn');
    const playPauseBtn = document.getElementById('wmp-play-pause-btn');
    const nextBtn = document.getElementById('wmp-next-btn');
    const volumeFader = document.getElementById('wmp-volume-fader');
    const wmpSongList = document.querySelector('.wmp-song-list');

    const songs = [
        { title: '01 Real No Ficcíon - Crashes', src: 'audio/01_Real_No_Ficcion_Crashes.wav' },
        { title: '02 Real No Ficcíon - Liar', src: 'audio/02_Real_No_Ficcion_Liar.wav' },
        { title: '03 Real No Ficcíon - Echoes, Time and Names', src: 'audio/03_Real_No_Ficcion_Echoes_Time_and_Names.wav' },
        { title: '04 Real No Ficcíon - About Blank', src: 'audio/04_Real_No_Ficcion_About_Blank.wav' },
        { title: '05 Real No Ficcíon - Blame Me', src: 'audio/05_Real_No_Ficcion_Blame_Me.wav' },
        { title: '06 Real No Ficcíon - Crashes Feat. MADRE', src: 'audio/06_Real_No_Ficcion_Crashes_Feat_MADRE.wav' },
        { title: '07 Real No Ficcíon - Cold Pools', src: 'audio/07_Real_No_Ficcion_Cold_Pools.wav' },
        { title: '08 Real No Ficcíon - Never You', src: 'audio/08_Real_No_Ficcion_Never_You.wav' },
        { title: '09 Real No Ficcíon - Scorpio Sun', src: 'audio/09_Real_No_Ficcion_Scorpio_Sun.wav' },
        { title: '10 Real No Ficcíon - Trauma Club', src: 'audio/10_Real_No_Ficcion_Trauma_Club.wav' }
    ];

    let currentSongIndex = 0;
    let audio = new Audio();

    function loadSong(index) {
        const song = songs[index];
        audio.src = song.src;
        currentSongTitle.textContent = song.title;
        audio.load();

        // Update active class in song list
        document.querySelectorAll('.song-item').forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    function playSong() {
        audio.play();
        playPauseBtn.innerHTML = '&#10074;&#10074;'; // Pause icon
    }

    function pauseSong() {
        audio.pause();
        playPauseBtn.innerHTML = '&#9658;'; // Play icon
    }

    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex);
        playSong();
    }

    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        loadSong(currentSongIndex);
        playSong();
    }

    // Event Listeners for controls
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (audio.paused) {
                playSong();
            } else {
                pauseSong();
            }
        });
    }
    if (prevBtn) prevBtn.addEventListener('click', prevSong);
    if (nextBtn) nextBtn.addEventListener('click', nextSong);

    // Volume control
    if (volumeFader) {
        volumeFader.addEventListener('input', (e) => {
            audio.volume = parseFloat(e.target.value);
        });
        audio.volume = parseFloat(volumeFader.value); // Set initial volume
    }

    // Play next song automatically when current one ends
    audio.addEventListener('ended', nextSong);

    // Populate song list and add click handlers
    if (wmpSongList) {
        wmpSongList.innerHTML = ''; // Clear existing hardcoded items
        const header = document.createElement('div');
        header.classList.add('song-list-header');
        header.innerHTML = '<div class="col-filename">File Name</div><div class="col-filesize">Size</div><div class="col-bitrate">Bitrate</div><div class="col-frequency">Freq</div><div class="col-length">Length</div>';
        wmpSongList.appendChild(header);

        songs.forEach((song, index) => {
            const songItem = document.createElement('div');
            songItem.classList.add('song-item');
            songItem.dataset.songId = `song${index + 1}`;
            songItem.innerHTML = `
                <div class="col-filename">${song.title}</div>
                <div class="col-filesize">N/A</div>
                <div class="col-bitrate">N/A</div>
                <div class="col-frequency">N/A</div>
                <div class="col-length">N/A</div>
            `;

            // Make songs 04, 05, 06 unclickable
            if (index === 3 || index === 4 || index === 5) {
                songItem.classList.add('unclickable-song');
            } else {
                songItem.addEventListener('click', () => {
                    currentSongIndex = index;
                    loadSong(currentSongIndex);
                    playSong();
                });
            }
            wmpSongList.appendChild(songItem);
        });
    }

    // Load the first song on page load
    loadSong(currentSongIndex);

    // Make the music player draggable
    let isMusicPlayerDragging = false;
    let musicPlayerOffsetX, musicPlayerOffsetY;

    if (musicPlayer) {
        // Load last saved position or calculate initial centered position
        const savedLeft = localStorage.getItem('musicPlayerLeft');
        const savedTop = localStorage.getItem('musicPlayerTop');

        if (savedLeft && savedTop) {
            musicPlayer.style.left = `${savedLeft}`;
            musicPlayer.style.top = `${savedTop}`;
        } else {
            // Calculate initial centered position with 20% left offset relative to viewport
            const initialLeft = (window.innerWidth - musicPlayer.offsetWidth) / 2 - (window.innerWidth * 0.20);
            const initialTop = (window.innerHeight - musicPlayer.offsetHeight) / 2;
            musicPlayer.style.left = `${initialLeft}px`;
            musicPlayer.style.top = `${initialTop}px`;
        }
        musicPlayer.style.position = 'absolute'; // Ensure it's absolute

        musicPlayer.addEventListener('mousedown', dragMusicPlayerStart);
        document.addEventListener('mouseup', dragMusicPlayerEnd);
        document.addEventListener('mousemove', dragMusicPlayer);

        function dragMusicPlayerStart(e) {
            if (e.target.closest('.wmp-top-bar') || e.target.closest('.wmp-display')) {
                isMusicPlayerDragging = true;
                musicPlayerOffsetX = e.clientX - musicPlayer.getBoundingClientRect().left;
                musicPlayerOffsetY = e.clientY - musicPlayer.getBoundingClientRect().top;
            }
        }

        function dragMusicPlayerEnd() {
            isMusicPlayerDragging = false;
            // Save last position
            localStorage.setItem('musicPlayerLeft', musicPlayer.style.left);
            localStorage.setItem('musicPlayerTop', musicPlayer.style.top);
        }

        function dragMusicPlayer(e) {
            if (!isMusicPlayerDragging) return;
            e.preventDefault();
            let newX = e.clientX - musicPlayerOffsetX;
            let newY = e.clientY - musicPlayerOffsetY;
            musicPlayer.style.left = `${newX}px`;
            musicPlayer.style.top = `${newY}px`;
        }
    }

    // Annotation Terminal Logic
    const annotationTerminal = document.getElementById('annotation-terminal');
    const terminalTopBar = annotationTerminal ? annotationTerminal.querySelector('.terminal-top-bar') : null;
    const drawingCanvas = document.getElementById('drawing-canvas');
    const annotationText = document.getElementById('annotation-text');
    const sendAnnotationBtn = document.getElementById('send-annotation-btn');

    let isTerminalDragging = false;
    let terminalOffsetX, terminalOffsetY;

    if (annotationTerminal && terminalTopBar) {
        // Load last saved position or calculate initial position
        const savedTerminalLeft = localStorage.getItem('annotationTerminalLeft');
        const savedTerminalTop = localStorage.getItem('annotationTerminalTop');

        if (savedTerminalLeft && savedTerminalTop) {
            annotationTerminal.style.left = `${savedTerminalLeft}`;
            annotationTerminal.style.top = `${savedTerminalTop}`;
        } else {
            // Initial positioning (e.g., top right) relative to viewport
            annotationTerminal.style.left = `${window.innerWidth - annotationTerminal.offsetWidth - 50}px`;
            annotationTerminal.style.top = `50px`;
        }
        annotationTerminal.style.position = 'absolute'; // Ensure it's absolute

        terminalTopBar.addEventListener('mousedown', dragTerminalStart);
        document.addEventListener('mouseup', dragTerminalEnd);
        document.addEventListener('mousemove', dragTerminal);
    }

    function dragTerminalStart(e) {
        isTerminalDragging = true;
        terminalOffsetX = e.clientX - annotationTerminal.getBoundingClientRect().left;
        terminalOffsetY = e.clientY - annotationTerminal.getBoundingClientRect().top;
    }

    function dragTerminalEnd() {
        isTerminalDragging = false;
        // Save last position
        localStorage.setItem('annotationTerminalLeft', annotationTerminal.style.left);
        localStorage.setItem('annotationTerminalTop', annotationTerminal.style.top);
    }

    function dragTerminal(e) {
        if (!isTerminalDragging) return;
        e.preventDefault();
        let newX = e.clientX - terminalOffsetX;
        let newY = e.clientY - terminalOffsetY;
        annotationTerminal.style.left = `${newX}px`;
        annotationTerminal.style.top = `${newY}px`;
    }

    // Draggable Heart Logic
    const draggableHeart = document.getElementById('draggable-heart');
    let isHeartDragging = false;
    let heartOffsetX, heartOffsetY;

    if (draggableHeart) {
        draggableHeart.onload = () => {
            // Load last saved position or calculate initial position
            const savedHeartLeft = localStorage.getItem('draggableHeartLeft');
            const savedHeartTop = localStorage.getItem('draggableHeartTop');

            if (savedHeartLeft && savedHeartTop) {
                draggableHeart.style.left = `${savedHeartLeft}`;
                draggableHeart.style.top = `${savedHeartTop}`;
                console.log('Draggable Heart: Loaded from localStorage', savedHeartLeft, savedHeartTop);
            } else {
                // Initial positioning (e.g., center of the video content area)
                const videoRect = getVideoContentRect();
                if (videoRect) {
                    const initialLeft = videoRect.left + (videoRect.width - draggableHeart.offsetWidth) / 2;
                    const initialTop = videoRect.top + (videoRect.height - draggableHeart.offsetHeight) / 2;
                    draggableHeart.style.left = `${initialLeft}px`;
                    draggableHeart.style.top = `${initialTop}px`;
                    console.log('Draggable Heart: Initial centered position', initialLeft, initialTop);
                }
            }
            draggableHeart.style.position = 'absolute'; // Ensure it's absolute
        };

        // If image is already loaded (e.g., from cache), trigger onload manually
        if (draggableHeart.complete) {
            draggableHeart.onload();
        }

        draggableHeart.addEventListener('mousedown', dragHeartStart);
        document.addEventListener('mouseup', dragHeartEnd);
        document.addEventListener('mousemove', dragHeart);
    }

    function dragHeartStart(e) {
        isHeartDragging = true;
        heartOffsetX = e.clientX - draggableHeart.getBoundingClientRect().left;
        heartOffsetY = e.clientY - draggableHeart.getBoundingClientRect().top;
        console.log('Draggable Heart: Drag Start', { clientX: e.clientX, clientY: e.clientY, offsetLeft: draggableHeart.getBoundingClientRect().left, offsetTop: draggableHeart.getBoundingClientRect().top, heartOffsetX, heartOffsetY });
    }

    function dragHeartEnd() {
        isHeartDragging = false;
        // Save last position
        localStorage.setItem('draggableHeartLeft', draggableHeart.style.left);
        localStorage.setItem('draggableHeartTop', draggableHeart.style.top);
        console.log('Draggable Heart: Drag End', { savedLeft: draggableHeart.style.left, savedTop: draggableHeart.style.top });
    }

    function dragHeart(e) {
        if (!isHeartDragging) return;
        e.preventDefault();
        let newX = e.clientX - heartOffsetX;
        let newY = e.clientY - heartOffsetY;
        draggableHeart.style.left = `${newX}px`;
        draggableHeart.style.top = `${newY}px`;
        // console.log('Draggable Heart: Dragging', { newX, newY }); // Too verbose, enable if needed
    }

    // Drawing functionality
    if (drawingCanvas) {
        const ctx = drawingCanvas.getContext('2d');
        let isDrawing = false;

        // Set canvas dimensions to match its display size
        const setCanvasDimensions = () => {
            drawingCanvas.width = drawingCanvas.offsetWidth;
            drawingCanvas.height = drawingCanvas.offsetHeight;
        };
        setCanvasDimensions();
        window.addEventListener('resize', setCanvasDimensions);

        drawingCanvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
            ctx.strokeStyle = '#0000ff'; // Blue drawing color
            ctx.lineWidth = 2;
        });

        drawingCanvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        });

        drawingCanvas.addEventListener('mouseup', () => {
            isDrawing = false;
            ctx.closePath();
        });

        drawingCanvas.addEventListener('mouseleave', () => {
            isDrawing = false;
            ctx.closePath();
        });
    }

    // Send Annotation (client-side save)
    if (sendAnnotationBtn && annotationText && drawingCanvas) {
        sendAnnotationBtn.addEventListener('click', () => {
            const textNote = annotationText.value;
            const drawingData = drawingCanvas.toDataURL(); // Save drawing as base64 image

            const annotation = {
                timestamp: new Date().toISOString(),
                text: textNote,
                drawing: drawingData
            };

            // Retrieve existing annotations or initialize an empty array
            let savedAnnotations = JSON.parse(localStorage.getItem('userAnnotations') || '[]');
            savedAnnotations.push(annotation);
            localStorage.setItem('userAnnotations', JSON.stringify(savedAnnotations));

            console.log('Annotation saved:', annotation);
            alert('Annotation saved locally!');

            // Clear for next annotation
            annotationText.value = '';
            if (drawingCanvas) {
                const ctx = drawingCanvas.getContext('2d');
                ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            }
        });
    }
});