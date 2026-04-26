/**
 * Email validation - checks if email format is valid
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation - ensures strong password
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long."
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter."
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter."
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number."
    };
  }

  if (!/[!@#$%^&*]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one special character (!@#$%^&*)."
    };
  }

  return {
    valid: true,
    message: "Password is strong."
  };
};

/**
 * Name validation
 */
const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return {
      valid: false,
      message: "Name must be at least 2 characters long."
    };
  }

  if (name.trim().length > 100) {
    return {
      valid: false,
      message: "Name must not exceed 100 characters."
    };
  }

  return { valid: true };
};

/**
 * Phone number validation (optional)
 */
const validatePhone = (phone) => {
  if (!phone) return { valid: true }; // Optional field
  
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return {
      valid: false,
      message: "Phone number format is invalid."
    };
  }

  return { valid: true };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone
};