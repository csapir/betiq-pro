// הרחבת האובייקט logic בתוך app.js
const logic = {
    currentSport: 'soccer',

    filterSport(sport) {
        this.currentSport = sport;
        document.querySelectorAll('.sport-tab').forEach(t => t.classList.remove('active'));
        event.target.classList.add('active');
        app.loadData();
    },

    // פונקציה שמחשבת "ציון כוח" (רק לצורך תצוגה, מבוסס על הדאטה)
    calculatePowerScore(match) {
        // כאן היינו מכניסים חישוב של xG, Pace, או ELO
        return Math.floor(Math.random() * 40) + 60; 
    },

    renderPowerRankings() {
        const container = document.getElementById('rankings-container');
        const teams = this.currentSport === 'soccer' 
            ? ['מנצ'סטר סיטי', 'באיירן מינכן', 'ארסנל', 'ריאל מדריד']
            : ['בוסטון סלטיקס', 'דנבר נאגטס', 'אוקלהומה סיטי'];
            
        container.innerHTML = teams.map((team, i) => `
            <div class="power-rank-item">
                <span>#${i+1} ${team}</span>
                <span class="momentum-badge momentum-up">↑ בשיפור</span>
            </div>
        `).join('');
    },

    renderInjuries() {
        const container = document.getElementById('injury-reports');
        const reports = this.currentSport === 'soccer'
            ? ['קבין דה בריינה - בספק (קרסול)', 'מרטין אודגור - חזר לאימונים']
            : ['קוואי לאונרד - בחוץ (ברך)', 'ג'ואל אמביד - דקות מוגבלות'];
            
        container.innerHTML = reports.map(r => `<div style="margin-bottom:8px">⚠️ ${r}</div>`).join('');
    }
};

// עדכון פונקציית הטעינה
app.loadData = async function() {
    console.log(`fetching ${logic.currentSport} data...`);
    // כאן תמשוך את הנתונים מה-API לפי logic.currentSport
    
    ui.renderMatches(logic.currentSport === 'soccer' ? soccerDemo : hoopDemo);
    logic.renderPowerRankings();
    logic.renderInjuries();
    document.getElementById('active-events').innerText = logic.currentSport === 'soccer' ? '12' : '8';
};

const soccerDemo = [
    { home: 'Arsenal', away: 'Liverpool', probH: 42, probA: 33, info: 'ניתוח AI: ליברפול עם הגנה חסרה' },
    { home: 'Real Madrid', away: 'Milan', probH: 65, probA: 15, info: 'מדד מומנטום גבוה למארחת' }
];

const hoopDemo = [
    { home: 'Lakers', away: 'Warriors', probH: 52, probA: 48, info: 'קצב משחק (Pace) צפוי גבוה' },
    { home: 'Celtics', away: 'Heat', probH: 70, probA: 30, info: 'יתרון משמעותי בריבאונד' }
];
