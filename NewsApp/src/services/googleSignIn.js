import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import supabaseAuthService from './supabaseAuthService';

class GoogleSignInService {
  constructor() {
    this.configureGoogleSignIn();
  }

  // Configure Google Sign-In (exact from Supabase docs)
  configureGoogleSignIn() {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      webClientId: '1037806407817-74m2hjth7i31u2410biova9dsl3ph74l.apps.googleusercontent.com', // Your Google Web Client ID
    });
  }

  // Sign in with Google (exact from Supabase docs)
  async signIn() {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (userInfo.data.idToken) {
        const { data, error } = await supabaseAuthService.supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        });

        if (error) {
          throw new Error(`Supabase authentication failed: ${error.message}`);
        }

        console.log('Supabase auth result:', error, data);

        // Get the user session
        const { data: { session }, error: sessionError } = await supabaseAuthService.supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error('Failed to get user session after Google Sign-In');
        }

        // Bridge to your backend API
        const backendResult = await supabaseAuthService.authenticateWithBackend(session);
        
        return {
          success: true,
          userInfo: userInfo,
          supabaseUser: session.user,
          session: session,
          backendAuth: backendResult,
        };
      } else {
        throw new Error('no ID token present!');
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        throw new Error('Google Sign-In was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
        throw new Error('Google Sign-In is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        throw new Error('Google Play Services not available');
      } else {
        // some other error happened
        throw new Error(`Google Sign-In failed: ${error.message}`);
      }
    }
  }

  // Sign out
  async signOut() {
    try {
      await GoogleSignin.signOut();
      await supabaseAuthService.signOut();
      return { success: true };
    } catch (error) {
      console.error('Google Sign-Out error:', error);
      throw new Error('Google Sign-Out failed: ' + error.message);
    }
  }

  // Check if user is signed in
  async isSignedIn() {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      return isSignedIn;
    } catch (error) {
      console.error('Check sign-in status error:', error);
      return false;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      return currentUser;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
}

export default new GoogleSignInService(); 