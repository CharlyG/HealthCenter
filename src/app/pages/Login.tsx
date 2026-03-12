import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Heart, ChevronDown, User, Loader2 } from 'lucide-react';
import { supabaseUrl } from '../lib/supabaseClient';

// ── Demo profiles — mirror the server seed data exactly ─────────────────────
const DEMO_PROFILES = [
  {
    email: 'admin@demo.com',
    password: 'demo123',
    name: 'Sarah Admin',
    role: 'admin',
    description: 'Full system access · all modules & settings',
  },
  {
    email: 'doctor@demo.com',
    password: 'demo123',
    name: 'Dr. Michael Chen',
    role: 'physician',
    description: 'Clinical access · patients & charts',
  },
  {
    email: 'nurse@demo.com',
    password: 'demo123',
    name: 'Jennifer Martinez RN',
    role: 'nurse',
    description: 'Care delivery · visit documentation',
  },
  {
    email: 'scheduler@demo.com',
    password: 'demo123',
    name: 'David Scheduler',
    role: 'scheduler',
    description: 'Scheduling focus · create & manage visits',
  },
  {
    email: 'coordinator@demo.com',
    password: 'demo123',
    name: 'Emily Care Coordinator',
    role: 'care_coordinator',
    description: 'Care coordination · monitor & coordinate',
  },
  {
    email: 'biller@demo.com',
    password: 'demo123',
    name: 'Robert Billing',
    role: 'billing',
    description: 'Billing & insurance · claims management',
  },
];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  physician: 'bg-blue-100 text-blue-700 border-blue-200',
  nurse: 'bg-green-100 text-green-700 border-green-200',
  scheduler: 'bg-orange-100 text-orange-700 border-orange-200',
  care_coordinator: 'bg-teal-100 text-teal-700 border-teal-200',
  billing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<typeof DEMO_PROFILES[0] | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already signed in
  useEffect(() => {
    console.log('[Login] useEffect triggered - authLoading:', authLoading, 'user:', !!user);
    if (!authLoading && user) {
      console.log('[Login] User is authenticated, redirecting to /');
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Clear any stale error messages on mount
  useEffect(() => {
    // Force clear any stale auth state on login page
    console.log('[Login] Login page mounted');
    
    // Test Supabase connectivity
    const testConnection = async () => {
      try {
        console.log('[Login] Testing Supabase connection...');
        const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
          method: 'GET',
        });
        console.log('[Login] Supabase health check status:', response.status);
        const data = await response.text();
        console.log('[Login] Supabase health check response:', data);
      } catch (err) {
        console.error('[Login] Supabase health check failed:', err);
      }
    };
    
    testConnection();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectDemo = (profile: typeof DEMO_PROFILES[0]) => {
    setSelectedDemo(profile);
    setEmail(profile.email);
    setPassword(profile.password);
    setDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Signed in successfully');
      // Don't navigate here - let the useEffect handle it after state updates
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to sign in');
      setLoading(false); // Only reset loading on error
    }
    // Note: Don't reset loading on success - let the redirect happen
  };

  if (authLoading) {
    return (
      <div className="size-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="size-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="size-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">HealthCare Platform</CardTitle>
          <CardDescription className="text-gray-500">
            HIPAA-compliant care management system
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* ── Quick Access (Demo Users) dropdown ─────────────────────── */}
          <div className="space-y-1.5" ref={dropdownRef}>
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Quick Access (Demo Users)
            </Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border-2 border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {selectedDemo ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="size-4 text-blue-600 shrink-0" />
                    <span className="font-medium text-gray-900 truncate">{selectedDemo.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium shrink-0 ${ROLE_COLORS[selectedDemo.role] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {selectedDemo.role.replace('_', ' ')}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500">Select a demo user to auto-fill credentials…</span>
                )}
                <ChevronDown className={`size-4 text-blue-500 shrink-0 ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  {DEMO_PROFILES.map((profile) => (
                    <button
                      key={profile.email}
                      type="button"
                      onClick={() => handleSelectDemo(profile)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-gray-900 text-sm group-hover:text-blue-700">
                          {profile.name}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border font-medium shrink-0 ${ROLE_COLORS[profile.role] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {profile.role.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{profile.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedDemo && (
              <p className="text-xs text-blue-600 pl-1">
                Credentials filled — click <strong>Sign In</strong> to continue.
              </p>
            )}
          </div>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or enter manually</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ── Credentials form ───────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="provider@healthcare.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSelectedDemo(null); }}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); }}
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? (
                <><Loader2 className="size-4 mr-2 animate-spin" />Signing in…</>
              ) : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400">
            ⚠️ Development environment only · Not for PHI/PII
          </p>

          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 text-center">
            💡 If you see "Invalid JWT" errors, the database was recently reset. Please use the demo user dropdown above to sign in with fresh credentials.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}