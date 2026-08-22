/**
 * Sanjeevani — Application Logic & Controller
 * Orchestrates navigation, reactive filtering, profile re-matching, OCR simulation,
 * application tracking, multilingual support, and admin workflows.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize State
  window.appState = {
    currentScreen: 'home',
    currentLanguage: 'en',
    activeTab: 'for-you',
    searchQuery: '',
    filterState: 'all',
    filterIncome: 'all',
    filterCondition: 'all',
    filterGovLevel: 'all',
    filterStatus: 'all',
    sortBy: 'match',
    userProfile: { ...SANJEEVANI_DATA.currentUser },
    schemes: [...SANJEEVANI_DATA.schemes],
    documents: [...SANJEEVANI_DATA.userDocuments],
    applications: [...SANJEEVANI_DATA.applications],
    intelligence: [...SANJEEVANI_DATA.intelligenceUpdates],
    adminRecords: [...SANJEEVANI_DATA.adminSchemeRecords],
    selectedSchemeForModal: null,
    isMobileSimulator: false
  };

  // Initialize AI Assistant
  window.aiAssistant = new SanjeevaniAIAssistant();

  // Initial Boot
  recalculateMatchScores();
  renderSummaryMetrics();
  renderSchemesGrid();
  renderIntelligenceTimeline();
  renderDocumentsGrid();
  renderApplicationsList();
  renderAdminTable();
  setupEventListeners();
  populateProfileForm();
});

/* ==========================================================================
   Navigation & Screen Controller
   ========================================================================== */
