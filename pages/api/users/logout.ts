import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Clear the auth cookie by setting it to expire immediately
    res.setHeader('Set-Cookie', [
      'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure'
    ]);

    res.status(200).json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Failed to logout' });
  }
}
