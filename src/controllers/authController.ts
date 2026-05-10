import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { generateToken } from '../utils/jwt';

export const signup = async (req: Request, res: Response) => {
  try {
    console.log('Signup Request Body:', req.body);
    const { email, password, name, phone, city, country, bio } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
        city,
        country,
        bio
      } as any
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Signup error DETAILS:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Special handling for Admin Login
    if (email === 'admin@travelloop.com' && password === 'TLadmin@123') {
      let admin = await prisma.user.findUnique({ where: { email } });
      
      if (!admin) {
        const passwordHash = await bcrypt.hash(password, 10);
        admin = await prisma.user.create({
          data: {
            email,
            passwordHash,
            name: 'Super Admin',
            role: 'ADMIN'
          }
        });
      } else {
        // Force update role to ADMIN every time they login with these credentials
        admin = await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN' }
        });
      }

      const token = generateToken(admin.id);
      return res.json({
        message: 'Admin login successful',
        token,
        user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, photoUrl: user.photoUrl, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
