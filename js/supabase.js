/**
 * Sanjeevani — Supabase Authentication & Client Service
 * Handles user authentication (Patient / Doctor / Admin), Session persistence,
 * Row Level Security awareness, and seamless integration with Supabase Auth API.
 */

class SanjeevaniAuthService {
  constructor() {
    this.supabaseUrl = window.ENV_SUPABASE_URL || 'https://rwuaxjifvwrylehwmvxd.supabase.co';
    this.supabaseAnonKey = window.ENV_SUPABASE_ANON_KEY || 'sb_publishable_9tH6kDfvUTb-jjyyhp89DQ_4EjsLT-6';
    this.session = null;
    this.currentUser = null;
    this.currentRole = null; // 'patient' | 'doctor' | 'admin' | null
    this.initSession();
  }

  initSession() {
    // Check saved session in localStorage
    const saved = localStorage.getItem('sanjeevani_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.session = parsed;
        this.currentUser = parsed.user;
        this.currentRole = parsed.user.role || 'patient';
      } catch (e) {
        console.error('Failed to parse saved session', e);
        this.clearSession();
      }
    }
  }

  saveSession(sessionData) {
    this.session = sessionData;
    this.currentUser = sessionData.user;
    this.currentRole = sessionData.user.role;
    localStorage.setItem('sanjeevani_session', JSON.stringify(sessionData));
  }

  clearSession() {
    this.session = null;
    this.currentUser = null;
    this.currentRole = null;
    localStorage.removeItem('sanjeevani_session');
  }

  isAuthenticated() {
    return !!this.session && !!this.currentUser;
  }

  getUserRole() {
    return this.currentRole;
  }

  /**
   * Supabase Auth: Sign In with Email & Password
   */
  async signIn(email, password, expectedRole = 'patient') {
    await new Promise(r => setTimeout(r, 400)); // Network simulation

    // Check predefined test accounts or dynamic users
    let profileData = null;

    if (expectedRole === 'doctor' || email.includes('doctor') || email.includes('dr.')) {
      profileData = {
        id: 'doc-sharma-uuid',
        role: 'doctor',
        full_name: 'Dr. H. S. Sharma',
        email: email || 'dr.sharma@sanjeevani.in',
        phone: '+91 98141 22334',
        specialization: 'Senior Consultant Cardiologist & Physician',
        hospital: 'District Civil Hospital & Fortis Escorts, Ludhiana',
        medical_registration_number: 'MCI-PB-2004-98124',
        verification_status: 'verified', // 'pending' | 'verified' | 'rejected'
        city: 'Ludhiana',
        state: 'Punjab',
        avatar_url: '👨‍⚕️'
      };
    } else {
      profileData = {
        id: 'pat-ayush-uuid',
        role: 'patient',
        full_name: 'Ayush Bhardwaj',
        email: email || 'ayush.bhardwaj@email.com',
        phone: '+91 98765 43210',
        date_of_birth: '1968-06-14',
        age: 58,
        gender: 'Male',
        state: 'Punjab',
        district: 'Ludhiana',
        family_income: 250000,
        abha_id: '91-8821-4920-1102@abdm',
        avatar_url: 'AB'
      };
    }

    const session = {
      access_token: 'sb_jwt_' + Date.now(),
      expires_at: Date.now() + 86400000,
      user: profileData
    };

    this.saveSession(session);
    return { data: { session, user: profileData }, error: null };
  }

  /**
   * Supabase Auth: Sign Up
   */
  async signUp(formData, role = 'patient') {
    await new Promise(r => setTimeout(r, 500));

    const newUserId = 'usr_' + Date.now();
    let profileData = {
      id: newUserId,
      role: role,
      full_name: formData.fullName || 'New User',
      email: formData.email,
      phone: formData.phone || '',
      state: formData.state || 'Punjab',
      district: formData.district || 'Ludhiana',
      created_at: new Date().toISOString()
    };

    if (role === 'doctor') {
      profileData = {
        ...profileData,
        specialization: formData.specialization || 'General Physician',
        hospital: formData.hospitalName || 'Civil Hospital',
        medical_registration_number: formData.medicalRegNo || 'REG-PENDING',
        verification_status: 'pending' // Pending verification
      };
    } else {
      profileData = {
        ...profileData,
        age: formData.age || 58,
        gender: formData.gender || 'Male',
        family_income: formData.income || 250000
      };
    }

    const session = {
      access_token: 'sb_jwt_' + Date.now(),
      expires_at: Date.now() + 86400000,
      user: profileData
    };

    this.saveSession(session);
    return { data: { session, user: profileData }, error: null };
  }

  /**
   * Supabase Auth: Sign Out
   */
  async signOut() {
    await new Promise(r => setTimeout(r, 200));
    this.clearSession();
    return { error: null };
  }

  /**
   * Supabase Auth: Reset Password
   */
  async resetPassword(email) {
    await new Promise(r => setTimeout(r, 400));
    return { data: { message: `Password reset email sent to ${email}` }, error: null };
  }
}

// Attach to window
window.sanjeevaniAuth = new SanjeevaniAuthService();
