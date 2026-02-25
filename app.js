const app = {
    config: {
        oddsKey: '',
        aiKey: '',
        isDemo: false
    },

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

    async loadData() {
        // כאן תבוא הפונקציה שמושכת נתונים מה-API
        console.log("Loading sports data...");
        ui.renderMatches(demoData);
    }
};

const logic = {
    calculateImpliedProbability(odds) {
        return odds > 0 ? (1 / odds) * 100 : 0;
    },

    updateProb() {
        const val = document.getElementById('odds-input').value;
        const prob = this.calculateImpliedProbability(val);
        document.getElementById('prob-display').innerText = `הסתברות גלומה: ${prob.toFixed(1)}%`;
    }
};

const ui = {
    showSection(id) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    },

    renderMatches(data) {
        const container = document.getElementById('matches-container');
        container.innerHTML = data.map(m => `
            <div class="match-card">
                <div class="match-teams">${m.home} vs ${m.away}</div>
                <div class="prob-bar-container">
                    <div class="prob-home" style="width: ${m.probH}%"></div>
                    <div class="prob-away" style="width: ${m.probA}%"></div>
                </div>
                <small>ניתוח הסתברות: בית ${m.probH}% | חוץ ${m.probA}%</small>
            </div>
        `).join('');
    }
};

const demoData = [
    { home: 'Real Madrid', away: 'Barcelona', probH: 38, probA: 42 },
    { home: 'Liverpool', away: 'Arsenal', probH: 55, probA: 20 }
];
