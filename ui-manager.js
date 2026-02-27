const UIManager = {
    renderDeepAnalysis(data) {
        const container = document.getElementById('deep-stats-grid');
        let html = '';

        if (app.currentSport === 'soccer') {
            html = `
                <div class="stat-card"><span>🚩 קרנות</span><strong>${data.deep.corners}</strong></div>
                <div class="stat-card"><span>🚫 נבדלים</span><strong>${data.deep.offsides}</strong></div>
                <div class="stat-card"><span>🏠 ממוצע בית</span><strong>${data.deep.homeGoalsAvg}</strong></div>
                <div class="stat-card"><span>✈️ ממוצע חוץ</span><strong>${data.deep.awayGoalsAvg}</strong></div>
            `;
        } else {
            html = `
                <div class="stat-card"><span>🎯 שלשות</span><strong>${data.deep.threePointers}</strong></div>
                <div class="stat-card"><span>🏀 ריבאונד</span><strong>${data.deep.rebounds}</strong></div>
                <div class="stat-card"><span>⏱️ פסקי זמן</span><strong>${data.deep.timeouts}</strong></div>
            `;
        }
        
        container.innerHTML = html;
        this.renderMissing(data.deep.missing);
    },

    renderMissing(players) {
        const list = document.getElementById('missing-players-list');
        list.innerHTML = players.map(p => `
            <div class="player-row ${p.type}">
                <span>${p.name}</span>
                <small>${p.status}</small>
            </div>
        `).join('');
    }
};
