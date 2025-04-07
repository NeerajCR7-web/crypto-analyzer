require('dotenv').config();

// Import modules
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/api/cryptos', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5'
    );
    res.json(response.data);
  } catch (error) {
    console.error('Crypto API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch crypto data' });
  }
});

// New endpoint for searching specific crypto
app.get('/api/cryptos/:id', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${req.params.id}`
    );
    res.json(response.data[0] || null);
  } catch (error) {
    console.error('Crypto API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch crypto data' });
  }
});

app.get('/api/news', async (req, res) => {
  if (!process.env.NEWS_API_KEY) {
    return res.status(400).json({ error: "NewsAPI key not configured" });
  }

  try {
    const { page = 1, query = 'cryptocurrency' } = req.query;
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${query}&apiKey=${process.env.NEWS_API_KEY}&pageSize=5&page=${page}&sortBy=publishedAt`
    );
    res.json(response.data.articles || []);
  } catch (error) {
    console.error('News API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

const PORT = process.env.PORT || 4567;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));