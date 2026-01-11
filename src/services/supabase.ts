import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- Mock Supabase Implementation for Local Testing ---
class MockSupabaseClient {
  private user: any = null;
  private session: any = null;
  private notes: any[] = [];
  private authSubscribers: any[] = [];
  private registeredUsers: any[] = []; // Track registered users

  constructor() {
    // Try to restore session from localStorage
    try {
      const stored = localStorage.getItem('mock_supabase_session');
      if (stored) {
        this.session = JSON.parse(stored);
        this.user = this.session.user;
      }
      
      // Load mock notes
      const storedNotes = localStorage.getItem('mock_supabase_notes');
      if (storedNotes) {
        this.notes = JSON.parse(storedNotes);
      }

      // Load registered users
      const storedUsers = localStorage.getItem('mock_supabase_users');
      if (storedUsers) {
        this.registeredUsers = JSON.parse(storedUsers);
      }
    } catch (e) { console.error(e); }
  }

  auth = {
    getSession: async () => ({ data: { session: this.session }, error: null }),
    onAuthStateChange: (callback: any) => {
      this.authSubscribers.push(callback);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signUp: async ({ email, password }: any) => {
      // Old signUp method - not recommended, redirect to use OTP
      console.warn('[Mock] signUp called - please use signInWithOtp for email verification flow');
      return { data: { user: null, session: null }, error: new Error('Please use email verification code to sign up') };
    },
    signInWithPassword: async ({ email, password }: any) => {
      // Check if user exists in registered users
      const userExists = this.registeredUsers.find(u => u.email === email);
      
      if (!userExists) {
        return { 
          data: { user: null, session: null }, 
          error: new Error('This email is not registered. Please sign up first') 
        };
      }
      
      // In mock mode, we don't actually verify password, just check existence
      return this.mockSignIn(email);
    },
    signInWithOtp: async ({ email, options }: any) => {
      // Mock OTP - generate a fake 6-digit code and store it
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'color: #4CAF50;');
      console.log(`%c[Mock OTP] 验证码已生成`, 'background: #4CAF50; color: white; padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: bold;');
      console.log(`%c  验证码: ${otp}`, 'color: #4CAF50; font-size: 24px; font-weight: bold; padding: 8px 0;');
      console.log(`%c  邮箱: ${email}`, 'color: #666; font-size: 12px;');
      console.log(`%c  提示：这是Mock模式，请复制上方验证码到注册页面`, 'color: #666; font-style: italic; font-size: 12px;');
      console.log(`%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'color: #4CAF50;');
      
      // Store OTP in localStorage for verification
      localStorage.setItem('mock_otp_' + email, otp);
      localStorage.setItem('mock_otp_timestamp_' + email, Date.now().toString());
      
      return { data: { user: null, session: null }, error: null };
    },
    verifyOtp: async ({ email, token, type }: any) => {
      // Mock OTP verification
      const storedOtp = localStorage.getItem('mock_otp_' + email);
      const timestamp = localStorage.getItem('mock_otp_timestamp_' + email);
      
      if (!storedOtp) {
        return { data: { user: null, session: null }, error: new Error('Verification code expired or not found. Please resend') };
      }
      
      // Check if OTP is expired (5 minutes)
      if (timestamp && Date.now() - parseInt(timestamp) > 5 * 60 * 1000) {
        localStorage.removeItem('mock_otp_' + email);
        localStorage.removeItem('mock_otp_timestamp_' + email);
        return { data: { user: null, session: null }, error: new Error('Verification code expired. Please resend') };
      }
      
      if (storedOtp !== token) {
        return { data: { user: null, session: null }, error: new Error('Incorrect verification code. Please try again') };
      }
      
      // OTP is valid - register the user and sign in
      localStorage.removeItem('mock_otp_' + email);
      localStorage.removeItem('mock_otp_timestamp_' + email);
      
      // Add user to registered users list
      if (!this.registeredUsers.find(u => u.email === email)) {
        this.registeredUsers.push({ email, registeredAt: Date.now() });
        localStorage.setItem('mock_supabase_users', JSON.stringify(this.registeredUsers));
        console.log(`%c[Mock] 新用户注册成功: ${email}`, 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px;');
      }
      
      return this.mockSignIn(email);
    },
    updateUser: async (updates: any) => {
      // Mock update user - just return success
      if (this.user && updates.password) {
        console.log('[Mock] User password updated');
      }
      return { data: { user: this.user }, error: null };
    },
    signOut: async () => {
      this.user = null;
      this.session = null;
      localStorage.removeItem('mock_supabase_session');
      this.notifySubscribers('SIGNED_OUT');
      return { error: null };
    }
  };

  private mockSignIn(email: string) {
    const user = { id: 'mock-user-id-' + Date.now(), email };
    const session = { access_token: 'mock-token', user };
    this.user = user;
    this.session = session;
    localStorage.setItem('mock_supabase_session', JSON.stringify(session));
    this.notifySubscribers('SIGNED_IN');
    return { data: { user, session }, error: null };
  }

  private notifySubscribers(event: string) {
    this.authSubscribers.forEach(cb => cb(event, this.session));
  }

  from(table: string) {
    if (table !== 'notes') return { select: () => ({ data: [], error: null }) };

    return {
      select: (columns: string) => {
        return {
          eq: (field: string, value: any) => {
            // Support chaining for .eq('podcast_url', ...).eq('user_id', ...)
            const filter1 = { field, value };
            return {
              eq: (field2: string, value2: any) => {
                 return this.queryNotes([filter1, { field: field2, value: value2 }]);
              },
              order: (field: string) => this.queryNotes([filter1]) // fallback
            };
          }
        };
      },
      insert: (rows: any[]) => {
        const newRows = rows.map(r => ({
           ...r, 
           id: 'mock-note-' + Date.now() + Math.random(),
           created_at: new Date().toISOString()
        }));
        this.notes = [...this.notes, ...newRows];
        this.saveNotes();
        return { select: () => ({ single: () => ({ data: newRows[0], error: null }) }) };
      },
      delete: () => {
        return {
          eq: (field: string, value: any) => {
             return {
                eq: (field2: string, value2: any) => {
                   this.notes = this.notes.filter(n => !(n[field] === value && n[field2] === value2));
                   this.saveNotes();
                   return { error: null };
                }
             };
          }
        };
      }
    };
  }

  private queryNotes(filters: {field: string, value: any}[]) {
    let result = this.notes;
    for (const f of filters) {
      result = result.filter(n => n[f.field] === f.value);
    }
    // Simple sort support if needed, but for now just return
    return { 
      data: result, 
      error: null,
      order: () => ({ data: result, error: null }) 
    };
  }

  private saveNotes() {
    localStorage.setItem('mock_supabase_notes', JSON.stringify(this.notes));
  }
}

// Check if we should use the real client or the mock one
const shouldUseRealClient = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('YOUR_SUPABASE_URL');

if (!shouldUseRealClient) {
  console.log('%c[Supabase] Running in Mock Mode', 'background: #222; color: #bada55; font-size: 12px; padding: 4px; border-radius: 4px;');
  console.log('To use real Supabase, update your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = (shouldUseRealClient
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new MockSupabaseClient()) as any;
