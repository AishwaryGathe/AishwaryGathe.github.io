document.addEventListener('DOMContentLoaded', () => {
    // Load data from LocalStorage if available, otherwise use default from data.js
    const fileSystem = JSON.parse(localStorage.getItem('retroOS_data')) || defaultFileSystem;

    const desktopEl = document.getElementById('desktop');
    const contextMenu = document.getElementById('context-menu');
    const startMenu = document.getElementById('start-menu');
    const startBtn = document.getElementById('start-btn');
    const taskbarApps = document.getElementById('taskbar-apps');
    const bootScreen = document.getElementById('boot-screen');
    const startupSound = document.getElementById('startup-sound');
    const screensaver = document.getElementById('screensaver');
    const screensaverLogo = document.getElementById('screensaver-logo');

    // Apply Config
    if (fileSystem.config && fileSystem.config.name) {
        screensaverLogo.innerText = fileSystem.config.name;
        document.title = fileSystem.config.tagline || 'Retro OS';
    }
    const weatherWidget = document.getElementById('weather-widget');
    const volumeIcon = document.getElementById('volume-icon');
    const clockEl = document.getElementById('clock');

    // --- Boot Sequence ---
    setTimeout(() => {
        // Attempt to play sound
        startupSound.volume = 0.5;
        const playPromise = startupSound.play();

        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Auto-play was prevented.
                // Play sound on first user interaction
                const playOnInteraction = () => {
                    startupSound.play();
                    // Remove listeners once played
                    document.removeEventListener('click', playOnInteraction);
                    document.removeEventListener('keydown', playOnInteraction);
                    document.removeEventListener('mousemove', playOnInteraction);
                    document.removeEventListener('touchstart', playOnInteraction);
                };

                document.addEventListener('click', playOnInteraction);
                document.addEventListener('keydown', playOnInteraction);
                document.addEventListener('mousemove', playOnInteraction);
                document.addEventListener('touchstart', playOnInteraction);
            });
        }

        // Hide boot screen after simulated load
        setTimeout(() => {
            bootScreen.style.display = 'none';
        }, 3000);
    }, 1000);

    // --- System Tray Logic ---

    // Weather
    async function fetchWeather() {
        try {
            // Using wttr.in with format %t for temperature (e.g., +25°C)
            const response = await fetch('https://wttr.in/?format=%t');
            if (response.ok) {
                const text = await response.text();
                weatherWidget.innerHTML = `<span>${text.trim()}</span>`;
            } else {
                throw new Error('Weather fetch failed');
            }
        } catch (e) {
            // Fallback
            weatherWidget.innerHTML = `<span>24°C</span>`;
        }
    }
    fetchWeather();
    setInterval(fetchWeather, 600000); // Update every 10 mins

    // Volume
    let isMuted = false;
    volumeIcon.addEventListener('click', () => {
        isMuted = !isMuted;
        startupSound.muted = isMuted;
        if (isMuted) {
            volumeIcon.src = "https://win98icons.alexmeub.com/icons/png/loudspeaker_muted-0.png";
        } else {
            volumeIcon.src = "https://win98icons.alexmeub.com/icons/png/loudspeaker_rays-0.png";
            // Play a ding to confirm unmute
            if (startupSound.paused) {
                // Optional: play a short sound or just reset
            }
        }
    });

    // Clock & Date
    function updateClock() {
        const now = new Date();
        // Format: 12:00 PM
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        // Format: 1/4/2026
        const dateStr = now.toLocaleDateString(); // Simple date format

        clockEl.innerHTML = `<div style="text-align:right; line-height:1.2;">${timeStr}<br>${dateStr}</div>`;
    }
    setInterval(updateClock, 1000);
    updateClock();


    // --- Screensaver Logic ---
    let idleTime = 0;
    let screensaverActive = false;
    let ssAnimFrame;

    // Bouncing Logic
    let x = 0, y = 0, dx = 2, dy = 2;

    function startScreensaver() {
        screensaverActive = true;
        screensaver.style.display = 'block';

        // Reset position
        x = Math.random() * (window.innerWidth - 150);
        y = Math.random() * (window.innerHeight - 80);

        function animate() {
            if (!screensaverActive) return;

            x += dx;
            y += dy;

            if (x + 150 > window.innerWidth || x < 0) {
                dx = -dx;
                screensaverLogo.style.color = getRandomColor();
                screensaverLogo.style.borderColor = screensaverLogo.style.color;
                screensaverLogo.style.boxShadow = `0 0 10px ${screensaverLogo.style.color}`;
            }
            if (y + 80 > window.innerHeight || y < 0) {
                dy = -dy;
                screensaverLogo.style.color = getRandomColor();
                screensaverLogo.style.borderColor = screensaverLogo.style.color;
                screensaverLogo.style.boxShadow = `0 0 10px ${screensaverLogo.style.color}`;
            }

            screensaverLogo.style.left = x + 'px';
            screensaverLogo.style.top = y + 'px';

            ssAnimFrame = requestAnimationFrame(animate);
        }
        animate();
    }

    function stopScreensaver() {
        screensaverActive = false;
        screensaver.style.display = 'none';
        cancelAnimationFrame(ssAnimFrame);
        idleTime = 0;
    }

    function getRandomColor() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Idle Timer
    setInterval(() => {
        idleTime++;
        if (idleTime > 60 && !screensaverActive) { // 60 seconds
            startScreensaver();
        }
    }, 1000);

    // Reset Idle on Interaction
    ['mousemove', 'mousedown', 'keydown', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, () => {
            if (screensaverActive) stopScreensaver();
            idleTime = 0;
        });
    });


    // --- Window Manager & Desktop (Existing Code) ---
    let zIndexCounter = 100;
    const openWindows = {};

    const WindowManager = {
        open: (item) => {
            if (openWindows[item.id]) {
                const win = openWindows[item.id];
                win.style.display = 'flex';
                WindowManager.focus(win);
                return;
            }

            const win = document.createElement('div');
            win.className = `window app-${item.app}`;
            win.id = `win-${item.id}`;
            win.style.zIndex = ++zIndexCounter;

            const top = 50 + (Object.keys(openWindows).length * 20);
            const left = 50 + (Object.keys(openWindows).length * 20);
            win.style.top = `${top}px`;
            win.style.left = `${left}px`;

            let contentHtml = '';
            let afterRender = null;

            if (item.app === 'explorer') {
                contentHtml = WindowManager.renderExplorer(item.content);
            } else if (item.app === 'browser') {
                let url = item.url;
                // Robust YouTube ID extraction and embed conversion
                const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
                const match = url.match(regExp);
                if (match && match[7] && match[7].length === 11) {
                    url = `https://www.youtube.com/embed/${match[7]}`;
                }

                contentHtml = `
                    <div style="display:flex; flex-direction:column; height:100%;">
                        <div style="padding:6px; background:rgba(0,0,0,0.06); display:flex; gap:8px; align-items:center;">
                            <button class="btn open-external" data-url="${url}">Open in new tab</button>
                            <a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#fff;">Open link</a>
                        </div>
                        <div style="flex:1;">
                            <iframe src="${url}" title="${item.name}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%; height:100%;"></iframe>
                        </div>
                    </div>
                `;
                afterRender = (win) => {
                    const btn = win.querySelector('.open-external');
                    if (btn) btn.addEventListener('click', () => {
                        const u = btn.getAttribute('data-url');
                        // Try to open as a separate browser window (popup) with minimal chrome.
                        // Browsers may still open a tab depending on user settings.
                        window.open(u, '_blank', 'toolbar=0,location=0,status=0,menubar=0,scrollbars=1,resizable=1,width=1000,height=700');
                    });
                };
            } else if (item.app === 'pdf-reader') {
                contentHtml = `
                    <div style="display:flex; flex-direction:column; height:100%; color:#fff;">
                        <div style="padding:8px; background:rgba(0,0,0,0.06); display:flex; align-items:center; gap:8px;">
                            <h3 style="margin:0; flex:1;">${item.name}</h3>
                            <button class="btn open-external" data-url="${item.content}">Open in new tab</button>
                        </div>
                        <div style="flex:1; padding:8px; background:#fff; position:relative;">
                            <iframe src="${item.content}" title="${item.name}" style="width:100%; height:100%; border:1px solid #000;" ></iframe>
                            <div class="iframe-error" style="display:none; position:absolute; inset:0; background:rgba(0,0,0,0.6); color:#fff; align-items:center; justify-content:center; text-align:center; padding:16px;">
                                <div>
                                    <p style="margin:0 0 8px 0;">This content cannot be displayed inside the app.</p>
                                    <a class="open-link" href="${item.content}" target="_blank" rel="noopener noreferrer" style="color:#fff; text-decoration:underline;">Open in a new tab</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                afterRender = (win) => {
                    const btn = win.querySelector('.open-external');
                    const iframe = win.querySelector('iframe');
                    const err = win.querySelector('.iframe-error');
                    if (btn) btn.addEventListener('click', () => {
                        const u = btn.getAttribute('data-url');
                        window.open(u, '_blank', 'toolbar=0,location=0,status=0,menubar=0,scrollbars=1,resizable=1,width=1000,height=700');
                    });

                    // Detect framing/blocking by attempting to access the iframe document
                    const handleMaybeBlocked = () => {
                        try {
                            // Accessing contentDocument will throw for cross-origin
                            const doc = iframe.contentDocument || iframe.contentWindow.document;
                            // If document is accessible but empty (some PDFs), still allow iframe
                            if (!doc || doc.location === null) {
                                // show fallback
                                if (err) err.style.display = 'flex';
                            }
                        } catch (e) {
                            if (err) err.style.display = 'flex';
                        }
                    };

                    iframe.addEventListener('load', () => {
                        // Give it a small moment then test
                        setTimeout(handleMaybeBlocked, 200);
                    });
                    // Also run a timeout in case load doesn't fire
                    setTimeout(() => { if (iframe && iframe.complete !== false) handleMaybeBlocked(); }, 1000);
                };
            } else if (item.app === 'text-viewer') {
                contentHtml = `<div style="padding:10px; background:#fff; height:100%;">${item.content}</div>`;
            } else if (item.app === 'settings') {
                contentHtml = WindowManager.renderSettings();
                afterRender = WindowManager.initSettings;
            } else if (item.app === 'game') {
                contentHtml = WindowManager.renderGame();
                afterRender = WindowManager.initGame;
            }

            win.innerHTML = `
                <div class="title-bar">
                    <div class="title-bar-text">${item.name}</div>
                    <div class="title-bar-controls">
                        <div class="control-box minimize">_</div>
                        <div class="control-box maximize">□</div>
                        <div class="control-box close">X</div>
                    </div>
                </div>
                <div class="window-body">
                    ${contentHtml}
                </div>
            `;

            document.body.appendChild(win);
            openWindows[item.id] = win;

            WindowManager.addTaskbarItem(item);

            const titleBar = win.querySelector('.title-bar');
            const closeBtn = win.querySelector('.close');
            const minBtn = win.querySelector('.minimize');
            const maxBtn = win.querySelector('.maximize');

            let isDragging = false;
            let offset = { x: 0, y: 0 };

            titleBar.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('control-box')) return;
                isDragging = true;
                offset.x = e.clientX - win.offsetLeft;
                offset.y = e.clientY - win.offsetTop;
                WindowManager.focus(win);
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    win.style.left = `${e.clientX - offset.x}px`;
                    win.style.top = `${e.clientY - offset.y}px`;
                }
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
            });

            win.addEventListener('mousedown', () => WindowManager.focus(win));

            closeBtn.addEventListener('click', () => WindowManager.close(item.id));

            minBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                win.style.display = 'none';
            });

            maxBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                win.classList.toggle('maximized');
            });

            if (afterRender) afterRender(win);
        },

        close: (id) => {
            const win = openWindows[id];
            if (win) {
                win.remove();
                delete openWindows[id];
                WindowManager.removeTaskbarItem(id);
            }
        },

        focus: (win) => {
            win.style.zIndex = ++zIndexCounter;
        },

        renderExplorer: (items) => {
            if (!Array.isArray(items)) return '<p>Empty Folder</p>';
            return items.map(subItem => `
                <div class="file-item" data-id="${subItem.id}">
                    <img src="${subItem.iconImg}" alt="icon">
                    <div style="font-size:12px;">${subItem.name}</div>
                </div>
            `).join('');
        },

        renderSettings: () => {
            return `
                <div style="padding: 10px;">
                    <div class="settings-group">
                        <h4>Background Color</h4>
                        <label class="radio-option"><input type="radio" name="bg" value="teal" checked> Classic Teal</label>
                        <label class="radio-option"><input type="radio" name="bg" value="black"> Hacker Black</label>
                        <label class="radio-option"><input type="radio" name="bg" value="blue"> BSOD Blue</label>
                    </div>
                    <div class="settings-group">
                        <h4>Wallpaper URL</h4>
                        <input type="text" id="bg-url" placeholder="https://..." style="width: 100%;">
                        <button class="btn" id="apply-url" style="margin-top: 5px;">Apply</button>
                    </div>
                </div>
            `;
        },

        initSettings: (win) => {
            const radios = win.querySelectorAll('input[name="bg"]');
            radios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    const color = e.target.value;
                    if (color === 'teal') document.body.style.backgroundColor = '#008080';
                    if (color === 'black') document.body.style.backgroundColor = '#000000';
                    if (color === 'blue') document.body.style.backgroundColor = '#0000AA';
                    document.body.style.backgroundImage = 'radial-gradient(#000 1px, transparent 1px)';
                });
            });

            const applyBtn = win.querySelector('#apply-url');
            const urlInput = win.querySelector('#bg-url');
            applyBtn.addEventListener('click', () => {
                if (urlInput.value) {
                    document.body.style.backgroundImage = `url('${urlInput.value}')`;
                    document.body.style.backgroundSize = 'cover';
                }
            });
        },

        renderGame: () => {
            return `
                <div style="padding: 10px;">
                    <div class="game-status" id="game-status">Player vs AishwaryBot</div>
                    <div class="game-board" id="game-board">
                        <div class="game-cell" data-index="0"></div>
                        <div class="game-cell" data-index="1"></div>
                        <div class="game-cell" data-index="2"></div>
                        <div class="game-cell" data-index="3"></div>
                        <div class="game-cell" data-index="4"></div>
                        <div class="game-cell" data-index="5"></div>
                        <div class="game-cell" data-index="6"></div>
                        <div class="game-cell" data-index="7"></div>
                        <div class="game-cell" data-index="8"></div>
                    </div>
                    <div class="game-controls">
                        <button class="btn" id="reset-game">Restart Game</button>
                    </div>
                </div>
            `;
        },

        initGame: (win) => {
            const cells = win.querySelectorAll('.game-cell');
            const status = win.querySelector('#game-status');
            const resetBtn = win.querySelector('#reset-game');
            let board = ['', '', '', '', '', '', '', '', ''];
            let currentPlayer = 'X';
            let gameActive = true;

            const checkWin = () => {
                const winConditions = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8],
                    [0, 3, 6], [1, 4, 7], [2, 5, 8],
                    [0, 4, 8], [2, 4, 6]
                ];

                for (let condition of winConditions) {
                    const [a, b, c] = condition;
                    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                        return board[a];
                    }
                }
                return board.includes('') ? null : 'Draw';
            };

            const botMove = () => {
                if (!gameActive) return;
                const emptyIndices = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
                if (emptyIndices.length > 0) {
                    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                    board[randomIndex] = 'O';
                    cells[randomIndex].textContent = 'O';
                    cells[randomIndex].style.color = 'red';

                    const winner = checkWin();
                    if (winner) {
                        gameActive = false;
                        status.textContent = winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`;
                    } else {
                        currentPlayer = 'X';
                        status.textContent = "Your Turn (X)";
                    }
                }
            };

            cells.forEach(cell => {
                cell.addEventListener('click', () => {
                    const index = cell.dataset.index;
                    if (board[index] === '' && gameActive && currentPlayer === 'X') {
                        board[index] = 'X';
                        cell.textContent = 'X';
                        cell.style.color = 'blue';

                        const winner = checkWin();
                        if (winner) {
                            gameActive = false;
                            status.textContent = winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`;
                        } else {
                            currentPlayer = 'O';
                            status.textContent = "Bot is thinking...";
                            setTimeout(botMove, 500);
                        }
                    }
                });
            });

            resetBtn.addEventListener('click', () => {
                board = ['', '', '', '', '', '', '', '', ''];
                cells.forEach(c => { c.textContent = ''; c.style.color = 'black'; });
                gameActive = true;
                currentPlayer = 'X';
                status.textContent = "Player vs AishwaryBot";
            });
        },

        addTaskbarItem: (item) => {
            const btn = document.createElement('div');
            btn.className = 'start-btn';
            btn.style.marginRight = '5px';
            btn.id = `taskbar-${item.id}`;
            btn.innerHTML = `<img src="${item.iconImg}" style="width:16px;height:16px;"> ${item.name}`;
            btn.onclick = () => {
                const win = openWindows[item.id];
                if (win) {
                    if (win.style.display === 'none') {
                        win.style.display = 'flex';
                        WindowManager.focus(win);
                    } else {
                        if (parseInt(win.style.zIndex) === zIndexCounter) {
                            win.style.display = 'none';
                        } else {
                            WindowManager.focus(win);
                        }
                    }
                }
            };
            taskbarApps.appendChild(btn);
        },

        removeTaskbarItem: (id) => {
            const btn = document.getElementById(`taskbar-${id}`);
            if (btn) btn.remove();
        }
    };

    function renderDesktop() {
        desktopEl.innerHTML = '';
        fileSystem.desktop.forEach(item => {
            const icon = document.createElement('div');
            icon.className = 'desktop-icon';
            icon.innerHTML = `
                <img src="${item.iconImg}" alt="icon">
                <div class="icon-label">${item.name}</div>
            `;

            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.desktop-icon').forEach(el => el.classList.remove('selected'));
                icon.classList.add('selected');
            });

            icon.addEventListener('dblclick', () => {
                WindowManager.open(item);
            });

            desktopEl.appendChild(icon);
        });
    }

    document.body.addEventListener('dblclick', (e) => {
        const fileItem = e.target.closest('.file-item');
        if (fileItem) {
            const id = fileItem.dataset.id;
            let foundItem = null;
            const search = (items) => {
                for (let item of items) {
                    if (item.id === id) return item;
                    if (item.content && Array.isArray(item.content)) {
                        const res = search(item.content);
                        if (res) return res;
                    }
                }
                return null;
            };
            foundItem = search(fileSystem.desktop);

            if (foundItem) {
                WindowManager.open(foundItem);
            }
        }
    });

    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
        startMenu.style.display = 'none';
        startBtn.classList.remove('active');
    });

    document.addEventListener('click', (e) => {
        contextMenu.style.display = 'none';

        if (!e.target.closest('#start-menu') && !e.target.closest('#start-btn')) {
            startMenu.style.display = 'none';
            startBtn.classList.remove('active');
        }

        if (!e.target.closest('.desktop-icon')) {
            document.querySelectorAll('.desktop-icon').forEach(el => el.classList.remove('selected'));
        }
    });

    document.getElementById('ctx-refresh').addEventListener('click', () => {
        desktopEl.innerHTML = '';
        setTimeout(renderDesktop, 200);
    });

    document.getElementById('ctx-new-folder').addEventListener('click', () => {
        alert('New Folder created (Simulation)');
    });

    document.getElementById('ctx-properties').addEventListener('click', () => {
        alert('System Properties: Retro OS v1.0\nUser: Aishwary Gathe');
    });

    startBtn.addEventListener('click', () => {
        const isVisible = startMenu.style.display === 'block';
        startMenu.style.display = isVisible ? 'none' : 'block';
        startBtn.classList.toggle('active', !isVisible);
    });

    renderDesktop();
});
