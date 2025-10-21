import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, JWTPayload } from './jwt';

// Extend NextApiRequest to include user
declare module 'next' {
  interface NextApiRequest {
    user?: JWTPayload;
  }
}

export const authenticateToken = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        console.log('authenticateToken', req.cookies);
      // Get token from cookie
      const token = req.cookies['auth-token'];

      if (!token) {
        return res.status(401).json({ message: 'Access token required' });
      }

      // Verify token
      const decoded = verifyToken(token);
      req.user = decoded;

      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};

// Helper function to get user from request
export const getUserFromRequest = (req: NextApiRequest): JWTPayload | null => {
  try {
    const token = req.cookies['auth-token'];
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    return null;
  }
};
