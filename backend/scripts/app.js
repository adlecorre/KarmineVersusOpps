const express = require('express');
const pool = require('./db');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.get('/api/matches', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM matches ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur GET /matches:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/matches/:id/games', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM games WHERE match_id = $1', [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur GET /matches/:id/games:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
