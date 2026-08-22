/**
 * Sanjeevani AI Assistant Engine — Live Server-Side Sarvam AI (sarvam-105b) Integration
 * Connects directly to `POST /api/chat` with Supabase profile context, conversation history,
 * and dynamically generated healthcare answers without any client-side API key exposure.
 */

class SanjeevaniAIAssistant {
  constructor() {
    this.speechSynthesis = window.speechSynthesis || null;
    this.currentlySpeakingMsgId = null;
    this.isVoiceRecording = false;
    this.recognition = null;
    this.activeThreadId = 'thread-01';
    this.mediaRecorder = null;
    this.audioChunks = [];
    
    // Conversation Threads (Persisted in state)
    this.threads = [
      {
        id: 'thread-01',
        title: 'New Conversation',
        date: 'Today',
        messages: []
      },
      {
        id: 'thread-02',
        title: 'Diabetes & Hypertension Care',
        date: 'Yesterday',
        messages: [
          { id: 'm-prev-1', sender: 'user', text: 'Mere diabetes aur BP ke liye generic medicines kahan milengi?', timestamp: 'Yesterday, 04:15 PM' },
          { id: 'm-prev-2', sender: 'ai', text: 'Aap Pradhan Mantri Bhartiya Janaushadhi Kendra (PMBJP) se Metformin aur Telmisartan 85% discount par le sakte hain. Ludhiana mein 15+ kendras hain.', timestamp: 'Yesterday, 04:16 PM' }
        ]
      }
    ];

    this.initSpeechRecognition();
    this.initWelcomeMessage('thread-01');
  }

  initWelcomeMessage(threadId) {
    const thread = this.threads.find(t => t.id === threadId);
    if (!thread) return;

    if (thread.messages.length === 0) {
      thread.messages.push({
        id: 'msg-welcome-' + Date.now(),
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `**Namaste! 👋**\n\nMain Sanjeevani AI hoon (Powered by Sarvam AI 105B & Supabase 3,400+ Schemes Knowledge Base). Aapke health profile ke basis par main verified government healthcare schemes find karne aur healthcare information provide karne mein help karta hoon.\n\nAap Hindi, English, Hinglish ya Punjabi mein bol kar (🎙️) ya type karke pooch sakte hain.`,
        showContextCard: true,
        showQuickChips: true,
        chips: [
          "💬 Mere liye kaunsi scheme hai?",
          "📄 Documents kya chahiye?",
          "👉 Mujhe ab kya karna chahiye?",
          "🇮🇳 Hindi mein samjhao",
          "🔍 Check my eligibility"
        ]
      });
    }
  }

  getActiveMessages() {
    const thread = this.threads.find(t => t.id === this.activeThreadId);
    return thread ? thread.messages : [];
  }

  createThread(customTitle = 'New Conversation') {
    const newId = 'thread-' + Date.now();
    const newThread = {
      id: newId,
      title: customTitle,
      date: 'Just now',
      messages: []
    };
    this.threads.unshift(newThread);
    this.activeThreadId = newId;
    this.initWelcomeMessage(newId);
    return newThread;
  }

  switchThread(threadId) {
    this.activeThreadId = threadId;
    this.initWelcomeMessage(threadId);
  }

  /* ==========================================================================
     MediaRecorder Web Audio Stream Recording
     ========================================================================== */
  async startAudioRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4');

