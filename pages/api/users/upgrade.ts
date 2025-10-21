import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateToken } from '../../../lib/auth';
import { User } from '../../../db/models/User';

export default authenticateToken(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { upgradeCode } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!upgradeCode) {
      return res.status(400).json({ message: 'Upgrade code is required' });
    }

    // Check if the upgrade code is correct
    if (upgradeCode.toLowerCase() !== 'alkira') {
      return res.status(400).json({ message: 'Invalid upgrade code' });
    }

    // Find the user and update their access level
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has write access
    if (user.access_level === 'write') {
      return res.status(400).json({ message: 'User already has write access' });
    }

    // Update user's access level to write
    user.access_level = 'write';
    await user.save();

    return res.status(200).json({ 
      message: 'Successfully upgraded to write level!',
      access_level: user.access_level
    });

  } catch (error) {
    console.error('Error upgrading user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
