// Type augmentation for Express to recognize req.user (Supabase User)
import { User } from '@supabase/supabase-js';

// This ensures that anywhere in your backend, req.user is typed as Supabase User
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {}; // Required to make this a module
