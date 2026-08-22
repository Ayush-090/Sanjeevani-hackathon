/**
 * Sanjeevani - Government Medical Scheme Intelligence Database
 * Rich, authentic dataset of Indian central and state healthcare schemes, updates, and initial user context.
 */

const SANJEEVANI_DATA = {
  currentUser: {
    name: "Ayush Bhardwaj",
    age: 38,
    gender: "Male",
    state: "Punjab",
    district: "Ludhiana",
    pincode: "141001",
    familyIncome: 240000, // INR 2.4 Lakh
    incomeCategory: "Low Income / Priority Household",
    occupation: "Self-Employed / Small Agriculture",
    rationCardType: "Priority Household (PHH)",
    bplStatus: true,
    familyMembersCount: 4,
    healthConditions: ["Hypertension", "Hospital Treatment Required", "Cardiology Consultation Needed"],
    criticalNeeds: ["Cashless Hospitalization", "Diagnostic Coverage", "Affordable Medicines"],
    disabilityStatus: "None",
    seniorCitizenInFamily: true
  },

  schemes: [
    {
      id: "pmjay",
      name: "Ayushman Bharat PM-JAY",
      hindiName: "आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना",
      category: "Central Government",
      governmentLevel: "Central",
      state: "All India",
      status: "Active", // Active, Newly Introduced, Recently Updated
      statusType: "active",
      matchScore: 96,
      whyMatch: [
        "Annual family income (₹2.4L) is below SECC 2011 / State Deprivation threshold",
        "Punjab is a participating state under the Ayushman Bharat convergence",
        "Covers secondary and tertiary hospitalization required for cardiac & general surgery",
        "Valid Ration Card (PHH) satisfies family identification criteria"
      ],
      shortSummary: "World's largest government-funded healthcare assurance scheme offering ₹5 Lakh per family per year for secondary and tertiary care.",
      fullDescription: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY) provides a health cover of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization to over 12 crore poor and vulnerable families (approximately 55 crore beneficiaries) that form the bottom 40% of the Indian population.",
      benefits: [
        "₹5,00,000 annual cashless health coverage per family",
        "Covers 1,949+ medical procedures including surgeries, oncology, and cardiology",
        "Pre-existing illnesses covered from Day 1 with zero waiting period",
        "Includes 3 days pre-hospitalization and 15 days post-hospitalization expenses",
        "Paperless and cashless treatment across 28,000+ empaneled private & public hospitals nationwide"
      ],
      eligibilityCriteria: {
        incomeLimit: "₹2,50,000/yr (or SECC 2011 identified)",
        ageGroup: "All age groups covered",
        residence: "All Indian States & UTs (Except Delhi/WB having state equivalents)",
        targetGroup: "Rural deprivation criteria D1-D7 & Urban occupational categories"
      },
      requiredDocuments: [
        { name: "Aadhaar Card", required: true, status: "Available" },
        { name: "Ration Card (NFSA/PHH) or Family ID", required: true, status: "Available" },
        { name: "Income Certificate / Self Declaration", required: true, status: "Available" },
        { name: "Doctor Referral / Hospital Admission Slip", required: false, status: "Pending" }
      ],
      officialSource: "National Health Authority (NHA), MoHFW",
      officialUrl: "https://pmjay.gov.in",
      helpline: "14555",
      lastVerifiedDate: "18 Aug 2026",
      updatedBadge: "Recently Updated: Senior Care Expansion",
      coveredHospitalsInDistrict: 24,
      schemeType: "Cashless Health Assurance"
    },
    {
      id: "pmjay-vav",
      name: "Ayushman Bharat - Vay Vandana Extension",
      hindiName: "आयुष्मान वय वंदना योजना (70+ वरिष्ठ नागरिक)",
      category: "Senior Citizen Special",
      governmentLevel: "Central",
      state: "All India",
      status: "Newly Introduced",
      statusType: "new",
      matchScore: 91,
      whyMatch: [
        "Senior citizen (70+ years) present in your family profile",
        "Universal coverage regardless of family income cap for citizens aged 70+",
        "Provides distinct top-up cover for geriatric care and chronic illness"
      ],
      shortSummary: "Universal healthcare extension providing an exclusive ₹5 Lakh/year top-up health cover to all senior citizens aged 70 and above.",
      fullDescription: "Launched under the Union Cabinet expansion, every senior citizen aged 70 years and above is eligible to receive free health insurance coverage of up to ₹5 lakh per year, irrespective of their socio-economic status. Families with elderly members get a dedicated top-up card.",
      benefits: [
        "Dedicated ₹5,00,000 separate annual cover for members aged 70+",
        "No income ceiling or wealth criteria required",
        "Includes intensive geriatric care, orthopedic joint replacements, and stroke care",
        "Instant Ayushman Vay Vandana golden card generation via Aadhaar e-KYC"
      ],
      eligibilityCriteria: {
        incomeLimit: "No income limit (Universal for 70+)",
        ageGroup: "70 Years and Above",
        residence: "Indian Citizen",
        targetGroup: "All senior citizens aged 70+"
      },
      requiredDocuments: [
        { name: "Aadhaar Card (Proof of Age 70+)", required: true, status: "Available" },
        { name: "Active Mobile Number linked to Aadhaar", required: true, status: "Available" },
        { name: "Recent Passport Size Photograph", required: true, status: "Available" }
      ],
      officialSource: "Ministry of Health and Family Welfare (MoHFW)",
      officialUrl: "https://beneficiary.nha.gov.in",
      helpline: "14555",
      lastVerifiedDate: "15 Aug 2026",
      updatedBadge: "Newly Launched 2026 Expansion",
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
      whyMatch: [
        "Resident of Punjab (Ludhiana District)",
        "Blue Card holder / NFSA Priority Household match",
        "J-Form Farmer / Small Trader registration recognized",
        "Provides additional state-empaneled tertiary hospitals in Punjab & Chandigarh"
      ],
      shortSummary: "Punjab state flagship health cover offering ₹5 Lakh per family per year covering 65% of the state's population.",
      fullDescription: "A comprehensive health protection scheme by the Government of Punjab that merges state health welfare beneficiaries with PM-JAY, covering NFSA ration card holders, J-form holding farmers, small traders registered with Punjab excise department, and accredited journalists.",
      benefits: [
        "₹5 Lakh per family per year cashless treatment",
        "Over 1,600+ surgical and medical packages covered",
        "Valid across 900+ empanelled public and private hospitals across Punjab and tricity (PGI Chandigarh)",
        "Pre-authorized cashless emergency support at all district civil hospitals"
      ],
      eligibilityCriteria: {
        incomeLimit: "NFSA Blue Card holders / Farmers with J-form / Small Traders < ₹6L turnover",
        ageGroup: "All age groups",
        residence: "Punjab Domicile",
        targetGroup: "NFSA cardholders, Farmers, Construction workers, Small shopkeepers"
      },
      requiredDocuments: [
        { name: "Aadhaar Card", required: true, status: "Available" },
        { name: "Punjab Smart Ration Card (Blue Card)", required: true, status: "Available" },
        { name: "J-Form or Punjab Resident Proof", required: true, status: "Available" }
      ],
      officialSource: "State Health Agency, Department of Health & Family Welfare Punjab",
      officialUrl: "https://shapunjab.in",
      helpline: "104",
      lastVerifiedDate: "12 Aug 2026",
      updatedBadge: "Updated: 150 New Packages Added",
      coveredHospitalsInDistrict: 18,
      schemeType: "State Health Assurance"
    },
    {
      id: "pmndp",
      name: "Pradhan Mantri National Dialysis Programme (PMNDP)",
      hindiName: "प्रधानमंत्री राष्ट्रीय डायलिसिस कार्यक्रम",
      category: "Specialized Care",
      governmentLevel: "Central & State Convergence",
      state: "All India",
      status: "Active",
      statusType: "active",
      matchScore: 82,
      whyMatch: [
        "Free hemodialysis & peritoneal dialysis access for BPL/EWS patients",
        "Available at District Hospital Ludhiana with zero out-of-pocket payment",
        "No waiting period or complicated pre-authorization"
      ],
      shortSummary: "Free dialysis services for Below Poverty Line (BPL) patients across all District Civil Hospitals in India.",
      fullDescription: "The Pradhan Mantri National Dialysis Programme was rolled out under the National Health Mission (NHM) to provide free dialysis services to poor patients through public-private partnership (PPP) modes at district hospitals nationwide.",
      benefits: [
        "100% Free Hemodialysis and Peritoneal Dialysis for BPL patients",
        "Subsidized at non-BPL nominal rates for general public",
        "Free routine laboratory tests during dialysis cycles",
        "Covers essential dialysis consumables and EPO injections"
      ],
      eligibilityCriteria: {
        incomeLimit: "BPL card holders receive 100% free service",
        ageGroup: "All ages requiring renal replacement therapy",
        residence: "Any Indian state",
        targetGroup: "Chronic Kidney Disease (CKD Stage 5) patients"
      },
      requiredDocuments: [
        { name: "Aadhaar Card", required: true, status: "Available" },
        { name: "BPL Certificate / Ayushman Card", required: true, status: "Available" },
        { name: "Nephrologist Referral & Serum Creatinine Reports", required: true, status: "Pending" }
      ],
      officialSource: "National Health Mission (NHM), MoHFW",
      officialUrl: "https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=1054&lid=609",
      helpline: "1800-180-1104",
      lastVerifiedDate: "05 Aug 2026",
      updatedBadge: "Active in 600+ Districts",
      coveredHospitalsInDistrict: 3,
      schemeType: "Specialized Free Treatment"
    },
    {
      id: "ran",
      name: "Rashtriya Arogya Nidhi (RAN) & Rare Diseases Financial Support",
      hindiName: "राष्ट्रीय आरोग्य निधि (दुर्लभ एवं गंभीर रोग सहायता)",
      category: "Tertiary Life-Threatening Care",
      governmentLevel: "Central",
      state: "All India",
      status: "Recently Updated",
      statusType: "updated",
      matchScore: 78,
      whyMatch: [
        "Applicable for BPL families facing super-specialty treatment costs beyond normal covers",
        "One-time financial grant of up to ₹50 Lakh for rare diseases and life-threatening conditions",
        "Valid at premier institutes like AIIMS, PGI Chandigarh"
      ],
      shortSummary: "One-time financial assistance of up to ₹15-50 Lakh for poor patients suffering from major life-threatening diseases at premier government hospitals.",
      fullDescription: "Rashtriya Arogya Nidhi provides financial assistance to patients living below the poverty line who are suffering from major life-threatening diseases relating to heart, kidney, liver, cancer, and rare congenital disorders for treatment at designated super-specialty government hospitals.",
      benefits: [
        "Direct one-time grant up to ₹15 Lakh for critical organ surgeries / cancer care",
        "Up to ₹50 Lakh for Rare Diseases Group 1-3 under National Rare Disease Policy",
        "Direct fund disbursement to the treating government institute/hospital",
        "Includes emergency medicines and implants not covered under standard packages"
      ],
      eligibilityCriteria: {
        incomeLimit: "Family income below official state BPL threshold",
        ageGroup: "All ages",
        residence: "Indian Citizen",
        targetGroup: "Patients with life-threatening ailments treated at Central Gov institutes"
      },
      requiredDocuments: [
        { name: "Income Certificate issued by Revenue Authority (Tehsildar/SDM)", required: true, status: "Available" },
        { name: "Ration Card copy", required: true, status: "Available" },
        { name: "Hospital Estimate & Application Proforma signed by Medical Superintendent", required: true, status: "Pending" }
      ],
      officialSource: "Ministry of Health and Family Welfare (MoHFW)",
      officialUrl: "https://mohfw.gov.in/major-programmes/other-national-health-programmes/rashtriya-arogya-nidhi",
      helpline: "011-23061986",
      lastVerifiedDate: "10 Jul 2026",
      updatedBadge: "Grant Limit Enhanced to ₹50L",
      coveredHospitalsInDistrict: 2,
      schemeType: "Direct Financial Medical Grant"
    },
    {
      id: "pmsma",
      name: "Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)",
      hindiName: "प्रधानमंत्री सुरक्षित मातृत्व अभियान",
      category: "Maternal & Child Health",
      governmentLevel: "Central",
      state: "All India",
      status: "Active",
      statusType: "active",
      matchScore: 70,
      whyMatch: [
        "Universal free antenatal care (ANC) for pregnant women on 9th of every month",
        "Free ultrasound, lab tests, and specialist OB-GYN consultations at public centers",
        "Maternal welfare scheme with cash incentive linkages"
      ],
      shortSummary: "Comprehensive, guaranteed, quality antenatal care provided free of cost to all pregnant women on the 9th of every month.",
      fullDescription: "A national flagship initiative to ensure comprehensive and quality antenatal care, free diagnostic tests, and specialist counseling for pregnant women in their 2nd and 3rd trimesters at designated government health facilities.",
      benefits: [
        "Free high-risk pregnancy screening by OB-GYN specialists",
        "Zero-cost diagnostic tests (Ultrasound, Blood Glucose, Hemoglobin)",
        "Free iron-folic acid supplements and nutritional guidance",
        "Integration with Janani Suraksha Yojana cash benefits (₹1,400 - ₹6,000)"
      ],
      eligibilityCriteria: {
        incomeLimit: "No income limit (Universal for all pregnant women)",
        ageGroup: "Pregnant Women (2nd & 3rd Trimester)",
        residence: "All States & UTs",
        targetGroup: "Expectant mothers"
      },
      requiredDocuments: [
        { name: "Mother and Child Protection (MCP) Card", required: true, status: "Available" },
        { name: "Aadhaar Card", required: true, status: "Available" },
        { name: "Bank Account Passbook", required: true, status: "Available" }
      ],
      officialSource: "Maternal Health Division, MoHFW",
      officialUrl: "https://pmsma.mohfw.gov.in",
      helpline: "1800-180-1104",
      lastVerifiedDate: "01 Aug 2026",
      updatedBadge: "Active Nationwide",
      coveredHospitalsInDistrict: 12,
      schemeType: "Free Maternal Healthcare"
    },
    {
      id: "pmbjp",
      name: "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)",
      hindiName: "प्रधानमंत्री भारतीय जनऔषधि परियोजना (सस्ती दवाइयां)",
      category: "Affordable Medicines",
      governmentLevel: "Central",
      state: "All India",
      status: "Active",
      statusType: "active",
      matchScore: 95,
      whyMatch: [
        "Reduces monthly out-of-pocket pharmacy bills by 50% to 90% for chronic conditions (Hypertension, Diabetes)",
        "15+ Janaushadhi Kendras operating within 5 km of Ludhiana pin code 141001",
        "Direct walk-in access with any valid doctor prescription"
      ],
      shortSummary: "Quality generic medicines, surgical items, and nutraceuticals available at 50% to 90% lesser prices than branded equivalents.",
      fullDescription: "Dedicated campaign by the Pharmaceuticals & Medical Devices Bureau of India (PMBI) to provide quality medicines at affordable prices for all through special outlets known as Pradhan Mantri Bhartiya Janaushadhi Kendras.",
      benefits: [
        "2,000+ generic medicines & 300+ surgical items at 50-90% discount",
        "WHO-GMP certified quality assurance for all batches",
        "Cardiovascular, hypertensive, and anti-diabetic formulations priced under ₹10-₹25 per strip",
        "Zero registration required; open to all citizens"
      ],
      eligibilityCriteria: {
        incomeLimit: "No income limit (Universal for all citizens)",
        ageGroup: "All age groups",
        residence: "All India",
        targetGroup: "Any citizen requiring affordable medicines"
      },
      requiredDocuments: [
        { name: "Valid Doctor's Prescription (Rx)", required: true, status: "Available" }
      ],
      officialSource: "Pharmaceuticals & Medical Devices Bureau of India (PMBI)",
      officialUrl: "https://janaushadhi.gov.in",
      helpline: "1800-180-8080",
      lastVerifiedDate: "20 Aug 2026",
      updatedBadge: "10,000+ Kendras Operational",
      coveredHospitalsInDistrict: 32,
      schemeType: "Generic Pharmacy Network"
    },
    {
      id: "nikshay",
      name: "Ni-kshay Poshan Yojana (NPY - TB Patient Support)",
      hindiName: "निक्षय पोषण योजना (टीबी पोषण सहायता)",
      category: "Nutritional & Direct Benefit Transfer",
      governmentLevel: "Central (National TB Elimination Program)",
      state: "All India",
      status: "Recently Updated",
      statusType: "updated",
      matchScore: 65,
      whyMatch: [
        "Direct Benefit Transfer (DBT) of ₹1,000/month for nutritional support during TB treatment",
        "Free diagnostic testing (CBNAAT / TrueNat) and anti-tubercular medication",
        "Updated benefit doubled in recent ministry directive"
      ],
      shortSummary: "Direct cash transfer of ₹1,000 per month directly into bank account to provide nutritional support for all notified TB patients.",
      fullDescription: "Centrally sponsored scheme under the National Tuberculosis Elimination Program (NTEP) providing monthly financial assistance via DBT directly into the bank accounts of all notified TB patients throughout their treatment duration.",
      benefits: [
        "₹1,000/month DBT cash transfer during entire course of treatment",
        "100% free diagnostics, sputum tests, and first/second-line drugs",
        "Free Nikshay Mitra nutrition ration kit delivery",
        "Integrated monitoring via the Ni-kshay online portal"
      ],
      eligibilityCriteria: {
        incomeLimit: "Universal for all notified TB patients",
        ageGroup: "All ages",
        residence: "All India",
        targetGroup: "Patients clinically diagnosed and registered on Nikshay portal"
      },
      requiredDocuments: [
        { name: "Aadhaar Card", required: true, status: "Available" },
        { name: "Bank Account Passbook (Aadhaar linked)", required: true, status: "Available" },
        { name: "TB Notification Certificate / Nikshay ID", required: true, status: "Pending" }
      ],
      officialSource: "Central TB Division, Ministry of Health & Family Welfare",
      officialUrl: "https://nikshay.in",
      helpline: "1800-11-6666",
      lastVerifiedDate: "14 Aug 2026",
      updatedBadge: "Updated: Monthly DBT Doubled to ₹1000",
      coveredHospitalsInDistrict: 14,
      schemeType: "Direct Benefit Transfer (DBT)"
    }
  ],

  intelligenceUpdates: [
    {
      id: "intel-01",
      date: "20 Aug 2026",
      scheme: "Ayushman Bharat PM-JAY",
      status: "Active",
      type: "active",
      headline: "Senior Citizen Universal Coverage Rolled Out Across Empanelled Hospitals",
      summary: "All citizens aged 70 and above can now register directly at any Ayushman Kendra with Aadhaar biometric verification to receive the dedicated ₹5 Lakh Vay Vandana card.",
      source: "National Health Authority Press Release #2026-NHA-89",
      sourceUrl: "https://nha.gov.in/updates",
      impact: "High — Direct family members aged 70+ in Punjab can immediately avail separate ₹5L coverage."
    },
    {
      id: "intel-02",
      date: "14 Aug 2026",
      scheme: "Ni-kshay Poshan Yojana",
      status: "Recently Updated",
      type: "updated",
      headline: "Nutritional DBT Support Raised From ₹500 to ₹1,000 Per Month",
      summary: "Ministry of Health has officially enhanced direct bank transfer benefits to ₹1,000/month to counter nutrition deficits in underprivileged patients.",
      source: "Ministry of Health & Family Welfare Gazette Notification",
      sourceUrl: "https://mohfw.gov.in",
      impact: "Moderate — Applicable to notified patients upon Nikshay ID registration."
    },
    {
      id: "intel-03",
      date: "03 Aug 2026",
      scheme: "State Health Assurance (Punjab Sehat Bima)",
      status: "Recently Updated",
      type: "updated",
      headline: "150 New Specialized Cardiac and Oncology Treatment Packages Added",
      summary: "Punjab State Health Agency empanels 18 additional private hospitals in Ludhiana, Jalandhar, and Amritsar with zero co-pay mandate.",
      source: "Punjab Health System Corporation Notification",
      sourceUrl: "https://shapunjab.in",
      impact: "Critical — Cardiac care requirements now 100% pre-authorized in Ludhiana district."
    },
    {
      id: "intel-04",
      date: "22 Jul 2026",
      scheme: "Ayushman Bharat - Vay Vandana Extension",
      status: "Newly Introduced",
      type: "new",
      headline: "Universal Senior Health Card Portal Launched For Direct Self-Registration",
      summary: "Citizens can now self-register elderly family members through the Ayushman App using facial authentication or Aadhaar OTP without middle agents.",
      source: "Ministry of Health & Family Welfare Notification",
      sourceUrl: "https://beneficiary.nha.gov.in",
      impact: "High — Allows paperless card generation within 10 minutes."
    },
    {
      id: "intel-05",
      date: "15 Jun 2026",
      scheme: "Rashtriya Arogya Nidhi (RAN)",
      status: "Important Changes",
      type: "warning",
      headline: "Rare Disease One-Time Grant Upper Cap Formally Enhanced to ₹50 Lakh",
      summary: "Under the revised National Policy for Rare Diseases, government institutes can disburse up to ₹50 lakh per patient without waiting for multi-level inter-ministerial clearance.",
      source: "Rare Disease Cell, MoHFW Gazette Ref #4410",
      sourceUrl: "https://mohfw.gov.in",
      impact: "Significant — Reduces critical grant approval turnaround time from 90 days to 14 days."
    }
  ],

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
        dob: "14/06/1988",
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
        annualIncome: "₹2,40,000",
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
      status: "Under Review",
      uploadedDate: "21 Aug 2026",
      expiryDate: "Valid 6 Months",
      extractedData: {
        hospital: "District Civil Hospital, Ludhiana",
        diagnosis: "Grade II Essential Hypertension, Cardiac Evaluation Advised",
        doctor: "Dr. H. S. Gill, MD (Cardiology)"
      },
      fileSize: "1.8 MB",
      format: "JPG/Scan"
    }
  ],

  applications: [
    {
      id: "app-01",
      referenceNo: "SNJ-2026-PB-8921",
      schemeName: "Ayushman Bharat PM-JAY & Sehat Bima",
      appliedDate: "14 Aug 2026",
      currentStage: "Government Verification",
      stageIndex: 3, // 0: Profile Submitted, 1: Eligibility Pre-Check, 2: Documents Submitted, 3: Government Verification, 4: Approved / Card Issued
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
      estimatedResolution: "23 Aug 2026",
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

  adminSchemeRecords: [
    {
      id: "pmjay",
      name: "Ayushman Bharat PM-JAY",
      level: "Central",
      state: "All India",
      status: "Active",
      eligibility: "SECC Deprived / BPL / Low Income (< ₹2.5L)",
      benefit: "₹5,00,000 / Year / Family",
      lastUpdated: "18 Aug 2026",
      officialSource: "National Health Authority",
      sourceVerified: true
    },
    {
      id: "pmjay-vav",
      name: "Ayushman Vay Vandana (70+ Seniors)",
      level: "Central",
      state: "All India",
      status: "Newly Introduced",
      eligibility: "Universal for all Citizens 70+ Yrs",
      benefit: "₹5,00,000 Dedicated Top-up",
      lastUpdated: "15 Aug 2026",
      officialSource: "MoHFW Notification",
      sourceVerified: true
    },
    {
      id: "sarbat-sehat",
      name: "Mukh Mantri Sehat Bima Yojana",
      level: "State",
      state: "Punjab",
      status: "Recently Updated",
      eligibility: "NFSA Blue Card / J-Form Farmers",
      benefit: "₹5,00,000 / Year / Family",
      lastUpdated: "12 Aug 2026",
      officialSource: "State Health Agency Punjab",
      sourceVerified: true
    },
    {
      id: "pmndp",
      name: "National Dialysis Programme",
      level: "Central/State",
      state: "All India",
      status: "Active",
      eligibility: "BPL & EWS Renal Patients",
      benefit: "100% Free Dialysis at Civil Hospitals",
      lastUpdated: "05 Aug 2026",
      officialSource: "NHM Portal",
      sourceVerified: true
    },
    {
      id: "ran",
      name: "Rashtriya Arogya Nidhi (RAN)",
      level: "Central",
      state: "All India",
      status: "Recently Updated",
      eligibility: "BPL with Rare/Critical Illnesses",
      benefit: "Direct Grant up to ₹50 Lakh",
      lastUpdated: "10 Jul 2026",
      officialSource: "Rare Disease Division MoHFW",
      sourceVerified: true
    }
  ]
};
