import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import prisma from '../utils/prismaClient';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import {
  generateAccessToken,
  generateRefreshToken,
  generateRandomToken,
  isPasswordCorrect,
} from '../utils/authUtils';
import { sendEmail } from '../utils/sendMail';
import { forgotPasswordMailContent } from '../mailTemplates/emailTemplates';

const sanitizeUser = (user: any) => ({
  id: user.id,
  email: user.email,
  phoneNumber: user.phoneNumber,
  firstName: user.firstName,
  lastName: user.lastName,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
});

// Register
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { phoneNumber, email, password, firstName, lastName } = req.body;

  if (
    [phoneNumber, email, password, firstName, lastName].some(
      (f) => !f || f.trim() === ''
    )
  ) {
    throw ApiError.badRequest('All fields are required');
  }

  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
    throw ApiError.badRequest(
      'Password must be at least 8 characters long and include both letters and numbers'
    );
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw ApiError.conflict('Email or phone number already in use');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      phoneNumber,
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
    },
  });

  const createdUser = await prisma.user.findFirst({ where: { id: user.id } });
  if (!createdUser) throw new ApiError(500, "User can't be created!");

  return res
    .status(201)
    .send(
      ApiResponse.success(
        sanitizeUser(createdUser),
        'User created successfully'
      )
    );
});

// Login
const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password || email.trim() === '' || password.trim() === '') {
    throw ApiError.badRequest('All fields are mandatory');
  }

  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });

  if (!user) throw ApiError.notFound('User not found!');

  const isPasswordValid = await isPasswordCorrect(password, user.passwordHash);
  if (!isPasswordValid)
    throw ApiError.incorrectCredentials('Incorrect password');

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    phoneNumber: user.phoneNumber,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  const refreshToken = generateRefreshToken({ id: user.id });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  };

  return res
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .status(200)
    .send(
      ApiResponse.success(sanitizeUser(user), 'User logged in successfully')
    );
});

// Logout
const logoutUser = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user?.id) throw ApiError.unauthorized('Not authenticated');

    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken: null },
    });

    return res
      .clearCookie('accessToken')
      .clearCookie('refreshToken')
      .status(200)
      .send(ApiResponse.success('User logged out successfully'));
  }
);

// Update
const updateUser = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const { email, firstName, lastName } = req.body;
    if (!email && !firstName && !lastName)
      throw ApiError.badRequest('At least one field must be provided');
    if (!req.user?.id) throw ApiError.unauthorized('Not authenticated');

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(email && { email: email.toLowerCase() }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      },
    });

    return res
      .status(200)
      .send(
        ApiResponse.success(
          sanitizeUser(updatedUser),
          'User updated successfully'
        )
      );
  }
);

// Forgot Password
const forgotPasswordRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });
    if (!user) throw ApiError.notFound('User not found with the email entered');

    const { unhashedToken, hashedToken, expiryTime } = generateRandomToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        forgottenPasswordToken: hashedToken,
        forgottenPasswordExpiryTime: new Date(expiryTime),
      },
    });

    const redirectUrl = process.env.NGROK_TEST;
    if (!redirectUrl)
      throw ApiError.internalServerError(
        'Forgot password redirect URL is not configured'
      );  

    const { subject, html } = forgotPasswordMailContent.generate(
      `${user.firstName} ${user.lastName}`,
      `${redirectUrl}/api/v0/users/reset-forgotten-password/${unhashedToken}`
    );

    try {
      await sendEmail({
        from: process.env.EMAIL_SENDER || 'no-reply@example.com',
        to: [user.email],
        subject,
        html,
      });
    } catch (error) {
      throw ApiError.internalServerError('Error in sending the email');
    }

    res.status(200).send(ApiResponse.success('Email sent successfully'));
  }
);

const resetForgottenPassword = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id: resetToken } = req.params;
    const { newPassword } = req.body;

    if (!resetToken) {
      throw ApiError.unauthorized('Reset token is required');
    }

    if (!newPassword) {
      throw ApiError.badRequest('New password is required');
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(newPassword)) {
      throw ApiError.badRequest(
        'Password must be at least 8 characters long and include both letters and numbers'
      );
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        forgottenPasswordToken: hashedToken,
        forgottenPasswordExpiryTime: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        forgottenPasswordToken: null,
        forgottenPasswordExpiryTime: null,
      },
    });

    res
      .status(200)
      .send(ApiResponse.success('Password has been reset successfully'));
  }
);


export {
  registerUser,
  loginUser,
  logoutUser,
  updateUser,
  forgotPasswordRequest,
  resetForgottenPassword,
};
