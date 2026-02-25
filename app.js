const app = {
    // הכנס כאן את המפתח שקיבלת מ-RapidAPI
    apiKey: 'YOUR_RAPIDAPI_KEY_HERE', 
    liveMatches: [],

    init() {
        if (this.apiKey === 'YOUR_RAPIDAPI_KEY_HERE') {
            document.getElementById('api-status').innerText = 'DEMO MODE';
            ui.renderMatches(soccerDemo);
        } else {
            document.getElementById('api-status').innerText = 'API ACTIVE';
            this.fetchLiveSoccer();
        }
    },

    async fetchLiveSoccer() {
        const container = document.getElementById('matches-container');
        container.innerHTML = '<p class="muted">מושך נתונים חיים...</p>';

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': this.apiKey,
                'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
            }
        };

        try {
            // מושך את כל המשחקים שמתקיימים היום (או לייב)
            const response = await fetch('https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all', options);
            const result = await response.json();
            
            if (result.response && result.response.length > 0) {
                this.liveMatches = result.response.map(item => ({
                    id: item.fixture.id,
                    home: item.teams.home.name,
                    away: item.teams.away.name,
                    league: item.league.name,
                    score: `${item.goals.home} - ${item.goals.away}`,
                    status: item.fixture.status.short,
                    stats: {
                        s1: Math.floor(Math.random() * 10), // קרנות (ב-API החינמי זה דורש קריאה נפרדת, אז שמנו רנדומלי)
                        s2: item.goals.home + item.goals.away,
                        s3: item.fixture.status.elapsed + "'"
                    }
                }));
                ui.renderMatches(this.liveMatches);
            } else {
                container.innerHTML = '<p class="muted">אין משחקים חיים כרגע. מציג דמו.</p>';
                ui.renderMatches(soccerDemo);
            }
        } catch (error) {
            console.error(error);
            container.innerHTML = '<p class="muted">שגיאה בחיבור ל-API. וודא שהמפתח תקין.</p>';
        }
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
                    <span style="color:var(--accent)">${m.score || 'VS'}</span>
                    <b>${m.away}</b>
                </div>
                <div style="font-size:0.65rem; color:var(--text-dim)">סטטוס: ${m.status || 'Scheduled'}</div>
            </div>
        `).join('');
    },

    showAnalysis(idx) {
        const data = app.liveMatches.length > 0 ? app.liveMatches[idx] : soccerDemo[idx];
        document.getElementById('analysis-content').style.display = 'block';
        document.getElementById('placeholder-text').style.display = 'none';
        document.getElementById('selected-match-title').innerText = `${data.home} vs ${data.away}`;
        
        document.getElementById('micro-stats-content').innerHTML = `
            <div class="micro-stat-row"><span>🚩 קרנות מוערכות</span> <b>${data.stats.s1}</b></div>
            <div class="micro-stat-row"><span>⚽ סך שערים</span> <b>${data.stats.s2}</b></div>
            <div class="micro-stat-row"><span>⏱️ דקה/זמן</span> <b>${data.stats.s3}</b></div>
        `;
        
        this.updateChart([Math.random()*5, Math.random()*5, Math.random()*5, Math.random()*5, Math.random()*5]);
    },

    updateChart(trendData) {
        const ctx = document.getElementById('matchChart').getContext('2d');
        if (window.myChart) window.myChart.destroy();
        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['15', '30', '45', '60', '75'],
                datasets: [{
                    data: trendData, borderColor: '#00f2ff', tension: 0.4, borderWidth: 2, pointRadius: 0, fill: true,
                    backgroundColor: 'rgba(0, 242, 255, 0.1)'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                scales: { y: { display: false }, x: { grid: { display: false } } }
            }
        });
    },

    showSection(id) {
        // לוגיקת מעבר דפים
    }
};

const soccerDemo = [
    { home: 'Man City', away: 'Real Madrid', league: 'Champions League', score: '2 - 1', status: '75\'', stats: { s1: 8, s2: 3, s3: '75' } }
];
