import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import {
  USER_TEMPORARY_TOKEN_EXPIRY
} from "../constants/constants"
interface AccessTokenPayload {
  email: string;
  id: string;
  firstName: string;
  lastName: string
  phoneNumber: string;
}

interface RefreshTokenPayload {
  id: string;
}

export const isPasswordCorrect = async function (
  password: string,
  hashedPassword: string
) {
  return await bcrypt.compare(password, hashedPassword);
};

export function generateAccessToken(user: AccessTokenPayload) {
  const options: SignOptions = {
    expiresIn: '2d',
  };
  return jwt.sign(
    {
      email: user.email,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
    },
    process.env.ACCESS_TOKEN_SECRET_KEY! as Secret,
    options
  );
}

export function generateRefreshToken(user: RefreshTokenPayload) {
  const options: SignOptions = {
    expiresIn: '7d',
  };
  return jwt.sign(
    {
      id: user.id,
    },
    process.env.REFRESH_TOKEN_SECRET_KEY as Secret,
    options
  );
}

export function generateRandomToken() {
  const unhashedToken = crypto.randomBytes(20).toString('hex'); // This will used for token verfication

  const hashedToken = crypto
    .createHash('sha256')
    .update(unhashedToken)
    .digest('hex');
  
  const expiryTime = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

  return { unhashedToken, hashedToken, expiryTime };
}
