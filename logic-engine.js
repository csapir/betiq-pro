const logic = {
    analyze(ev) {
        const fixture = ev.fixture;
        const teams = ev.teams;
        const goals = ev.goals;
        const score = ev.score;

        const h = goals.home ?? 0;
        const a = goals.away ?? 0;

        // הסתברות בסיסית (תוכל לשפר עם ML מאוחר יותר)
        let homeProb = 45 + (h - a) * 8 + (fixture.status.elapsed || 0) / 5;
        let awayProb = 45 + (a - h) * 8 + (fixture.status.elapsed || 0) / 5;
        const drawProb = Math.max(100 - homeProb - awayProb, 10);

        return {
            id: fixture.id,
            home: { name: teams.home.name, id: teams.home.id, logo: teams.home.logo },
            away: { name: teams.away.name, id: teams.away.id, logo: teams.away.logo },
            score: `${h} - ${a}`,
            time: fixture.status.long || fixture.status.short,
            elapsed: fixture.status.elapsed || 0,
            league: ev.league.name,
            probs: { h: Math.round(homeProb), d: Math.round(drawProb), a: Math.round(awayProb) },
            stats: {}  // ימולא ב-updateAnalysis
        };
    },

    async fetchDeepData(fixtureId, homeId, awayId) {
        try {
            // Statistics (קרנות, נבדלים, possession...)
            const statsRes = await fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`, {
                headers: { 'x-apisports-key': app.apiKey }
            });
            const statsData = await statsRes.json();

            let homeStats = statsData.response?.[0] || {};
            let awayStats = statsData.response?.[1] || {};

            // Injuries / sidelined
            const injHome = await fetch(`https://v3.football.api-sports.io/injuries?team=${homeId}&season=2025`, {
                headers: { 'x-apisports-key': app.apiKey }
            }).then(r => r.json()).catch(() => ({response: []}));

            const injAway = await fetch(`https://v3.football.api-sports.io/injuries?team=${awayId}&season=2025`, {
                headers: { 'x-apisports-key': app.apiKey }
            }).then(r => r.json()).catch(() => ({response: []}));

            // Form / streaks
            const formHome = await fetch(`https://v3.football.api-sports.io/teams/statistics?team=${homeId}&league=${ev.league.id || 39}&season=2025`, {
                headers: { 'x-apisports-key': app.apiKey }
            }).then(r => r.json()).catch(() => ({response: {form: 'לא זמין'}}));

            const formAway = await fetch(`https://v3.football.api-sports.io/teams/statistics?team=${awayId}&league=${ev.league.id || 39}&season=2025`, {
                headers: { 'x-apisports-key': app.apiKey }
            }).then(r => r.json()).catch(() => ({response: {form: 'לא זמין'}}));

            return {
                cornersHome: homeStats.statistics?.find(s => s.type === 'Corner Kicks')?.value || 0,
                cornersAway: awayStats.statistics?.find(s => s.type === 'Corner Kicks')?.value || 0,
                offsidesHome: homeStats.statistics?.find(s => s.type === 'Offsides')?.value || 0,
                possessionHome: homeStats.statistics?.find(s => s.type === 'Ball Possession')?.value || '0%',
                shotsHome: homeStats.statistics?.find(s => s.type === 'Total Shots')?.value || 0,
                missingHome: injHome.response.map(p => ({name: p.player?.name, status: p.status || 'פצוע'})),
                missingAway: injAway.response.map(p => ({name: p.player?.name, status: p.status || 'פצוע'})),
                streakHome: formHome.response?.form || 'לא זמין',
                streakAway: formAway.response?.form || 'לא זמין'
            };
        } catch (e) {
            console.error('Deep fetch error:', e);
            return { error: true };
        }
    }
};