      this.mediaRecorder = new MediaRecorder(stream, { mimeType });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250);
      this.isVoiceRecording = true;
      return true;
    } catch (e) {
      console.warn('Microphone permission or MediaRecorder not available:', e);
      return false;
    }
  }

  async stopAudioRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioChunks = [];
        this.isVoiceRecording = false;

        if (this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }

        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /* ==========================================================================
     Server-Side Voice Transcription API (`POST /api/voice/transcribe`)
     ========================================================================== */
  async transcribeAudioWithServer(audioBlob, languageCode = 'hi-IN') {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice_recording.webm');
      formData.append('language_code', languageCode);

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();
      return result.transcript || null;
    } catch (err) {
      console.error('Server-side transcription error:', err);
      return null;
    }
  }

  /* ==========================================================================
     Speech Synthesis (Text-to-Speech / 🔊 Listen Button)
     ========================================================================== */
  speakText(text, msgId, onEndCallback, langCode = 'hi-IN') {
    if (!this.speechSynthesis) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (this.speechSynthesis.speaking && this.currentlySpeakingMsgId === msgId) {
      this.speechSynthesis.cancel();
      this.currentlySpeakingMsgId = null;
      if (onEndCallback) onEndCallback(false);
      return;
    }

    this.speechSynthesis.cancel();

    // Clean markdown symbols for natural speech
    const cleanText = text.replace(/[*#_`>✓🏛️🟢🟡🔵⚠️]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode || 'hi-IN';
    
    const voices = this.speechSynthesis.getVoices();
    let selectedVoice = null;

    if (langCode.includes('pa')) {
      selectedVoice = voices.find(v => v.lang.includes('pa') || v.lang.includes('IN'));
    } else if (langCode.includes('en')) {
      selectedVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en'));
    } else {
      selectedVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
    }

    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 0.95;

    this.currentlySpeakingMsgId = msgId;

    utterance.onend = () => {
      this.currentlySpeakingMsgId = null;
      if (onEndCallback) onEndCallback(false);
    };

    utterance.onerror = () => {
      this.currentlySpeakingMsgId = null;
      if (onEndCallback) onEndCallback(false);
    };

    this.speechSynthesis.speak(utterance);
    if (onEndCallback) onEndCallback(true);
  }

  stopSpeaking() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
      this.currentlySpeakingMsgId = null;
    }
  }

  /* ==========================================================================
     Browser Web Speech Recognition Fallback
     ========================================================================== */
  initSpeechRecognition(lang = 'hi-IN') {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = lang || 'hi-IN';
    }
  }

  /* ==========================================================================
     Live Sarvam AI Chat API Call (`POST /api/chat`)
     ========================================================================== */
  async processQuery(userInput, userProfile, schemesDatabase, onProgressUpdate, isVoiceInput = false) {
    const trimmed = userInput.trim();
    if (!trimmed) return null;

    const thread = this.threads.find(t => t.id === this.activeThreadId);
    if (!thread) return null;

    // Update thread title if first user query
    if (thread.messages.filter(m => m.sender === 'user').length === 0) {
      thread.title = trimmed.length > 28 ? trimmed.substring(0, 25) + '...' : trimmed;
    }

    const userMessage = {
      id: 'msg-u-' + Date.now(),
      sender: 'user',
      isVoiceInput: isVoiceInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: trimmed
    };
    thread.messages.push(userMessage);

    if (onProgressUpdate) {
      onProgressUpdate("🔎 Checking Sanjeevani scheme database...", 30);
    }

    try {
      if (onProgressUpdate) {
        setTimeout(() => {
          onProgressUpdate("🤖 Preparing your grounded answer...", 75);
        }, 500);
      }

      // Call Server-Side Sarvam AI API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: trimmed,
          history: thread.messages.slice(-12),
          profile: userProfile
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const aiResponse = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: data.answer || "Main aapki sahayata ke liye tayar hoon. Please apna sawal poochein.",
        matchedSchemes: data.schemes || [],
        responseLanguage: data.responseLanguage || 'hi-IN'
      };

      thread.messages.push(aiResponse);
      return aiResponse;

    } catch (err) {
      console.error('Error connecting to /api/chat:', err);

      const fallbackResponse = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "Sorry, abhi Sanjeevani AI se response nahi mil pa raha. Please try again.",
        matchedSchemes: [],
        responseLanguage: 'hi-IN'
      };

      thread.messages.push(fallbackResponse);
      return fallbackResponse;
    }
  }
}
