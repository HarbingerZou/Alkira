import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '../../../db/models/User';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email parameter is required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data (without password)
    const userResponse = {
      id: user._id,
      email: user.email,
      is_temporary: user.is_temporary,
      access_level: user.access_level,
      verificationCode: user.verificationCode,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      user: userResponse
    });

  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
}

export default handler;
