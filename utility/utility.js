const expirationTime = 60 * 60 * 1000 // 1 Houre

const getResetPasswordLink = (token) => {
  return `https://rocket.linksaver.web.app/reset/password/?token=${token}`;
}

module.exports = {
  expirationTime,
  getResetPasswordLink
}
