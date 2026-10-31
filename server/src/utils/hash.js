const bcrypt = require('bcryptjs');

async function hashPassword(plainPassword) {
  const saltRounds = 10;
  return bcrypt.hash(plainPassword, saltRounds);
}

async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  hashPassword,
  comparePassword
};
