const app = {
    480d7b8455mshb4ee5606f0a42a1p10a646jsn64b65efdb148
    apiKey: '480d7b8455mshb4ee5606f0a42a1p10a646jsn64b65efdb148', 
    currentMatches: [],

    init() {
        console.log("SportIQ Ultra Active with SportAPI");
        document.getElementById('api-status').innerText = 'SPORT-API ACTIVE';
        // טעינה ראשונית של כדורגל
        this.fetchData();
    },

    async fetchData() {
        const container = document.getElementById('matches-container');
        container.innerHTML = '<p class="muted">סורק משחקים חיים ב-SportAPI...</p>';

        const sportId = logic.currentSport === 'soccer' ? '1' : '2'; // 1 לכדורגל, 2 לכדורסל ברוב ה-APIs
        
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': this.apiKey,
                'x-rapidapi-host': 'sportapi7.p.rapidapi.com'
            }
        };

        try {
            // קריאה למשחקים חיים (Live) מה-SportAPI שלך
            const response = await fetch('https://sportapi7.p.rapidapi.com/api/v1/sport/football/events/live', options);
            const result = await response.json();
            
            if (result.events && result.events.length > 0) {
                this.currentMatches = result.events.map(event => ({
                    home: event.homeTeam.name,
                    away: event.awayTeam.name,
                    league: event.tournament.name,
                    score: `${event.homeScore.display || 0} - ${event.awayScore.display || 0}`,
                    time: event.status.description,
                    id: event.id,
                    stats: {
                        s1: "לחץ: " + (event.homeScore.period1 || 0),
                        s2: "סהזמן: " + event.status.description,
                        s3: "ID: " + event.id
                    }
                }));
                ui.renderMatches(this.currentMatches);
            } else {
                container.innerHTML = `<p class="muted">אין משחקי ${logic.currentSport} חיים ברגע זה.</p>`;
            }
        } catch (error) {
            console.error("API Error:", error);
            container.innerHTML = '<p class="muted">שגיאה בתקשורת. וודא שאישרת את ה-Plan ב-RapidAPI.</p>';
        }
    }
};

const logic = {
    currentSport: 'soccer',
    changeSport(sport) {
        this.currentSport = sport;
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        const btn = document.getElementById(`btn-${sport}`);
        if(btn) btn.classList.add('active');
        app.fetchData();
    }
};

const ui = {
    renderMatches(data) {
        const container = document.getElementById('matches-container');
        container.innerHTML = data.map((m, idx) => `
            <div class="match-card" onclick="ui.showAnalysis(${idx})">
                <div style="font-size:0.7rem; color:var(--accent);">${m.league}</div>
                <div style="display:flex; justify-content:space-between; margin:8px 0; align-items:center;">
                    <b style="flex:1; text-align:right;">${m.home}</b>
                    <span style="background:var(--accent); color:black; padding:2px 8px; border-radius:4px; margin:0 10px; font-weight:bold;">${m.score}</span>
                    <b style="flex:1; text-align:left;">${m.away}</b>
                </div>
                <div style="font-size:0.65rem; color:var(--text-dim)">זמן: ${m.time}</div>
            </div>
        `).join('');
    },

    showAnalysis(idx) {
        const data = app.currentMatches[idx];
        document.getElementById('analysis-content').style.display = 'block';
        document.getElementById('placeholder-text').style.display = 'none';
        document.getElementById('selected-match-title').innerText = `${data.home} vs ${data.away}`;
        
        document.getElementById('micro-stats-content').innerHTML = `
            <div class="micro-stat-row"><span>🏟️ ליגה</span> <b>${data.league}</b></div>
            <div class="micro-stat-row"><span>⏱️ סטטוס</span> <b>${data.time}</b></div>
            <div class="micro-stat-row"><span>🆔 מזהה משחק</span> <b>${data.id}</b></div>
        `;
        
        // גרף מומנטום רנדומלי המבוסס על תוצאת המשחק
        const base = parseInt(data.score.split('-')[0]) + 1;
        this.updateChart([base, base + 2, base + 1, base + 3]);
    },

    updateChart(trendData) {
        const ctx = document.getElementById('matchChart').getContext('2d');
        if (window.myChart) window.myChart.destroy();
        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [{
                    data: trendData,
                    borderColor: '#00f2ff',
                    backgroundColor: 'rgba(0, 242, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { display: false },
                    x: { grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });
    },

    showSection(id) {
        // פונקציונליות ניווט במידה ותרצה להוסיף דפים
    }
};
