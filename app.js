const app = {
    apiKey: 'YOUR_API_KEY_HERE',  // ← החלף כאן + בכל מקום אחר אם יש
    currentMatches: [],
    selectedIdx: null,

    init() {
        this.fetchData();
        setInterval(() => this.fetchData(), 30000);  // 30 שניות – בטוח לחינמי
    },

    async fetchData() {
        try {
            const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
                method: 'GET',
                headers: {
                    'x-apisports-key': this.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            this.currentMatches = (data.response || []).slice(0, 12).map(ev => logic.analyze(ev));  // max 12 כדי לחסוך בקשות
            ui.renderMatches();

            document.getElementById('hot-games-count').innerText = this.currentMatches.length;
            document.getElementById('api-status').innerText = data.response?.length ? 'LIVE' : 'אין משחקים חיים כרגע';

            if (this.selectedIdx !== null && this.currentMatches[this.selectedIdx]) {
                ui.updateAnalysis();
            }
        } catch (e) {
            console.error('Fetch error:', e);
            document.getElementById('api-status').innerText = 'שגיאת API – בדוק מפתח או חיבור';
        }
    }
};
