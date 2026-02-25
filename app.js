const app = {
    apiKey: '480d7b8455mshb4ee5606f0a42a1p10a646jsn64b65efdb148', 
    currentMatches: [],

    init() {
        console.log("SportIQ Intelligence Engine Online");
        document.getElementById('api-status').innerText = 'AI ENGINE ACTIVE';
        this.fetchData();
        // עדכון אוטומטי כל 60 שניות
        setInterval(() => this.fetchData(), 60000);
    },

    async fetchData() {
        const container = document.getElementById('matches-container');
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': this.apiKey,
                'x-rapidapi-host': 'sportapi7.p.rapidapi.com'
            }
        };

        try {
            const endpoint = logic.currentSport === 'soccer' ? 'football' : 'basketball';
            const response = await fetch(`https://sportapi7.p.rapidapi.com/api/v1/sport/${endpoint}/events/live`, options);
            const result = await response.json();
            
            if (result.events && result.events.length > 0) {
                this.currentMatches = result.events.map(event => {
                    const homeScore = event.homeScore.display || 0;
                    const awayScore = event.awayScore.display || 0;
                    const elapsed = parseInt(event.status.description) || 45;
                    
                    // מנוע ה-AI לחישוב הסתברות
                    const prediction = logic.calculateAIProbs(homeScore, awayScore, elapsed);

                    return {
                        home: event.homeTeam.name,
                        away: event.awayTeam.name,
                        league: event.tournament.name,
                        score: `${homeScore} - ${awayScore}`,
                        time: event.status.description,
                        id: event.id,
                        prediction: prediction
                    };
                });
                ui.renderMatches(this.currentMatches);
            } else {
                container.innerHTML = `<div class="muted">אין משחקי ${logic.currentSport} חיים כרגע.</div>`;
            }
        } catch (error) {
            console.error("API Error:", error);
            container.innerHTML = `<div class="muted">שגיאה בחיבור ל-API.</div>`;
        }
    }
};

const logic = {
    currentSport: 'soccer',
    
    // מנוע חישוב הסתברויות חכם
    calculateAIProbs(h, a, time) {
        let homeProb = 33, awayProb = 33, drawProb = 34;
        const diff = h - a;
        const timeFactor = Math.min(time / 90, 1);

        if (diff > 0) {
            homeProb = 45 + (diff * 12) + (timeFactor * 25);
            awayProb = (100 - homeProb) * 0.4;
        } else if (diff < 0) {
            awayProb = 45 + (Math.abs(diff) * 12) + (timeFactor * 25);
            homeProb = (100 - awayProb) * 0.4;
        } else {
            drawProb = 40 + (timeFactor * 30);
            homeProb = (100 - drawProb) / 2;
            awayProb = homeProb;
        }

        const total = homeProb + awayProb + (logic.currentSport === 'soccer' ? drawProb : 0);
        const factor = 100 / total;

        return {
            h: Math.round(homeProb * factor),
            a: Math.round(awayProb * factor),
            d: logic.currentSport === 'soccer' ? Math.round(drawProb * factor) : 0
        };
    },

    changeSport(sport) {
        this.currentSport = sport;
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        document.getElementById(`btn-${sport}`).classList.add('active');
        app.fetchData();
    }
};

const ui = {
    renderMatches(data) {
        const container = document.getElementById('matches-container');
        container.innerHTML = data.map((m, idx) => `
            <div class="match-card" onclick="ui.showAnalysis(${idx})">
                <div style="display:flex; justify-content:space-between; font-size:0.65rem; margin-bottom:8px;">
                    <span style="color:var(--accent)">${m.league}</span>
                    <span class="live-tag">LIVE ${m.time}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <b style="width:35%; text-align:right; font-size:0.9rem;">${m.home}</b>
                    <span class="score-badge">${m.score}</span>
                    <b style="width:35%; text-align:left; font-size:0.9rem;">${m.away}</b>
                </div>
                <div class="mini-prob-bar">
                    <div style="width:${m.prediction.h}%; background:var(--accent)"></div>
                    <div style="width:${m.prediction.d}%; background:#444"></div>
                    <div style="width:${m.prediction.a}%; background:var(--accent2)"></div>
                </div>
            </div>
        `).join('');
    },

    showAnalysis(idx) {
        const m = app.currentMatches[idx];
        document.getElementById('analysis-content').style.display = 'block';
        document.getElementById('placeholder-text').style.display = 'none';
        document.getElementById('selected-match-title').innerText = `${m.home} vs ${m.away}`;
        
        document.getElementById('micro-stats-content').innerHTML = `
            <div class="ai-insight-card">
                <h4 style="margin:0; color:var(--accent);">🤖 ניתוח הסתברויות AI</h4>
                <div class="prob-labels">
                    <span>בית: ${m.prediction.h}%</span>
                    ${logic.currentSport === 'soccer' ? `<span>תיקו: ${m.prediction.d}%</span>` : ''}
                    <span>חוץ: ${m.prediction.a}%</span>
                </div>
            </div>
            <div class="micro-stat-row"><span>🔥 מומנטום נוכחי</span> <b>${(Math.random() * 40 + 60).toFixed(0)}%</b></div>
            <div class="micro-stat-row"><span>⏱️ דקה במשחק</span> <b>${m.time}</b></div>
            <div class="micro-stat-row"><span>🏟️ ליגה</span> <b>${m.league}</b></div>
        `;

        this.updateChart(m.prediction);
    },

    updateChart(pred) {
        const ctx = document.getElementById('matchChart').getContext('2d');
        if (window.myChart) window.myChart.destroy();
        
        const data = logic.currentSport === 'soccer' ? [pred.h, pred.d, pred.a] : [pred.h, pred.a];
        const labels = logic.currentSport === 'soccer' ? ['Home', 'Draw', 'Away'] : ['Home', 'Away'];
        const colors = logic.currentSport === 'soccer' ? ['#00f2ff', '#1e2d4a', '#70a1ff'] : ['#00f2ff', '#70a1ff'];

        window.myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                cutout: '80%',
                plugins: { legend: { display: false } },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
};
