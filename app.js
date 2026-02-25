const app = {
    // במידה ותרצה להזין מפתחות בעתיד, שים אותם כאן בגרשיים
    config: { 
        oddsKey: '', 
        aiKey: '' 
    },

    init() {
        console.log("SportIQ Pro Loaded");
        this.loadData();
    },

    async loadData() {
        // אם אין מפתח, נשתמש בנתוני דמו. אם יש, ננסה למשוך מה-API.
        if (!this.config.oddsKey) {
            console.log("No API key - using Demo Mode");
            const data = logic.currentSport === 'soccer' ? soccerDemo : hoopDemo;
            ui.renderMatches(data);
            ui.renderAlerts(data);
            document.getElementById('active-events').innerText = data.length;
        } else {
            this.fetchLiveOdds();
        }
    },

    async fetchLiveOdds() {
        // פונקציית משיכה מה-API (פעילה רק אם יש מפתח)
        try {
            const response = await fetch(`https://api.the-odds-api.com/v4/sports/upcoming/odds/?apiKey=${this.config.oddsKey}&regions=eu`);
            const data = await response.json();
            // כאן תבוא לוגיקת עיבוד הנתונים מה-API
            console.log("Live Data Fetched:", data);
        } catch (e) {
            console.error("API Fetch Error", e);
        }
    }
};

const logic = {
    currentSport: 'soccer',

    filterSport(sport) {
        this.currentSport = sport;
        document.querySelectorAll('.sport-tab').forEach(t => t.classList.remove('active'));
        document.getElementById(`btn-${sport}`).classList.add('active');
        app.loadData();
    },

    generateStats(id) {
        const isSoccer = this.currentSport === 'soccer';
        return {
            corners: (Math.random() * 6 + 4).toFixed(1),
            offsides: (Math.random() * 3 + 1).toFixed(1),
            homeGoals: (Math.random() * 1.5 + 1).toFixed(1),
            awayGoals: (Math.random() * 1.2 + 0.8).toFixed(1),
            trend: Array.from({length: 5}, () => Math.floor(Math.random() * 4))
        };
    }
};

const ui = {
    renderMatches(data) {
        const container = document.getElementById('matches-container');
        container.innerHTML = data.map((m, idx) => `
            <div class="match-card" onclick="ui.showAnalysis(${idx})">
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--muted)">
                    <span>${m.league}</span>
                    <span>AI Analysed</span>
                </div>
                <div style="margin: 8px 0; font-weight:bold;">${m.home} vs ${m.away}</div>
                <div class="prob-bar-container">
                    <div class="prob-h" style="width: ${m.probH}%"></div>
                    <div class="prob-a" style="width: ${m.probA}%"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.7rem">
                    <span>בית: ${m.probH}%</span>
                    <span>חוץ: ${m.probA}%</span>
                </div>
            </div>
        `).join('');
    },

    renderAlerts(data) {
        const container = document.getElementById('quick-alerts');
        const alerts = [];
        data.forEach(m => {
            if (m.probH > 60) alerts.push(`🔥 פייבוריטית ברורה: ${m.home}`);
            if (m.isHighCorners) alerts.push(`🚩 רצף קרנות: ${m.home}`);
        });
        container.innerHTML = alerts.map(a => `<div class="alert-pill">🔔 ${a}</div>`).join('');
    },

    showAnalysis(id) {
        document.getElementById('analysis-content').style.display = 'block';
        document.getElementById('placeholder-text').style.display = 'none';
        const stats = logic.generateStats(id);
        const labels = logic.currentSport === 'soccer' 
            ? ['🚩 קרנות (ממוצע)', '🚫 נבדלים', '🏠 שערי בית', '✈️ שערי חוץ']
            : ['🏀 ריבאונדים', '🎯 % מהשדה', '🏠 נקודות בית', '✈️ נקודות חוץ'];

        document.getElementById('micro-stats-content').innerHTML = `
            <div class="micro-stat-row"><span>${labels[0]}</span><b>${stats.corners}</b></div>
            <div class="micro-stat-row"><span>${labels[1]}</span><b>${stats.offsides}</b></div>
            <div class="micro-stat-row"><span>${labels[2]}</span><b>${stats.homeGoals}</b></div>
            <div class="micro-stat-row"><span>${labels[3]}</span><b>${stats.awayGoals}</b></div>
        `;
        this.updateChart(stats.trend);
    },

    updateChart(data) {
        const ctx = document.getElementById('matchChart').getContext('2d');
        if (window.myChart) window.myChart.destroy();
        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['G1', 'G2', 'G3', 'G4', 'G5'],
                datasets: [{
                    data: data, borderColor: '#00d4ff', backgroundColor: 'rgba(0, 212, 255, 0.1)', fill: true, tension: 0.4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: '#1e2d4a' } }, x: { grid: { display: false } } }
            }
        });
    },

    showSection(id) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }
};

const soccerDemo = [
    { home: 'Arsenal', away: 'Liverpool', probH: 45, probA: 30, league: 'Premier League', isHighCorners: true },
    { home: 'Real Madrid', away: 'Barcelona', probH: 62, probA: 18, league: 'La Liga', isHighCorners: false }
];

const hoopDemo = [
    { home: 'Lakers', away: 'Warriors', probH: 52, probA: 48, league: 'NBA' },
    { home: 'Celtics', away: 'Knicks', probH: 70, probA: 30, league: 'NBA' }
];
