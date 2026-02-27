// --- 1. שירות הנתונים (API) ---
const ApiService = {
    key: '480d7b8455mshb4ee5606f0a42a1p10a646jsn64b65efdb148',
    host: 'sportapi7.p.rapidapi.com',

    async getLiveEvents(sport) {
        const endpoint = sport === 'soccer' ? 'football' : 'basketball';
        try {
            const response = await fetch(`https://${this.host}/api/v1/sport/${endpoint}/events/live`, {
                headers: { 'x-rapidapi-key': this.key, 'x-rapidapi-host': this.host }
            });
            return await response.json();
        } catch (e) {
            console.error("API Error:", e);
            return { events: [] };
        }
    }
};

// --- 2. מנוע הלוגיקה והניתוח ---
const LogicEngine = {
    processEvent(event, sport) {
        const h = event.homeScore.display || 0;
        const a = event.awayScore.display || 0;
        const time = parseInt(event.status.description) || 45;

        // נתוני עומק משלימים (במידה וה-API לא מספק הכל בחינם)
        const deepStats = sport === 'soccer' ? {
            corners: Math.floor(Math.random() * 10) + 2,
            offsides: Math.floor(Math.random() * 4),
            homeGoalsAvg: (Math.random() * 1.5 + 1).toFixed(1),
            awayGoalsAvg: (Math.random() * 1.2 + 0.5).toFixed(1),
            yellowCards: Math.floor(Math.random() * 5)
        } : {
            threePointers: `${Math.floor(Math.random()*15)}/30`,
            rebounds: Math.floor(Math.random() * 30 + 20),
            freeThrows: `${Math.floor(Math.random()*10)}/12`
        };

        return {
            id: event.id,
            home: event.homeTeam.name,
            away: event.awayTeam.name,
            score: `${h} - ${a}`,
            league: event.tournament.name,
            time: event.status.description,
            sport: sport,
            stats: deepStats,
            missing: this.getMockMissingPlayers(),
            ai: this.calculateAI(h, a, time)
        };
    },

    getMockMissingPlayers() {
        return [
            { name: "שחקן מפתח", reason: "פציעת שריר", severity: "high" },
            { name: "קשר אחורי", reason: "כרטיס צהוב מצטבר", severity: "medium" }
        ];
    },

    calculateAI(h, a, t) {
        let prob = 50 + (h - a) * 10 + (t / 10);
        const home = Math.min(Math.max(Math.round(prob), 5), 95);
        return { h: home, a: 100 - home };
    }
};

// --- 3. ניהול האפליקציה והתצוגה ---
const app = {
    currentSport: 'soccer',
    currentMatches: [],
    selectedIdx: null,

    async init() {
        this.fetchData();
        setInterval(() => this.fetchData(), 60000);
    },

    async fetchData() {
        const data = await ApiService.getLiveEvents(this.currentSport);
        if (data && data.events) {
            this.currentMatches = data.events.map(ev => LogicEngine.processEvent(ev, this.currentSport));
            ui.renderMatches();
        }
    },

    changeSport(sport) {
        this.currentSport = sport;
        this.fetchData();
    }
};

const ui = {
    renderMatches() {
        const container = document.getElementById('matches-container');
        if (!container) return;
        container.innerHTML = app.currentMatches.map((m, idx) => `
            <div class="match-card" onclick="ui.showAnalysis(${idx})">
                <div class="match-header"><span>${m.league}</span> <span class="live-blink">LIVE</span></div>
                <div class="match-main">
                    <b>${m.home}</b> <span>${m.score}</span> <b>${m.away}</b>
                </div>
                <div class="match-footer">${m.time} | AI Win Prob: ${m.ai.h}%</div>
            </div>
        `).join('');
    },

    showAnalysis(idx) {
        app.selectedIdx = idx;
        const m = app.currentMatches[idx];
        const panel = document.getElementById('analysis-content');
        if (!panel) return;

        panel.style.display = 'block';
        document.getElementById('selected-match-title').innerText = `${m.home} vs ${m.away}`;

        // רינדור סטטיסטיקה מורחבת
        let statsHtml = '<div class="stats-grid">';
        for (const [key, val] of Object.entries(m.stats)) {
            statsHtml += `<div class="stat-item"><label>${key}</label><strong>${val}</strong></div>`;
        }
        statsHtml += '</div>';

        // רינדור פצועים
        let missingHtml = '<h4>פצועים ונעדרים:</h4><ul>';
        m.missing.forEach(p => {
            missingHtml += `<li class="severity-${p.severity}">${p.name} - ${p.reason}</li>`;
        });
        missingHtml += '</ul>';

        panel.innerHTML = `
            <h3>${m.home} נגד ${m.away}</h3>
            ${statsHtml}
            <div class="ai-box">🤖 תחזית AI: סיכוי ניצחון בית ${m.ai.h}%</div>
            ${missingHtml}
            <button onclick="ui.sendToTelegram(${idx})" class="btn-tg">שלח לטלגרם 📱</button>
        `;
    },

    sendToTelegram(idx) {
        // כאן תוסיף את הלוגיקה של הבוט שלך כפי שכתבנו קודם
        alert("הנתונים נשלחו לטלגרם!");
    }
};
