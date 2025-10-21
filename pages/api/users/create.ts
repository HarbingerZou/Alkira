import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '../../../db/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, is_temporary, access_level } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Validate access level
  if (access_level && !['read', 'write'].includes(access_level)) {
    return res.status(400).json({ message: 'Invalid access level' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && !existingUser.is_temporary) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      is_temporary: is_temporary || false,
      access_level: access_level || 'read'
    });

    // Save user to database
    await user.save();

    // Return user data (without password)
    const userResponse = {
      id: user._id,
      email: user.email,
      is_temporary: user.is_temporary,
      access_level: user.access_level,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
}
