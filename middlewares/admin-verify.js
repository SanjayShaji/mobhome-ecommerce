
function verifyAdmin(req, res, next) {
    if (req.session.adminLoggedIn) {
      return next();
    }
    res.redirect('/admin/login')
  }

  module.exports = {
    verifyAdmin
  }