import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { User } from '../../db/models/User';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Generate verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  const existingUser = await User.findOne({ email });

  if(existingUser) {
    existingUser.verificationCode = verificationCode;
    await existingUser.save();
  
  }else{
    const user = new User({
      email,
      is_temporary: true,
      access_level: null,
      verificationCode: verificationCode
    });
    await user.save();
  }

  try {
    // Configure transporter for Gmail (you can change this to your preferred email service)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can also use 'outlook', 'yahoo', etc.
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your Gmail App Password (16 characters)
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Thank you for signing up! Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this verification code, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // In a real application, you would store this verification code in a database
    // with an expiration time and associate it with the email
    console.log(`Verification code ${verificationCode} sent to ${email}`);

    res.status(200).json({ 
      message: 'Verification code sent successfully',
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send verification email' });
  }
}
