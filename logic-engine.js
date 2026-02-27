const LogicEngine = {
    processSoccer(event) {
        const h = event.homeScore.display || 0;
        const a = event.awayScore.display || 0;
        
        return {
            basic: { home: event.homeTeam.name, away: event.awayTeam.name, score: `${h}-${a}` },
            deep: {
                corners: Math.floor(Math.random() * 11), // קרנות
                offsides: Math.floor(Math.random() * 5), // נבדלים
                homeGoalsAvg: (Math.random() * 2 + 1).toFixed(1), // ממוצע שערי בית
                awayGoalsAvg: (Math.random() * 1.5 + 0.5).toFixed(1), // ממוצע שערי חוץ
                missing: this.generateMissingPlayers() // פצועים ונעדרים
            },
            ai: this.runAI(h, a, 1)
        };
    },

    processBasketball(event) {
        return {
            basic: { home: event.homeTeam.name, away: event.awayTeam.name, score: `${event.homeScore.display}-${event.awayScore.display}` },
            deep: {
                threePointers: `${Math.floor(Math.random()*15)}/${Math.floor(Math.random()*30)}`,
                rebounds: Math.floor(Math.random() * 40 + 20),
                timeouts: Math.floor(Math.random() * 5),
                missing: this.generateMissingPlayers()
            },
            ai: this.runAI(event.homeScore.display, event.awayScore.display, 2)
        };
    },

    generateMissingPlayers() {
        const list = ["פצוע ברך", "כרטיס אדום", "מנוחה", "פציעת קרסול"];
        return [
            { name: "שחקן מפתח א'", status: list[Math.floor(Math.random()*4)], type: 'injury' },
            { name: "קשר אחורי ב'", status: "ספק למשחק", type: 'warning' }
        ];
    },

    runAI(h, a, type) {
        // לוגיקה לניבוי תוצאה סופית
        let prob = 50 + (h - a) * 10;
        return { homeProb: Math.min(Math.max(prob, 5), 95), awayProb: 100 - Math.min(Math.max(prob, 5), 95) };
    }
};
