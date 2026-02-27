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
            console.error("Fetch Error:", e);
            return { events: [] };
        }
    },

    // פונקציה להבאת פרטי פצועים/נעדרים (דרוש Endpoint של Lineups)
    async getMissingPlayers(eventId) {
        // ב-API החינמי לפעמים המידע מוגבל, אז אנחנו ניצור פונקציית גיבוי ב-Logic
        return await fetch(`https://${this.host}/api/v1/event/${eventId}/lineups`, {
             headers: { 'x-rapidapi-key': this.key, 'x-rapidapi-host': this.host }
        }).then(res => res.json()).catch(() => null);
    }
};
