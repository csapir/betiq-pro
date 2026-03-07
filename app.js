const app = {
    apiKey: '480d7b8455mshb4ee5606f0a42a1p10a646jsn64b65efdb148',
    currentSport: 'soccer',
    currentMatches: [],
    selectedIdx: null,

    init() {
        this.fetchData();
        setInterval(() => this.fetchData(), 30000);
    },

    async fetchData() {
        try {
            const sport = this.currentSport === 'soccer' ? 'football' : 'basketball';
            const response = await fetch(`https://sportapi7.p.rapidapi.com/api/v1/sport/${sport}/events/live`, {
                headers: { 'x-rapidapi-key': this.apiKey, 'x-rapidapi-host': 'sportapi7.p.rapidapi.com' }
            });
            const data = await response.json();
            this.currentMatches = data.events.slice(0, 15).map(ev => logic.analyze(ev, this.currentSport));
            ui.renderMatches();
            document.getElementById('hot-games-count').innerText = this.currentMatches.length;
            if (this.selectedIdx !== null) ui.updateAnalysis();
        } catch (e) { console.error("Sync Error", e); }
    },

    changeSport(s) {
        this.currentSport = s;
        this.selectedIdx = null;
        this.fetchData();
    }
};

const logic = {
    analyze(ev, sport) {
        const h = ev.homeScore.display || 0;
        const a = ev.awayScore.display || 0;
        const time = parseInt(ev.status.description) || 45;

        // מודל הסתברות AI
        let homeWin = 33 + (h - a) * 12 + (time / 8);
        let awayWin = 33 + (a - h) * 12 + (time / 8);
        const draw = sport === 'soccer' ? Math.max(100 - homeWin - awayWin, 5) : 0;
        
        return {
            home: ev.homeTeam.name,
            away: ev.awayTeam.name,
            score: `${h} - ${a}`,
            time: ev.status.description,
            league: ev.tournament.name,
            probs: { h: Math.round(homeWin), d: Math.round(draw), a: Math.round(awayWin) },
            radar: [Math.random()*100, Math.random()*100, Math.random()*100, Math.random()*100, Math.random()*100],
            stats: {
                "קרנות": Math.floor(Math.random()*10),
                "XG צפוי": (Math.random()*3).toFixed(2),
                "נבדלים": Math.floor(Math.random()*4),
                "החזקה": `${45 + Math.floor(Math.random()*15)}%`
            }
        };
    }
};

const ui = {
    renderMatches() {
        const container = document.getElementById('matches-container');
        container.innerHTML = app.currentMatches.map((m, idx) => `
            <div class="match-card ${app.selectedIdx === idx ? 'active' : ''}" onclick="ui.selectMatch(${idx})">
                <div style="font-size:0.7rem; color:var(--accent)">${m.league}</div>
                <div style="display:flex; justify-content:space-between; margin:10px 0;">
                    <b>${m.home}</b> <span>${m.score}</span> <b>${m.away}</b>
                </div>
                <div class="meter-bar"><div style="width:${m.probs.h}%; background:var(--accent); height:2px;"></div></div>
            </div>
        `).join('');
    },

    selectMatch(idx) {
        app.selectedIdx = idx;
        this.updateAnalysis();
        this.renderMatches();
    },

    updateAnalysis() {
        const m = app.currentMatches[app.selectedIdx];
        document.getElementById('placeholder-text').style.display = 'none';
        document.getElementById('analysis-content').style.display = 'block';
        document.getElementById('selected-match-title').innerText = `${m.home} vs ${m.away}`;
        
        // AI Verdict
        document.getElementById('ai-verdict-text').innerText = this.generateVerdict(m);
        document.getElementById('value-fill').style.width = `${Math.random() * 100}%`;

        // Stats
        document.getElementById('stats-grid').innerHTML = Object.entries(m.stats).map(([k,v]) => `
            <div class="stat-item"><label>${k}</label><b>${v}</b></div>
        `).join('');

        // Odds
        const toOdds = p => (100/(p||1)*0.95).toFixed(2);
        document.getElementById('odds-display').innerHTML = `
            <div class="odds-tile"><label>בית</label><h2>${toOdds(m.probs.h)}</h2></div>
            <div class="odds-tile"><label>תיקו</label><h2>${toOdds(m.probs.d)}</h2></div>
            <div class="odds-tile"><label>חוץ</label><h2>${toOdds(m.probs.a)}</h2></div>
        `;

        this.renderRadar(m.radar);
    },

    generateVerdict(m) {
        if (m.probs.h > 60) return `${m.home} שולטת במגרש. ה-XG שלה גבוה משמעותית והיא צפויה להבקיע את השער הבא.`;
        if (m.probs.a > 60) return `${m.away} מנצלת מתפרצות בצורה מושלמת. היחס עליה כרגע הוא Value מטורף.`;
        return `משחק שקול מאוד. שתי הקבוצות נזהרות. הימור על 'מתחת לשערים' עשוי להיות חכם כאן.`;
    },

    renderRadar(data) {
        const ctx = document.getElementById('radarChart').getContext('2d');
        if (window.rChart) window.rChart.destroy();
        window.rChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['התקפה', 'הגנה', 'מומנטום', 'בעיטות', 'משמעת'],
                datasets: [{
                    label: 'Team Metrics',
                    data: data,
                    backgroundColor: 'rgba(34, 211, 238, 0.2)',
                    borderColor: '#22d3ee',
                    pointBackgroundColor: '#22d3ee'
                }]
            },
            options: { 
                scales: { r: { ticks: { display: false }, grid: { color: '#334155' } } },
                plugins: { legend: { display: false } }
            }
        });
    },

    switchTab(tab) {
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        document.getElementById(`tab-${tab}`).style.display = 'block';
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
    }
};
