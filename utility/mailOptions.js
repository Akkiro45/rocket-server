const getMailOptions = (token, emailId) => {
  const {getResetPasswordLink} = require('./utility');
  return {
    from: 'rocket.linksaver@gmail.com',
    to: emailId,
    subject: 'Reset Password for Rocket link saver account!',
    html: `Click on below link to reset your password!
          <br></br>
          <a href=${getResetPasswordLink(token)}>${getResetPasswordLink(token)}</a>
          <br></br>
          This link is valid for only 1hour and make sure no other person get this link because anyone with this link will be able to change your password.`
  }
}

module.exports = getMailOptions;
