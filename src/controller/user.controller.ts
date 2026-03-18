import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import config from '../config/db';
import { User } from '../models/user.model';

// Generate tokens helper
const generateTokens = (email: string, role: string) => {
  const accessToken = jwt.sign(
    { email, role, type: 'access' },
    config.jwt_secret as Secret,
    { expiresIn: '15m' } // Short lived access token
  );

  const refreshToken = jwt.sign(
    { email, role, type: 'refresh' },
    config.jwt_secret as Secret,
    { expiresIn: '7d' } // Long lived refresh token
  );

  return { accessToken, refreshToken };
};

// Register user
const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, avatar } = req.body;
    
    // Check if user already exists
    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return res.status(400).json({
        success: false,
        message: 'User already exists!',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    // Create user
    const savedUser = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: avatar || ''
    });

    // Omit password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please login to get access token.',
      data: userResponse,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: err.message,
    });
  }
};

// Login user
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password as string);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(user.email, user.role);

    // Omit password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: {
        user: userResponse,
        accessToken,
        refreshToken,
      },
    });

  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: err.message,
    });
  }
};

// Get all users
const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: err.message,
    });
  }
};

// Get user by ID
const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      data: user,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: err.message,
    });
  }
};

// Update user
const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, avatar },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: err.message,
    });
  }
};

// Delete user
const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: err.message,
    });
  }
};

// Refresh token
const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt_secret as Secret) as { 
      email: string; 
      role: string; 
      type: string 
    };

    // Check if it's a refresh token
    if (decoded.type !== 'refresh') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token type',
      });
    }

    // Generate new tokens
    const tokens = generateTokens(decoded.email, decoded.role);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    });

  } catch (err: any) {
    res.status(403).json({
      success: false,
      message: 'Invalid or expired refresh token',
      error: err.message,
    });
  }
};

export const userControllers = {
  register,
  login,
  refreshToken,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};