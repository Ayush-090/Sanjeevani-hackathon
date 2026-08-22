/**
 * Sanjeevani Healthcare Platform — Server & Live Supabase + Sarvam AI Backend
 * Connects directly to Supabase `government_schemes` (3,400+ schemes) and Sarvam AI `sarvam-105b`.
 */

const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer in-memory storage for audio uploads
const upload = multer({ storage: multer.memoryStorage() });

// Serve static frontend files
app.use(express.static(__dirname));

/**
 * Intelligent Server-Side Scheme Search from Supabase (3,400+ Records)
 * Searches `government_schemes` table without overloading Sarvam LLM context.
 */
async function searchGovernmentSchemes(userQuery, userProfile = {}, limit = 6) {
  try {
    const query = (userQuery || '').toLowerCase();
    const state = userProfile.state || 'Punjab';
    
    // Check if query is health / medical / social related
    const isHealthQuery = /health|medical|doctor|hospital|treatment|dawa|medicine|bima|insurance|card|ayushman|sehat|arogya|swasthya|diabetes|sugar|bp|hypertension|cardiac|senior|elderly|bujurg|surgery|cancer/i.test(query);

    let queryBuilder = supabase
      .from('government_schemes')
      .select('id, scheme_name, slug, details, benefits, eligibility, application, documents, level, schemeCategory, tags');

    if (isHealthQuery) {
      // Prioritize Health & Wellness category
      queryBuilder = queryBuilder.or(`schemeCategory.ilike.%Health%,schemeCategory.ilike.%Medical%,details.ilike.%${state}%,details.ilike.%hospital%,details.ilike.%medical%,details.ilike.%treatment%,scheme_name.ilike.%Ayushman%,scheme_name.ilike.%Sehat%,scheme_name.ilike.%Swasthya%`);
    } else {
      // General keywords matching
      const words = query.split(/\s+/).filter(w => w.length > 2);
      if (words.length > 0) {
        const orClauses = words.slice(0, 3).map(w => `scheme_name.ilike.%${w}%,details.ilike.%${w}%,tags.ilike.%${w}%`).join(',');
        queryBuilder = queryBuilder.or(orClauses);
      }
    }

    const { data, error } = await queryBuilder.limit(20);

    if (error) {
      console.error('Supabase searchGovernmentSchemes error:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      const fallback = await supabase
        .from('government_schemes')
        .select('id, scheme_name, slug, details, benefits, eligibility, application, documents, level, schemeCategory, tags')
        .ilike('schemeCategory', '%Health%')
        .limit(limit);
      return fallback.data || [];
    }

    // Rank by Health & Wellness, State, and Central relevance
    const ranked = data.map(item => {
      let score = 0;
      const text = `${item.scheme_name || ''} ${item.details || ''} ${item.tags || ''} ${item.schemeCategory || ''}`.toLowerCase();
      
      if (item.schemeCategory && item.schemeCategory.toLowerCase().includes('health')) score += 40;
      if (item.level === 'Central') score += 25; // Central schemes apply to all states including Punjab
      if (text.includes(state.toLowerCase())) score += 30; // State-specific bonus
      if (text.includes('diabetes') || text.includes('treatment') || text.includes('hospital') || text.includes('insurance')) score += 15;

      return { ...item, matchRank: score };
    });

    ranked.sort((a, b) => b.matchRank - a.matchRank);
    return ranked.slice(0, limit);

  } catch (err) {
    console.error('Error in searchGovernmentSchemes:', err);
    return [];
  }
}

/**
 * POST /api/chat — Live Server-side Sarvam AI (sarvam-105b) with Supabase Scheme Intelligence
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], profile = {} } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`[API /api/chat] Incoming query: "${message.substring(0, 60)}..."`);

    if (!SARVAM_API_KEY) {
      console.error('SARVAM_API_KEY is missing from .env.local');
      return res.status(500).json({
        error: 'Server AI configuration missing',
        answer: 'Sorry, Sanjeevani AI is temporarily unavailable. Please try again.'
      });
    }

    // 1. Resolve Patient Profile Context
    const userProfile = {
      state: profile.state || 'Punjab',
      district: profile.district || 'Ludhiana',
      familyIncome: profile.familyIncome || profile.income || 250000,
      chronicConditions: profile.chronicConditions || profile.conditions || ['Type 2 Diabetes', 'Hypertension'],
      age: profile.age || 58,
      seniorCitizenInFamily: profile.seniorCitizenInFamily || true
    };

    // 2. Search Supabase for relevant government schemes
    const t0 = Date.now();
    const retrievedSchemes = await searchGovernmentSchemes(message, userProfile, 6);
    console.log(`[Supabase Search] Retrieved ${retrievedSchemes.length} schemes in ${Date.now() - t0}ms`);

    // Format retrieved schemes for Sarvam LLM context
    const schemeContextSummary = retrievedSchemes.map((s, idx) => `
[Scheme ${idx + 1}]
Name: ${s.scheme_name}
Category: ${s.schemeCategory || 'Health'}
Level: ${s.level || 'Central/State'}
Benefits Summary: ${s.benefits ? s.benefits.substring(0, 350) : 'Cashless medical assistance'}
Eligibility Summary: ${s.eligibility ? s.eligibility.substring(0, 300) : 'Subject to state/income criteria'}
Required Documents: ${s.documents ? s.documents.substring(0, 250) : 'Aadhaar, Ration Card, Medical Prescriptions'}
Application Route: ${s.application ? s.application.substring(0, 200) : 'Apply via official government portal or empanelled hospital'}
`).join('\n');

    // 3. System Prompt for Sanjeevani AI
    const systemPrompt = `You are Sanjeevani AI, a multilingual government healthcare scheme assistant.
You understand Hindi, English, Hinglish, Punjabi and other supported Indian languages.

Always respond in the same language/style used by the user.

Your primary purpose is to help users:
- discover relevant government healthcare schemes
- understand eligibility criteria
- understand benefits
- understand required documents
- understand the application process
- identify what they should do next
- avoid unsafe or unofficial application sources

IMPORTANT RULES:
- Never invent a government scheme.
- Never invent eligibility criteria, benefits, or documents.
- Use the scheme information supplied by the Supabase database below.
- If the database does not contain enough information, clearly say that the information could not be verified.
- Do not claim that a user is officially approved or eligible. Use wording such as: "potentially relevant", "appears to match", "please verify eligibility through the official source".
- For medical questions, provide general informational guidance and do not diagnose the user.
- Keep answers simple, conversational, warm and easy to understand for Indian citizens.

USER PROFILE CONTEXT:
- State: ${userProfile.state} (District: ${userProfile.district})
- Age: ${userProfile.age}
- Annual Family Income: ₹${userProfile.familyIncome}
- Health Conditions: ${Array.isArray(userProfile.chronicConditions) ? userProfile.chronicConditions.join(', ') : userProfile.chronicConditions}
- Senior Member (70+): ${userProfile.seniorCitizenInFamily ? 'Yes' : 'No'}

VERIFIED SCHEMES RETRIEVED FROM SUPABASE DATABASE:
${schemeContextSummary || 'No specific scheme matched the exact search filter. Suggest general Ayushman PM-JAY and Sehat Bima verification.'}`;

    // 4. Format recent conversation history (last 10-12 messages)
    const formattedMessages = [
      { role: 'system', content: systemPrompt }
    ];

    if (Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const h of recentHistory) {
        if (h.sender === 'user' || h.role === 'user') {
          formattedMessages.push({ role: 'user', content: h.text || h.content || '' });
        } else if (h.sender === 'ai' || h.role === 'assistant') {
          formattedMessages.push({ role: 'assistant', content: h.text || h.content || '' });
        }
      }
    }

    // Add current user message
    formattedMessages.push({ role: 'user', content: message.trim() });

    // 5. Send Request to Sarvam AI (`sarvam-105b`)
    let generatedAnswer = '';

    try {
      const sarvamResponse = await fetch('https://api.sarvam.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': SARVAM_API_KEY
        },
        body: JSON.stringify({
          model: 'sarvam-105b',
          messages: formattedMessages,
          temperature: 0.35,
          max_tokens: 1500
        })
      });

      if (!sarvamResponse.ok) {
        const errBody = await sarvamResponse.text();
        console.error('Sarvam AI chat completions API error:', sarvamResponse.status, errBody);

        // Fallback to conversational model variant
        const fallbackRes = await fetch('https://api.sarvam.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-subscription-key': SARVAM_API_KEY
          },
          body: JSON.stringify({
            model: 'sarvam-2b',
            messages: formattedMessages,
            temperature: 0.4,
            max_tokens: 800
          })
        });

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          generatedAnswer = fallbackData.choices?.[0]?.message?.content || '';
        } else {
          throw new Error(`Sarvam AI returned status ${sarvamResponse.status}`);
        }
      } else {
        const sarvamData = await sarvamResponse.json();
        const choiceMsg = sarvamData.choices?.[0]?.message;
        generatedAnswer = (choiceMsg?.content && choiceMsg.content.trim()) 
          ? choiceMsg.content 
          : (choiceMsg?.reasoning_content || '');
        console.log(`[Sarvam AI Response] Generated ${generatedAnswer.length} chars`);
      }
    } catch (apiErr) {
      console.error('Sarvam AI API Error:', apiErr.message);
      return res.status(500).json({
        error: 'Sarvam AI communication failed',
        answer: 'Sorry, Sanjeevani AI is temporarily unavailable. Please try again.'
      });
    }

    // 6. Format Structured Scheme Cards for Frontend
    const formattedCards = retrievedSchemes.map(s => ({
      name: s.scheme_name,
      category: s.schemeCategory || 'Health & Wellness',
      level: s.level || 'Central',
      status: 'active',
      eligibility_status: 'potentially_eligible',
      benefits: s.benefits ? s.benefits.substring(0, 180) + '...' : 'Cashless hospitalization and healthcare assistance',
      eligibility: s.eligibility ? s.eligibility.substring(0, 150) + '...' : 'Based on state and income parameters',
      documents: s.documents ? s.documents.substring(0, 120) + '...' : 'Aadhaar Card, Ration Card',
      application: s.application ? s.application.substring(0, 120) + '...' : 'Apply via official portal',
      official_source_url: 'https://nha.gov.in'
    }));

    return res.json({
      answer: generatedAnswer,
      schemes: formattedCards
    });

  } catch (error) {
    console.error('Server error handling /api/chat:', error);
    return res.status(500).json({
      error: 'Internal server error',
      answer: 'Sorry, Sanjeevani AI is temporarily unavailable. Please try again.'
    });
  }
});

/**
 * POST /api/voice/transcribe — Server-side Sarvam AI Speech-to-Text Endpoint
 */
app.post('/api/voice/transcribe', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    if (!SARVAM_API_KEY) {
      return res.status(500).json({ error: 'SARVAM_API_KEY not configured' });
    }

    const languageCode = req.body.language_code || 'hi-IN';
    const model = req.body.model || 'saaras:v3';
    const mode = req.body.mode || 'transcribe';

    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'audio/webm' });
    formData.append('file', blob, req.file.originalname || 'speech.webm');
    formData.append('model', model);
    formData.append('mode', mode);
    formData.append('language_code', languageCode);

    const sarvamRes = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY
      },
      body: formData
    });

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      console.error('Sarvam STT error:', sarvamRes.status, errText);
      return res.status(sarvamRes.status).json({ error: 'Sarvam transcription error', details: errText });
    }

    const data = await sarvamRes.json();
    return res.json(data);
  } catch (err) {
    console.error('Server error on /api/voice/transcribe:', err);
    return res.status(500).json({ error: 'Transcription failed' });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🌿 Sanjeevani Server running at http://localhost:${PORT}`);
  console.log(`🗄️ Supabase Connected: ${SUPABASE_URL}`);
  console.log(`🤖 Sarvam AI Live Backend connected (sarvam-105b)`);
});
