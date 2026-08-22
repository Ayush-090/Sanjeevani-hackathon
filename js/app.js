/**
 * Sanjeevani — Master Application Controller
 * Handles WhatsApp-Style Voice Chat Assistant, Sarvam AI Speech-to-Text Integration,
 * Web Audio Recording, Multi-Thread History, Role-Based Dashboards, and Scheme Discovery.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Global App State
  window.appState = {
    currentScreen: 'landing', // 'landing' | 'patient-dashboard' | 'doctor-dashboard'
    patientSubTab: 'overview',
    doctorSubTab: 'overview',
    currentLanguage: 'hi',
    discoveryStep: 1,
    selectedDoctorForConsent: null,
    selectedPatientForDoctorView: null,
    isVoiceRecording: false,
    recordedTranscriptionText: '',
    isMasterAudioOn: true,
    schemes: [...SANJEEVANI_DATA.schemes],
    medicalRecords: [...SANJEEVANI_DATA.medicalRecords],
    doctors: [...SANJEEVANI_DATA.doctors],
    activeConsents: [...SANJEEVANI_DATA.activeConsents],
    userProfile: { ...SANJEEVANI_DATA.currentUser },
    intelligence: [...SANJEEVANI_DATA.intelligenceUpdates],
    applications: [...SANJEEVANI_DATA.applications],
    doctorPatients: [
      {
        id: 'pat-ayush-090',
        name: 'Ayush Bhardwaj',
        age: 58,
        gender: 'Male',
        state: 'Punjab',
        district: 'Ludhiana',
        lastConsultation: '02 Aug 2026',
        diagnosis: 'Type 2 Diabetes, Hypertension, Cardiac Review',
        sharedRecords: ['Comprehensive Metabolic Panel', 'ECG Diagnostic Scan', 'Cardiology Prescription'],
        accessExpires: '29 Aug 2026 (7 Days Active)',
        status: 'Connected'
      }
    ],
    doctorRequests: [
      {
        id: 'req-01',
        patientName: 'Ayush Bhardwaj',
        requestedRecords: 'Previous 2025 Blood Tests & Cardiology History',
        reason: 'Required for annual chronic disease review',
        status: 'Pending Patient Approval',
        date: '21 Aug 2026'
      }
    ]
  };

  // Initialize AI Engine
  window.aiAssistant = new SanjeevaniAIAssistant();

  // Check Auth State on Boot
  checkAuthAndRoute();
  recalculateMatchScores();
  setupEventListeners();
});

/* ==========================================================================
   Supabase Auth State & Routing
   ========================================================================== */
function checkAuthAndRoute() {
  if (window.sanjeevaniAuth && window.sanjeevaniAuth.isAuthenticated()) {
    const role = window.sanjeevaniAuth.getUserRole();
    if (role === 'doctor') {
      routeToDoctorDashboard();
    } else {
      routeToPatientDashboard();
    }
  } else {
    routeToLandingPage();
  }
}

function routeToLandingPage() {
  window.appState.currentScreen = 'landing';
  hideAllScreens();
  const el = document.getElementById('screen-landing');
  if (el) el.classList.add('active-screen');
  updateNavbarForAuth(false);
}

function routeToPatientDashboard() {
  window.appState.currentScreen = 'patient-dashboard';
  hideAllScreens();
  const el = document.getElementById('screen-patient-dashboard');
  if (el) el.classList.add('active-screen');
  updateNavbarForAuth(true, 'patient');
  renderPatientOverview();
}

function routeToDoctorDashboard() {
  window.appState.currentScreen = 'doctor-dashboard';
  hideAllScreens();
  const el = document.getElementById('screen-doctor-dashboard');
  if (el) el.classList.add('active-screen');
  updateNavbarForAuth(true, 'doctor');
  renderDoctorOverview();
}

function hideAllScreens() {
  document.querySelectorAll('.view-screen').forEach(s => s.classList.remove('active-screen'));
}

