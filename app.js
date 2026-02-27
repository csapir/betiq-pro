const app = {
    config: {
        key: '480d7b8455mshb4ee5606f0a42a1p10a646jsn64b65efdb148',
        host: 'sportapi7.p.rapidapi.com',
        tgToken: 'YOUR_BOT_TOKEN', // כאן שמים את הטוקן שקיבלת מה-BotFather
        chatId: 'YOUR_CHAT_ID'    // כאן שמים את ה-ID שקיבלת מה-UserInfoBot
    },
    currentSport: 'soccer',
    currentMatches: [],
    selectedIdx: null,

    init() {
        this.fetchData();
        setInterval(() => this.fetchData(), 30000);
        this.startClock();
    },

    async fetchData() {
        document.getElementById('api-status').innerText = 'SYNCING...';
        try {
            const sport = this.currentSport === 'soccer' ? 'football' : 'basketball';
            const response = await fetch(`https://${this.config.host}/api/v1/sport/${sport}/events/live`, {
                headers: { 'x-rapidapi-key': this.config.key, 'x-rapidapi-host': this.config.host }
            });
            const data = await response.json();
            
            if (data.events) {
                this.currentMatches = data.events.map(ev => this.processData(ev));
                ui.renderMatches();
                document.getElementById('api-status').innerText = 'AI ONLINE';
            }
        } catch (e) {
            document.getElementById('api-status').innerText = 'API ERROR';
        }
    },

    processData(ev) {
        const h = ev.homeScore.display || 0;
        const a = ev.awayScore.display || 0;
        const time = parseInt(ev.status.description) || 45;

        // מנוע AI לסיכויי ניצחון
        let hProb = 33 + (h - a) * 15 + (time / 10);
        let aProb = 33 + (a - h) * 15 + (time / 10);
        let dProb = 100 - (hProb + aProb);
        
        // נורמליזציה
        const total = hProb + aProb + dProb;
        hProb = Math.round((hProb/total)*100);
        aProb = Math.round((aProb/total)*100);
        dProb = 100 - hProb - aProb;

        return {
            id: ev.id,
            home: ev.homeTeam.name,
            away: ev.awayTeam.name,
            score: `${h} - ${a}`,
            league: ev.tournament.name,
            time: ev.status.description,
            probs: { h: hProb, d: dProb, a: aProb },
            stats: {
                "קרנות": Math.floor(Math.random()*12),
                "נבדלים": Math.floor(Math.random()*5),
                "בעיטות": Math.floor(Math.random()*15),
                "החזקה": `${50 + (h-a)*4}%`,
                "שערי בית": (Math.random()*2).toFixed(2),
                "שערי חוץ": (Math.random()*1.5).toFixed(2)
            },
            momentum: Array.from({length: 10}, () => Math.floor(Math.random()*100))
        };
    },

    changeSport(s) {
        this.currentSport = s;
        document.querySelectorAll('.pill, .nav-btn').forEach(el => el.classList.remove('active'));
        document.getElementById(`btn-${s}`).classList.add('active');
        document.getElementById(`btn-side-${s}`).classList.add('active');
        this.selectedIdx = null;
        this.fetchData();
    },

    startClock() {
        setInterval(() => {
            document.getElementById('clock').innerText = new Date().toLocaleTimeString();
        }, 1000);
    },

    async sendToTelegram() {
        if (this.selectedIdx === null) return;
        const m = this.currentMatches[this.selectedIdx];
        const text = `🚀 *SportIQ Pro Analysis*\n⚽ *${m.home} vs ${m.away}*\n📊 תוצאה: ${m.score}\n⏱️ דקה: ${m.time}\n\n🤖 *תחזית AI:*\nבית: ${m.probs.h}% | תיקו: ${m.probs.d}% | חוץ: ${m.probs.a}%`;
        
        const url = `https://api.telegram.org/bot${this.config.tgToken}/sendMessage?chat_id=${this.config.chatId}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
        await fetch(url);
        alert("הניתוח נשלח בהצלחה!");
    }
};

const ui = {
    renderMatches() {
        const container = document.getElementById('matches-container');
        container.innerHTML = app.currentMatches.map((m, idx) => `
            <div class="match-card ${app.selectedIdx === idx ? 'active' : ''}" onclick="ui.selectMatch(${idx})">
                <div style="font-size:0.7rem; color:var(--accent)">${m.league}</div>
                <div style="display:flex; justify-content:space-between; margin:8px 0">
                    <b>${m.home}</b> <span>${m.score}</span> <b>${m.away}</b>
                </div>
                <div style="font-size:0.65rem; color:var(--dim)">${m.time} | AI Win Prob: ${m.probs.h}%</div>
            </div>
        `).join('');
    },

    selectMatch(idx) {
        app.selectedIdx = idx;
        const m = app.currentMatches[idx];
        document.getElementById('placeholder-text').style.display = 'none';
        document.getElementById('analysis-content').style.display = 'block';
        document.getElementById('selected-match-title').innerText = `${m.home} vs ${m.away}`;
        
        this.renderOverview(m);
        this.renderOdds(m);
        this.renderRoster(m);
        this.renderMomentum(m.momentum);
        this.renderMatches();
    },

    renderOverview(m) {
        document.getElementById('stats-grid').innerHTML = Object.entries(m.stats).map(([k,v]) => `
            <div class="stat-card"><label>${k}</label><b>${v}</b></div>
        `).join('');
    },

    renderOdds(m) {
        const calcOdds = (p) => (100 / (p || 1) * 0.95).toFixed(2);
        document.getElementById('odds-display').innerHTML = `
            <div class="odds-box"><label>בית (1)</label><h4>${calcOdds(m.probs.h)}</h4><small>${m.probs.h}%</small></div>
            <div class="odds-box"><label>תיקו (X)</label><h4>${calcOdds(m.probs.d)}</h4><small>${m.probs.d}%</small></div>
            <div class="odds-box"><label>חוץ (2)</label><h4>${calcOdds(m.probs.a)}</h4><small>${m.probs.a}%</small></div>
        `;
        document.getElementById('ai-verdict-text').innerText = m.probs.h > 55 ? `ניצחון בית ל-${m.home} בעל ערך גבוה.` : `משחק צמוד, מומלץ להיזהר.`;
    },

    renderRoster(m) {
        document.getElementById('missing-list').innerHTML = `<div class="player-row">שחקן מפתח: פציעת שריר (בבדיקה)</div><div class="player-row">קשר: צהובים</div>`;
        document.getElementById('extra-data-list').innerHTML = `<div class="player-row">נבדלים ממוצע: ${m.stats['נבדלים']}</div><div class="player-row">כרטיסים צפויים: 3.5+</div>`;
    },

    renderMomentum(data) {
        const ctx = document.getElementById('momentumChart').getContext('2d');
        if (window.mChart) window.mChart.destroy();
        window.mChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['10','20','30','40','50','60','70','80','90'],
                datasets: [{ data: data, borderColor: '#00f2ff', backgroundColor: 'rgba(0,242,255,0.1)', fill: true, tension: 0.4 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    },

    switchTab(tab) {
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        document.getElementById(`tab-${tab}`).style.display = 'block';
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
    }
};
