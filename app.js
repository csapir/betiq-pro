const app = {
    480d7b8455mshb4ee5606f0a42a1p10a646jsn64b65efdb148
    apiKey: 'YOUR_RAPIDAPI_KEY_HERE', 
    currentMatches: [],

    init() {
        if (this.apiKey === 'YOUR_RAPIDAPI_KEY_HERE') {
            document.getElementById('api-status').innerText = 'DEMO MODE (No Key)';
        } else {
            document.getElementById('api-status').innerText = 'API CONNECTED';
        }
    },

    async fetchData() {
        const container = document.getElementById('matches-container');
        container.innerHTML = '<p class="muted">מתחבר לשרתים...</p>';

        const sport = logic.currentSport;
        // הגדרות API משתנות לפי הענף
        const endpoint = sport === 'soccer' 
            ? 'https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all' 
            : 'https://api-basketball.p.rapidapi.com/games?live=all';
        
        const host = sport === 'soccer' 
            ? 'api-football-v1.p.rapidapi.com' 
            : 'api-basketball.p.rapidapi.com';

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': this.apiKey,
                'X-RapidAPI-Host': host
            }
        };

        try {
            const response = await fetch(endpoint, options);
            const result = await response.json();
            
            if (result.response && result.response.length > 0) {
                this.currentMatches = result.response.map(item => {
                    if (sport === 'soccer') {
                        return {
                            home: item.teams.home.name,
                            away: item.teams.away.name,
                            league: item.league.name,
                            score: `${item.goals.home} - ${item.goals.away}`,
                            stats: { s1: 'קרנות: ' + (Math.floor(Math.random()*8)), s2: 'שערים: ' + (item.goals.home + item.goals.away), s3: 'דקה: ' + item.fixture.status.elapsed }
                        };
                    } else {
                        // פורמט כדורסל
                        return {
                            home: item.teams.home.name,
                            away: item.teams.away.name,
                            league: item.league.name,
                            score: `${item.scores.home.total} - ${item.scores.away.total}`,
                            stats: { s1: 'רבע: ' + item.status.short, s2: 'סה"כ נקודות: ' + (item.scores.home.total + item.scores.away.total), s3: 'זמן: LIVE' }
                        };
                    }
                });
                ui.renderMatches(this.currentMatches);
            } else {
                container.innerHTML = `<p class="muted">אין משחקי ${sport} פעילים כרגע.</p>`;
            }
        } catch (error) {
            console.error(error);
            container.innerHTML = '<p class="muted">שגיאה. וודא שהמפתח תקין ב-app.js</p>';
        }
    }
};

const logic = {
    currentSport: 'soccer',
    changeSport(sport) {
        this.currentSport = sport;
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        document.getElementById(`btn-${sport}`).classList.add('active');
        document.getElementById('list-title').innerText = sport === 'soccer' ? 'משחקי כדורגל פעילים' : 'משחקי NBA/כדורסל פעילים';
        app.fetchData();
    }
};

const ui = {
    renderMatches(data) {
        const container = document.getElementById('matches-container');
        container.innerHTML = data.map((m, idx) => `
            <div class="match-card" onclick="ui.showAnalysis(${idx})">
                <div style="font-size:0.7rem; color:var(--accent);">${m.league}</div>
                <div style="display:flex; justify-content:space-between; margin:8px 0">
                    <b>${m.home}</b>
                    <span style="color:var(--accent)">${m.score}</span>
                    <b>${m.away}</b>
                </div>
            </div>
        `).join('');
    },

    showAnalysis(idx) {
        const data = app.currentMatches[idx];
        document.getElementById('analysis-content').style.display = 'block';
        document.getElementById('placeholder-text').style.display = 'none';
        document.getElementById('selected-match-title').innerText = `${data.home} vs ${data.away}`;
        
        document.getElementById('micro-stats-content').innerHTML = `
            <div class="micro-stat-row"><span>📊 מדד 1</span> <b>${data.stats.s1}</b></div>
            <div class="micro-stat-row"><span>🔥 מדד 2</span> <b>${data.stats.s2}</b></div>
            <div class="micro-stat-row"><span>⏱️ זמן אמת</span> <b>${data.stats.s3}</b></div>
        `;
        
        // יצירת גרף מומנטום רנדומלי (מדמה לחץ במשחק)
        const mockTrend = logic.currentSport === 'soccer' ? [1,2,1,4,3] : [102, 110, 108, 115, 112];
        this.updateChart(mockTrend);
    },

    updateChart(trendData) {
        const ctx = document.getElementById('matchChart').getContext('2d');
        if (window.myChart) window.myChart.destroy();
        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['T1', 'T2', 'T3', 'T4', 'T5'],
                datasets: [{
                    data: trendData, borderColor: '#00f2ff', tension: 0.4, borderWidth: 2, pointRadius: 2, fill: true,
                    backgroundColor: 'rgba(0, 242, 255, 0.05)'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                scales: { y: { display: false }, x: { grid: { display: false } } }
            }
        });
    },

    showSection(id) { /* מעבר בין דפים */ }
};
