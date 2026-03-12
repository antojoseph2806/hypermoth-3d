import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ detail: 'No token provided' });
    }

    const token = authHeader.substring(7);
    console.log(`Received token (first 20 chars): ${token.substring(0, 20)}...`);

    if (!token) {
      return res.status(401).json({ detail: 'No token provided' });
    }

    try {
      // Try to verify with Supabase first
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        // Fallback to JWT decode
        const payload = jwt.verify(
          token,
          process.env.SUPABASE_JWT_SECRET,
          {
            algorithms: ['HS256'],
            audience: 'authenticated'
          }
        );
        
        console.log(`Token decoded successfully with JWT for user: ${payload.sub}`);
        req.user = {
          sub: payload.sub,
          email: payload.email,
          user_metadata: payload.user_metadata || {}
        };
      } else {
        console.log(`Token verified successfully for user: ${user.id}`);
        req.user = {
          sub: user.id,
          email: user.email,
          user_metadata: user.user_metadata || {}
        };
      }
      
      next();
    } catch (jwtError) {
      console.log(`JWT verification error: ${jwtError.message}`);
      return res.status(401).json({ detail: 'Invalid token' });
    }
  } catch (error) {
    console.log(`Unexpected auth error: ${error.message}`);
    return res.status(401).json({ detail: 'Authentication failed' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.user_metadata?.role !== 'admin') {
    return res.status(403).json({ detail: 'Admin access required' });
  }
  next();
};
