export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const isValidPassword = (password) => {
  // At least 8 characters, at least one letter and one number
  return password && password.length >= 8;
};

export const isValidCardNumber = (cardNumber) => {
  const sanitized = cardNumber.replace(/\D/g, '');
  return sanitized.length >= 13 && sanitized.length <= 19;
};