function updateNavbarForAuth(isAuthenticated, role = 'patient') {
  const publicNav = document.getElementById('public-nav-links');
  const patientNav = document.getElementById('patient-nav-links');
  const doctorNav = document.getElementById('doctor-nav-links');
  const loginBtn = document.getElementById('nav-login-btn');
  const userPill = document.getElementById('nav-user-pill');
  const userPillName = document.getElementById('nav-user-pill-name');
  const userPillTag = document.getElementById('nav-user-pill-tag');

  if (!isAuthenticated) {
    if (publicNav) publicNav.style.display = 'flex';
    if (patientNav) patientNav.style.display = 'none';
    if (doctorNav) doctorNav.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (userPill) userPill.style.display = 'none';
  } else {
    if (publicNav) publicNav.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'none';
    if (userPill) userPill.style.display = 'flex';

    if (role === 'doctor') {
      if (patientNav) patientNav.style.display = 'none';
      if (doctorNav) doctorNav.style.display = 'flex';
      if (userPillName) userPillName.textContent = 'Dr. H. S. Sharma';
      if (userPillTag) userPillTag.textContent = '✓ Verified Doctor';
    } else {
      if (patientNav) patientNav.style.display = 'flex';
      if (doctorNav) doctorNav.style.display = 'none';
      if (userPillName) userPillName.textContent = 'Ayush (58)';
      if (userPillTag) userPillTag.textContent = 'Patient Account';
    }
  }
}

/* ==========================================================================
   Auth Modal & Role Selector
   ========================================================================== */
function openAuthModal(defaultRole = 'patient') {
  const modal = document.getElementById('auth-modal');
  modal.classList.add('active');
  selectAuthRole(defaultRole);
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('active');
}

function selectAuthRole(role) {
  const patientCard = document.getElementById('role-card-patient');
  const doctorCard = document.getElementById('role-card-doctor');
  const patientForm = document.getElementById('auth-form-patient');
  const doctorForm = document.getElementById('auth-form-doctor');

  if (role === 'doctor') {
    if (patientCard) patientCard.classList.remove('selected');
    if (doctorCard) doctorCard.classList.add('selected');
    if (patientForm) patientForm.style.display = 'none';
    if (doctorForm) doctorForm.style.display = 'block';
  } else {
    if (patientCard) patientCard.classList.add('selected');
    if (doctorCard) doctorCard.classList.remove('selected');
    if (patientForm) patientForm.style.display = 'block';
    if (doctorForm) doctorForm.style.display = 'none';
  }
}

async function handlePatientLogin() {
  const email = document.getElementById('patient-login-email').value;
  const pass = document.getElementById('patient-login-pass').value;

  await window.sanjeevaniAuth.signIn(email, pass, 'patient');
  closeAuthModal();
  routeToPatientDashboard();
  showToast('✓ Welcome back, Ayush Bhardwaj!');
}

async function handleDoctorLogin() {
  const email = document.getElementById('doctor-login-email').value;
  const pass = document.getElementById('doctor-login-pass').value;

  await window.sanjeevaniAuth.signIn(email, pass, 'doctor');
  closeAuthModal();
  routeToDoctorDashboard();
  showToast('✓ Welcome back, Dr. H. S. Sharma!');
}

async function handleLogout() {
  await window.sanjeevaniAuth.signOut();
  routeToLandingPage();
  showToast('✓ Logged out successfully.');
}

/* ==========================================================================
   Patient Dashboard Navigation
   ========================================================================== */
function switchPatientTab(tabId) {
  window.appState.patientSubTab = tabId;

  document.querySelectorAll('.patient-sidebar-link').forEach(link => {
    link.classList.toggle('active', link.dataset.tab === tabId);
  });

  document.querySelectorAll('.patient-tab-content').forEach(content => {
    content.style.display = content.id === `patient-tab-${tabId}` ? 'block' : 'none';
  });

  if (tabId === 'records') renderMedicalRecords();
  if (tabId === 'doctors' || tabId === 'consents') renderDoctorsAndConsents();
  if (tabId === 'schemes') renderSchemesGrid();
  if (tabId === 'ai') renderWhatsAppAIChat();
  if (tabId === 'docs') renderDocumentsGrid();
  if (tabId === 'applications') renderApplicationsList();
}

function renderPatientOverview() {
  const v = window.appState.userProfile.vitals;
  const bpEl = document.getElementById('vital-bp');
  const sugarEl = document.getElementById('vital-sugar');
  const hba1cEl = document.getElementById('vital-hba1c');
  const bmiEl = document.getElementById('vital-bmi');

  if (bpEl) bpEl.textContent = v.bloodPressure;
  if (sugarEl) sugarEl.textContent = v.bloodSugarFasting;
  if (hba1cEl) hba1cEl.textContent = v.hba1c;
  if (bmiEl) bmiEl.textContent = v.bmi;

  switchPatientTab('overview');
}

/* ==========================================================================
   Doctor Dashboard Navigation
   ========================================================================== */
