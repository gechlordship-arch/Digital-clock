// ============================================
// DIGITAL CLOCK — with world clock, 12/24h, dynamic bg
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

    // Dynamic gradient based on time of day
    function updateBackground(hour) {
        if (lightMode) return; // don't override light mode

        let gradient;
        if (hour >= 5 && hour < 8) {
            // Sunrise
            gradient = 'linear-gradient(135deg, #f59e0b 0%, #ec4899 60%, #1e1b4b 100%)';
        } else if (hour >= 8 && hour < 12) {
            // Morning
            gradient = 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)';
        } else if (hour >= 12 && hour < 17) {
            // Afternoon
            gradient = 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)';
        } else if (hour >= 17 && hour < 20) {
            // Sunset
            gradient = 'linear-gradient(135deg, #f97316 0%, #7c2d12 50%, #1e1b4b 100%)';
        } else {
            // Night
            gradient = 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)';
        }
        document.body.style.background = gradient;
    }

    // ---------- 5. Format a time in a specific timezone ----------
    function formatTimeInZone(date, timeZone, use24) {
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: !use24,
            timeZone: timeZone
        };
        return date.toLocaleTimeString('en-US', options);
    }

    // ---------- 6. Build the world clock once ----------
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

    // ---------- 7. Update the world clock ----------
    function updateWorldClock() {
        const now = new Date();
        cities.forEach(city => {
            const el = document.querySelector(`[data-tz="${city.tz}"]`);
            if (el) el.textContent = formatTimeInZone(now, city.tz, use24Hour);
        });
    }

    // ---------- 8. Main update function ----------
    function updateClock() {
        const now = new Date();

        const hours24   = now.getHours();
        const minutes   = now.getMinutes();
        const seconds   = now.getSeconds();

        // Decide what to display for hours + AM/PM
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

        // Update time digits
        hoursEl.textContent   = pad(displayHours);
        minutesEl.textContent = pad(minutes);
        secondsEl.textContent = pad(seconds);

        if (use24Hour) {
            ampmEl.classList.add('hidden');
        } else {
            ampmEl.classList.remove('hidden');
            ampmEl.textContent = displayAmPm;
        }

        // Greeting
        greetingEl.textContent = getGreeting(hours24);

        // Date
        dateEl.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Day progress
        const secondsToday = hours24 * 3600 + minutes * 60 + seconds;
        const totalSeconds = 24 * 3600;
        const percent = (secondsToday / totalSeconds) * 100;
        progressFill.style.width = percent + '%';
        progressPct.textContent = percent.toFixed(1) + '%';

        // Dynamic background
        updateBackground(hours24);

        // World clock
        updateWorldClock();
    }

    // ---------- 9. Apply saved theme on load ----------
    function applyTheme() {
        if (lightMode) {
            document.body.classList.add('light');
            themeToggle.textContent = '☀️';
        } else {
            document.body.classList.remove('light');
            themeToggle.textContent = '🌙';
            // Reapply dynamic bg
            updateBackground(new Date().getHours());
        }
    }

    // ---------- 10. Apply saved format on load ----------
    function applyFormat() {
        formatToggle.textContent = use24Hour ? '24h' : '12h';
    }

    // ---------- 11. Event listeners ----------
    themeToggle.addEventListener('click', () => {
        lightMode = !lightMode;
        localStorage.setItem('clockTheme', lightMode ? 'light' : 'dark');
        applyTheme();
    });

    formatToggle.addEventListener('click', () => {
        use24Hour = !use24Hour;
        localStorage.setItem('clockFormat', use24Hour ? '24' : '12');
        applyFormat();
        updateClock(); // refresh immediately
    });

    // ---------- 12. Initialize & run ----------
    applyTheme();
    applyFormat();
    buildWorldClock();

    updateClock();                      // first run (no delay)
    setInterval(updateClock, 1000);     // then every second

    console.log('⏰ Clock running with world clock + 12/24h toggle');
});