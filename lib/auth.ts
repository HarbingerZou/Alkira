import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, JWTPayload } from './jwt';

// Extend NextApiRequest to include user
declare module 'next' {
  interface NextApiRequest {
    user?: JWTPayload;
  }
}

// For API routes
export const authenticateToken = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>, level?: "read" | "write") => {
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

      if(level && level === "write" && decoded.access_level !== "write") {
        return res.status(401).json({ message: 'Access denied, you are not authorized to access this resource' });
      }

      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};

// For getServerSideProps
export const authenticateTokenSSR = (handler: (context: GetServerSidePropsContext) => Promise<any>) => {
  return async (context: GetServerSidePropsContext) => {
    try {
      // Get token from cookie
      const token = context.req.cookies['auth-token'];

      if (!token) {
        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        };
      }
      const decoded = verifyToken(token);
      (context.req as any).user = decoded;


      // Call the original handler
      return handler(context);
    } catch (error) {
      console.error('Token verification failed:', error);
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
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
