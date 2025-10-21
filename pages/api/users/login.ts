import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '../../../db/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, verificationCode } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if(!verificationCode) {
    return res.status(400).json({ message: 'Verification code is required' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user || user.is_temporary) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if(user.verificationCode !== verificationCode) {
      return res.status(401).json({ message: 'Invalid verification code' });
    }
    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
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
      message: 'Login successful',
      user: userResponse
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
}
