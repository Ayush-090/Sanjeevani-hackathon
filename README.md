# Sanjeevani — Unified Digital Health, Doctor Platform & Sarvam AI Voice Assistant 🌿🇮🇳

> **"Your healthcare. Your benefits. One intelligent platform."**

Sanjeevani is a complete, production-ready digital healthcare platform featuring **Sarvam AI Indic Speech-to-Text (`POST https://api.sarvam.ai/speech-to-text`)**, **WhatsApp-Style Voice & Text Chat UI**, **Supabase Authentication**, **PostgreSQL Row Level Security (RLS)**, **Patient Dashboard**, **Doctor Consultation & Granular Consent Sharing**, and **Government Medical Scheme Intelligence**.

---

## 🎙️ Sarvam AI Speech-to-Text Integration

The voice assistant communicates with the **Sarvam AI REST API** for high-accuracy transcription across 22 Indian languages:

### API Specification & Parameters
- **Endpoint**: `POST https://api.sarvam.ai/speech-to-text`
- **Authentication**: `api-subscription-key` header
- **Content-Type**: `multipart/form-data`
- **Models**:
  - `saaras:v3` (Default, recommended state-of-the-art model)
  - `saaras:v4` (Latest Indic language model)
- **Modes**:
  - `transcribe`: Standard transcription in original Indic script (e.g. *मेरा फोन नंबर है...*)
  - `translate`: Direct translation to English (e.g. *My phone number is...*)
  - `codemix`: Mixed Latin for English words + Native script for Indic words
  - `verbatim`: Exact word-for-word audio transcription without normalization
  - `translit`: Latin/Roman transliterated script (e.g. *mera phone number hai...*)
- **Supported Indic Languages**:
  - `hi-IN` (Hindi), `pa-IN` (Punjabi), `bn-IN` (Bengali), `mr-IN` (Marathi), `ta-IN` (Tamil), `te-IN` (Telugu), `gu-IN` (Gujarati), `kn-IN` (Kannada), `ml-IN` (Malayalam), `od-IN` (Odia), `as-IN` (Assamese), `en-IN` (Indian English), etc.

```javascript
// Example Sarvam AI REST API Call
const formData = new FormData();
formData.append('file', audioBlob, 'recording.webm');
formData.append('model', 'saaras:v3');
formData.append('mode', 'transcribe');
formData.append('language_code', 'hi-IN');

const response = await fetch('https://api.sarvam.ai/speech-to-text', {
  method: 'POST',
  headers: {
    'api-subscription-key': process.env.SARVAM_API_KEY
  },
  body: formData
});
```

---

## 🏗️ Architecture & Dual-Role Ecosystem

```
SANJEEVANI HEALTHCARE PLATFORM
├── 1. WhatsApp-Style Voice Chat UI (Powered by Sarvam AI)
│   ├── Left Multi-Thread Conversation History Sidebar (+ New Chat, Search)
│   ├── 12-Language Live Switcher (Hindi, Punjabi, Bengali, Tamil, Telugu, etc.)
│   ├── Microphone Voice Recording with Live Sound Waveform Overlay
│   ├── Sarvam AI REST STT Transcription Confirmation before Sending
│   ├── Dedicated Full-Screen Voice Conversation Mode Modal
│   ├── Web Speech Audio Text-to-Speech (🔊 Listen / ⏸ Pause)
│   └── Embedded Government Scheme Cards with Match Scores & Benefits
│
├── 2. Supabase Authentication & Role Switcher
│   ├── Role Selection: 🧑 Patient vs 👨‍⚕️ Doctor
│   ├── Supabase Auth API (`signUp`, `signInWithPassword`, `signOut`)
│   └── 1-Click Evaluator Test Accounts (Pre-filled Ayush & Dr. Sharma)
│
├── 3. Patient Dashboard (`/dashboard/patient`)
│   ├── Health Snapshot & Vitals (BP, Fasting Sugar, HbA1c, BMI)
│   ├── Medical Records Vault (Metabolic Panel, ECG Scans, Prescriptions)
│   ├── My Doctors & Granular Consent Manager (Time-bound Expiry & 1-Click Revocation)
│   └── 🏛️ Government Medical Scheme Discovery (PM-JAY 96% Match, Sehat Bima, Janaushadhi)
│
└── 4. Doctor Dashboard (`/dashboard/doctor`)
    ├── Doctor Metrics (14 Patients, 2 Requests, 28 Records, 6 Daily Reviews)
    ├── Consented Patients List & RLS-Guarded Patient Detail View
    ├── 🔐 "Patient Consented — Access is limited to records shared by patient" Banner
    └── Interactive "Request Additional Medical Records" System
```

---

## 🗄️ Supabase PostgreSQL Schema & Row Level Security (RLS)

The complete SQL migration is located in [`supabase/schema.sql`](file:///c:/Users/siwan/Sanjeevani%20hackthon/supabase/schema.sql):

- **`profiles`**: Master user identity table (`id`, `role`, `full_name`, `email`, `phone`, `state`, `district`).
- **`patient_profiles`**: Clinical vitals, chronic conditions (`Type 2 Diabetes`, `Hypertension`), allergies, family income (`₹2.5L`), and NFSA Blue Card status.
- **`doctor_profiles`**: Medical registration number, specialization, hospital, city, and `verification_status` (`pending`, `verified`, `rejected`).
- **`medical_records`**: Encrypted clinical records metadata linked to private storage buckets.
- **`consents`**: Granular patient permissions (`records_allowed UUID[]`, `valid_until`, `status: 'active' | 'revoked'`).
- **`doctor_requests`**: Requests from doctors to patients for additional diagnostic history.
- **`government_schemes`**: Source-attributed Central & State healthcare scheme knowledge base.

---

## 🚀 Running the Platform Locally

The application runs directly in any modern browser:

```bash
# Serve locally on port 3000
python -m http.server 3000

# Open in browser
http://localhost:3000
```

### ⚡ Quick Demo Accounts (1-Click in Login Modal):
- **Patient Account**: `ayush.bhardwaj@email.com` (Ayush Bhardwaj, 58, Punjab)
- **Doctor Account**: `dr.sharma@sanjeevani.in` (Dr. H. S. Sharma, Cardiologist)