function switchDoctorTab(tabId) {
  window.appState.doctorSubTab = tabId;

  document.querySelectorAll('.doctor-sidebar-link').forEach(link => {
    link.classList.toggle('active', link.dataset.tab === tabId);
  });

  document.querySelectorAll('.doctor-tab-content').forEach(content => {
    content.style.display = content.id === `doctor-tab-${tabId}` ? 'block' : 'none';
  });

  if (tabId === 'patients') renderDoctorPatientsList();
  if (tabId === 'requests') renderDoctorRequestsList();
}

function renderDoctorOverview() {
  switchDoctorTab('overview');
  renderDoctorPatientsList();
  renderDoctorRequestsList();
}

function renderDoctorPatientsList() {
  const container = document.getElementById('doctor-patients-container');
  if (!container) return;

  container.innerHTML = window.appState.doctorPatients.map(p => `
    <div style="background: white; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <h4 style="font-size: 16px; font-weight: 800; color: var(--text-main);">${p.name}</h4>
          <span class="badge badge-active">${p.status}</span>
        </div>
        <div style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 6px;">
          ${p.age} Yrs • ${p.gender} • ${p.district}, ${p.state} | Last Visit: <strong>${p.lastConsultation}</strong>
        </div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 6px;">
          <strong>Diagnosis:</strong> ${p.diagnosis}
        </div>
        <div style="font-size: 11.5px; color: var(--teal-700); font-weight: 700;">
          🔒 Consented Records: ${p.sharedRecords.join(', ')} (${p.accessExpires})
        </div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="openDoctorPatientDetail('${p.id}')">
        View Consented Profile →
      </button>
    </div>
  `).join('');
}

