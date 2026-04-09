import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post('/api/translate', async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Missing or empty text field.' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({
      error: 'ANTHROPIC_API_KEY is not configured. Please set it in your .env file.',
    });
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system:
        'You are a professional translator. Translate the English text provided by the user into Simplified Chinese (简体中文). ' +
        'Return ONLY the translated text — no explanations, no pinyin, no notes. ' +
        'Preserve the original meaning, tone, and nuance as closely as possible.',
      messages: [{ role: 'user', content: text.trim() }],
    });

    const translation = message.content[0].text;
    res.json({ translation });
  } catch (err) {
    console.error('Translation error:', err.message);
    res.status(500).json({ error: 'Translation failed. ' + err.message });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    apiKeyConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
  });
});

app.listen(port, () => {
  console.log(`Translation server running on http://localhost:${port}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠  ANTHROPIC_API_KEY is not set — translation will fail until you add it to .env');
  }
});
