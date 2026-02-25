const app = {
    config: { oddsKey: '', aiKey: '', isDemo: false },

    start() {
        this.config.oddsKey = document.getElementById('oddsApiKey').value;
        this.config.aiKey = document.getElementById('anthropicKey').value;
        document.getElementById('setup-screen').style.display = 'none';
        this.loadData();
    },

    startDemo() {
        this.config.isDemo = true;
        document.getElementById('setup-screen').style.display = 'none';
        this.loadData();
    },

    loadData() {
        console.log("Fetching live sports data...");
        const currentData = logic.currentSport === 'soccer' ? soccerData : hoopData;
        ui.renderMatches(currentData);
        document.getElementById('active-events').innerText = currentData.length;
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

    getDetailData(matchId) {
        // סימולציה של נתונים מורחבים מה-API
        const isSoccer = this.currentSport === 'soccer';
        return {
            corners: isSoccer ? (Math.random() * 5 + 4).toFixed(1) : 'N/A',
            offsides: isSoccer ? (Math.random() * 3 + 1).toFixed(1) : 'N/A',
            homeGoals: (Math.random() * 1.5 + 1).toFixed(1),
            awayGoals: (Math.random() * 1.2 + 0.8).toFixed(1),
            trend: Array.from({length: 5}, () => Math.floor(Math.random() * 4))
        };
    }
};

const ui = {
    showSection(id) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    },

    renderMatches(data) {
        const container = document.getElementById('matches-container');
        container.innerHTML = data.map((m, idx) => `
            <div class="match-card" onclick="ui.showMatchAnalysis(${idx}, '${m.home} vs ${m.away}')">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--muted)">
                    <span>${m.league}</span>
                    <span>AI Analysis Ready</span>
                </div>
                <div style="margin: 10px 0; font-weight:bold; font-size:1.1rem">
                    ${m.home} vs ${m.away}
                </div>
                <div class="prob-bar-container">
                    <div class="prob-h" style="width: ${m.probH}%"></div>
                    <div class="prob-a" style="width: ${m.probA}%"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem">
                    <span>בית: ${m.probH}%</span>
                    <span>חוץ: ${m.probA}%</span>
                </div>
            </div>
        `).join('');
    },

    showMatchAnalysis(id, title) {
        document.getElementById('analysis-content').style.display = 'block';
        const detail = logic.getDetailData(id);
        
        // עדכון מדדי מיקרו
        const microContainer = document.getElementById('micro-stats-content');
        const labels = logic.currentSport === 'soccer' 
            ? ['🚩 קרנות ממוצע', '🚫 נבדלים', '🏠 שערי בית', '✈️ שערי חוץ']
            : ['🏀 ריבאונדים', '🎯 אחוז מהשדה', '🏠 נקודות בית', '✈️ נקודות חוץ'];
            
        microContainer.innerHTML = `
            <div class="micro-stat-row"><span>${labels[0]}</span> <span>${detail.corners}</span></div>
            <div class="micro-stat-row"><span>${labels[1]}</span> <span>${detail.offsides}</span></div>
            <div class="micro-stat-row"><span>${labels[2]}</span> <span>${detail.homeGoals}</span></div>
            <div class="micro-stat-row"><span>${labels[3]}</span> <span>${detail.awayGoals}</span></div>
        `;

        this.updateChart(detail.trend);
    },

    updateChart(data) {
        const ctx = document.getElementById('matchChart').getContext('2d');
        if (window.myChart) window.myChart.destroy();

        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['G1', 'G2', 'G3', 'G4', 'G5'],
                datasets: [{
                    label: 'מגמת ביצועים (5 משחקים אחרונים)',
                    data: data,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { 
                    y: { beginAtZero: true, grid: { color: '#1e2d4a' } },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
};

// נתוני דמו
const soccerData = [
    { home: 'Arsenal', away: 'Liverpool', probH: 45, probA: 30, league: 'Premier League' },
    { home: 'Real Madrid', away: 'Barcelona', probH: 40, probA: 40, league: 'La Liga' },
    { home: 'Bayern', away: 'Dortmund', probH: 60, probA: 20, league: 'Bundesliga' }
];

const hoopData = [
    { home: 'Lakers', away: 'Warriors', probH: 52, probA: 48, league: 'NBA' },
    { home: 'Celtics', away: 'Knicks', probH: 65, probA: 35, league: 'NBA' }
];
