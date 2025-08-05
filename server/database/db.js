import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Check if credentials are available and valid
let supabase;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_url' || supabaseKey === 'your_supabase_anon_key') {
  console.warn('Supabase credentials are missing or using placeholder values. Using mock data instead.');
  // We'll create a mock implementation for development purposes
  supabase = createMockSupabaseClient();
} else {
  // Create actual Supabase client
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Create a mock Supabase client for development
function createMockSupabaseClient() {
  // Import mock data
  const mockData = {
    users: [],
    alumni: [],
    feedback: [],
    fundraising_campaigns: [],
    donations: [],
    notifications: [],
    college_info: [{
      id: 1,
      name: 'Demo College',
      address: '123 Education St, Knowledge City',
      phone: '+1-234-567-8900',
      email: 'info@democollege.edu',
      website: 'https://www.democollege.edu',
      description: 'A leading institution dedicated to excellence in education.',
      foundedYear: 1950,
      totalAlumni: 0,
      totalFundsRaised: 0
    }]
  };

  // Create a mock client that mimics Supabase's interface
  return {
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => ({
          single: () => Promise.resolve({ data: mockData[table]?.find(item => item[column] === value) || null, error: null }),
          then: (callback) => Promise.resolve({ data: mockData[table]?.filter(item => item[column] === value) || [], error: null }).then(callback)
        }),
        order: () => ({
          then: (callback) => Promise.resolve({ data: [...mockData[table]] || [], error: null }).then(callback)
        }),
        then: (callback) => Promise.resolve({ data: [...mockData[table]] || [], error: null }).then(callback)
      }),
      insert: (data) => ({
        then: (callback) => {
          const newItem = Array.isArray(data) ? data : { id: Date.now(), ...data };
          if (Array.isArray(data)) {
            mockData[table] = [...mockData[table], ...newItem];
          } else {
            mockData[table] = [...mockData[table], newItem];
          }
          return Promise.resolve({ data: newItem, error: null }).then(callback);
        }
      }),
      update: (data) => ({
        eq: (column, value) => ({
          then: (callback) => {
            const index = mockData[table]?.findIndex(item => item[column] === value);
            if (index !== -1) {
              mockData[table][index] = { ...mockData[table][index], ...data };
              return Promise.resolve({ data: mockData[table][index], error: null }).then(callback);
            }
            return Promise.resolve({ data: null, error: 'Item not found' }).then(callback);
          }
        })
      }),
      delete: () => ({
        eq: (column, value) => ({
          then: (callback) => {
            const index = mockData[table]?.findIndex(item => item[column] === value);
            if (index !== -1) {
              const deleted = mockData[table][index];
              mockData[table] = mockData[table].filter(item => item[column] !== value);
              return Promise.resolve({ data: deleted, error: null }).then(callback);
            }
            return Promise.resolve({ data: null, error: 'Item not found' }).then(callback);
          }
        })
      })
    }),
    auth: {
      signUp: ({ email, password }) => Promise.resolve({ 
        data: { user: { id: Date.now(), email } }, 
        error: null 
      }),
      signIn: ({ email, password }) => Promise.resolve({ 
        data: { user: mockData.users.find(u => u.email === email) || null }, 
        error: mockData.users.find(u => u.email === email) ? null : 'Invalid credentials' 
      })
    }
  };
}

export default supabase;