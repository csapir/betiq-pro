const app = {
    // כדי לקבל מידע אמיתי בחינם:
    // 1. הירשם ל-https://rapidapi.com/
    // 2. חפש את "API-Football" או "NBA Sensei"
    // 3. העתק את ה-API Key שלך לכאן
    apiKey: 'YOUR_RAPIDAPI_KEY_HERE', 

    init() {
        this.loadData();
    },

    async loadData() {
        if (this.apiKey !== 'YOUR_RAPIDAPI_KEY_HERE') {
            this.fetchFromLiveAPI();
        } else {
            // נתוני דמו מושקעים
            ui.renderMatches(logic.currentSport === 'soccer' ? soccerDemo : hoopDemo);
        }
    },

    async fetchFromLiveAPI() {
        // דוגמה לקריאה ל-API כדורגל (חינמי עד כמות מסוימת)
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': this.apiKey,
                'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
            }
        };
        // fetch('https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all', options)...
    }
};

const logic = {
    currentSport: 'soccer',
    filterSport(sport) {
        this.currentSport = sport;
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        document.getElementById(`btn-${sport}`).classList.add('active');
        app.loadData();
    }
};

const ui = {
    renderMatches(data) {
        const container = document.getElementById('matches-container');
        container.innerHTML = data.map((m, idx) => `
            <div class="match-card" onclick="ui.showAnalysis(${idx})">
                <div style="font-size:0.7rem; color:var(--accent); margin-bottom:5px">● ${m.league}</div>
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <span style="font-weight:600">${m.home}</span>
                    <span style="color:var(--text-dim)">VS</span>
                    <span style="font-weight:600">${m.away}</span>
                </div>
            </div>
        `).join('');
    },

    showAnalysis(id) {
        const data = logic.currentSport === 'soccer' ? soccerDemo[id] : hoopDemo[id];
        document.getElementById('analysis-content').style.display = 'block';
        document.getElementById('placeholder-text').style.display = 'none';
        document.getElementById('selected-match-title').innerText = `${data.home} vs ${data.away}`;
        
        // עדכון גרף
        this.updateChart(data.trend);
        
        // עדכון בר הסתברות
        document.getElementById('win-bar').style.width = data.probH + '%';
        
        // עדכון סטטיסטיקות
        document.getElementById('micro-stats-content').innerHTML = `
            <div class="micro-stat-row"><span>🚩 קרנות</span> <b>${data.stats.s1}</b></div>
            <div class="micro-stat-row"><span>🎯 בעיטות למסגרת</span> <b>${data.stats.s2}</b></div>
            <div class="micro-stat-row"><span>🏠 שערים למשחק</span> <b>${data.stats.s3}</b></div>
        `;
    },

    updateChart(data) {
        const ctx = document.getElementById('matchChart').getContext('2d');
        if (window.myChart) window.myChart.destroy();
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(0, 242, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 242, 255, 0)');

        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['G1', 'G2', 'G3', 'G4', 'G5'],
                datasets: [{
                    data: data,
                    borderColor: '#00f2ff',
                    borderWidth: 3,
                    fill: true,
                    backgroundColor: gradient,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { display: false },
                    x: { grid: { display: false }, ticks: { color: '#555' } }
                }
            }
        });
    }
};

const soccerDemo = [
    { home: 'Real Madrid', away: 'Barcelona', league: 'LA LIGA', probH: 65, stats: { s1: '6.2', s2: '8.1', s3: '2.4' }, trend: [2, 3, 1, 4, 2] },
    { home: 'Man City', away: 'Arsenal', league: 'PREMIER LEAGUE', probH: 58, stats: { s1: '7.8', s2: '6.5', s3: '2.8' }, trend: [3, 3, 2, 5, 4] }
];

const hoopDemo = [
    { home: 'Lakers', away: 'Warriors', league: 'NBA', probH: 52, stats: { s1: '45.2', s2: '12.1', s3: '112.5' }, trend: [110, 105, 118, 122, 115] }
];
