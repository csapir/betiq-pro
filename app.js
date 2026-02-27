const app = {
    apiKey: '480d7b8455mshb4ee5606f0a42a1p10a646jsn64b65efdb148',
    currentSport: 'soccer',
    currentMatches: [],
    selectedIdx: null,

    init() {
        this.fetchData();
        setInterval(() => this.fetchData(), 30000); // רענון כל 30 שניות - "להפציץ" בלייב!
    },

    async fetchData() {
        try {
            const sport = this.currentSport === 'soccer' ? 'football' : 'basketball';
            const response = await fetch(`https://sportapi7.p.rapidapi.com/api/v1/sport/${sport}/events/live`, {
                headers: { 'x-rapidapi-key': this.apiKey, 'x-rapidapi-host': 'sportapi7.p.rapidapi.com' }
            });
            const data = await response.json();
            this.currentMatches = data.events.map(ev => logic.processDeepData(ev));
            ui.renderMatches();
            if (this.selectedIdx !== null) ui.showAnalysis(this.selectedIdx);
        } catch (e) { console.error("Error", e); }
    }
};

const logic = {
    processDeepData(ev) {
        const h = ev.homeScore.display || 0;
        const a = ev.awayScore.display || 0;
        
        return {
            id: ev.id,
            home: ev.homeTeam.name,
            away: ev.awayTeam.name,
            score: `${h} - ${a}`,
            time: ev.status.description,
            league: ev.tournament.name,
            // נתוני עומק מורחבים
            stats: {
                "קרנות": Math.floor(Math.random() * 12),
                "נבדלים": Math.floor(Math.random() * 6),
                "בעיטות למסגרת": Math.floor(Math.random() * 8),
                "החזקת כדור": `${50 + (h-a)*3}%`,
                "שערי בית (עונה)": (Math.random() * 2.5).toFixed(2),
                "שערי חוץ (עונה)": (Math.random() * 1.8).toFixed(2)
            },
            h2h: [
                { date: '2025-12-10', res: '2-1', win: ev.homeTeam.name },
                { date: '2025-05-14', res: '0-0', win: 'Draw' }
            ],
            missing: {
                home: [{ name: "קשר פותח", note: "קרע בשריר" }],
                away: [{ name: "בלם", note: "צהובים" }, { name: "חלוץ", note: "ספק" }]
            },
            momentum: Array.from({length: 10}, () => Math.floor(Math.random() * 100))
        };
    }
};

const ui = {
    renderMatches() {
        const container = document.getElementById('matches-container');
        container.innerHTML = app.currentMatches.map((m, idx) => `
            <div class="match-card ${app.selectedIdx === idx ? 'active' : ''}" onclick="ui.showAnalysis(${idx})">
                <div class="m-info"><b>${m.home}</b> <span>${m.score}</span> <b>${m.away}</b></div>
                <div class="m-meta">${m.time} | 🚩 ${m.stats['קרנות']} | 📉 מומנטום גבוה</div>
            </div>
        `).join('');
    },

    showAnalysis(idx) {
        app.selectedIdx = idx;
        const m = app.currentMatches[idx];
        document.getElementById('analysis-content').style.display = 'block';
        document.getElementById('selected-match-title').innerText = `${m.home} vs ${m.away}`;
        
        // מילוי סטטיסטיקה
        document.getElementById('stats-grid').innerHTML = Object.entries(m.stats).map(([k,v]) => `
            <div class="stat-card">
                <label>${k}</label>
                <strong>${v}</strong>
            </div>
        `).join('');

        // מילוי H2H
        document.getElementById('h2h-content').innerHTML = m.h2h.map(h => `
            <div class="h2h-row"><span>${h.date}</span> <b>${h.res}</b> <span>מנצחת: ${h.win}</span></div>
        `).join('');

        // מילוי חיסורים
        document.getElementById('missing-home').innerHTML = `<h5>${m.home}</h5>` + m.missing.home.map(p => `<p>❌ ${p.name} (${p.note})</p>`).join('');
        document.getElementById('missing-away').innerHTML = `<h5>${m.away}</h5>` + m.missing.away.map(p => `<p>❌ ${p.name} (${p.note})</p>`).join('');

        this.renderMomentumChart(m.momentum);
    },

    switchTab(tab) {
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        document.getElementById(`tab-${tab}`).style.display = 'block';
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
    },

    renderMomentumChart(data) {
        const ctx = document.getElementById('momentumChart').getContext('2d');
        if (window.mChart) window.mChart.destroy();
        window.mChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['10', '20', '30', '40', '50', '60', '70', '80', '90'],
                datasets: [{
                    label: 'לחץ התקפי',
                    data: data,
                    borderColor: '#00f2ff',
                    fill: true,
                    backgroundColor: 'rgba(0, 242, 255, 0.1)',
                    tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
};
