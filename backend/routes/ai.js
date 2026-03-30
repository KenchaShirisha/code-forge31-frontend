const router = require('express').Router();
const https = require('https');
const { protect } = require('../middleware/auth');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function callGemini(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('Gemini response:', JSON.stringify(parsed).slice(0, 300));
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return resolve(text);
          const blocked = parsed?.promptFeedback?.blockReason;
          if (blocked) return resolve(`Content blocked by AI safety filters: ${blocked}`);
          const errorMsg = parsed?.error?.message;
          if (errorMsg) return resolve(`Gemini error: ${errorMsg}`);
          resolve('No response from AI.');
        } catch (e) {
          console.error('Parse error:', e.message, 'Raw:', data.slice(0, 200));
          reject(new Error('Failed to parse AI response'));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// POST /api/ai/review
router.post('/review', protect, async (req, res) => {
  try {
    const { code, language, problemTitle } = req.body;
    if (!code || !language) return res.status(400).json({ message: 'Code and language required' });

    const prompt = `You are an expert ${language} code reviewer. Review the following code${problemTitle ? ` for the problem: "${problemTitle}"` : ''}.

Provide a structured review with these exact sections:
1. **Overall Assessment** (1-2 sentences)
2. **Correctness** (is the logic correct?)
3. **Code Quality** (readability, naming, structure)
4. **Time & Space Complexity** (Big O analysis)
5. **Issues Found** (list specific bugs or problems, if any)
6. **Improvements** (3-5 specific suggestions)
7. **Score** (rate out of 10)

Code (${language}):
\`\`\`${language}
${code}
\`\`\`

Be concise, specific, and helpful. Use bullet points for lists.`;

    const review = await callGemini(prompt);
    res.json({ review });
  } catch (err) {
    res.status(500).json({ message: 'AI review failed. Check your GEMINI_API_KEY in .env', error: err.message });
  }
});

// POST /api/ai/hint
router.post('/hint', protect, async (req, res) => {
  try {
    const { problemTitle, problemDesc, language } = req.body;
    const prompt = `Give 3 progressive hints for this coding problem. Do NOT give the solution. Start vague and get more specific.

Problem: ${problemTitle}
Description: ${problemDesc}
Language: ${language}

Format:
Hint 1: (very vague, conceptual)
Hint 2: (more specific approach)
Hint 3: (almost there, specific technique)`;

    const hints = await callGemini(prompt);
    res.json({ hints });
  } catch (err) {
    res.status(500).json({ message: 'AI hint failed', error: err.message });
  }
});

module.exports = router;
