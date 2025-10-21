import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '../../../db/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  console.log(req.body);
  const { email, password, verificationCode} = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser && !existingUser.is_temporary) {
      return res.status(400).json({ message: 'User already exists' });
    }
    if(!existingUser) {
      return res.status(400).json({ message: 'Please send the verification code first' });
    }
    
    if (existingUser && existingUser.verificationCode !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

   existingUser.password = password;
   existingUser.is_temporary = false;
   existingUser.access_level = 'read';
   existingUser.verificationCode = null;
   await existingUser.save();

    // Return user data (without password)
    const userResponse = {
      id: existingUser._id,
      email: existingUser.email,
      is_temporary: existingUser.is_temporary,
      access_level: existingUser.access_level,
      createdAt: existingUser.createdAt,
      updatedAt: existingUser.updatedAt
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
