import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { envVars } from "../config/env.config";
import { IUser } from "../modules/user/user.interface";

export const generateToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: string
) => {
  const token = jwt.sign(payload, secret, { expiresIn } as SignOptions);
  return token;
};

export const createUserTokens = (user: IUser) => {
  const jwtPayload = {
    role: user.role,
    userId: user._id,
    phone: user.phone,
    email: user.email,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT.JWT_ACCESS_SECRET,
    envVars.JWT.JWT_ACCESS_EXPIRATION
  );
  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT.JWT_REFRESH_SECRET,
    envVars.JWT.JWT_REFRESH_EXPIRATION
  );
  return { accessToken, refreshToken };
};
