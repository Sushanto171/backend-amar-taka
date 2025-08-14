import bcrypt from "bcryptjs";
export const hashPassword = (
  plainPassword: string,
  saltRound: string | number
) => {
  const hashedPassword = bcrypt.hashSync(plainPassword, Number(saltRound));
  return hashedPassword;
};

export const comparePassword = (oldPassword: string, newPassword: string) => {
  const password = bcrypt.compareSync(newPassword, oldPassword);
  return password;
};
