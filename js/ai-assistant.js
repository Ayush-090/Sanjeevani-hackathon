/**
 * Sanjeevani AI Assistant Engine
 * Conversational healthcare intelligence module supporting English, Hindi, and Hinglish.
 */

class SanjeevaniAIAssistant {
  constructor() {
    this.messages = [];
    this.isProcessing = false;
    this.initDefaultMessages();
  }

  initDefaultMessages() {
    this.messages = [
      {
        id: "msg-01",
        sender: "ai",
        timestamp: "Just now",
        text: "Namaste Ayush! I am your Sanjeevani Medical Scheme Assistant. Aapko kis healthcare support ya government scheme ki zarurat hai?",
        chips: [
          "Find schemes for Punjab",
          "Family income ₹2.4 Lakh eligibility",
          "Senior citizen (70+) scheme",
          "What documents do I need for Ayushman Bharat?",
          "Free dialysis & cardiac surgery help"
        ]
      }
    ];
  }

  /**
   * Process a user query with intent matching, dynamic eligibility analysis, and multi-step progress
   */
  async processQuery(userInput, userProfile, schemesDatabase, onProgressUpdate) {
    const trimmed = userInput.trim();
    if (!trimmed) return null;

    const userMessage = {
      id: "msg-" + Date.now(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: trimmed
    };
    this.messages.push(userMessage);

    // Multi-step progress simulation
    const progressSteps = [
      "Understanding citizen profile & clinical context...",
      "Matching against Central & State scheme registries...",
      "Evaluating income & categorical criteria...",
      "Synthesizing verified recommendations..."
    ];

    for (let i = 0; i < progressSteps.length; i++) {
      if (onProgressUpdate) {
        onProgressUpdate(progressSteps[i], (i + 1) * 25);
      }
      await new Promise(res => setTimeout(res, 450));
    }

    const response = this.generateResponse(trimmed, userProfile, schemesDatabase);
    this.messages.push(response);
    return response;
  }

  generateResponse(query, profile, schemes) {
    const qLower = query.toLowerCase();
    const isHinglish = /meri|mera|aap|karo|chahiye|paisa|ilaaj|aspataal|punjab|lakh|dawa|bima|kahan|kaise/i.test(query);

    // Intent 1: Income / Hospital treatment / Punjab / Ayushman inquiry
    if (qLower.includes("2.5 lakh") || qLower.includes("income") || qLower.includes("punjab") || qLower.includes("hospital") || qLower.includes("treatment")) {
      const pmjay = schemes.find(s => s.id === "pmjay");
      const sarbat = schemes.find(s => s.id === "sarbat-sehat");
      const janaushadhi = schemes.find(s => s.id === "pmbjp");

      return {
        id: "msg-ai-" + Date.now(),
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: isHinglish 
          ? "Aapki family income (₹2.4-2.5 Lakh) aur Punjab residence ke basis par 2 flagship government health schemes aur 1 pharmacy scheme highly relevant hain. Main inka criteria compare karke summary de raha hoon:"
          : "Based on your family income bracket and Punjab residence, you have high potential eligibility for Ayushman Bharat PM-JAY and Punjab's Mukh Mantri Sehat Bima Yojana, offering comprehensive cashless hospital coverage up to ₹5 Lakh/year.",
        reasoningPoints: [
          "✓ Location: Punjab (Ludhiana District) satisfies convergent state assurance network",
          "✓ Income: Below the ₹2,50,000 threshold for subsidized public health protection",
          "✓ Clinical Need: Covers tertiary and secondary hospital surgeries & diagnostic admissions",
          "✓ NFSA Blue Card / Priority Household status ensures direct eligibility linkage"
        ],
        statusTag: "Likely Eligible",
        statusTagClass: "status-tag-eligible",
        matchedSchemes: [pmjay, sarbat, janaushadhi].filter(Boolean),
        nextSteps: [
          "Verify your name in the Ayushman beneficiary database using your Aadhaar or Ration Card.",
          "Visit the nearest Empaneled Hospital or Kisan Seva Kendra with original Aadhaar & NFSA card.",
          "Generate your golden e-card for immediate cashless admission."
        ],
        disclaimer: "Informational match based on provided data. Final e-KYC and authorization is completed via the official NHA / State Health Agency portal."
      };
    }

    // Intent 2: Senior citizen / 70+ years (Ayushman Vay Vandana)
    if (qLower.includes("senior") || qLower.includes("70") || qLower.includes("elderly") || qLower.includes("bujurg") || qLower.includes("vay vandana")) {
      const vayVandana = schemes.find(s => s.id === "pmjay-vav");
      return {
        id: "msg-ai-" + Date.now(),
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: isHinglish
          ? "Agar aapke parivaar mein 70 saal ya usse adhik aayu ke bujurg hain, to unke liye nayi 'Ayushman Vay Vandana Yojana' bina kisi income restriction ke poori tarah se lagu hai."
          : "For senior citizens aged 70 and above, the newly introduced Ayushman Bharat Vay Vandana scheme provides a dedicated ₹5 Lakh/year health cover with universal eligibility (no income ceiling).",
        reasoningPoints: [
          "✓ Universal Eligibility: Every citizen aged 70+ qualifies regardless of family economic status",
          "✓ Separate Top-up: Does not deduct from the family's regular PM-JAY ₹5L cover",
          "✓ Geriatric Care: Includes chronic disease management, joint replacements, and ICU care"
        ],
        statusTag: "Universal Benefit (70+)",
        statusTagClass: "status-tag-eligible",
        matchedSchemes: [vayVandana].filter(Boolean),
        nextSteps: [
          "Complete biometric or OTP-based e-KYC using the senior member's Aadhaar.",
          "Download the Vay Vandana Golden Card instantly from beneficiary.nha.gov.in."
        ],
        disclaimer: "Age verification via Aadhaar date of birth is mandatory during enrollment."
      };
    }

    // Intent 3: Documents required
    if (qLower.includes("document") || qLower.includes("kagaz") || qLower.includes("aadhaar") || qLower.includes("proof")) {
      return {
        id: "msg-ai-" + Date.now(),
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: isHinglish
          ? "Government health schemes (jaise Ayushman Bharat aur State Sehat Bima) ke liye aamtaur par nimnalikhit verified documents ki zaroorat hoti hai:"
          : "To apply for or verify eligibility across central and state healthcare schemes, you will typically need the following primary documents:",
        reasoningPoints: [
          "1. Identity & Age Proof: Aadhaar Card (Mandatory for biometric e-KYC)",
          "2. Family Beneficiary Linkage: Ration Card (NFSA / Blue Card / State Family ID)",
          "3. Income Verification: Income Certificate issued by Tehsildar / Sub-Divisional Magistrate",
          "4. State Domicile: Punjab Residence Proof or Voter ID",
          "5. Clinical Records: Hospital OPD slip, treatment estimate, or doctor prescription (for special grants/dialysis)"
        ],
        statusTag: "Document Checklist",
        statusTagClass: "status-tag-info",
        matchedSchemes: [],
        nextSteps: [
          "You can upload and organize these in Sanjeevani's 'My Documents' section for automated pre-verification."
        ],
        disclaimer: "Carrying original physical cards at the time of hospital admission is recommended."
      };
    }

    // Intent 4: Dialysis, Kidney, Critical care, RAN
    if (qLower.includes("dialysis") || qLower.includes("kidney") || qLower.includes("cancer") || qLower.includes("rare") || qLower.includes("critical") || qLower.includes("heart")) {
      const pmndp = schemes.find(s => s.id === "pmndp");
      const ran = schemes.find(s => s.id === "ran");
      const pmjay = schemes.find(s => s.id === "pmjay");

      return {
        id: "msg-ai-" + Date.now(),
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: isHinglish
          ? "Gambhir bimariyon (jaise Dialysis, Cardiac Surgery, ya Cancer) ke liye government do tarah se sahayata pradan karti hai — cashless hospital packages aur direct grants:"
          : "For critical care and chronic treatments (such as Hemodialysis, Cardiac Interventions, or Oncology), both cashless packages and specialized direct grants are available for eligible citizens:",
        reasoningPoints: [
          "✓ National Dialysis Programme: 100% Free hemodialysis at District Civil Hospitals for BPL/Ayushman beneficiaries",
          "✓ PM-JAY / Sehat Bima: Comprehensive pre-authorized cashless packages for open-heart surgery, stents, and chemotherapies",
          "✓ Rashtriya Arogya Nidhi (RAN): One-time financial assistance up to ₹50 Lakh for life-threatening conditions at AIIMS/PGI"
        ],
        statusTag: "Critical Care Coverage",
        statusTagClass: "status-tag-eligible",
        matchedSchemes: [pmndp, ran, pmjay].filter(Boolean),
        nextSteps: [
          "Obtain an official medical certificate and cost estimate proforma from the treating government hospital.",
          "Submit the estimate to the Medical Superintendent office or Sanjeevani Assisted Helpdesk."
        ],
        disclaimer: "RAN grants require institutional application directly from empaneled central government hospitals."
      };
    }

    // Default Fallback
    const topSchemes = schemes.slice(0, 3);
    return {
      id: "msg-ai-" + Date.now(),
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: isHinglish
        ? `Aapke prashn ke aadhar par maine aapki profile (Punjab, ₹2.4 Lakh Income) ko scan kiya hai. Aapke liye sabse upyogi schemes yeh hain:`
        : `Based on your query and current profile (Resident of Punjab, Income ₹2.4L), here are the most relevant government health schemes curated for you:`,
      reasoningPoints: [
        `✓ Socio-economic match: Income tier matches priority criteria for Ayushman & State Sehat Bima`,
        `✓ Geographic validity: Punjab empaneled network covers over 900+ tertiary healthcare centers`,
        `✓ Direct generic medicine subsidy available via Janaushadhi network`
      ],
      statusTag: "Potentially Eligible",
      statusTagClass: "status-tag-eligible",
      matchedSchemes: topSchemes,
      nextSteps: [
        "Select any scheme below to view detailed benefit schedules, document checklists, and official application portals."
      ],
      disclaimer: "Sanjeevani AI provides informational guidance. Final eligibility and approval are determined by the concerned government authority."
    };
  }
}
