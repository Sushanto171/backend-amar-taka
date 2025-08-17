import bcrypt from "bcryptjs";
export const hashPassword = async (
  plainPassword: string,
  saltRound: string
) => {
  const hashedPassword = await bcrypt.hash(plainPassword, Number(saltRound));
  return hashedPassword;
};

export const comparePassword = async (
  hashedPassword: string,
  oldPassword: string
) => {
  const password = await bcrypt.compare(oldPassword, hashedPassword);
  return password;
};
