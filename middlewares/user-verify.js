const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')

function verifySignup(req, res, next) {
    userHelpers.doVerifySignup(req.body).then(verify => {
      if (verify) {
        req.session.signupErr = "Email already exists";
        return res.redirect('/signup');
      } else {
        // res.redirect('/login')
        next();
      }
    })
  }

  function verifyUser(req, res, next) {
    if (req.session.userLoggedIn) {
      return next();
    }
    return res.redirect('/login')
  }
  
//   const userProductListPageination = async(req, res, next)=>{
//     const page = parseInt(req.query.page)
//     // const limit = parseInt(req.query.limit)
//     const limit = 3
//     const startIndex = (page - 1) * limit
//     const endIndex = page * limit
//     console.log(page);
//     const results = {}
//     let productsCount=await productHelpers.getProductsCount()

//     if (endIndex < productsCount) {
//       results.next = {
//         page: page + 1,
//         limit: limit
//       }
//     }
    
//     if (startIndex > 0) {
//       results.previous = {
//         page: page - 1,
//         limit: limit
//       }
//     }
//     try {
//       results.products = await productHelpers.getPaginatedResult(limit,startIndex)
//       results.pageCount =Math.ceil(parseInt(productsCount)/parseInt(limit)).toString()
//       results.pages =Array.from({length: results.pageCount}, (_, i) => i + 1)
//       results.currentPage =page.toString()
//       results.limit=limit
//       results.startIndex=startIndex
//       res.paginatedResults = results
//       next()
//     } catch (e) {
//       res.status(500).json({ message: e.message })
//     }
  
// }
  function notVerifyUser(req, res, next) {
    if (req.session.userLoggedIn) {
      return res.redirect('/')
    }
    next();
  }

  module.exports = {
    verifySignup,
    verifyUser,
    notVerifyUser
  }
