import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Always set loading to false immediately after auth state change
        setLoading(false);
        
        // Fetch user role if authenticated (non-blocking)
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('user_id', session.user.id)
                .single();
              
              console.log('Profile loaded:', profile);
              setUserRole(profile?.role || 'user');
            } catch (error) {
              console.error('Profile loading error:', error);
              setUserRole('user');
            }
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false); // Set loading to false immediately
      
      // Fetch user role if authenticated (non-blocking)
      if (session?.user) {
        (async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();
            
            console.log('Initial profile loaded:', profile);
            setUserRole(profile?.role || 'user');
          } catch (error) {
            console.error('Initial profile loading error:', error);
            setUserRole('user');
          }
        })();
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName
        }
      }
    });

    if (error) {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Registrierung erfolgreich",
        description: "Bitte überprüfe deine E-Mails zur Bestätigung."
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Anmeldung erfolgreich",
        description: "Willkommen zurück!"
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Abmeldung erfolgreich",
      description: "Bis bald!"
    });
  };

  const isAdmin = userRole === 'admin' || userRole === 'moderator';

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
    userRole
  };
};

export { AuthContext };