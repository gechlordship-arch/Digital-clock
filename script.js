// ============================================
// DIGITAL + ANALOG CLOCK
// ============================================

document.addEventListener('DOMContentLoaded', function () {

    // ---------- 1. Grab DOM elements ----------
    const hoursEl       = document.getElementById('hours');
    const minutesEl     = document.getElementById('minutes');
    const secondsEl     = document.getElementById('seconds');
    const ampmEl        = document.getElementById('ampm');
    const dateEl        = document.getElementById('date');
    const greetingEl    = document.getElementById('greeting');
    const themeToggle   = document.getElementById('themeToggle');
    const formatToggle  = document.getElementById('formatToggle');
    const progressFill  = document.getElementById('progressFill');
    const progressPct   = document.getElementById('progressPercent');
    const citiesEl      = document.getElementById('cities');

    // Analog clock
    const hourHand      = document.getElementById('hourHand');
    const minuteHand    = document.getElementById('minuteHand');
    const secondHand    = document.getElementById('secondHand');
    const hourMarkers   = document.getElementById('hourMarkers');

    // ---------- 2. State ----------
    let use24Hour = localStorage.getItem('clockFormat') === '24';
    let lightMode = localStorage.getItem('clockTheme') === 'light';

    // ---------- 3. World clock cities ----------
    const cities = [
        { name: 'New York', tz: 'America/New_York' },
        { name: 'London',   tz: 'Europe/London' },
        { name: 'Dubai',    tz: 'Asia/Dubai' },
        { name: 'Tokyo',    tz: 'Asia/Tokyo' }
    ];

    // ---------- 4. Helpers ----------
    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function getGreeting(hour) {
        if (hour < 12) return '☀️ Good morning';
        if (hour < 17) return '🌤️ Good afternoon';
        if (hour < 21) return '🌆 Good evening';
        return '🌙 Good night';
    }

    function updateBackground(hour) {
        if (lightMode) return;
        let gradient;
        if (hour >= 5 && hour < 8) {
            gradient = 'linear-gradient(135deg, #f59e0b 0%, #ec4899 60%, #1e1b4b 100%)';
        } else if (hour >= 8 && hour < 12) {
            gradient = 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)';
        } else if (hour >= 12 && hour < 17) {
            gradient = 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)';
        } else if (hour >= 17 && hour < 20) {
            gradient = 'linear-gradient(135deg, #f97316 0%, #7c2d12 50%, #1e1b4b 100%)';
        } else {
            gradient = 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)';
        }
        document.body.style.background = gradient;
    }

    function formatTimeInZone(date, timeZone, use24) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: !use24,
            timeZone: timeZone
        });
    }

    // ---------- 5. Build hour markers on the analog clock ----------
    function buildHourMarkers() {
        hourMarkers.innerHTML = '';
        const cx = 100, cy = 100, radius = 82;

        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);

            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', x.toFixed(2));
            dot.setAttribute('cy', y.toFixed(2));
            // Bigger + blue for 12, 3, 6, 9
            const isMajor = i % 3 === 0;
            dot.setAttribute('r', isMajor ? '4' : '2.2');
            dot.setAttribute('class', 'marker' + (isMajor ? ' major' : ''));
            hourMarkers.appendChild(dot);
        }
    }

    // ---------- 6. Update the analog clock ----------
    function updateAnalogClock(now) {
        const hours   = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const ms      = now.getMilliseconds();

        // Continuous motion — smoother hands
        const secondDeg = (seconds + ms / 1000) * 6;                 // 360 / 60
        const minuteDeg = (minutes + seconds / 60) * 6;              // 360 / 60
        const hourDeg   = ((hours % 12) + minutes / 60) * 30;        // 360 / 12

        // Rotate around center (100, 100)
        hourHand.setAttribute('transform',   `rotate(${hourDeg} 100 100)`);
        minuteHand.setAttribute('transform', `rotate(${minuteDeg} 100 100)`);
        secondHand.setAttribute('transform', `rotate(${secondDeg} 100 100)`);
    }

    // ---------- 7. Build the world clock once ----------
    function buildWorldClock() {
        citiesEl.innerHTML = '';
        cities.forEach(city => {
            const div = document.createElement('div');
            div.className = 'city';
            div.innerHTML = `
                <div class="city-name">${city.name}</div>
                <div class="city-time" data-tz="${city.tz}">--:--</div>
            `;
            citiesEl.appendChild(div);
        });
    }

    function updateWorldClock(now) {
        cities.forEach(city => {
            const el = document.querySelector(`[data-tz="${city.tz}"]`);
            if (el) el.textContent = formatTimeInZone(now, city.tz, use24Hour);
        });
    }

    // ---------- 8. Main update function ----------
    function updateClock() {
        const now = new Date();

        const hours24 = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        // --- Digital time ---
        let displayHours;
        let displayAmPm;

        if (use24Hour) {
            displayHours = hours24;
            displayAmPm  = '';
        } else {
            const ampm = hours24 >= 12 ? 'PM' : 'AM';
            let h12 = hours24 % 12;
            if (h12 === 0) h12 = 12;
            displayHours = h12;
            displayAmPm  = ampm;
        }

        hoursEl.textContent   = pad(displayHours);
        minutesEl.textContent = pad(minutes);
        secondsEl.textContent = pad(seconds);

        if (use24Hour) {
            ampmEl.classList.add('hidden');
        } else {
            ampmEl.classList.remove('hidden');
            ampmEl.textContent = displayAmPm;
        }

        // --- Greeting + date ---
        greetingEl.textContent = getGreeting(hours24);
        dateEl.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // --- Day progress ---
        const secondsToday = hours24 * 3600 + minutes * 60 + seconds;
        const totalSeconds = 24 * 3600;
        const percent = (secondsToday / totalSeconds) * 100;
        progressFill.style.width = percent + '%';
        progressPct.textContent = percent.toFixed(1) + '%';

        // --- Dynamic background ---
        updateBackground(hours24);

        // --- Analog clock ---
        updateAnalogClock(now);

        // --- World clock ---
        updateWorldClock(now);
    }

    // ---------- 9. Apply saved theme ----------
    function applyTheme() {
        if (lightMode) {
            document.body.classList.add('light');
            themeToggle.textContent = '☀️';
        } else {
            document.body.classList.remove('light');
            themeToggle.textContent = '🌙';
            updateBackground(new Date().getHours());
        }
    }

    function applyFormat() {
        formatToggle.textContent = use24Hour ? '24h' : '12h';
    }

    // ---------- 10. Event listeners ----------
    themeToggle.addEventListener('click', () => {
        lightMode = !lightMode;
        localStorage.setItem('clockTheme', lightMode ? 'light' : 'dark');
        applyTheme();
    });

    formatToggle.addEventListener('click', () => {
        use24Hour = !use24Hour;
        localStorage.setItem('clockFormat', use24Hour ? '24' : '12');
        applyFormat();
        updateClock();
    });

    // ---------- 11. Initialize & run ----------
    applyTheme();
    applyFormat();
    buildWorldClock();
    buildHourMarkers();

    updateClock();
    setInterval(updateClock, 1000);

    console.log('⏰ Digital + Analog clock running');
});