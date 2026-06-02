require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Azure Language Service configuration
const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT;
const AZURE_KEY = process.env.AZURE_KEY;

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sentiment Analysis API endpoint
app.post('/api/sentiment', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    // Call Azure Language Service API
    const response = await axios.post(
      `${AZURE_ENDPOINT}text/analytics/v3.1/sentiment?model-version=latest`,
      {
        documents: [
          {
            id: '1',
            language: 'en',
            text: text
          }
        ]
      },
      {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract sentiment data
    const document = response.data.documents[0];
    const sentiment = {
      sentiment: document.sentiment,
      scores: {
        positive: document.confidenceScores.positive,
        neutral: document.confidenceScores.neutral,
        negative: document.confidenceScores.negative
      },
      sentences: document.sentences.map(s => ({
        text: s.text,
        sentiment: s.sentiment,
        scores: {
          positive: s.confidenceScores.positive,
          neutral: s.confidenceScores.neutral,
          negative: s.confidenceScores.negative
        }
      }))
    };

    res.json(sentiment);
  } catch (error) {
    console.error('Error calling Azure API:', error.message);
    res.status(500).json({ 
      error: 'Failed to analyze sentiment',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
