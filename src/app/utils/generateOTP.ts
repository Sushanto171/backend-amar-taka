export const generateOTP = (length: 6) => {
  const otp = Math.floor(Math.random() * 10 ** length).toString();
  return otp;
};
