import { NextApiRequest, NextApiResponse } from 'next';
import { Message } from '../../../db/models/Message';
import { authenticateToken } from '../../../lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { message } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ message: 'Message is required' });
      }

      if (message.length > 1000) {
        return res.status(400).json({ message: 'Message too long (max 1000 characters)' });
      }

      // Create new message
      const newMessage = new Message({
        message: message.trim(),
        userId: req.user!.userId
      });

      await newMessage.save();

      // Populate user info for response
      await newMessage.populate('userId', 'email');

      res.status(201).json({ message: newMessage });
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ message: 'Failed to create message' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default authenticateToken(handler);
