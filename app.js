const app = {
    apiKey: '480d7b8455mshb4ee5606f0a42a1p10a646jsn64b65efdb148',
    // הגדרות טלגרם - הכנס את הפרטים שלך כאן
    telegramToken: 'כאן_שמים_את_הטוקן_מהבוט', 
    chatId: 'כאן_שמים_את_האיידי_שלך',
    currentMatches: [],

    init() {
        console.log("SportIQ Intelligence Engine Online");
        document.getElementById('api-status').innerText = 'AI ENGINE ACTIVE';
        this.fetchData();
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
            }
        } catch (error) { console.error("API Error:", error); }
    },

    // הפונקציה החדשה לשליחת התראה לטלגרם
    async sendToTelegram(matchIdx) {
        const m = this.currentMatches[matchIdx];
        const message = `
🤖 *SportIQ AI Alert* ⚽ *משחק:* ${m.home} vs ${m.away}
🏆 *ליגה:* ${m.league}
⏱️ *דקה:* ${m.time}
📊 *תוצאה:* ${m.score}

📈 *ניתוח סיכויים:*
בית: ${m.prediction.h}% | תיקו: ${m.prediction.d}% | חוץ: ${m.prediction.a}%
        `;

        const url = `https://api.telegram.org/bot${this.telegramToken}/sendMessage?chat_id=${this.chatId}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;

        try {
            await fetch(url);
            alert("הניתוח נשלח לטלגרם שלך! 🚀");
        } catch (e) {
            alert("שגיאה בשליחה. וודא שהבוט וה-ID תקינים.");
        }
    }
};

// הוספת כפתור הבוט בממשק המשתמש (מעדכן רק את פונקציית ui.showAnalysis)
ui.showAnalysis = function(idx) {
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
            <button onclick="app.sendToTelegram(${idx})" class="tg-btn">שלח ניתוח לטלגרם 📱</button>
        </div>
        <div class="micro-stat-row"><span>🔥 מומנטום נוכחי</span> <b>${(Math.random() * 40 + 60).toFixed(0)}%</b></div>
        <div class="micro-stat-row"><span>⏱️ דקה במשחק</span> <b>${m.time}</b></div>
    `;

    this.updateChart(m.prediction);
};
