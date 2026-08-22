/**
 * Sanjeevani — Unified Healthcare & Government Medical Scheme Intelligence Database
 * Integrates Core Sanjeevani (Patient Profile, Medical Records, Vitals, Doctors, Consent Management)
 * with Government Medical Scheme Intelligence (Central/State Registry, Eligibility, Intelligence Feed, Schema Entities).
 */

const SANJEEVANI_DATA = {
  // Existing Sanjeevani Patient Profile
  currentUser: {
    id: "pat-ayush-090",
    name: "Ayush Bhardwaj",
    age: 58,
    gender: "Male",
    bloodGroup: "B+",
    phone: "+91 98765 43210",
    email: "ayush.bhardwaj@email.com",
    abhaId: "91-8821-4920-1102@abdm",
    state: "Punjab",
    district: "Ludhiana",
    pincode: "141001",
    familyIncome: 250000, // ₹2.5 Lakh
    incomeCategory: "Priority Household / Low-Income Tier",
    occupation: "Small Agriculture / Self-Employed",
    rationCardType: "NFSA Blue Card (PHH)",
    bplStatus: true,
    seniorCitizenInFamily: true,
    vitals: {
      bloodPressure: "138/88 mmHg",
      bloodSugarFasting: "142 mg/dL",
      hba1c: "7.4%",
      bmi: "24.6",
      heartRate: "74 bpm",
      spO2: "98%"
    },
    chronicConditions: ["Type 2 Diabetes Mellitus", "Stage 1 Essential Hypertension", "Cardiac Evaluation Advised"],
    allergies: ["Penicillin", "Sulfa Drugs"],
    activeMedications: [
      { name: "Metformin 500mg", dosage: "1 tablet after dinner", duration: "Ongoing" },
      { name: "Telmisartan 40mg", dosage: "1 tablet morning", duration: "Ongoing" },
      { name: "Atorvastatin 10mg", dosage: "1 tablet bedtime", duration: "Ongoing" }
    ]
  },

  // Existing Sanjeevani Medical Records & Lab Reports
  medicalRecords: [
    {
      id: "rec-01",
      title: "Comprehensive Metabolic & Lipid Panel",
      category: "Lab Report",
      date: "14 Aug 2026",
      facility: "Apex Diagnostic & Wellness, Ludhiana",
      doctor: "Dr. H. S. Sharma",
      summary: "Elevated Fasting Blood Sugar (142 mg/dL) and HbA1c (7.4%). Lipid values within borderline control.",
      status: "Verified",
      fileType: "PDF",
      fileSize: "1.4 MB"
    },
    {
      id: "rec-02",
      title: "Electrocardiogram (ECG) & Echo Screening",
      category: "Diagnostic Scan",
      date: "02 Aug 2026",
      facility: "District Civil Hospital, Ludhiana",
      doctor: "Dr. Arvind Gill",
      summary: "Normal sinus rhythm with mild left ventricular hypertrophy secondary to chronic hypertension.",
      status: "Verified",
      fileType: "PDF",
      fileSize: "2.8 MB"
    },
    {
      id: "rec-03",
      title: "Cardiology & Diabetology Prescription Slip",
      category: "Prescription",
      date: "02 Aug 2026",
      facility: "Civil Hospital OPD",
      doctor: "Dr. H. S. Sharma",
      summary: "Advised generic Metformin + Telmisartan combination. Recommended enrollment into PM-JAY / Sehat Bima for subsidized cardiology consultations.",
      status: "Verified",
      fileType: "PDF",
      fileSize: "840 KB"
    },
    {
      id: "rec-04",
      title: "Renal Function & Serum Creatinine Test",
      category: "Lab Report",
      date: "18 Jun 2026",
      facility: "Civil Hospital Diagnostic Wing",
      doctor: "Dr. Neha Verma",
      summary: "Serum Creatinine: 1.1 mg/dL, eGFR > 85. Kidney function stable.",
      status: "Verified",
      fileType: "PDF",
      fileSize: "920 KB"
    }
  ],

  // Existing Sanjeevani Empaneled Doctors & Specialists
  doctors: [
    {
      id: "doc-01",
      name: "Dr. H. S. Sharma",
      specialty: "Senior Consultant Cardiologist & Physician",
      hospital: "District Civil Hospital & Fortis Escorts, Ludhiana",
      experience: "22 Years Exp",
      rating: "4.9 (420+ Consultations)",
      languages: "English, Hindi, Punjabi",
      availableTime: "Mon - Sat (10:00 AM - 04:00 PM)",
      image: "👨‍⚕️"
    },
    {
      id: "doc-02",
      name: "Dr. Arvind Gill",
      specialty: "Endocrinologist & Diabetes Specialist",
      hospital: "Dayanand Medical College (DMC) Hospital, Ludhiana",
      experience: "16 Years Exp",
      rating: "4.8 (310+ Consultations)",
      languages: "English, Punjabi",
      availableTime: "Mon - Fri (11:00 AM - 05:00 PM)",
      image: "👨‍⚕️"
    },
    {
      id: "doc-03",
      name: "Dr. Neha Verma",
      specialty: "General Medicine & Chronic Disease Specialist",
      hospital: "Kisan Health Center, Model Town, Ludhiana",
      experience: "12 Years Exp",
      rating: "4.9 (560+ Consultations)",
      languages: "English, Hindi",
      availableTime: "Daily (09:00 AM - 02:00 PM)",
      image: "👩‍⚕️"
    }
  ],

  // Granular Patient-Doctor Consents
  activeConsents: [
    {
      id: "con-01",
      doctorName: "Dr. H. S. Sharma",
      doctorId: "doc-01",
      purpose: "Cardiac Follow-up & Treatment Scheme Verification",
      sharedRecords: ["Lab Report: Metabolic & Lipid Panel", "Prescription: Cardiology Slip", "ECG Diagnostic Scan"],
      validUntil: "29 Aug 2026 (7 Days Access)",
      status: "Active",
      grantedDate: "22 Aug 2026"
    }
  ],

  // Structured Government Schemes Database (Source of Truth)
  schemes: [
    {
      id: "pmjay",
      name: "Ayushman Bharat PM-JAY",
      hindiName: "आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना",
      category: "Central Government",
      governmentLevel: "Central & State Convergence",
      state: "All India",
      status: "Active",
      statusType: "active",
      matchScore: 96,
      eligibilityTag: "Likely Eligible",
      eligibilityTagClass: "status-tag-eligible",
      whyMatch: [
        "Annual family income (₹2.5L) matches priority deprivation threshold",
        "Punjab state residency with NFSA Priority Blue Card satisfies identification",
        "Covers pre-existing diabetes and cardiac hospitalization from Day 1 with zero waiting period",
        "Includes cashless coverage at 28,000+ public and private hospitals nationwide"
      ],
      shortSummary: "World's largest government-funded healthcare assurance scheme offering ₹5 Lakh per family per year for secondary and tertiary hospitalization.",
      fullDescription: "PM-JAY provides health assurance of ₹5 Lakh per family per year to eligible households, completely cashless and paperless across all empaneled public and private hospitals.",
      benefits: [
        "₹5,00,000 annual cashless cover per family",
        "Covers 1,949+ surgical & medical treatment procedures including cardiology & oncology",
        "Includes 3 days pre-hospitalization and 15 days post-hospitalization diagnostics & medications",
        "Pre-existing illnesses (like Diabetes and Hypertension) covered from Day 1",
        "Portability across India — valid at AIIMS, PGI Chandigarh, and private networks"
      ],
      eligibilityCriteria: {
        incomeLimit: "₹2,50,000/yr (or SECC 2011 Deprivation / NFSA Blue Card)",
        ageGroup: "All Age Groups",
        residence: "Indian Citizen / Participating States",
        targetGroup: "Rural D1-D7 criteria and urban low-income occupational categories"
      },
      requiredDocuments: [
        { name: "Aadhaar Card", required: true, status: "Available in Sanjeevani Vault" },
        { name: "NFSA Blue Ration Card", required: true, status: "Available in Sanjeevani Vault" },
        { name: "Income Certificate (Tehsildar Verified)", required: true, status: "Available in Sanjeevani Vault" },
        { name: "Doctor Referral Slip", required: false, status: "Prescription Available" }
      ],
      officialSource: "National Health Authority (NHA), MoHFW",
      officialUrl: "https://pmjay.gov.in",
      helpline: "14555",
      lastVerifiedDate: "20 Aug 2026",
      coveredHospitalsInDistrict: 24,
      schemeType: "Cashless Health Assurance"
    },
    {
      id: "pmjay-vav",
      name: "Ayushman Bharat - Vay Vandana Extension (70+ Seniors)",
      hindiName: "आयुष्मान वय वंदना योजना (70+ वरिष्ठ नागरिक)",
      category: "Senior Citizen Special",
      governmentLevel: "Central",
      state: "All India",
      status: "Newly Introduced",
      statusType: "new",
      matchScore: 92,
      eligibilityTag: "Universal Benefit (70+)",
      eligibilityTagClass: "status-tag-eligible",
      whyMatch: [
        "Senior citizen (70+ years) present in your Sanjeevani family profile",
        "Universal eligibility with ZERO income restrictions for any citizen aged 70+",
        "Separate dedicated ₹5L cover that does not exhaust family PM-JAY balance"
      ],
      shortSummary: "Universal healthcare extension providing an exclusive ₹5 Lakh/year top-up health cover to all senior citizens aged 70 and above.",
      fullDescription: "Launched under the Union Cabinet expansion, every senior citizen aged 70+ receives a free, distinct Ayushman Vay Vandana golden card for geriatric, orthopedic, and chronic disease coverage.",
      benefits: [
        "Dedicated ₹5,00,000 separate annual health cover for members aged 70+",
        "No income ceiling or wealth threshold applicable",
        "Direct self-registration via Aadhaar biometric e-KYC on the NHA portal",
        "Covers senior intensive care, stroke management, and joint replacements"
      ],
      eligibilityCriteria: {
        incomeLimit: "No income limit (Universal for 70+)",
        ageGroup: "70 Years and Above",
        residence: "All Indian States",
        targetGroup: "All Senior Citizens aged 70+"
      },
      requiredDocuments: [
        { name: "Aadhaar Card (Proof of Age 70+)", required: true, status: "Available in Sanjeevani Vault" },
        { name: "Aadhaar Linked Mobile for OTP", required: true, status: "Verified" }
      ],
      officialSource: "Ministry of Health & Family Welfare (MoHFW)",
      officialUrl: "https://beneficiary.nha.gov.in",
      helpline: "14555",
      lastVerifiedDate: "18 Aug 2026",
      coveredHospitalsInDistrict: 24,
      schemeType: "Universal Senior Assurance"
    },
    {
      id: "sarbat-sehat",
      name: "Ayushman Bharat - Mukh Mantri Sehat Bima Yojana (Punjab)",
      hindiName: "ਮੁੱਖ ਮੰਤਰੀ ਸਿਹਤ ਬੀਮਾ ਯੋਜਨਾ (ਪੰਜਾਬ)",
      category: "State Government",
      governmentLevel: "State (Punjab)",
      state: "Punjab",
      status: "Recently Updated",
      statusType: "updated",
      matchScore: 94,
      eligibilityTag: "Likely Eligible",
      eligibilityTagClass: "status-tag-eligible",
      whyMatch: [
        "Resident of Punjab (Ludhiana District) in Sanjeevani profile",
        "NFSA Blue Card / J-Form farmer category verified",
        "Empanels 900+ state hospitals including local civil hospital & PGI Chandigarh"
      ],
      shortSummary: "Flagship Punjab state health cover offering ₹5 Lakh per family per year covering 65% of the state's population.",
      fullDescription: "A comprehensive health protection scheme by the Government of Punjab that merges state health welfare beneficiaries with PM-JAY, covering NFSA ration card holders and small farmers.",
      benefits: [
        "₹5 Lakh per family per year cashless treatment",
        "Over 1,600+ surgical and medical packages covered",
        "Zero out-of-pocket expenses at district civil hospitals",
        "Direct emergency admission authorization"
      ],
      eligibilityCriteria: {
        incomeLimit: "NFSA Blue Card holders / Farmers with J-form / Small Traders",
        ageGroup: "All Age Groups",
        residence: "Punjab Domicile",
        targetGroup: "NFSA cardholders, Farmers, Construction workers"
      },
      requiredDocuments: [
        { name: "Aadhaar Card", required: true, status: "Available in Sanjeevani Vault" },
        { name: "Punjab Smart Ration Card (Blue Card)", required: true, status: "Available in Sanjeevani Vault" },
        { name: "Punjab Domicile Proof", required: true, status: "Available in Sanjeevani Vault" }
      ],
      officialSource: "State Health Agency (SHA), Punjab",
      officialUrl: "https://shapunjab.in",
      helpline: "104",
      lastVerifiedDate: "15 Aug 2026",
      coveredHospitalsInDistrict: 18,
      schemeType: "State Health Assurance"
    },
    {
      id: "pmbjp",
      name: "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)",
      hindiName: "प्रधानमंत्री भारतीय जनऔषधि परियोजना (सस्ती दवाइयां)",
      category: "Affordable Generic Medicines",
      governmentLevel: "Central",
      state: "All India",
      status: "Active",
      statusType: "active",
      matchScore: 95,
      eligibilityTag: "Universal Access",
      eligibilityTagClass: "status-tag-eligible",
      whyMatch: [
        "Directly covers your active prescription (Metformin & Telmisartan) at 50-90% lower price",
        "15+ Janaushadhi Kendras operating within 5 km of Ludhiana pin code 141001",
        "Walk-in access with your existing Sanjeevani prescription"
      ],
      shortSummary: "Quality generic medicines, surgical items, and nutraceuticals available at 50% to 90% lesser prices than branded equivalents.",
      fullDescription: "Dedicated campaign by PMBI to provide high quality generic medicines for diabetes, cardiovascular, and chronic conditions at minimal prices.",
      benefits: [
        "2,000+ generic medicines & 300+ surgical items at 50-90% discount",
        "WHO-GMP certified quality assurance for all medicine batches",
        "Diabetes and Blood Pressure medicines under ₹10-₹25 per strip",
        "Zero registration required; open to all citizens"
      ],
      eligibilityCriteria: {
        incomeLimit: "No income limit (Universal for all citizens)",
        ageGroup: "All Age Groups",
        residence: "All India",
        targetGroup: "Any citizen requiring affordable medicines"
      },
      requiredDocuments: [
        { name: "Doctor's Prescription (Rx)", required: true, status: "Available in Sanjeevani Medical Records" }
      ],
      officialSource: "Pharmaceuticals & Medical Devices Bureau of India (PMBI)",
      officialUrl: "https://janaushadhi.gov.in",
      helpline: "1800-180-8080",
      lastVerifiedDate: "20 Aug 2026",
      coveredHospitalsInDistrict: 32,
      schemeType: "Generic Pharmacy Network"
    },
    {
      id: "pmndp",
      name: "Pradhan Mantri National Dialysis Programme (PMNDP)",
      hindiName: "प्रधानमंत्री राष्ट्रीय डायलिसिस कार्यक्रम",
      category: "Specialized Free Care",
      governmentLevel: "Central & State Convergence",
      state: "All India",
      status: "Active",
      statusType: "active",
      matchScore: 82,
      eligibilityTag: "Potentially Eligible",
      eligibilityTagClass: "status-tag-info",
      whyMatch: [
        "Free hemodialysis access for BPL/EWS patients at District Civil Hospital Ludhiana",
        "Zero out-of-pocket expenses for renal replacement therapy",
        "Seamless integration with Ayushman Golden Card"
      ],
      shortSummary: "Free dialysis services for Below Poverty Line (BPL) patients across all District Civil Hospitals in India.",
      fullDescription: "Provides 100% free hemodialysis and peritoneal dialysis services to poor patients through PPP mode at district health centers.",
      benefits: [
        "100% Free Hemodialysis and Peritoneal Dialysis for BPL patients",
        "Free routine lab tests during dialysis cycles",
        "Covers essential dialysis consumables and EPO injections"
      ],
      eligibilityCriteria: {
        incomeLimit: "BPL card holders receive 100% free treatment",
        ageGroup: "All Ages",
        residence: "All Indian States",
        targetGroup: "Patients requiring dialysis"
      },
      requiredDocuments: [
        { name: "Aadhaar Card", required: true, status: "Available in Sanjeevani Vault" },
        { name: "BPL / Ayushman Card", required: true, status: "Available in Sanjeevani Vault" },
        { name: "Nephrologist Referral Slip", required: true, status: "Requires Clinical Referral" }
      ],
      officialSource: "National Health Mission (NHM), MoHFW",
      officialUrl: "https://nhm.gov.in",
      helpline: "1800-180-1104",
      lastVerifiedDate: "10 Aug 2026",
      coveredHospitalsInDistrict: 3,
      schemeType: "Specialized Free Treatment"
    },
    {
      id: "ran",
      name: "Rashtriya Arogya Nidhi (RAN) & Rare Diseases Grant",
      hindiName: "राष्ट्रीय आरोग्य निधि (गंभीर रोग सहायता)",
      category: "Tertiary Life-Threatening Care",
      governmentLevel: "Central",
      state: "All India",
      status: "Recently Updated",
      statusType: "updated",
      matchScore: 76,
      eligibilityTag: "Information Required",
      eligibilityTagClass: "status-tag-warning",
      whyMatch: [
        "One-time financial grant of up to ₹50 Lakh for life-threatening diseases at AIIMS/PGI",
        "Applicable for BPL families facing super-specialty treatment costs beyond normal covers"
      ],
      shortSummary: "One-time financial assistance of up to ₹50 Lakh for poor patients suffering from major life-threatening diseases at premier government hospitals.",
      fullDescription: "Rashtriya Arogya Nidhi provides direct financial assistance to patients below the poverty line for major surgeries at central government institutes.",
      benefits: [
        "Direct one-time grant up to ₹50 Lakh for critical surgeries & rare diseases",
        "Direct fund disbursement to treating government hospital (PGI Chandigarh / AIIMS)",
        "Includes emergency implants and specialized drugs"
      ],
      eligibilityCriteria: {
        incomeLimit: "Below official state BPL threshold",
        ageGroup: "All Ages",
        residence: "Indian Citizen",
        targetGroup: "Life-threatening ailments treated at Central Government institutes"
      },
      requiredDocuments: [
        { name: "Income Certificate (Tehsildar)", required: true, status: "Available in Sanjeevani Vault" },
        { name: "Hospital Estimate Proforma signed by MS", required: true, status: "Pending Hospital Form" }
      ],
      officialSource: "Ministry of Health & Family Welfare",
      officialUrl: "https://mohfw.gov.in",
      helpline: "011-23061986",
      lastVerifiedDate: "12 Jul 2026",
      coveredHospitalsInDistrict: 2,
      schemeType: "Direct Financial Medical Grant"
    }
  ],

  // Real-time Intelligence Feed
  intelligenceUpdates: [
    {
      id: "intel-01",
      date: "20 Aug 2026",
      scheme: "Ayushman Bharat PM-JAY",
      status: "Active",
      type: "active",
      headline: "Senior Citizen (70+) Universal Card Registration Open at All District Kendras",
      summary: "All citizens aged 70 and above can now register with Aadhaar e-KYC for the ₹5 Lakh Vay Vandana card without income limitation.",
      source: "National Health Authority Press Release #2026-NHA-89",
      sourceUrl: "https://nha.gov.in/updates",
      impact: "Direct Benefit: Family members aged 70+ in Punjab can immediately avail dedicated ₹5L cover."
    },
    {
      id: "intel-02",
      date: "15 Aug 2026",
      scheme: "Mukh Mantri Sehat Bima Yojana (Punjab)",
      status: "Recently Updated",
      type: "updated",
      headline: "150 New Specialized Cardiac and Oncology Treatment Packages Empaneled",
      summary: "Punjab State Health Agency empanels 18 additional private hospitals in Ludhiana, Jalandhar, and Amritsar with zero co-pay mandate.",
      source: "Punjab Health System Corporation Notification",
      sourceUrl: "https://shapunjab.in",
      impact: "Critical: Cardiac evaluation & hypertension treatments now 100% pre-authorized in Ludhiana."
    },
    {
      id: "intel-03",
      date: "03 Aug 2026",
      scheme: "Pradhan Mantri Bhartiya Janaushadhi Pariyojana",
      status: "Active",
      type: "active",
      headline: "500 New Generic Formulations Added for Cardiovascular & Diabetes Care",
      summary: "Prices of Telmisartan and Metformin combinations stabilized under ₹18 per strip across all 10,000+ Janaushadhi Kendras.",
      source: "PMBI Official Gazette Notification",
      sourceUrl: "https://janaushadhi.gov.in",
      impact: "Reduces patient's recurring monthly pharmacy bills from ₹1,200 to under ₹180."
    },
    {
      id: "intel-04",
      date: "22 Jul 2026",
      scheme: "Rashtriya Arogya Nidhi (RAN)",
      status: "Important Changes",
      type: "warning",
      headline: "Rare Disease Grant Cap Formally Enhanced to ₹50 Lakh with Fast-Track Approvals",
      summary: "Under the revised National Policy, hospital medical superintendents can disburse critical grants within 14 days.",
      source: "Rare Disease Cell, MoHFW Gazette Ref #4410",
      sourceUrl: "https://mohfw.gov.in",
      impact: "Reduces approval turnaround time for critical interventions from 90 days to 14 days."
    }
  ],

  // Uploaded Documents in Sanjeevani Document Center
  userDocuments: [
    {
      id: "doc-aadhaar",
      name: "Aadhaar Card",
      type: "Identity Proof",
      status: "Verified",
      uploadedDate: "12 May 2026",
      expiryDate: "Lifetime",
      extractedData: {
        fullName: "Ayush Bhardwaj",
        dob: "14/06/1968 (Age: 58)",
        gender: "Male",
        uidMasked: "XXXX-XXXX-8921",
        state: "Punjab",
        pincode: "141001"
      },
      fileSize: "1.4 MB",
      format: "PDF"
    },
    {
      id: "doc-income",
      name: "Income Certificate (Tehsildar Verified)",
      type: "Financial Proof",
      status: "Verified",
      uploadedDate: "02 June 2026",
      expiryDate: "31 March 2027",
      extractedData: {
        certificateNo: "PB/LUD/INC/2026/09124",
        annualIncome: "₹2,50,000",
        issuingAuthority: "Tehsildar Ludhiana West",
        category: "Low Income / Priority Group"
      },
      fileSize: "890 KB",
      format: "PDF"
    },
    {
      id: "doc-residence",
      name: "Punjab Domicile / Residence Proof",
      type: "Address Proof",
      status: "Verified",
      uploadedDate: "02 June 2026",
      expiryDate: "Lifetime",
      extractedData: {
        domicileNo: "PB-DOM-141001-771",
        district: "Ludhiana",
        residenceDuration: "25+ Years"
      },
      fileSize: "1.1 MB",
      format: "PDF"
    },
    {
      id: "doc-ration",
      name: "Smart Ration Card (NFSA - Blue Card)",
      type: "Beneficiary Proof",
      status: "Verified",
      uploadedDate: "15 June 2026",
      expiryDate: "Valid 2028",
      extractedData: {
        rationCardNo: "NFSA-PB-03-881290",
        familyHead: "Ayush Bhardwaj",
        membersListed: "4 Members",
        cardType: "Priority Household (PHH)"
      },
      fileSize: "2.1 MB",
      format: "PDF"
    },
    {
      id: "doc-prescription",
      name: "Hospital Clinical Prescription & Cardiology Slip",
      type: "Medical Document",
      status: "Verified",
      uploadedDate: "02 Aug 2026",
      expiryDate: "Valid 6 Months",
      extractedData: {
        hospital: "District Civil Hospital, Ludhiana",
        diagnosis: "Type 2 Diabetes, Essential Hypertension, Cardiac Evaluation Advised",
        doctor: "Dr. H. S. Sharma, MD (Cardiology)"
      },
      fileSize: "1.8 MB",
      format: "JPG/Scan"
    }
  ],

  // Tracked Applications for Government Health Cards
  applications: [
    {
      id: "app-01",
      referenceNo: "SNJ-2026-PB-8921",
      schemeName: "Ayushman Bharat PM-JAY & Sehat Bima",
      appliedDate: "14 Aug 2026",
      currentStage: "Government Verification",
      stageIndex: 3,
      totalStages: 5,
      statusLabel: "Verification Pending at District Health Office",
      statusColor: "amber",
      estimatedResolution: "26 Aug 2026",
      notes: "E-KYC completed successfully via Aadhaar OTP. Document dossier transmitted to SHA Punjab for final Golden Card approval.",
      assignedCenter: "Kisan Seva Kendra / District Civil Hospital Ludhiana",
      steps: [
        { label: "Profile Submitted", completed: true, date: "14 Aug 2026, 10:30 AM" },
        { label: "Sanjeevani Eligibility Check", completed: true, date: "14 Aug 2026, 10:32 AM" },
        { label: "Documents Dossier Uploaded", completed: true, date: "15 Aug 2026, 03:15 PM" },
        { label: "Government Verification", completed: false, inProgress: true, date: "Under Review by District Health Officer" },
        { label: "Golden Card Issued", completed: false, inProgress: false, date: "Estimated 26 Aug 2026" }
      ]
    },
    {
      id: "app-02",
      referenceNo: "SNJ-2026-VAV-1049",
      schemeName: "Ayushman Vay Vandana Card (Senior Family Member)",
      appliedDate: "19 Aug 2026",
      currentStage: "Eligibility Check",
      stageIndex: 1,
      totalStages: 5,
      statusLabel: "Aadhaar Age Verification In Progress",
      statusColor: "blue",
      estimatedResolution: "24 Aug 2026",
      notes: "Senior member Aadhaar linkage submitted for age proof validation (70+).",
      assignedCenter: "Online Direct NHA Portal Gateway",
      steps: [
        { label: "Profile Submitted", completed: true, date: "19 Aug 2026, 11:00 AM" },
        { label: "Eligibility Pre-Check", completed: false, inProgress: true, date: "Matching 70+ Age Criteria" },
        { label: "Documents Verification", completed: false, inProgress: false, date: "Pending" },
        { label: "State Approval", completed: false, inProgress: false, date: "Pending" },
        { label: "Senior Health Card Activated", completed: false, inProgress: false, date: "Pending" }
      ]
    }
  ],

  // Step 11: Proposed Database Schema Extensions
  databaseSchemaDocumentation: {
    tables: [
      {
        name: "government_schemes",
        columns: ["id (UUID)", "scheme_name (TEXT)", "description (TEXT)", "government_level (TEXT)", "state (TEXT)", "category (TEXT)", "eligibility (JSONB)", "benefits (JSONB)", "documents_required (JSONB)", "status (TEXT)", "official_source (TEXT)", "last_updated (TIMESTAMP)"]
      },
      {
        name: "scheme_recommendations",
        columns: ["id (UUID)", "user_id (FK patients.id)", "scheme_id (FK government_schemes.id)", "eligibility_status (TEXT)", "relevance_reason (TEXT[])", "generated_at (TIMESTAMP)"]
      },
      {
        name: "consents",
        columns: ["id (UUID)", "patient_id (FK patients.id)", "recipient_type (ENUM: 'doctor', 'scheme_verification')", "recipient_id (TEXT)", "purpose (TEXT)", "records_allowed (TEXT[])", "valid_from (TIMESTAMP)", "valid_until (TIMESTAMP)", "status (ENUM: 'active', 'revoked', 'expired')", "revoked_at (TIMESTAMP)"]
      }
    ]
  }
};