function switchScreen(screenId) {
  window.appState.currentScreen = screenId;

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.screen === screenId);
  });

  // Update mobile bottom nav
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.screen === screenId);
  });

  // Update view screen containers
  document.querySelectorAll('.view-screen').forEach(screen => {
    screen.classList.toggle('active-screen', screen.id === `screen-${screenId}`);
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // If entering AI screen, render chat history
  if (screenId === 'ai') {
    renderAIChatMessages();
  }
}

/* ==========================================================================
   Dynamic Profile Re-Matching Engine
   ========================================================================== */
function recalculateMatchScores() {
  const profile = window.appState.userProfile;

  window.appState.schemes.forEach(scheme => {
    let score = 50;

    // Income match
    if (profile.familyIncome <= 250000) {
      score += 25;
    } else if (profile.familyIncome <= 500000) {
      score += 15;
    } else {
      if (scheme.id === 'pmjay-vav' || scheme.id === 'pmbjp') score += 30; // Universal schemes
      else score -= 10;
    }

    // State match
    if (scheme.state === 'All India' || scheme.state.toLowerCase() === profile.state.toLowerCase()) {
      score += 15;
    } else {
      score -= 20;
    }

    // Condition match
    if (profile.healthConditions.some(c => c.toLowerCase().includes('cardiac') || c.toLowerCase().includes('hypertension'))) {
      if (scheme.id === 'pmjay' || scheme.id === 'sarbat-sehat' || scheme.id === 'pmbjp') score += 10;
    }

    // Senior citizen match
    if (profile.seniorCitizenInFamily && scheme.id === 'pmjay-vav') {
      score += 20;
    }

    scheme.matchScore = Math.min(99, Math.max(35, score));
  });

  // Sort by match score
  window.appState.schemes.sort((a, b) => b.matchScore - a.matchScore);
}

/* ==========================================================================
   Rendering: Summary Metrics Bar
   ========================================================================== */
function renderSummaryMetrics() {
  const total = window.appState.schemes.length;
  const highlyRelevant = window.appState.schemes.filter(s => s.matchScore >= 85).length;
  const updated = window.appState.schemes.filter(s => s.statusType === 'updated').length;
  const newSchemes = window.appState.schemes.filter(s => s.statusType === 'new').length;

  const countTotalEl = document.getElementById('count-total-schemes');
  const countHighEl = document.getElementById('count-high-match');
  const countUpdatedEl = document.getElementById('count-updated-schemes');
  const countNewEl = document.getElementById('count-new-schemes');

  if (countTotalEl) countTotalEl.textContent = total;
  if (countHighEl) countHighEl.textContent = highlyRelevant;
  if (countUpdatedEl) countUpdatedEl.textContent = updated;
  if (countNewEl) countNewEl.textContent = newSchemes;
}

/* ==========================================================================
   Rendering: Scheme Discovery Dashboard (Screen 3 & 4)
   ========================================================================== */
function renderSchemesGrid() {
  const container = document.getElementById('schemes-grid-container');
  if (!container) return;

  const { schemes, activeTab, searchQuery, filterState, filterCondition, filterGovLevel, filterStatus, sortBy } = window.appState;

  // Filter pipeline
  let filtered = schemes.filter(scheme => {
    // Tab Filter
    if (activeTab === 'active' && scheme.statusType !== 'active') return false;
    if (activeTab === 'new' && scheme.statusType !== 'new') return false;
    if (activeTab === 'updated' && scheme.statusType !== 'updated') return false;
    if (activeTab === 'for-you' && scheme.matchScore < 60) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = scheme.name.toLowerCase().includes(q) || (scheme.hindiName && scheme.hindiName.includes(q));
      const matchSummary = scheme.shortSummary.toLowerCase().includes(q);
      const matchCat = scheme.category.toLowerCase().includes(q);
      if (!matchName && !matchSummary && !matchCat) return false;
    }

    // State filter
    if (filterState !== 'all') {
      if (scheme.state !== 'All India' && scheme.state.toLowerCase() !== filterState.toLowerCase()) return false;
    }

    // Gov Level
    if (filterGovLevel !== 'all') {
      if (!scheme.governmentLevel.toLowerCase().includes(filterGovLevel.toLowerCase())) return false;
    }

    // Status
    if (filterStatus !== 'all') {
      if (scheme.statusType !== filterStatus) return false;
    }

    return true;
  });

  // Sorting
  if (sortBy === 'match') {
    filtered.sort((a, b) => b.matchScore - a.matchScore);
  } else if (sortBy === 'updated') {
    filtered.sort((a, b) => (b.statusType === 'updated' ? 1 : 0) - (a.statusType === 'updated' ? 1 : 0));
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Update counter in active tab
  const tabCountEl = document.getElementById(`tab-count-${activeTab}`);
  if (tabCountEl) tabCountEl.textContent = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: white; border-radius: 16px; border: 1px dashed var(--border-medium);">
        <div style="font-size: 36px; margin-bottom: 12px;">🔍</div>
        <h3 style="font-size: 18px; margin-bottom: 8px;">No schemes matched your exact filters</h3>
        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 16px;">Try clearing some filters or searching for terms like "Ayushman", "Dialysis", or "Punjab".</p>
        <button class="btn btn-secondary btn-sm" onclick="resetAllFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(scheme => `
    <div class="scheme-card">
      <div>
        <div class="scheme-card-top">
          <div class="scheme-header-meta">
            <h3 class="scheme-title">${scheme.name}</h3>
            ${scheme.hindiName ? `<div class="scheme-regional-title">${scheme.hindiName}</div>` : ''}
          </div>
          <span class="match-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            ${scheme.matchScore}% Match
          </span>
        </div>

        <div class="scheme-tags-row">
          <span class="badge badge-${scheme.statusType}">
            <span class="badge-dot"></span>
            ${scheme.status}
          </span>
          <span class="badge" style="background: #f1f5f9; color: var(--text-secondary); border: 1px solid var(--border-subtle);">
            ${scheme.governmentLevel}
          </span>
          <span class="badge" style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;">
            ${scheme.schemeType}
          </span>
        </div>

        <div class="scheme-why-box">
          <div class="why-heading">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            Why Recommended For You:
          </div>
          <ul class="why-list">
            ${scheme.whyMatch.slice(0, 2).map(point => `
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                ${point}
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="scheme-benefits-strip">
          <div>
            <div class="benefit-highlight-text">${scheme.benefits[0]}</div>
            <div class="benefit-sub-label">Covered at 28,000+ Empaneled Hospitals</div>
          </div>
        </div>

        <div class="scheme-docs-preview">
          <span style="font-weight: 700;">Required Docs:</span>
          ${scheme.requiredDocuments.map(doc => `<span class="doc-chip">${doc.name}</span>`).join('')}
        </div>
      </div>

      <div class="scheme-card-footer">
        <div class="source-stamp">
          <strong>${scheme.officialSource}</strong>
          <span>Verified: ${scheme.lastVerifiedDate}</span>
        </div>
        <div class="card-actions-group">
          <button class="btn btn-secondary btn-sm" onclick="openSchemeModal('${scheme.id}')">
            View Details →
          </button>
          <button class="btn btn-primary btn-sm" onclick="startAssistedVerification('${scheme.id}')">
            Verify
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   SCREEN 5 — Scheme Details Modal
   ========================================================================== */
function openSchemeModal(schemeId) {
  const scheme = window.appState.schemes.find(s => s.id === schemeId);
  if (!scheme) return;

  window.appState.selectedSchemeForModal = scheme;
  const modal = document.getElementById('scheme-details-modal');
  const body = document.getElementById('scheme-modal-body');

  body.innerHTML = `
    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 16px;">
      <div>
        <span class="badge badge-${scheme.statusType}" style="margin-bottom: 8px;">
          <span class="badge-dot"></span>
          ${scheme.status}
        </span>
        <h2 style="font-size: 24px; font-weight: 800; color: var(--text-main);">${scheme.name}</h2>
        ${scheme.hindiName ? `<div style="font-size: 14px; color: var(--text-muted);">${scheme.hindiName}</div>` : ''}
      </div>
      <div class="match-pill" style="font-size: 14px; padding: 6px 14px;">
        ${scheme.matchScore}% Match Score
      </div>
    </div>

    <div style="background: var(--bg-surface-subtle); border-radius: var(--radius-md); padding: 14px; margin-bottom: 20px; font-size: 14px; line-height: 1.6;">
      <strong>Overview: </strong> ${scheme.fullDescription}
    </div>

    <h4 style="font-size: 16px; font-weight: 800; margin-bottom: 8px; color: var(--primary-900);">Why Sanjeevani Recommended This:</h4>
    <div class="match-matrix-grid">
      <div class="matrix-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        <span><strong>Location:</strong> ${scheme.state} Network Eligible</span>
      </div>
      <div class="matrix-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        <span><strong>Income:</strong> ≤ ₹2.5L Household Tier</span>
      </div>
      <div class="matrix-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        <span><strong>Clinical Need:</strong> Cashless Hospitalization</span>
      </div>
      <div class="matrix-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        <span><strong>Beneficiary:</strong> NFSA / Ration Card Match</span>
      </div>
    </div>

    <h4 style="font-size: 16px; font-weight: 800; margin: 20px 0 10px; color: var(--text-main);">Key Scheme Benefits:</h4>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
      ${scheme.benefits.map(b => `
        <div style="display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; background: #f0fdf4; padding: 8px 12px; border-radius: 8px; border: 1px solid #d1fae5;">
          <span style="color: var(--primary-700); font-weight: 800;">✓</span>
          <span>${b}</span>
        </div>
      `).join('')}
    </div>

    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: #92400e; margin-bottom: 4px; font-size: 13px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Official Verification Notice
      </div>
      <p style="font-size: 12.5px; color: #78350f; line-height: 1.5;">
        Your profile appears to match available criteria (Potentially Eligible), but final eligibility must be verified through the official government portal or registered kiosk.
      </p>
    </div>

    <h4 style="font-size: 16px; font-weight: 800; margin-bottom: 10px; color: var(--text-main);">Required Documents Checklist:</h4>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 24px;">
      ${scheme.requiredDocuments.map(d => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: white; border: 1px solid var(--border-subtle); border-radius: 8px; font-size: 13px;">
          <span>${d.name}</span>
          <span class="badge ${d.status === 'Available' ? 'badge-active' : 'badge-warning'}">${d.status}</span>
        </div>
      `).join('')}
    </div>

    <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid var(--border-subtle); gap: 14px; flex-wrap: wrap;">
      <div>
        <div style="font-size: 12px; font-weight: 700; color: var(--text-main);">Source: ${scheme.officialSource}</div>
        <div style="font-size: 11px; color: var(--text-muted);">Last Verified: ${scheme.lastVerifiedDate} | Helpline: ${scheme.helpline}</div>
      </div>
      <div style="display: flex; gap: 10px;">
        <a href="${scheme.officialUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">
          Visit Official Portal ↗
        </a>
        <button class="btn btn-primary btn-sm" onclick="trackNewApplication('${scheme.id}')">
          Apply via Sanjeevani Track
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeSchemeModal() {
  const modal = document.getElementById('scheme-details-modal');
  if (modal) modal.classList.remove('active');
}

/* ==========================================================================
   SCREEN 6 — Scheme Intelligence & Timeline Feed
   ========================================================================== */
function renderIntelligenceTimeline(filterType = 'all') {
  const container = document.getElementById('timeline-feed-container');
  if (!container) return;

  let updates = window.appState.intelligence;
  if (filterType !== 'all') {
    updates = updates.filter(u => u.type === filterType);
  }

  container.innerHTML = updates.map(item => `
    <div class="timeline-card">
      <div class="timeline-dot">
        ${item.type === 'new' ? '🆕' : item.type === 'warning' ? '⚠️' : '🟢'}
      </div>
      <div class="timeline-header">
        <span class="badge badge-${item.type}">
          <span class="badge-dot"></span>
          ${item.status}
        </span>
        <span class="timeline-date">${item.date}</span>
      </div>
      <h3 class="timeline-headline">${item.headline}</h3>
      <div style="font-size: 13px; font-weight: 700; color: var(--primary-800); margin-bottom: 6px;">
        Scheme: ${item.scheme}
      </div>
      <p class="timeline-body">${item.summary}</p>
      <div class="timeline-impact-banner">
        <strong>Impact on Citizens:</strong> ${item.impact}
      </div>
      <div class="timeline-footer">
        <span>Source: <strong>${item.source}</strong></span>
        <a href="${item.sourceUrl}" target="_blank" rel="noopener" style="font-weight: 700;">View Official Gazette ↗</a>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   SCREEN 7 — Health Profile Controller
   ========================================================================== */
function populateProfileForm() {
  const profile = window.appState.userProfile;
  const nameEl = document.getElementById('profile-name');
  const ageEl = document.getElementById('profile-age');
  const stateEl = document.getElementById('profile-state');
  const districtEl = document.getElementById('profile-district');
  const incomeSlider = document.getElementById('income-slider');
  const incomeDisplay = document.getElementById('income-display-val');

  if (nameEl) nameEl.value = profile.name;
  if (ageEl) ageEl.value = profile.age;
  if (stateEl) stateEl.value = profile.state;
  if (districtEl) districtEl.value = profile.district;
  if (incomeSlider) incomeSlider.value = profile.familyIncome;
  if (incomeDisplay) incomeDisplay.textContent = `₹${(profile.familyIncome / 100000).toFixed(1)} Lakh / Year`;
}

function handleProfileUpdate() {
  const nameEl = document.getElementById('profile-name');
  const ageEl = document.getElementById('profile-age');
  const stateEl = document.getElementById('profile-state');
  const districtEl = document.getElementById('profile-district');
  const incomeSlider = document.getElementById('income-slider');

  if (nameEl) window.appState.userProfile.name = nameEl.value;
  if (ageEl) window.appState.userProfile.age = parseInt(ageEl.value, 10) || 38;
  if (stateEl) window.appState.userProfile.state = stateEl.value;
  if (districtEl) window.appState.userProfile.district = districtEl.value;
  if (incomeSlider) window.appState.userProfile.familyIncome = parseInt(incomeSlider.value, 10);

  // Recalculate match scores
  recalculateMatchScores();
  renderSummaryMetrics();
  renderSchemesGrid();

  // Update dynamic score card in profile screen
  const topMatch = window.appState.schemes[0];
  const scoreNumEl = document.getElementById('profile-top-score');
  const scoreSchemeEl = document.getElementById('profile-top-scheme');
  if (scoreNumEl) scoreNumEl.textContent = `${topMatch.matchScore}%`;
  if (scoreSchemeEl) scoreSchemeEl.textContent = topMatch.name;

  showToast('✓ Profile updated & scheme matches refreshed!');
}

/* ==========================================================================
   SCREEN 8 — Document Center & OCR Simulation
   ========================================================================== */
function renderDocumentsGrid() {
  const container = document.getElementById('documents-grid-container');
  if (!container) return;

  container.innerHTML = window.appState.documents.map(doc => `
    <div class="doc-card">
      <div>
        <div class="doc-card-top">
          <div class="doc-icon-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <span class="badge ${doc.status === 'Verified' ? 'badge-active' : 'badge-warning'}">
            ${doc.status}
          </span>
        </div>
        <div style="margin: 12px 0 6px;">
          <h4 class="doc-name">${doc.name}</h4>
          <span class="doc-type-lbl">${doc.type} • ${doc.fileSize}</span>
        </div>
        <div class="doc-data-snippet">
          ${Object.entries(doc.extractedData).slice(0, 3).map(([key, val]) => `
            <div><strong>${key}:</strong> ${val}</div>
          `).join('')}
        </div>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
        <span style="font-size: 11px; color: var(--text-muted);">Uploaded: ${doc.uploadedDate}</span>
        <button class="btn btn-secondary btn-sm" onclick="showToast('Viewing verified document preview...')">
          View
        </button>
      </div>
    </div>
  `).join('');
}

function simulateDocumentOCR() {
  const modal = document.getElementById('ocr-scan-modal');
  modal.classList.add('active');

  const scanText = document.getElementById('ocr-scan-status-text');
  const scanProgress = document.getElementById('ocr-scan-progress');

  const steps = [
    "Uploading document to encrypted vault...",
    "Extracting metadata via intelligent OCR scanner...",
    "Cross-referencing Aadhaar / Income certificate fields...",
    "Updating Sanjeevani health profile..."
  ];

  let step = 0;
  const interval = setInterval(() => {
    if (step < steps.length) {
      if (scanText) scanText.textContent = steps[step];
      if (scanProgress) scanProgress.style.width = `${(step + 1) * 25}%`;
      step++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        modal.classList.remove('active');
        showToast('✓ OCR successfully verified new document & updated profile!');
      }, 500);
    }
  }, 500);
}

/* ==========================================================================
   SCREEN 9 — Application Tracker
   ========================================================================== */
function renderApplicationsList() {
  const container = document.getElementById('applications-list-container');
  if (!container) return;

  container.innerHTML = window.appState.applications.map(app => `
    <div class="application-card">
      <div class="app-card-header">
        <div>
          <span class="app-ref-no">${app.referenceNo}</span>
          <h3 class="app-title" style="margin-top: 6px;">${app.schemeName}</h3>
        </div>
        <span class="badge badge-warning">
          <span class="badge-dot"></span>
          ${app.statusLabel}
        </span>
      </div>

      <div class="step-tracker-pipeline">
        ${app.steps.map((step, idx) => `
          <div class="pipeline-step ${step.completed ? 'completed' : step.inProgress ? 'current' : ''}">
            <div class="step-bubble">
              ${step.completed ? '✓' : idx + 1}
            </div>
            <div class="step-label">${step.label}</div>
          </div>
        `).join('')}
      </div>

      <div style="background: var(--bg-surface-subtle); border-radius: var(--radius-md); padding: 14px; font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
        <strong>Official Remark:</strong> ${app.notes}
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; color: var(--text-muted);">
        <span>Assigned: <strong>${app.assignedCenter}</strong></span>
        <span>Est. Card Ready: <strong>${app.estimatedResolution}</strong></span>
      </div>
    </div>
  `).join('');
}

function trackNewApplication(schemeId) {
  const scheme = window.appState.schemes.find(s => s.id === schemeId);
  if (!scheme) return;

  const newApp = {
    id: 'app-' + Date.now(),
    referenceNo: `SNJ-2026-PB-${Math.floor(1000 + Math.random() * 9000)}`,
    schemeName: scheme.name,
    appliedDate: 'Today',
    currentStage: 'Eligibility Check',
    stageIndex: 1,
    totalStages: 5,
    statusLabel: 'Verification In Progress',
    statusColor: 'blue',
    estimatedResolution: 'Within 7 Working Days',
    notes: 'Application initialized via Sanjeevani smart eligibility match. E-KYC scheduled.',
    assignedCenter: 'District Health Agency / Seva Kendra',
    steps: [
      { label: 'Profile Submitted', completed: true, date: 'Just now' },
      { label: 'Eligibility Check', completed: false, inProgress: true, date: 'Under automated check' },
      { label: 'Documents Submitted', completed: false, inProgress: false, date: 'Pending' },
      { label: 'Gov Verification', completed: false, inProgress: false, date: 'Pending' },
      { label: 'Approved', completed: false, inProgress: false, date: 'Pending' }
    ]
  };

  window.appState.applications.unshift(newApp);
  renderApplicationsList();
  closeSchemeModal();
  switchScreen('applications');
  showToast(`✓ Assisted application created for ${scheme.name}!`);
}

function startAssistedVerification(schemeId) {
  openSchemeModal(schemeId);
}

/* ==========================================================================
   SCREEN 2 — Conversational AI Assistant
   ========================================================================== */
function renderAIChatMessages() {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  container.innerHTML = window.aiAssistant.messages.map(msg => {
    if (msg.sender === 'user') {
      return `
        <div class="chat-bubble-wrap user-msg">
          <div class="chat-avatar user-av">A</div>
          <div class="chat-bubble-content">
            <div class="bubble-text">${msg.text}</div>
            <div style="font-size: 11px; color: var(--text-muted); align-self: flex-end;">${msg.timestamp}</div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="chat-bubble-wrap ai-msg">
          <div class="chat-avatar ai-av">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
          </div>
          <div class="chat-bubble-content" style="width: 100%;">
            <div class="bubble-text">${msg.text}</div>
            
            ${msg.reasoningPoints ? `
              <div class="ai-reasoning-card">
                <div class="ai-reasoning-title">Intelligent Match Analysis:</div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  ${msg.reasoningPoints.map(p => `<div style="font-size: 13px; color: var(--text-secondary);">${p}</div>`).join('')}
                </div>
              </div>
            ` : ''}

            ${msg.matchedSchemes && msg.matchedSchemes.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
                ${msg.matchedSchemes.map(sch => `
                  <div class="ai-matched-scheme-card">
                    <div>
                      <div class="ai-scheme-name">${sch.name}</div>
                      <div class="ai-scheme-benefit">${sch.benefits[0]}</div>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="openSchemeModal('${sch.id}')">
                      View →
                    </button>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${msg.chips ? `
              <div class="quick-chips-row" style="padding: 6px 0 0;">
                ${msg.chips.map(c => `
                  <button class="suggestion-chip" onclick="handleChipClick('${c}')">${c}</button>
                `).join('')}
              </div>
            ` : ''}

            <div style="font-size: 11px; color: var(--text-muted);">${msg.timestamp}</div>
          </div>
        </div>
      `;
    }
  }).join('');

  container.scrollTop = container.scrollHeight;
}

async function handleSendMessage() {
  const inputEl = document.getElementById('chat-user-input');
  if (!inputEl) return;
  const text = inputEl.value;
  if (!text.trim()) return;

  inputEl.value = '';
  renderAIChatMessages();

  const progressBox = document.getElementById('ai-progress-indicator');
  const progressText = document.getElementById('progress-step-text');
  const progressFill = document.getElementById('progress-bar-fill');

  if (progressBox) progressBox.style.display = 'flex';

  await window.aiAssistant.processQuery(
    text,
    window.appState.userProfile,
    window.appState.schemes,
    (stepText, percent) => {
      if (progressText) progressText.textContent = stepText;
      if (progressFill) progressFill.style.width = `${percent}%`;
    }
  );

  if (progressBox) progressBox.style.display = 'none';
  renderAIChatMessages();
}

function handleChipClick(chipText) {
  const inputEl = document.getElementById('chat-user-input');
  if (inputEl) {
    inputEl.value = chipText;
    handleSendMessage();
  }
}

/* ==========================================================================
   SCREEN 12 — Admin Knowledge Base
   ========================================================================== */
function renderAdminTable() {
  const tbody = document.getElementById('admin-schemes-tbody');
  if (!tbody) return;

  tbody.innerHTML = window.appState.adminRecords.map(rec => `
    <tr>
      <td><strong>${rec.name}</strong></td>
      <td>${rec.level}</td>
      <td>${rec.state}</td>
      <td><span class="badge badge-active">${rec.status}</span></td>
      <td>${rec.eligibility}</td>
      <td>${rec.benefit}</td>
      <td>${rec.lastUpdated}</td>
      <td>${rec.officialSource}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="showToast('Source verified from official gazette!')">
          Verify Source
        </button>
      </td>
    </tr>
  `).join('');
}

function triggerSourceVerificationWorkflow() {
  const modal = document.getElementById('admin-workflow-modal');
  if (modal) modal.classList.add('active');
}

function closeAdminWorkflowModal() {
  const modal = document.getElementById('admin-workflow-modal');
  if (modal) modal.classList.remove('active');
}

function publishAdminVerifiedScheme() {
  closeAdminWorkflowModal();
  showToast('✓ Scheme update published & live in Sanjeevani registry!');
}

/* ==========================================================================
   Multilingual Controller (Screen 10)
   ========================================================================== */
function handleLanguageChange(langCode) {
  window.appState.currentLanguage = langCode;
  const dict = TRANSLATIONS[langCode] || TRANSLATIONS.en;

  // Update App Texts
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Update Search Placeholder
  const searchInput = document.getElementById('main-scheme-search');
  if (searchInput && dict.searchPlaceholder) {
    searchInput.placeholder = dict.searchPlaceholder;
  }

  showToast(`Language set to ${langCode.toUpperCase()}`);
}

/* ==========================================================================
   Simulator Mode Toggle (Screen 11)
   ========================================================================== */
function toggleMobileSimulator() {
  const btn = document.getElementById('simulator-toggle-btn');
  const appContainer = document.getElementById('app-root-container');

  window.appState.isMobileSimulator = !window.appState.isMobileSimulator;

  if (window.appState.isMobileSimulator) {
    document.body.classList.add('simulator-active-body');
    appContainer.classList.add('simulator-frame');
    if (btn) btn.classList.add('active');
    showToast('📱 Mobile View Simulator Activated (390px Viewport)');
  } else {
    document.body.classList.remove('simulator-active-body');
    appContainer.classList.remove('simulator-frame');
    if (btn) btn.classList.remove('active');
    showToast('💻 Desktop Viewport Restored');
  }
}

/* ==========================================================================
   Toast Notification Helper
   ========================================================================== */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function resetAllFilters() {
  window.appState.searchQuery = '';
  window.appState.filterState = 'all';
  window.appState.filterCondition = 'all';
  window.appState.filterGovLevel = 'all';
  window.appState.filterStatus = 'all';
  window.appState.activeTab = 'for-you';
  window.appState.sortBy = 'match';

  const searchInput = document.getElementById('main-scheme-search');
  const stateSelect = document.getElementById('filter-state');
  const levelSelect = document.getElementById('filter-gov-level');
  const sortSelect = document.getElementById('sort-schemes-by');

  if (searchInput) searchInput.value = '';
  if (stateSelect) stateSelect.value = 'all';
  if (levelSelect) levelSelect.value = 'all';
  if (sortSelect) sortSelect.value = 'match';

  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === 'for-you');
  });

  renderSchemesGrid();
}

/* ==========================================================================
   Event Listeners Setup
   ========================================================================== */
function setupEventListeners() {
  // Navigation Links
  document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.screen;
      if (target) switchScreen(target);
    });
  });

  // Language Selector
  const langSelect = document.getElementById('lang-selector-select');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      handleLanguageChange(e.target.value);
    });
  }

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.appState.activeTab = btn.dataset.tab;
      renderSchemesGrid();
    });
  });

  // Search Field with debounce
  const searchInput = document.getElementById('main-scheme-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      window.appState.searchQuery = e.target.value;
      renderSchemesGrid();
    });
  }

  // Filters
  const stateSelect = document.getElementById('filter-state');
  if (stateSelect) {
    stateSelect.addEventListener('change', (e) => {
      window.appState.filterState = e.target.value;
      renderSchemesGrid();
    });
  }

  const levelSelect = document.getElementById('filter-gov-level');
  if (levelSelect) {
    levelSelect.addEventListener('change', (e) => {
      window.appState.filterGovLevel = e.target.value;
      renderSchemesGrid();
    });
  }

  const sortSelect = document.getElementById('sort-schemes-by');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      window.appState.sortBy = e.target.value;
      renderSchemesGrid();
    });
  }

  // Profile Form Inputs
  const incomeSlider = document.getElementById('income-slider');
  if (incomeSlider) {
    incomeSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      const display = document.getElementById('income-display-val');
      if (display) display.textContent = `₹${(val / 100000).toFixed(1)} Lakh / Year`;
      handleProfileUpdate();
    });
  }

  const stateInput = document.getElementById('profile-state');
  if (stateInput) {
    stateInput.addEventListener('change', handleProfileUpdate);
  }

  // AI Chat Input Keydown
  const chatInput = document.getElementById('chat-user-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleSendMessage();
      }
    });
  }
}