function openDoctorPatientDetail(patientId) {
  const p = window.appState.doctorPatients.find(item => item.id === patientId);
  if (!p) return;

  window.appState.selectedPatientForDoctorView = p;
  const modal = document.getElementById('doctor-patient-detail-modal');
  const body = document.getElementById('doctor-patient-detail-body');

  body.innerHTML = `
    <div class="consent-lock-banner">
      <div>
        <div style="font-size: 13px; font-weight: 800; text-transform: uppercase;">🔐 Patient Consented Access (RLS Protected)</div>
        <div style="font-size: 12px; color: #d1fae5; margin-top: 2px;">Access is strictly limited to records authorized by the patient. Valid until: ${p.accessExpires}</div>
      </div>
      <button class="btn btn-secondary btn-sm" style="color: white; border-color: rgba(255,255,255,0.4);" onclick="openRequestRecordsModal()">
        + Request Additional Records
      </button>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
      <div>
        <h2 style="font-size: 22px; font-weight: 800;">${p.name}</h2>
        <div style="font-size: 13px; color: var(--text-muted);">${p.age} Yrs • ${p.gender} • Ludhiana, Punjab • ABHA Linked</div>
      </div>
      <span class="badge badge-active">Consultation Active</span>
    </div>

    <h4 style="font-size: 15px; font-weight: 800; margin-bottom: 10px;">Patient Vitals Snapshot:</h4>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
      <div style="background: #f8fafc; padding: 10px; border-radius: 8px; font-size: 12px;"><strong>BP:</strong> 138/88 mmHg</div>
      <div style="background: #f8fafc; padding: 10px; border-radius: 8px; font-size: 12px;"><strong>Fasting Sugar:</strong> 142 mg/dL</div>
      <div style="background: #f8fafc; padding: 10px; border-radius: 8px; font-size: 12px;"><strong>HbA1c:</strong> 7.4%</div>
      <div style="background: #f8fafc; padding: 10px; border-radius: 8px; font-size: 12px;"><strong>BMI:</strong> 24.6</div>
    </div>

    <h4 style="font-size: 15px; font-weight: 800; margin-bottom: 10px;">Authorized Medical Records:</h4>
    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
      <div style="background: white; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>Comprehensive Metabolic & Lipid Panel</strong>
          <div style="font-size: 11.5px; color: var(--text-muted);">14 Aug 2026 • Fasting Sugar: 142 mg/dL, HbA1c: 7.4%</div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="showToast('Viewing verified Lab Report PDF')">View PDF</button>
      </div>

      <div style="background: white; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>ECG & Echo Screening Scan</strong>
          <div style="font-size: 11.5px; color: var(--text-muted);">02 Aug 2026 • Normal sinus rhythm, mild LVH</div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="showToast('Viewing verified ECG Scan')">View Scan</button>
      </div>

      <div style="background: white; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>Cardiology Prescription Slip</strong>
          <div style="font-size: 11.5px; color: var(--text-muted);">02 Aug 2026 • Metformin 500mg, Telmisartan 40mg</div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="showToast('Viewing verified Prescription')">View Prescription</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeDoctorPatientDetailModal() {
  const modal = document.getElementById('doctor-patient-detail-modal');
  if (modal) modal.classList.remove('active');
}

function openRequestRecordsModal() {
  const modal = document.getElementById('doctor-request-records-modal');
  if (modal) modal.classList.add('active');
}

function closeRequestRecordsModal() {
  const modal = document.getElementById('doctor-request-records-modal');
  if (modal) modal.classList.remove('active');
}

function submitDoctorRecordRequest() {
  const reason = document.getElementById('doctor-req-reason').value;
  closeRequestRecordsModal();
  showToast(`✓ Request sent to patient: ${reason}`);
}

function renderDoctorRequestsList() {
  const container = document.getElementById('doctor-requests-container');
  if (!container) return;

  container.innerHTML = window.appState.doctorRequests.map(r => `
    <div style="background: white; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 18px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h4 style="font-size: 15px; font-weight: 800;">Patient: ${r.patientName}</h4>
        <div style="font-size: 12.5px; color: var(--text-secondary); margin: 2px 0;"><strong>Requested:</strong> ${r.requestedRecords}</div>
        <div style="font-size: 11.5px; color: var(--text-muted);">Reason: ${r.reason} • Sent: ${r.date}</div>
      </div>
      <span class="badge badge-warning">${r.status}</span>
    </div>
  `).join('');
}

/* ==========================================================================
   WHATSAPP-STYLE SANJEEVANI AI CHAT CONTROLLER
   ========================================================================== */
function renderWhatsAppAIChat() {
  renderChatSidebarThreads();
  renderChatFeedMessages();
}

function renderChatSidebarThreads() {
  const container = document.getElementById('threads-scroll-container');
  if (!container) return;

  container.innerHTML = window.aiAssistant.threads.map(t => `
    <div class="thread-item-card ${t.id === window.aiAssistant.activeThreadId ? 'active' : ''}" onclick="switchActiveThread('${t.id}')">
      <div class="thread-item-title">${t.title}</div>
      <div class="thread-item-date">${t.date}</div>
    </div>
  `).join('');
}

function switchActiveThread(threadId) {
  window.aiAssistant.switchThread(threadId);
  renderWhatsAppAIChat();
}

function createNewChatThread() {
  window.aiAssistant.createThread('New Conversation');
  renderWhatsAppAIChat();
  showToast('✓ Started new conversation thread');
}

function renderChatFeedMessages() {
  const feed = document.getElementById('wa-messages-feed-container');
  if (!feed) return;

  const messages = window.aiAssistant.getActiveMessages();

  feed.innerHTML = messages.map(msg => {
    if (msg.sender === 'user') {
      return `
        <div class="wa-bubble-wrap-user">
          <div class="wa-bubble-user">
            ${msg.text}
          </div>
          <div class="wa-bubble-meta">
            <span>${msg.timestamp}</span>
            <span style="color: #0d9488;">✓✓</span>
          </div>
        </div>
      `;
    } else {
      const cleanFormattedText = msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
      return `
        <div class="wa-bubble-wrap-ai">
          <div class="wa-bubble-ai">
            <div>${cleanFormattedText}</div>

            <!-- Compact Health Context Card -->
            ${msg.showContextCard ? `
              <div class="wa-compact-context-card">
                <div class="context-chips-group">
                  <span>📍 Punjab</span>
                  <span>💰 ₹2.5L Income</span>
                  <span>🩺 Type 2 Diabetes</span>
                  <span>🩺 Hypertension</span>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="switchPatientTab('health')">Edit Profile</button>
              </div>
            ` : ''}

            <!-- Quick Action Suggestion Chips -->
            ${msg.showQuickChips && msg.chips ? `
              <div style="margin-top: 12px;">
                <div style="font-size: 12px; font-weight: 800; color: var(--text-secondary); margin-bottom: 6px;">What would you like help with?</div>
                <div class="wa-quick-actions-bar">
                  ${msg.chips.map(c => `<button class="wa-chip-btn" onclick="handleQuickChipClick('${c}')">${c}</button>`).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Embedded Government Scheme Cards in Chat -->
            ${msg.matchedSchemes && msg.matchedSchemes.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 12px;">
                ${msg.matchedSchemes.map(sch => `
                  <div class="wa-scheme-card-embed">
                    <div class="wa-scheme-embed-header">
                      <div>
                        <span class="badge badge-active">🏛️ Government Scheme</span>
                        <h4 style="font-size: 16px; font-weight: 800; color: var(--text-main); margin-top: 4px;">${sch.name}</h4>
                      </div>
                      <span class="match-pill">${sch.matchScore}% Match</span>
                    </div>

                    <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 8px;">
                      ${sch.shortSummary}
                    </div>

                    <div style="background: var(--primary-50); padding: 8px 12px; border-radius: 6px; font-size: 12.5px; font-weight: 800; color: var(--primary-900); margin-bottom: 10px;">
                      Benefit: ${sch.benefits[0]}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 10px; gap: 8px; flex-wrap: wrap;">
                      <span style="font-size: 11px; color: var(--text-muted);">Source: ${sch.officialSource}</span>
                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-secondary btn-sm" onclick="openSchemeModal('${sch.id}')">View Details →</button>
                        <button class="btn-speak-listen" onclick="triggerSpeakMessage('${msg.id}', '${sch.name}. ${sch.shortSummary}')">
                          <span>🔊 Listen</span>
                        </button>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <!-- AI Action Bar (🔊 Listen & 📋 Copy) -->
            <div class="wa-ai-actions-bar">
              <button id="btn-listen-${msg.id}" class="btn-speak-listen" onclick="triggerSpeakMessage('${msg.id}', '${msg.text.replace(/'/g, "\\'")}')">
                <span>🔊 Listen</span>
              </button>
              <button class="btn-copy-chip" onclick="copyMessageText('${msg.text.replace(/'/g, "\\'")}')">
                <span>📋 Copy</span>
              </button>
            </div>
          </div>
          <div class="wa-bubble-meta" style="align-self: flex-start;">
            <span>${msg.timestamp} • Sanjeevani AI</span>
          </div>
        </div>
      `;
    }
  }).join('');

  feed.scrollTop = feed.scrollHeight;
}

/* ==========================================================================
   Voice Input (Sarvam AI Speech-to-Text & MediaRecorder Web Audio)
   ========================================================================== */
async function toggleVoiceRecording() {
  const overlay = document.getElementById('wa-recording-overlay');
  const previewText = document.getElementById('recording-transcription-preview');

  if (!window.appState.isVoiceRecording) {
    // Start Recording
    window.appState.recordedTranscriptionText = '';
    const started = await window.aiAssistant.startAudioRecording();
    window.appState.isVoiceRecording = true;

    if (overlay) overlay.style.display = 'flex';
    if (previewText) previewText.textContent = 'Listening... Speak in Hindi, Punjabi or English';

    if (window.aiAssistant.recognition) {
      try {
        window.aiAssistant.recognition.start();
        window.aiAssistant.recognition.onresult = (event) => {
          const transcript = Array.from(event.results).map(r => r[0].transcript).join('').trim();
          if (transcript) {
            window.appState.recordedTranscriptionText = transcript;
            console.log("1 VOICE TRANSCRIPT (Live Interim):", transcript);
            if (previewText) previewText.textContent = `“${transcript}”`;
          }
        };
      } catch (e) {
        console.warn('Speech recognition active', e);
      }
    }
  } else {
    // Stop recording and send audio to Sarvam AI
    await stopAndProcessVoiceWithSarvam();
  }
}

async function stopAndProcessVoiceWithSarvam() {
  const overlay = document.getElementById('wa-recording-overlay');
  const previewText = document.getElementById('recording-transcription-preview');

  if (previewText) previewText.textContent = 'Processing speech with Sarvam AI...';

  const audioBlob = await window.aiAssistant.stopAudioRecording();
  window.appState.isVoiceRecording = false;

  const langMap = {
    'hi': 'hi-IN', 'en': 'en-IN', 'pa': 'pa-IN', 'bn': 'bn-IN',
    'mr': 'mr-IN', 'ta': 'ta-IN', 'te': 'te-IN', 'gu': 'gu-IN',
    'kn': 'kn-IN', 'ml': 'ml-IN', 'or': 'od-IN', 'as': 'as-IN'
  };
  const targetLangCode = langMap[window.appState.currentLanguage] || 'hi-IN';

  let transcript = null;
  if (audioBlob) {
    transcript = await window.aiAssistant.transcribeAudioWithServer(audioBlob, targetLangCode);
  }

  // Use transcribed text from Sarvam or SpeechRecognition
  const finalTranscript = transcript || window.appState.recordedTranscriptionText;
  if (finalTranscript && finalTranscript.trim()) {
    window.appState.recordedTranscriptionText = finalTranscript.trim();
    console.log("1 VOICE TRANSCRIPT (Final):", window.appState.recordedTranscriptionText);
    if (previewText) previewText.textContent = `“${window.appState.recordedTranscriptionText}”`;
  } else {
    if (previewText) previewText.textContent = 'No speech detected. Please try speaking again.';
  }
}

function cancelVoiceRecording() {
  window.appState.isVoiceRecording = false;
  window.appState.recordedTranscriptionText = '';
  const overlay = document.getElementById('wa-recording-overlay');
  if (overlay) overlay.style.display = 'none';
  window.aiAssistant.stopAudioRecording();
  if (window.aiAssistant.recognition) {
    try { window.aiAssistant.recognition.stop(); } catch(e) {}
  }
}

function confirmSendVoiceRecording() {
  const text = window.appState.recordedTranscriptionText;
  if (!text || !text.trim()) {
    showToast('Please speak a question first');
    return;
  }
  cancelVoiceRecording();
  sendUserChatMessage(text.trim(), true); // true = speak answer aloud
}

/* ==========================================================================
   Voice Conversation Mode (Dedicated Real-Time Dynamic Loop)
   ========================================================================== */
function openVoiceModeModal() {
  const modal = document.getElementById('voice-conversation-modal');
  if (modal) modal.classList.add('active');
  startVoiceConversationLoop();
}

function closeVoiceModeModal() {
  const modal = document.getElementById('voice-conversation-modal');
  if (modal) modal.classList.remove('active');
  window.aiAssistant.stopSpeaking();
  if (window.aiAssistant.recognition) {
    try { window.aiAssistant.recognition.stop(); } catch(e) {}
  }
}

function startVoiceConversationLoop() {
  const statusEl = document.getElementById('voice-mode-status-text');
  if (statusEl) statusEl.textContent = 'Listening... Speak your healthcare or scheme question';

  if (!window.aiAssistant.recognition) {
    if (statusEl) statusEl.textContent = 'Microphone ready. Please speak your question.';
    return;
  }

  try {
    window.aiAssistant.recognition.start();

    window.aiAssistant.recognition.onresult = async (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join('').trim();
      if (!transcript) return;

      console.log("1 VOICE TRANSCRIPT (Voice Mode):", transcript);
      if (statusEl) statusEl.textContent = `“${transcript}”`;

      try { window.aiAssistant.recognition.stop(); } catch(e) {}

      if (statusEl) statusEl.textContent = 'Sanjeevani AI is checking schemes...';

      // Call dynamic chat API
      console.log("2 CHAT (Voice Mode):", transcript);
      const aiResponse = await window.aiAssistant.processQuery(
        transcript,
        window.appState.userProfile,
        window.appState.schemes
      );

      console.log("3 API RESPONSE (Voice Mode):", aiResponse);
      console.log("4 ANSWER (Voice Mode):", aiResponse ? aiResponse.text : '');

      renderChatFeedMessages();

      if (statusEl) statusEl.textContent = 'Speaking...';
      const cleanSpeakText = aiResponse && aiResponse.text ? aiResponse.text : 'Main aapki sahayata ke liye tayar hoon.';

      // Speak real dynamic answer
      window.aiAssistant.speakText(cleanSpeakText, 'voice-modal-msg', (isSpeaking) => {
        if (!isSpeaking) {
          if (statusEl) statusEl.textContent = 'Listening... (Speak your next question anytime)';
          try { window.aiAssistant.recognition.start(); } catch(e) {}
        }
      });
    };

    window.aiAssistant.recognition.onerror = (e) => {
      console.warn('Voice recognition error:', e);
      if (statusEl) statusEl.textContent = 'Listening... (Tap to speak)';
    };

  } catch(err) {
    console.warn('Voice loop initialization:', err);
  }
}

/* ==========================================================================
   Sarvam AI Key Settings Modal
   ========================================================================== */
function openSarvamSettingsModal() {
  const modal = document.getElementById('sarvam-settings-modal');
  const keyInput = document.getElementById('sarvam-api-key-input');
  if (keyInput) keyInput.value = window.aiAssistant.sarvamApiKey || '';
  if (modal) modal.classList.add('active');
}

function closeSarvamSettingsModal() {
  const modal = document.getElementById('sarvam-settings-modal');
  if (modal) modal.classList.remove('active');
}

function saveSarvamSettings() {
  const keyInput = document.getElementById('sarvam-api-key-input');
  const modelSelect = document.getElementById('sarvam-model-select');
  const modeSelect = document.getElementById('sarvam-mode-select');

  const key = keyInput ? keyInput.value.trim() : '';
  window.aiAssistant.sarvamApiKey = key;
  if (modelSelect) window.aiAssistant.sarvamModel = modelSelect.value;
  if (modeSelect) window.aiAssistant.sarvamMode = modeSelect.value;

  localStorage.setItem('sanjeevani_sarvam_api_key', key);
  closeSarvamSettingsModal();
  showToast('✓ Sarvam AI Speech settings saved successfully');
}

/* ==========================================================================
   Audio Text-to-Speech (🔊 Listen Playback)
   ========================================================================== */
function triggerSpeakMessage(msgId, text) {
  const btn = document.getElementById(`btn-listen-${msgId}`);
  window.aiAssistant.speakText(text, msgId, (isSpeaking) => {
    if (btn) {
      if (isSpeaking) {
        btn.classList.add('speaking');
        btn.innerHTML = '<span>⏸ Pause</span>';
      } else {
        btn.classList.remove('speaking');
        btn.innerHTML = '<span>🔊 Listen</span>';
      }
    }
  });
}

function copyMessageText(text) {
  navigator.clipboard.writeText(text);
  showToast('✓ Message copied to clipboard');
}

function toggleAttachmentMenu() {
  const popup = document.getElementById('wa-attachment-popup');
  if (!popup) return;
  popup.style.display = popup.style.display === 'flex' ? 'none' : 'flex';
}

function handleAttachmentOption(type) {
  toggleAttachmentMenu();
  showToast(`✓ Attached: ${type}. OCR extracting clinical metadata...`);
  setTimeout(() => {
    sendUserChatMessage(`[Uploaded ${type}]: Comprehensive Metabolic Panel (Fasting Sugar: 142 mg/dL)`);
  }, 1000);
}

function handleQuickChipClick(chipText) {
  sendUserChatMessage(chipText);
}

async function sendUserChatMessage(customText = null, speakAloud = false) {
  const inputEl = document.getElementById('wa-main-chat-input');
  const text = customText || (inputEl ? inputEl.value : '');
  if (!text.trim()) return;

  console.log("2 CHAT MESSAGE:", text.trim());

  if (inputEl && !customText) inputEl.value = '';
  renderChatFeedMessages();

  const thinkingBox = document.getElementById('wa-thinking-indicator');
  if (thinkingBox) thinkingBox.style.display = 'flex';

  const aiResponse = await window.aiAssistant.processQuery(
    text.trim(),
    window.appState.userProfile,
    window.appState.schemes,
    (stepText) => {
      const stepEl = document.getElementById('wa-thinking-step-text');
      if (stepEl) stepEl.textContent = stepText;
    }
  );

  console.log("3 API RESPONSE:", aiResponse);
  console.log("4 ANSWER:", aiResponse ? aiResponse.text : '');

  if (thinkingBox) thinkingBox.style.display = 'none';
  renderChatSidebarThreads();
  renderChatFeedMessages();

  if (speakAloud && aiResponse && aiResponse.text) {
    triggerSpeakMessage(aiResponse.id, aiResponse.text);
  }
}

/* ==========================================================================
   Dynamic Scheme Re-Matching Engine
   ========================================================================== */
function recalculateMatchScores() {
  const p = window.appState.userProfile;

  window.appState.schemes.forEach(scheme => {
    let score = 50;

    if (p.familyIncome <= 250000) score += 25;
    else if (p.familyIncome <= 500000) score += 15;
    else if (scheme.id === 'pmjay-vav' || scheme.id === 'pmbjp') score += 30;

    if (scheme.state === 'All India' || scheme.state.toLowerCase() === p.state.toLowerCase()) score += 15;
    if (p.chronicConditions.some(c => c.toLowerCase().includes('diabetes') || c.toLowerCase().includes('hypertension'))) score += 10;
    if (p.seniorCitizenInFamily && scheme.id === 'pmjay-vav') score += 20;

    scheme.matchScore = Math.min(99, Math.max(40, score));
  });

  window.appState.schemes.sort((a, b) => b.matchScore - a.matchScore);
}

function setDiscoveryStep(step) {
  window.appState.discoveryStep = step;
  const s1 = document.getElementById('discovery-step-1');
  const s2 = document.getElementById('discovery-step-2');
  const s3 = document.getElementById('discovery-step-3');
  const s4 = document.getElementById('discovery-step-4');

  if (s1) s1.style.display = step === 1 ? 'block' : 'none';
  if (s2) s2.style.display = step === 2 ? 'block' : 'none';
  if (s3) s3.style.display = step === 3 ? 'block' : 'none';
  if (s4) s4.style.display = step === 4 ? 'block' : 'none';

  if (step === 3) {
    setTimeout(() => {
      setDiscoveryStep(4);
      renderSchemesGrid();
    }, 1200);
  }
}

function renderSchemesGrid() {
  const container = document.getElementById('schemes-grid-container');
  if (!container) return;

  container.innerHTML = window.appState.schemes.map(s => `
    <div class="scheme-card">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <h3 style="font-size: 17px; font-weight: 800;">${s.name}</h3>
          <span class="match-pill">${s.matchScore}% Match</span>
        </div>
        <div style="display: flex; gap: 6px; margin-bottom: 10px;">
          <span class="badge badge-${s.statusType}">${s.status}</span>
          <span class="badge badge-active">${s.eligibilityTag}</span>
        </div>
        <div style="background: var(--primary-50); padding: 8px 12px; border-radius: 6px; font-size: 13px; font-weight: 800; color: var(--primary-900);">
          ${s.benefits[0]}
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
        <span style="font-size: 11px; color: var(--text-muted);">Source: ${s.officialSource}</span>
        <button class="btn btn-primary btn-sm" onclick="openSchemeModal('${s.id}')">View Details →</button>
      </div>
    </div>
  `).join('');
}

function openSchemeModal(schemeId) {
  const scheme = window.appState.schemes.find(s => s.id === schemeId);
  if (!scheme) return;

  const modal = document.getElementById('scheme-details-modal');
  const body = document.getElementById('scheme-modal-body');

  body.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
      <div>
        <span class="badge badge-${scheme.statusType}">${scheme.status}</span>
        <h2 style="font-size: 20px; font-weight: 800; margin-top: 4px;">${scheme.name}</h2>
      </div>
      <span class="match-pill">${scheme.matchScore}% Match</span>
    </div>

    <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
      ${scheme.fullDescription}
    </p>

    <h4 style="font-size: 14px; font-weight: 800; margin-bottom: 8px;">Benefits:</h4>
    <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px;">
      ${scheme.benefits.map(b => `<div style="font-size: 12.5px; background: #f0fdf4; padding: 6px 10px; border-radius: 6px;">✓ ${b}</div>`).join('')}
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
      <span style="font-size: 11px; color: var(--text-muted);">Source: ${scheme.officialSource}</span>
      <a href="${scheme.officialUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">Official Portal ↗</a>
    </div>
  `;

  modal.classList.add('active');
}

