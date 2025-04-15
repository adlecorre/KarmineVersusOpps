require('dotenv').config();
const fetch = require('node-fetch');
const { Client } = require('pg');

// Clé API et URLs
const API_KEY = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';
const STANDINGS_URL = 'https://esports-api.lolesports.com/persisted/gw/getStandings';
const GAME_INFO_URL = 'https://feed.lolesports.com/livestats/v1/details';

// Tournaments à scrapper (comme dans tournamentLoLConfig)
const tournamentLoLConfig = {
  '110659980962106717': { competition: 'LEC' },
  '110659980962106718': { competition: 'EMEA Masters' },
  // Ajoute les autres
};

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    const allMatches = [];

    for (const tournamentId of Object.keys(tournamentLoLConfig)) {
      const url = `${STANDINGS_URL}?hl=fr-FR&tournamentId=${tournamentId}`;
      const headers = { 'x-api-key': API_KEY };

      const res = await fetch(url, { headers });
      const json = await res.json();

      const matches = extractMatchesKC(json, tournamentId);
      console.log(`Tournoi ${tournamentId} => ${matches.length} matchs KC`);
      allMatches.push(...matches);
    }

    // Récupérer les timestamps
    const matchData = await Promise.all(
      allMatches.map(async (match) => {
        const gameId = (BigInt(match.id) + BigInt(1)).toString();
        const url = `${GAME_INFO_URL}/${gameId}`;
        const headers = { 'x-api-key': API_KEY };

        try {
          const res = await fetch(url, { headers });
          const json = await res.json();
          match.rfc460Timestamp = json?.frames?.[0]?.rfc460Timestamp || null;
        } catch (err) {
          console.error(`Erreur GameInfo ${gameId}`, err);
          match.rfc460Timestamp = null;
        }

        return match;
      })
    );

    // Insérer en BDD
    for (const match of matchData) {
      await client.query(
        `INSERT INTO matchs_kc (match_id, tournament_id, result, score_kc, score_opps, competition, rfc460timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (match_id) DO NOTHING`,
        [
          match.id,
          match.tournamentId,
          match.result,
          match.scoreKC,
          match.scoreOpps,
          match.competition,
          match.rfc460Timestamp,
        ]
      );
    }

    console.log('✅ Tous les matchs insérés avec succès');
  } catch (err) {
    console.error('❌ Erreur dans le batch :', err);
  } finally {
    await client.end();
  }
})();

// ----- Extraction KC -----
function extractMatchesKC(data, tournamentId) {
  const matches = [];
  const competition = tournamentLoLConfig[tournamentId]?.competition || '';

  data.data?.standings?.forEach((standing) => {
    standing.stages.forEach((stage) => {
      stage.sections.forEach((section) => {
        section.matches.forEach((match) => {
          if (match.teams.length === 2) {
            const kcTeam = match.teams.find(
              (t) => t.code === 'KC' || t.code === 'KCB'
            );
            const opponent = match.teams.find(
              (t) => t.code !== 'KC' && t.code !== 'KCB'
            );

            if (kcTeam && opponent) {
              matches.push({
                id: match.id,
                tournamentId,
                result: kcTeam.result?.outcome || null,
                scoreKC: kcTeam.result?.gameWins || 0,
                scoreOpps: opponent.result?.gameWins || 0,
                competition,
              });
            }
          }
        });
      });
    });
  });

  return matches;
}
