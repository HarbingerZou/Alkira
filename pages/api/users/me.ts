import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '../../../db/models/User';
import { authenticateToken } from '../../../lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // User is already verified by authenticateToken middleware
    const user = await User.findById(req.user!.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data (without password)
    const userResponse = {
      id: user._id,
      email: user.email,
      is_temporary: user.is_temporary,
      access_level: user.access_level,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      user: userResponse
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
}

export default authenticateToken(handler);