function closeSchemeModal() {
  const modal = document.getElementById('scheme-details-modal');
  if (modal) modal.classList.remove('active');
}

function renderMedicalRecords() {
  const container = document.getElementById('records-grid-container');
  if (!container) return;

  container.innerHTML = window.appState.medicalRecords.map(r => `
    <div style="background: white; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 18px;">
      <span class="badge" style="background: #f1f5f9; color: var(--text-secondary);">${r.category}</span>
      <h4 style="font-size: 15px; font-weight: 800; margin: 6px 0;">${r.title}</h4>
      <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 8px;">${r.summary}</p>
      <div style="font-size: 11px; color: var(--text-muted);">${r.date} • ${r.facility}</div>
    </div>
  `).join('');
}

function renderDoctorsAndConsents() {
  const docContainer = document.getElementById('doctors-grid-container');
  if (docContainer) {
    docContainer.innerHTML = window.appState.doctors.map(d => `
      <div style="background: white; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 18px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
        <div>
          <h4 style="font-size: 15px; font-weight: 800;">${d.name}</h4>
          <div style="font-size: 12px; color: var(--primary-700); font-weight: 600;">${d.specialty}</div>
          <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">${d.hospital}</div>
        </div>
        <button class="btn btn-teal btn-sm" onclick="openDoctorConsentModal('${d.id}')">Share Records With Consent</button>
      </div>
    `).join('');
  }
}

function renderDocumentsGrid() {
  const container = document.getElementById('documents-grid-container');
  if (!container) return;

  container.innerHTML = window.appState.documents.map(d => `
    <div style="background: white; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 16px;">
      <h4 style="font-size: 14px; font-weight: 800;">${d.name}</h4>
      <div style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 6px;">${d.type}</div>
      <span class="badge badge-active">${d.status}</span>
    </div>
  `).join('');
}

function renderApplicationsList() {
  const container = document.getElementById('applications-list-container');
  if (!container) return;

  container.innerHTML = window.appState.applications.map(a => `
    <div style="background: white; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 18px; margin-bottom: 12px;">
      <span style="font-size: 11px; font-weight: 700; color: var(--teal-700);">${a.referenceNo}</span>
      <h4 style="font-size: 16px; font-weight: 800;">${a.schemeName}</h4>
      <div style="font-size: 12px; color: var(--text-muted);">Status: ${a.statusLabel}</div>
    </div>
  `).join('');
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function setupEventListeners() {
  const chatInput = document.getElementById('wa-main-chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendUserChatMessage();
    });
  }
}
