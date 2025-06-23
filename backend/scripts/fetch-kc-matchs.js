require("dotenv").config();
const fetch = require("node-fetch").default;
const { Client } = require("pg");
const tournamentLoLConfig = require("./tournamentsLoLConfig");

const API_KEY = "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z";
const STANDINGS_URL =
  "https://esports-api.lolesports.com/persisted/gw/getStandings";
const EVENT_DETAILS_URL =
  "https://esports-api.lolesports.com/persisted/gw/getEventDetails";
const GAME_DETAILS_URL = "https://feed.lolesports.com/livestats/v1/window/";

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    const allMatches = [];

    const tournamentIds = Object.keys(tournamentLoLConfig || {});
    if (tournamentIds.length === 0) {
      console.warn("⚠️ Aucun tournoi trouvé dans la config");
    }

    for (const tournamentId of tournamentIds) {
      const url = `${STANDINGS_URL}?hl=fr-FR&tournamentId=${tournamentId}`;
      const headers = { "x-api-key": API_KEY };

      const res = await fetch(url, { headers });
      const json = await res.json();

      const matches = extractMatchesKC(json, tournamentId);
      console.log(`Tournoi ${tournamentId} => ${matches.length} matchs KC`);
      allMatches.push(...matches);
    }

    // Insertion ou mise à jour des matchs
    for (const match of allMatches) {
      await client.query(
        `INSERT INTO matches (id, competition, date, result, opps, nbgames, score_kc, score_opps, kc_team)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           competition = EXCLUDED.competition,
           date = EXCLUDED.date,
           result = EXCLUDED.result,
           opps = EXCLUDED.opps,
           nbgames = EXCLUDED.nbgames,
           score_kc = EXCLUDED.score_kc,
           score_opps = EXCLUDED.score_opps,
           kc_team = EXCLUDED.kc_team`,
        [
          match.id,
          match.competition,
          null, // date à compléter plus tard
          match.result,
          match.opps,
          null, // nbGames à compléter plus tard
          match.scoreKC,
          match.scoreOpps,
          match.kc_team,
        ]
      );
    }

    console.log('✅ Tous les matchs insérés ou mis à jour dans "matches"');

    // Insertion ou mise à jour des games
    for (const match of allMatches) {
      const url = `${EVENT_DETAILS_URL}?hl=fr-FR&id=${match.id}`;
      const headers = { "x-api-key": API_KEY };
      try {
        const res = await fetch(url, { headers });
        const json = await res.json();

        const games = json?.data?.event?.match?.games || [];
        //store first game id
        let firstGameId = games.length > 0 ? games[0].id : null;
        if (firstGameId === null) {
          console.warn(
            `⚠️ Aucun game trouvé pour le match ${match.id} (${match.competition})`
          );
          const bigId = BigInt(match.id);
          const newBigId = bigId + 1n;
          firstGameId = newBigId.toString();
        }
        try {
          const gameDetailsRes = await fetch(
            `${GAME_DETAILS_URL}${firstGameId}`
          );
          const gameDetailsJson = await gameDetailsRes.json();

          const rawTimestamp = gameDetailsJson?.frames?.[0]?.rfc460Timestamp;
          const date = rawTimestamp ? new Date(rawTimestamp) : null;

          if (date) {
            await client.query(`UPDATE matches SET date = $1 WHERE id = $2`, [
              date,
              match.id,
            ]);
          }
        } catch (error) {
          console.error(
            `❌ Erreur lors de la récupération des détails du jeu pour le match ${match.id}`,
            error
          );
        }

        for (const game of games) {
          await client.query(
            `INSERT INTO games (id, match_id, result)
             VALUES ($1, $2, $3)
             ON CONFLICT (id) DO UPDATE SET
               match_id = EXCLUDED.match_id,
               result = EXCLUDED.result`,
            [game.id, match.id, null]
          );
        }

        console.log(
          `🕹️ ${games.length} games insérées ou mises à jour pour le match ${match.id} ${match.competition}`
        );
      } catch (error) {
        console.error(
          `❌ Erreur lors de la récupération des games pour match ${match.id}`,
          error
        );
      }
    }
  } catch (err) {
    console.error("❌ Erreur dans le batch :", err);
  } finally {
    await client.end();
  }
})();

function extractMatchesKC(data, tournamentId) {
  const matches = [];
  const config = tournamentLoLConfig[tournamentId];
  const competition = config?.competition || "";

  data.data?.standings?.forEach((standing) => {
    standing.stages.forEach((stage) => {
      stage.sections.forEach((section) => {
        section.matches.forEach((match) => {
          if (match.teams.length === 2) {
            const kcTeam = match.teams.find(
              (t) => t.code === "KC" || t.code === "KCB"
            );
            const opponent = match.teams.find(
              (t) => t.code !== "KC" && t.code !== "KCB"
            );

            if (kcTeam && opponent) {
              matches.push({
                id: match.id,
                competition,
                result: kcTeam.result?.outcome || null,
                scoreKC: kcTeam.result?.gameWins || 0,
                scoreOpps: opponent.result?.gameWins || 0,
                opps: opponent.code || null,
                kc_team: kcTeam.code || null,
              });
            }
          }
        });
      });
    });
  });

  return matches;
}
