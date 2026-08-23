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
const SARVAM_API_KEY = process.env.SARVAM_API_KEY || 'sk_g102nzcd_JtWlroEVMXmr3zdoNdpM7xbi';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rwuaxjifvwrylehwmvxd.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_9tH6kDfvUTb-jjyyhp89DQ_4EjsLT-6';

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer in-memory storage for audio uploads
const upload = multer({ storage: multer.memoryStorage() });

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * Intelligent Server-Side Scheme Search from Supabase (3,400+ Records)
 * Uses Semantic keywords and ranking to retrieve relevant health/welfare records.
 */
async function searchGovernmentSchemes(userQuery, userProfile = {}, limit = 6) {
  try {
    const query = (userQuery || '').toLowerCase();
    const state = userProfile.state || 'Punjab';
    
    // Check if query is health / medical / social related
    const isHealthQuery = /health|medical|doctor|hospital|treatment|dawa|medicine|bima|insurance|card|ayushman|sehat|arogya|swasthya|diabetes|sugar|bp|hypertension|cardiac|senior|elderly|bujurg|surgery|cancer|relief|shramik|kalyan|sahayata/i.test(query);

    let queryBuilder = supabase
      .from('government_schemes')
      .select('id, scheme_name, slug, details, benefits, eligibility, application, documents, level, schemeCategory, tags, official_source, official_url');

    if (isHealthQuery) {
      // Prioritize Health & Wellness category
      queryBuilder = queryBuilder.or(`schemeCategory.ilike.%Health%,schemeCategory.ilike.%Medical%,details.ilike.%${state}%,details.ilike.%hospital%,details.ilike.%medical%,details.ilike.%treatment%,scheme_name.ilike.%Ayushman%,scheme_name.ilike.%Sehat%,scheme_name.ilike.%Swasthya%,details.ilike.%bima%`);
    } else {
      // General keywords matching
      const words = query.split(/\s+/).filter(w => w.length > 2);
      if (words.length > 0) {
        const orClauses = words.slice(0, 3).map(w => `scheme_name.ilike.%${w}%,details.ilike.%${w}%,tags.ilike.%${w}%`).join(',');
        queryBuilder = queryBuilder.or(orClauses);
      }
    }

    const { data, error } = await queryBuilder.limit(25);

    if (error) {
      console.error('Supabase searchGovernmentSchemes error:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      const fallback = await supabase
        .from('government_schemes')
        .select('id, scheme_name, slug, details, benefits, eligibility, application, documents, level, schemeCategory, tags, official_source, official_url')
        .ilike('schemeCategory', '%Health%')
        .limit(limit);
      return fallback.data || [];
    }

    // Rank & prioritize State + Health specific matches
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
 * Multilingual Language & Script Detection
 */
function detectLanguageAndScript(text = '') {
  const trimmed = text.trim();
  
  // 1. Script checks
  if (/[\u0900-\u097F]/.test(trimmed)) {
    return { language: 'hi-IN', script: 'devanagari', style: 'hindi', responseLanguage: 'hi-IN' };
  }
  if (/[\u0A00-\u0A7F]/.test(trimmed)) {
    return { language: 'pa-IN', script: 'gurmukhi', style: 'punjabi', responseLanguage: 'pa-IN' };
  }
  if (/[\u0980-\u09FF]/.test(trimmed)) {
    return { language: 'bn-IN', script: 'bengali', style: 'bengali', responseLanguage: 'bn-IN' };
  }
  if (/[\u0B80-\u0BFF]/.test(trimmed)) {
    return { language: 'ta-IN', script: 'tamil', style: 'tamil', responseLanguage: 'ta-IN' };
  }
  if (/[\u0C00-\u0C7F]/.test(trimmed)) {
    return { language: 'te-IN', script: 'telugu', style: 'telugu', responseLanguage: 'te-IN' };
  }
  if (/[\u0C80-\u0CFF]/.test(trimmed)) {
    return { language: 'kn-IN', script: 'kannada', style: 'kannada', responseLanguage: 'kn-IN' };
  }
  if (/[\u0D00-\u0D7F]/.test(trimmed)) {
    return { language: 'ml-IN', script: 'malayalam', style: 'malayalam', responseLanguage: 'ml-IN' };
  }
  if (/[\u0A80-\u0AFF]/.test(trimmed)) {
    return { language: 'gu-IN', script: 'gujarati', style: 'gujarati', responseLanguage: 'gu-IN' };
  }

  // 2. Explicit Language Override in query
  if (/\b(in\s+english|english\s*(mein|vich|in|\b))\b/i.test(trimmed)) {
    return { language: 'en-IN', script: 'roman', style: 'english', responseLanguage: 'en-IN' };
  }
  if (/\b(in\s+hindi|hindi\s*(mein|in|\b))\b/i.test(trimmed)) {
    return { language: 'hi-IN', script: 'roman', style: 'hinglish', responseLanguage: 'hi-IN' };
  }
  if (/\b(in\s+punjabi|punjabi\s*(mein|vich|in|\b))\b/i.test(trimmed)) {
    return { language: 'pa-IN', script: 'roman', style: 'punjabi', responseLanguage: 'pa-IN' };
  }

  // 3. Roman Punjabi keywords
  const punjabiPattern = /\b(mainu|sadda|saddi|tussi|tuhanu|kisse|vich|pind|bapu|bebe|kiddan|satshriakal|daso|dasso|chahidi|labhegi|kithon|hovega|hovegi)\b/i;
  if (punjabiPattern.test(trimmed)) {
    return { language: 'pa-IN', script: 'roman', style: 'punjabi', responseLanguage: 'pa-IN' };
  }

  // 4. Roman Hindi / Hinglish keywords
  const hinglishKeywords = [
    'mere', 'meri', 'mera', 'mereko', 'mujhe', 'mujhko', 'hum', 'hume', 'hamare', 'humare',
    'aap', 'aapke', 'aapko', 'tum', 'tumhe', 'tera', 'teri', 'unke', 'unki', 'unko', 'inke', 'iski', 'iske',
    'koi', 'kuch', 'kya', 'kyun', 'kyu', 'kaise', 'kahan', 'kidhar', 'kab', 'kitna', 'kitni', 'kitne', 'kaun', 'kaunsi', 'kaunsa',
    'hai', 'hain', 'tha', 'thi', 'the', 'hoga', 'hogi', 'hoge', 'nahi', 'nahin', 'na', 'mat',
    'batao', 'bataiye', 'bataye', 'samjhao', 'samjhaiye', 'samjhaye', 'chahiye', 'dekhna', 'milega', 'milegi', 'milenge',
    'kar', 'kare', 'karna', 'karen', 'karo', 'raha', 'rahi', 'rahe', 'sakta', 'sakti', 'sakte', 'chalta', 'chalti',
    'yojana', 'yojna', 'sarkar', 'sarkari', 'dawa', 'dawai', 'dawiyan', 'aspataal', 'aspatal', 'bima', 'bimari', 'ilaj', 'illaj',
    'pesha', 'paisa', 'paise', 'rupaye', 'rupe', 'form', 'dastavez', 'kagaz', 'bujurg', 'buzurg',
    'papa', 'pitaji', 'mummy', 'mataji', 'bhai', 'behen', 'dada', 'dadi', 'bina', 'saath',
    'se', 'ko', 'par', 'pe', 'mein', 'aur', 'ya', 'toh', 'bhi', 'shuru', 'kripya', 'namaste', 'namaskar', 'pranam', 'shukriya', 'dhanyawad'
  ];

  const lower = trimmed.toLowerCase();
  const words = lower.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const matchCount = words.filter(w => hinglishKeywords.includes(w)).length;

  if (matchCount >= 1 && (words.length <= 4 || matchCount / words.length >= 0.12)) {
    return { language: 'hi-IN', script: 'roman', style: 'hinglish', responseLanguage: 'hi-IN' };
  }

  // Default to English
  return { language: 'en-IN', script: 'roman', style: 'english', responseLanguage: 'en-IN' };
}

/**
 * Intent Classifier: Checks if user query is Emergency, Medical Informational, Scheme Search, or Unrelated.
 */
function classifyQueryIntent(query = '') {
  const q = query.toLowerCase();

  // 1. Emergency intent
  if (/chest pain|heart attack|dil ka daura|saans lene mein|breathing difficulty|heavy bleeding|khun beh|unconscious|behosh|stroke|seizure|chhati mein dard|poison|emergency/i.test(q)) {
    return 'EMERGENCY';
  }

  // 2. Unrelated intent (sports, films, coding, politics)
  if (/cricket|ipl|football|movie|actor|film|virat|dhoni|bollywood|hollywood|python code|react code|stocks|bitcoin/i.test(q)) {
    return 'UNRELATED';
  }

  // 3. Pure medical informational question (symptoms, diet, definition)
  if (/what is diabetes|diabetes kya hai|hypertension kya hai|causes of|symptoms of|blood sugar normal|hba1c normal|diet for|gharelu nuskhe/i.test(q) && !/scheme|yojana|sarkar|bima|card|form|document/i.test(q)) {
    return 'MEDICAL_INFO';
  }

  // 4. Government Scheme search / general health scheme enquiry
  return 'SCHEME_SEARCH';
}

/**
 * POST /api/chat — Live Server-side Sarvam AI (sarvam-105b) with Supabase Scheme Intelligence
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], profile = {}, language: clientLang, script: clientScript, style: clientStyle } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Language Detection
    const detected = detectLanguageAndScript(message);
    const userLanguage = clientLang || detected.language;
    const userScript = clientScript || detected.script;
    const userStyle = clientStyle || detected.style;
    const responseLanguage = detected.responseLanguage;

    // 2. Intent Classification
    const intent = classifyQueryIntent(message);

    console.log("------------------------------------------");
    console.log("USER MESSAGE:", message);
    console.log("INTENT:", intent);
    console.log("DETECTED LANGUAGE:", userLanguage);
    console.log("SCRIPT:", userScript);
    console.log("STYLE:", userStyle);
    console.log("RESPONSE LANGUAGE:", responseLanguage);
    console.log("------------------------------------------");

    if (!SARVAM_API_KEY) {
      console.error('SARVAM_API_KEY is missing from .env.local');
      return res.status(500).json({
        error: 'Server AI configuration missing',
        answer: 'Sorry, Sanjeevani AI is temporarily unavailable. Please try again.'
      });
    }

    // 3. Resolve Patient Profile Context
    const userProfile = {
      state: profile.state || 'Punjab',
      district: profile.district || 'Ludhiana',
      familyIncome: profile.familyIncome || profile.income || 250000,
      chronicConditions: profile.chronicConditions || profile.conditions || ['Type 2 Diabetes', 'Hypertension'],
      age: profile.age || 58,
      seniorCitizenInFamily: profile.seniorCitizenInFamily || true
    };

    // 4. Handle Emergency Queries Immediately
    if (intent === 'EMERGENCY') {
      let emergencyAnswer = '';
      if (userScript === 'devanagari' || userStyle === 'hindi') {
        emergencyAnswer = `🚨 **आपातकालीन चिकित्सा सूचना (Medical Emergency):**\n\nयदि आपको या आपके किसी परिजन को गंभीर लक्षण (जैसे सीने में तेज दर्द, सांस लेने में तकलीफ या अत्यधिक रक्तस्राव) हैं, तो कृपया तुरंत नजदीकी अस्पताल के इमरजेंसी विभाग (ICU) में जाएं या **108 / 112** राष्ट्रीय एम्बुलेंस सेवा पर कॉल करें।\n\nकृपया किसी भी सरकारी योजना की प्रतीक्षा किए बिना तुरंत आपातकालीन चिकित्सा सहायता लें।`;
      } else if (userStyle === 'hinglish') {
        emergencyAnswer = `🚨 **Emergency Alert:**\n\nAgar aapko ya parivaar mein kisi ko severe chest pain, saans lene mein takleef ya emergency symptoms hain, toh bina kisi delay ke **108 / 112** ambulance par call karein ya nearest hospital emergency room (ICU) jaayein.\n\nEmergency situation mein pehle urgent medical attention lein.`;
      } else if (userStyle === 'punjabi') {
        emergencyAnswer = `🚨 **ਐਮਰਜੈਂਸੀ ਮੈਡੀਕਲ ਸਹਾਇਤਾ (Emergency):**\n\nਜੇਕਰ ਛਾਤੀ ਵਿੱਚ ਦਰਦ ਜਾਂ ਸਾਹ ਲੈਣ ਵਿੱਚ ਗੰਭੀਰ ਤਕਲੀਫ਼ ਹੈ, ਤਾਂ ਤੁਰੰਤ **108 / 112** ਐਂਬੂਲੈਂਸ ਨੂੰ ਕਾਲ ਕਰੋ ਜਾਂ ਨੇੜਲੇ ਹਸਪਤਾਲ ਦੇ ਐਮਰਜੈਂਸੀ ਵਿਭਾਗ ਵਿੱਚ ਜਾਓ। ਤੁਰੰਤ ਡਾਕਟਰੀ ਇਲਾਜ ਸਭ ਤੋਂ ਪਹਿਲਾਂ ਜ਼ਰੂਰੀ ਹੈ।`;
      } else {
        emergencyAnswer = `🚨 **Medical Emergency Alert:**\n\nIf you or someone around you is experiencing acute chest pain, severe shortness of breath, heavy bleeding, or loss of consciousness, please call **108 / 112** (Emergency Medical Services) immediately or visit the nearest Hospital Emergency Room (ER).\n\nPlease prioritize immediate clinical emergency care before verifying government scheme paperwork.`;
      }

      return res.json({
        answer: emergencyAnswer,
        schemes: [],
        language: userLanguage,
        script: userScript,
        style: userStyle,
        responseLanguage: responseLanguage
      });
    }

    // 5. Retrieve Government Schemes from Supabase (Only for Scheme/Health searches)
    let retrievedSchemes = [];
    if (intent === 'SCHEME_SEARCH') {
      const t0 = Date.now();
      retrievedSchemes = await searchGovernmentSchemes(message, userProfile, 5);
      console.log(`[Supabase Search] Retrieved ${retrievedSchemes.length} schemes in ${Date.now() - t0}ms`);
    }

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
Official Source: ${s.official_source || s.official_url || 'Source verification required'}
`).join('\n');

    // Mandatory Language Directives for Sarvam AI
    let specificLanguageDirective = '';
    if (userStyle === 'hinglish') {
      specificLanguageDirective = `
CRITICAL MANDATORY LANGUAGE RULE (HINGLISH / ROMAN HINDI):
The user wrote in HINGLISH (Hindi written using English/Roman letters, for example: "Mere liye koi government scheme hai?").
You MUST respond ONLY in conversational Hinglish / Roman Hindi.
NEVER respond in pure English!
NEVER start with "Based on your profile..." or English introductions!
Example opening: "Aapke profile ke basis par kuch government health schemes potentially relevant ho sakti hain..."
Respond completely in natural Roman Hindi/Hinglish in 3-6 concise, clear points.`;
    } else if (userScript === 'devanagari') {
      specificLanguageDirective = `
CRITICAL MANDATORY LANGUAGE RULE (HINDI DEVANAGARI):
The user wrote in Hindi using Devanagari script (e.g. "मेरे लिए कोई सरकारी योजना है?").
You MUST respond ONLY in Hindi using Devanagari script.
NEVER respond in English! Keep points structured and concise (3-6 bullet points).`;
    } else if (userStyle === 'punjabi' || userScript === 'gurmukhi') {
      specificLanguageDirective = `
CRITICAL MANDATORY LANGUAGE RULE (PUNJABI):
The user wrote in Punjabi.
You MUST respond ONLY in Punjabi.
NEVER switch to English!`;
    } else {
      specificLanguageDirective = `
LANGUAGE RULE:
The user wrote in English. Respond in clear, professional English with 3-6 structured points.`;
    }

    // 6. System Prompt for Sanjeevani AI
    const systemPrompt = `You are Sanjeevani AI, an intelligent multilingual government healthcare scheme assistant for Indian citizens.
You understand Hindi, English, Hinglish, Punjabi and other supported Indian languages.

LANGUAGE RULE:
Always respond in the exact same language and writing style as the user's latest message.
If the user uses Hindi in Devanagari, respond in Hindi Devanagari.
If the user uses Hindi/Hinglish in Roman script, respond in Roman Hindi/Hinglish.
If the user uses English, respond in English.
If the user uses Punjabi, respond in Punjabi.
Never automatically switch to English.

${specificLanguageDirective}

CRITICAL RULES FOR SCHEMES & ELIGIBILITY:
1. Grounding: Use ONLY the scheme information supplied in the Supabase database context below. Never invent scheme names, benefits, eligibility, or procedures.
2. Transparency & Eligibility:
   - Never say "You are eligible."
   - Instead, use nuanced phrasing: "Likely Match", "Potentially Relevant", or "More Information Required".
   - If information is insufficient: clearly state "I couldn't verify your eligibility from the available information."
3. Action Plan: Always include a short "What to do next" (1. Verify eligibility on portal, 2. Gather required documents, 3. Apply via official CSC/Hospital).
4. Conciseness: Keep responses short and conversational (3-6 clear bullet points), ideal for voice playback. If user asks "Detail mein batao", provide comprehensive breakdown.
5. Medical Guidance: For clinical questions (e.g. "What is diabetes?"), provide helpful general informational guidance and remind user to consult a doctor. Do not diagnose or prescribe.
6. Unrelated Queries: For non-health queries (e.g. sports, films), answer briefly and politely clarify that Sanjeevani assists with healthcare guidance and government health schemes.

USER PROFILE CONTEXT:
- State: ${userProfile.state} (District: ${userProfile.district})
- Age: ${userProfile.age}
- Annual Family Income: ₹${userProfile.familyIncome}
- Health Conditions: ${Array.isArray(userProfile.chronicConditions) ? userProfile.chronicConditions.join(', ') : userProfile.chronicConditions}
- Senior Member (70+): ${userProfile.seniorCitizenInFamily ? 'Yes' : 'No'}

VERIFIED SCHEMES RETRIEVED FROM SUPABASE DATABASE:
${schemeContextSummary || 'No specific scheme matched. Guide the user on Ayushman Bharat PM-JAY and state health portals.'}`;

    // 7. Format recent conversation history (last 10-12 messages)
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

    // 8. Send Request to Sarvam AI (`sarvam-105b`)
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
          const choiceMsg = fallbackData.choices?.[0]?.message;
          generatedAnswer = (choiceMsg?.content && choiceMsg.content.trim()) 
            ? choiceMsg.content 
            : (choiceMsg?.reasoning_content || '');
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

    // 9. Format Enhanced Scheme Cards for Frontend with Eligibility & Source Transparency
    let formattedCards = [];
    if (intent === 'SCHEME_SEARCH' && retrievedSchemes.length > 0) {
      formattedCards = retrievedSchemes.map(s => {
        const hasUrl = s.official_url && s.official_url.startsWith('http');
        const sourceUrl = hasUrl ? s.official_url : (s.official_source && s.official_source.startsWith('http') ? s.official_source : null);
        
        // Determine eligibility badge
        let eligibilityStatus = 'potentially_relevant';
        let statusLabel = '🟡 Potentially Relevant';
        if (s.level === 'Central' || (s.details && s.details.toLowerCase().includes(userProfile.state.toLowerCase()))) {
          eligibilityStatus = 'likely_match';
          statusLabel = '🟢 Likely Match';
        } else if (!s.eligibility || s.eligibility.length < 20) {
          eligibilityStatus = 'more_info_required';
          statusLabel = '⚪ More Information Required';
        }

        return {
          id: s.id,
          name: s.scheme_name,
          category: s.schemeCategory || 'Health & Wellness',
          level: s.level || 'Central',
          status: s.status || 'Active',
          eligibility_status: eligibilityStatus,
          status_label: statusLabel,
          why_relevant: `Matches healthcare coverage criteria for residents of ${userProfile.state} with annual income around ₹${userProfile.familyIncome}.`,
          benefits: s.benefits ? s.benefits.substring(0, 180) + '...' : 'Cashless medical and hospitalization assistance',
          eligibility: s.eligibility ? s.eligibility.substring(0, 150) + '...' : 'Subject to state resident and demographic criteria',
          documents: s.documents ? s.documents.substring(0, 130) + '...' : 'Aadhaar Card, State Ration Card, Clinical Prescriptions',
          action_plan: [
            '1. Check eligibility criteria against your family documents.',
            '2. Gather Aadhaar card, income certificate, and medical prescriptions.',
            '3. Visit nearest Empanelled Hospital or CSC Center to apply.',
            '4. Verify official status on government portal before submission.'
          ],
          source_status: sourceUrl ? 'Official Source' : 'Source verification required',
          official_source_url: sourceUrl
        };
      });
    }

    return res.json({
      answer: generatedAnswer,
      schemes: formattedCards,
      intent: intent,
      language: userLanguage,
      script: userScript,
      style: userStyle,
      responseLanguage: responseLanguage
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

// Start Express Server locally
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🌿 Sanjeevani Server running at http://localhost:${PORT}`);
    console.log(`🗄️ Supabase Connected: ${SUPABASE_URL}`);
    console.log(`🤖 Sarvam AI Live Backend connected (sarvam-105b)`);
  });
}

module.exports = app;
