const express = require('express');
const router = express.Router();
const userHelpers = require('../helpers/user-helpers')


const {verifyUser, verifySignup, notVerifyUser} = require('../middlewares/user-verify')

const {userProductListPageination} = require('../middlewares/middlewares')

const {
  homePage, 
  signUpPage, 
  doSignup,
  loginPage,
  doLogin,
  otpLoginPage,
  doOtpLogin,
  otpVerifyPage,
  doOtpVerify,
  logout,
  doOtpResent,
  viewProduct,
  searchProduct,
  doFilterProduct,
  getCart,
  addToCart,
  changeProductQuantity,
  placeOrder,
  checkout,
  verifyPayment,
  orderSuccess,
  paypalOrderSuccess,
  getUserOrders,
  viewOrderProducts,
  addAddress,
  doAddAddress,
  dashBoard,
  orderCancel,
  applyCoupon,
  paypalPayment,
  paypalOrderCancel,
  wishlist,
  addToWishList,
  returnOrder,
  locals,
  removeCart,
  removeWishListItem,
  productOrderCancel,
  editAddress,
  changePassword,
  addressPage,
  deleteAddress,
  profilePage,
  productList,
  invoice
}= require('../controllers/user-controller');

const cartHelpers = require('../helpers/cart-helpers');
const wishlistHelpers = require('../helpers/wishlist-helpers');

///////////////////////////////////////////////////////


router.use('/', locals);

/* GET users listing. */
router.get('/', homePage);

// user authentification
router.get('/signup',notVerifyUser, signUpPage)

router.post('/signup', verifySignup, doSignup)

router.get('/login', loginPage)

router.post('/login', doLogin)

router.get('/otp-login', otpLoginPage)

router.post('/otp-login', doOtpLogin)

router.get('/otp-verify', otpVerifyPage)

router.get('/logout', logout)

router.post('/resent',notVerifyUser, doOtpResent)

router.post('/otp-verify',notVerifyUser, doOtpVerify)

//user authentication-end

//////////////////////////////////////////////////////////////////////////


router.get('/view-product/:id',  viewProduct)

router.post('/search-product', searchProduct)

router.get('/product-list/', userProductListPageination, productList)

router.post('/filter', doFilterProduct)

router.get('/cart', getCart)

router.get('/add-to-cart/:id', addToCart)

router.post('/change-product-quantity', changeProductQuantity)

router.get('/remove-cart/:productId/:quantity', removeCart)

router.get('/place-order',verifyUser, placeOrder)

router.post('/apply-coupon', applyCoupon)

router.post('/place-order', checkout)

router.post('/verify-payment', verifyPayment)

router.get('/order-success', verifyUser, orderSuccess)

router.get('/order-success/:id',verifyUser, paypalOrderSuccess)

router.get('/orders', verifyUser, getUserOrders)

router.get('/invoice/:id', verifyUser, invoice)
 
router.get('/view-order-products/:id',verifyUser, viewOrderProducts)

router.get('/address', verifyUser, addressPage)

router.get('/add-address', verifyUser, addAddress)

router.post('/add-address', doAddAddress)

router.post('/edit-address/:id', editAddress)

router.get('/delete-address/:id', verifyUser, deleteAddress)

router.get('/dash-board', verifyUser, dashBoard)

router.get('/profile', verifyUser, profilePage)

router.post('/change-password', verifyUser, changePassword)

router.get('/order-cancel/:id', orderCancel)

router.get('/product-order-cancel', productOrderCancel)

router.get('/pay/:id', paypalPayment);

router.get('/cancel', paypalOrderCancel);

router.get('/wish-list', verifyUser, wishlist)

router.get('/add-to-wish-list/:id', addToWishList)

router.get('/remove-wishlist-item/:id', removeWishListItem)

router.post('/return-order', returnOrder)

module.exports = router;

