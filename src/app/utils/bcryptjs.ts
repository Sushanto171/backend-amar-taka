import bcrypt from "bcryptjs";
export const hashPassword = (
  plainPassword: string,
  saltRound: string 
) => {
  const hashedPassword = bcrypt.hashSync(plainPassword, Number(saltRound));
  return hashedPassword;
};

export const comparePassword = (
  hashedPassword: string,
  oldPassword: string
) => {
  const password = bcrypt.compareSync(oldPassword, hashedPassword);
  return password;
};
