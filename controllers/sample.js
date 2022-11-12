const productHelpers = require('../helpers/product-helpers')
const categoryHelpers = require('../helpers/category-helpers')
const brandHelpers = require('../helpers/brand-helpers')
const orderHelpers = require('../helpers/order-helpers')
const cartHelpers = require('../helpers/cart-helpers')
const couponHelpers = require('../helpers/coupon-helpers')
const addressHelpers = require('../helpers/address-helpers')
const userHelpers = require('../helpers/user-helpers')
const wishlistHelpers = require('../helpers/wishlist-helpers')
const bannerHelpers = require('../helpers/banner-helpers')

require("dotenv").config();

const accountSID = process.env.ACCOUNTSID;
const authToken = process.env.AUTHTOKEN;
const serviceID = process.env.SERVICEID
const client = require('twilio')(accountSID, authToken)


/////////////////////////////////////////////////
const paypal = require('paypal-rest-sdk');
 
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AY7DSk2xHLsEkdRMAsomer-OXXJlzvksmQQgFJOK90Loi4U_xlAgpQPuvUUIF2TLsXpwY6W2gYvfThxw',
  'client_secret': 'EAqVScFXMqSCgQ48Z7qF1bNhlmrn8HikSaXSZaPt4K0hfkrLFkirF0clWs8q88Zx_LdvymsEcYcXvdUH'
})

//////////////////////////////////////////////////////
let cartCount = null;
let wishListCount = null;
let guestUserCart = [];
// let guestAddToCart = null
// let wishlistArray = null;
const locals = async function (req, res, next) {
  try {
    if (req.session.user) {
      if(req.session.guestUserCartCount){
        guestAddToCart =await cartHelpers.AddToGuestUserCart(req.session.guestUserCart, req.session.user._id)
        req.session.guestUserCart=''
        req.session.guestUserCartCount=''
        res.locals.guestUserCart = null;
        res.locals.guestUserCartCount = null;
      }
      res.locals.userLoggedIn = true
      res.locals.userName = req.session.user.name
      cartCount = await cartHelpers.getCartCount(req.session.user._id)
      wishListCount = await wishlistHelpers.getWishListCount(req.session.user._id)

      res.locals.cartCount = cartCount;
      res.locals.wishListCount = wishListCount;

      // res.locals.guestUserCart = null;
      // res.locals.guestUserCartCount = null;
    } else {
      if(req.session.guestUserCart){
      res.locals.guestUserCart = req.session.guestUserCart;
      res.locals.guestUserCartCount = req.session.guestUserCartCount;
      // cartCount = null
      res.locals.result = await productHelpers.guestUserCart(req.session.guestUserCart)
      res.locals.cartCount = 0
      res.locals.wishListCount = null
    }else{
      req.session.guestUserCart = null;
    }
  }
    req.app.locals.layout = 'layout'
    next(); // pass control to the next handler
    
  } catch (error) {
    console.log(error)
  }
  }

  const homePage = async function (req, res, next) {
    try {
      let vUser = req.session.user;
      let brand =await brandHelpers.getAllBrandDetails();
      let products = await productHelpers.getAllProducts();
      let banner = await bannerHelpers.getAllBannerDetails();
      let cart = ''
      let wishlist = ''
      if(req.session.userLoggedIn){
        
        if(res.locals.wishListCount){
          wishlist = await wishlistHelpers.getWishListProductList(req.session.user._id)
        }
        if(res.locals.cartCount){
          cart = await cartHelpers.getCartProductList(req.session.user._id)
        }
      }
      // console.log(brand);
      console.log("===========session");
      console.log(req.session);
      console.log("========================");
      //console.log("--=-=-=products=-=-=-");
      // console.log(products);
      // console.log("--=-=-=products=-=-=-");
      
      // console.log("--=-=-=cart=-=-=-");
      // console.log(wishlist);
      // console.log(cart);
      // console.log("--=-=-=cart=-=-=-");
      
      // console.log("========================");
      
      // console.log(req.session);
      console.log(res.locals);
      res.render('users/home', { vUser, brand, products, wishlist, cart, banner, user: true });
          
    } catch (error) {
      console.log(error)
    }
  }

  const signUpPage = (req, res, next) => {
    try {
      if (req.session.signupErr) {
        res.render('users/signup', { signupErr: req.session.signupErr });
        console.log(req.session);
        return req.session.signupErr = false;
      }
      res.render('users/signup');
      
    } catch (error) {
      console.log(error)
    }
  }

  const doSignup = (req, res) => {
    try {
      userHelpers.doSignup(req.body).then((data) => {
        console.log(data);
        userHelpers.getUsertDetails(data.insertedId).then(response => {
          req.session.userLoggedIn = true;
          req.session.user = response;
          res.redirect('/')
          console.log(response);
        })
      }).catch(err => {
        if (err) throw err;
        // res.redirect('/signup')
      })
      
    } catch (error) {
      console.log(error)
    }
  }

  const loginPage = (req, res, next) => {
    try {
      if (req.session.userLoggedIn) {
        res.redirect('/')
      } else {
        res.render('users/login', {user:true, links:true, loginErr: req.session.loginErr })
        req.session.loginErr = false;
      }
      
    } catch (error) {
      console.log(error)
    }
  }

  const doLogin = (req, res) => {
    try {
      userHelpers.doLogin(req.body).then(response => {
        if (response.status) {
          if (response.user.status) {
            req.session.userLoggedIn = true;
            req.session.user = response.user;
            console.log(req.session)
            res.redirect('/');
          } else {
            req.session.loginErr = "user is blocked"
            res.redirect('/login')
          }
        } else {
          req.session.loginErr = "invalid user";
          res.redirect('/login')
        }
      }).catch(error=>{
        console.log(error)
      })
      
    } catch (error) {
      console.log(error)
    }
  }

  const otpLoginPage = (req, res) => {
    try {
      if (req.session.otpLoginErr) {
        res.render('users/otp-login', {user:true, otpLoginErr: req.session.otpLoginErr })
        return req.session.otpLoginErr = false;
      }
      res.render('users/otp-login',{user:true})
      
    } catch (error) {
      console.log(error)
    }
  }

  const doOtpLogin = (req, res) => {
    try {
      userHelpers.doOtpLogin(req.body).then((response) => {
        if (response.status) {
          if(response.user.status){
            req.session.phoneNumber = req.body.phoneNumber;
            console.log(req.session);
            client.verify.services(serviceID).verifications.create({
              to: `+91${req.body.phoneNumber}`,
              channel: 'sms',
            }).then((data) => {
              if (data) {
                console.log("verification sent");
                res.redirect('/otp-verify');
              }
            })
          }else{
            req.session.otpLoginErr = "user is blocked";
            res.redirect('/otp-login')
          }
        } else {
          req.session.otpLoginErr = "Invalid phone number";
          res.redirect('/otp-login')
        }
      }).catch(error=>{
        console.log(error)
      })
      
    } catch (error) {
      console.log(error)
    }
  }

  const otpVerifyPage = (req, res) => {
    try {
      if (req.session.otpCodeErr) {
        res.render('users/otp-verify', { otpCodeErr: req.session.otpCodeErr })
        return req.session.otpCodeErr = false;
      }
      res.render('users/otp-verify', {user:true})
      
    } catch (error) {
      console.log(error)
    }
  }

  const doOtpVerify = (req, res) => {
    try {
      req.session.code = req.body.code;
    
      client.verify.services(serviceID).verificationChecks.create({
        to: `+91${req.session.phoneNumber}`,
        code: req.session.code
      }).then((data) => {
        if (data.status === 'approved') {
          console.log("user is verified");
          userHelpers.doOtpLogin(req.session).then((response) => {
            if (response.status) {
              req.session.user = response.user;
              req.session.userLoggedIn = true;
              req.session.phoneNumber = false;
              console.log(req.session);
              res.redirect('/');
            }
          })
        } else {
          req.session.otpCodeErr = "Invalid otp-number"
          console.log('user is not verified');
          res.redirect('/otp-verify');
        }
      }).catch(error=>{
        console.log(error)
      })
      
    } catch (error) {
      console.log(error)
    }
  }

  const doOtpResent = (req, res) => {
    try {
      client.verify.services(serviceID).verifications.create({
        to: `+91${req.session.phoneNumber}`,
        channel: 'sms',
      }).then((data) => {
        if (data) {
          console.log('otp resent sent');
          res.redirect('/otp-verify')
        }
      }).catch(error=>{
        console.log(error)
      })
      
    } catch (error) {
      console.log(error)
    }
  }

  const logout = (req, res) => {
    try {
      req.session.user = null;
      req.session.userLoggedIn = false;
      res.redirect('/login')
      
    } catch (error) {
      console.log(error)
    }
  }

  const viewProduct = (req, res, next) => {
    try {
      let productId = req.params.id;
      productHelpers.getProductDetails(productId).then(product => {
        res.render('./users/view-product', {vUser: req.session.user, product, user: true })
        console.log(product);
      }).catch(error=>{
        console.log(error)
      })
      
    } catch (error) {
      console.log(error)
    }
  }

  const searchProducts = async(req, res, next) => {
    try {
      // let user = req.session.user;
      // let products = await productHelpers.getAllProducts();
      let products =res.paginatedResults.products;
  
      let results = res.paginatedResults
      console.log(results);
      // let filter  = await userHelpers
      let categories = await categoryHelpers.getALlCategories();
      let brands = await brandHelpers.getAllBrandDetails();
      if(req.session.filterProduct){
        products = req.session.filterProduct
      }
      res.render('users/search-product', {vUser: req.session.user, user:true, products, results, categories, brands});
      req.session.filterProduct= false
      
    } catch (error) {
      console.log(error)
    }
  }

  const searchProduct = async(req,res)=>{
    try {
      let payload = req.body.payload.trim();
      let search = await productHelpers.searchProduct(payload)
      console.log(payload);
      res.send({payload: search})
      
    } catch (error) {
      console.log(error)
    }
  }

  const doFilterProduct = async(req,res)=>{
    try {
      console.log("/////////////////////");
      console.log(req.body)
      console.log("/////////////////////");
      // let categories = await userHelpers.getALlCategories();
      // let brands = await userHelpers.getAllBrandDetails();
      productHelpers.filterProduct(req.body.brand).then((products)=>{
        req.session.filterProduct = products;
        console.log(req.session);
        res.redirect('/search-products/?page=1')
        // res.render('users/search-product', {user: true, products, categories, brands})
      }).catch(error=>{
        console.log(error)
      })
      
    } catch (error) {
      console.log(error)
    }
  
  }
  

  const getCart = async(req,res)=>{
    try {
      // let cart = await userHelpers.cartCheck();
      if(req.session.userLoggedIn){
        let cartCount = await cartHelpers.getCartCount(req.session.user._id);
      if(cartCount!=0){
        req.session.user.cartCount = cartCount;
        let cartItems = await cartHelpers.getCartProducts(req.session.user._id);
        let totalPrice = await cartHelpers.getTotalPrice(req.session.user._id);
        let totalAmount = await cartHelpers.getTotalAmount(req.session.user._id);
        let totalDiscount = await cartHelpers.getTotalDiscountedAmount(req.session.user._id);
        let couponPrice = await couponHelpers.getCouponPrice(req.session.user._id, totalPrice);
    
        return res.render('users/cart',{user:true, totalPrice, totalDiscount, totalAmount, cartItems, couponPrice, cartCount, vUser: req.session.user});
      }
    }else{
      
    }
      res.render('users/cart',{user:true, vUser: req.session.user});
      
    } catch (error) {
      console.log(error)
    }
  
  }

  const addToCart = async(req,res)=>{
    try {
      if(req.session.userLoggedIn){
        req.session.guestUserCart =null
        console.log('api call');
        cartHelpers.addToCart(req.params.id, req.session.user._id).then(async()=>{
          // res.render('users/cart', {user:true})
          // let cart = await cartHelpers.getCartProductList(req.session.user._id)
          // let product = await productHelpers.getProductDetails(req.params.id)
          let response = {}
          // response.cart = cart
          // response.stock = product.stock
          response.status = true
          // res.redirect('/')
          res.json(response)
        }).catch((error)=>{
          res.json({status: false})
          console.log(error)
        })

      }else{
        guestUserCart.push(req.params.id)
        req.session.guestUserCart = guestUserCart;
        req.session.guestUserCartCount = req.session.guestUserCart.length
        console.log("--=--cart-=-=");
        console.log(req.params.id)
        console.log(req.session)
        console.log(res.locals);
        console.log("--=--cart-=-=");
        let response = {}
        response.status = true;
        response.cart = req.session.guestUserCart
        // res.result = await productHelpers.guestUserCart(req.session.guestUserCart)
        // console.log(res.result)
        // res.results = response
        res.json(response)
      }
      
    } catch (error) {
      console.log(error)
    }
  }

  const changeProductQuantity = (req,res)=>{
    try {
      console.log(req.body);
      cartHelpers.changeProductQuantity(req.body).then(async(resp)=>{
        let response = {}
        response.totalPrice = await cartHelpers.getTotalPrice(req.body.user);
        response.totalAmount = await cartHelpers.getTotalAmount(req.body.user);
        response.totalDiscount = await cartHelpers.getTotalDiscountedAmount(req.body.user);
        response.stock = await productHelpers.getStockCount(req.body.product)
        response.limit = resp.limit;
        res.json(response)
      }).catch(error=>{
        console.log(error)
      })
      
    } catch (error) {
      console.log(error)
    }
  }

  const removeCart = (req,res)=>{
    try {
      let productId = req.params.productId;
      let quantity = req.params.quantity;
      console.log(quantity)
      if(req.session.userLoggedIn){
          cartHelpers.removeCart(productId, quantity, req.session.user._id).then(()=>{
          res.redirect('/cart');
        })
      }
      
    } catch (error) {
      console.log(error)
    }
  }

  const placeOrder = async(req,res)=>{
    try {
      let cart = await cartHelpers.getCartCount(req.session.user._id);
  
      if(cart){
      let totalPrice =await cartHelpers.getTotalPrice(req.session.user._id);
      let totalAmount = await cartHelpers.getTotalAmount(req.session.user._id);
      let totalDiscount = await cartHelpers.getTotalDiscountedAmount(req.session.user._id);
      let address = await addressHelpers.getUserAddress(req.session.user._id);
      let applyCouponResult = ''
      if(req.session.applyCoupon){
        applyCouponResult = req.session.applyCoupon;
        console.log(req.session);
      }
      res.render('users/place-order', {user:true, vUser: req.session.user, applyCouponResult, totalPrice, totalAmount, totalDiscount, address})
    }else{
      res.redirect('/cart')
    }
      
    } catch (error) {
      console.log(error)
    }
  }


  const applyCoupon = async(req,res)=>{
    try {
      console.log(req.body);
      let code = req.body.code;
      let total = await cartHelpers.getTotalAmount(req.session.user._id) 
      let applyCoupon = await couponHelpers.applyCoupon(req.body, total, req.session.user._id)
      console.log(applyCoupon);
      console.log(total);
      req.session.applyCoupon = applyCoupon
      req.session.applyCoupon.code = code
  
      res.redirect('place-order')
      // req.session.applyCoupon.couponAppliedStatus = ''
      
      // res.json(applyCoupon)
      
    } catch (error) {
      console.log(error)
    }
  }

  const checkout = async(req,res)=>{
    try {
      console.log(req.body);
      let products = await cartHelpers.getCartProductList(req.body.userId)
      let totalPrice = await cartHelpers.getTotalAmount(req.session.user._id)
      // let totalAmount = await cartHelpers.getTotalAmount(req.session.user._id);
      // let totalDiscount = await cartHelpers.getTotalDiscountedAmount(req.session.user._id);
      // let orderPendingCheck = await orderHelpers
      orderHelpers.placeOrder(req.body, products, totalPrice, req.session.user._id).then((orderId)=>{
        if(req.body['paymentMethod']=='COD'){
          res.json({codSuccess:true});
        }else if(req.body['paymentMethod']=='paypal'){        
          res.json({paypal:true, orderId:orderId})
        }else{
          userHelpers.generateRazorPay(orderId, totalPrice).then((response)=>{
            console.log(response);
            res.json(response)
          })
        }
      }).catch(error=>{
        console.log(error)
      })
      
    } catch (error) {
      console.log(error)
    }
  }

  const verifyPayment = (req,res)=>{
    try {
      console.log("******************");
      console.log(req.body);
      console.log("******************");
    
      userHelpers.verifyPayment(req.body).then(()=>{
        userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
          console.log('payment successful');
          res.json({status: true})
        })
      }).catch((err)=>{
        console.log(err);
        res.json({status: false})
      })
      
    } catch (error) {
      console.log(error)
    }
  }

  const orderSuccess = async(req,res)=>{
    try {
      await orderHelpers.getOrderAllDetails(req.session.user._id)
      await cartHelpers.deleteCart(req.session.user._id);
      res.render('users/order-success', {user:true, vUser:req.session.user});
      req.session.applyCoupon = ''
      
    } catch (error) {
      console.log(error)
    }

  }

  const getUserOrders = async(req,res)=>{
    try {
      let orders= await orderHelpers.getUserOrders(req.session.user._id);
      res.render('users/orders', {user:true, vUser: req.session.user, orders});
      
    } catch (error) {
      console.log(error);
    }
    
  }

  const viewOrderProducts = async(req,res)=>{
    try {
      let orderId = req.params.id;
      console.log("****************"+orderId);
      let orderDetails = await orderHelpers.getOrderProducts(orderId)
      console.log("*************************");
      console.log(orderDetails);
      console.log("*************************");
    
      res.render('users/view-order-products',{user:true,vUser: req.session.user, orderDetails})
      
    } catch (error) {
      console.log(error);
    }
  }

  const addAddress = (req,res)=>{
    try {
      res.render('users/add-address', {user:true, vUser:req.session.user})
      
    } catch (error) {
      console.log(error)
    }
  }

  const doAddAddress = async(req,res)=>{
    try {
      await addressHelpers.addAddress(req.body, req.session.user._id);
      res.redirect('/address')
      
    } catch (error) {
      console.log(error)
    }
  }

  const editAddress = async(req,res)=>{
    try {
      await addressHelpers.editAddress(req.params.id, req.body)
      res.redirect('/dash-board')
      
    } catch (error) {
      console.log(error)
    }
  }

  const dashBoard = async(req,res)=>{
    try {
      let orders= await orderHelpers.getUserOrders(req.session.user._id);
      let address = await addressHelpers.getUserAddress(req.session.user._id);
      res.render('users/dashboard1', {user:true,vUser: req.session.user, orders, address})
      
    } catch (error) {
      console.log(error)
    }
  }

  const addressPage = async(req,res)=>{
    try {
    let address = await addressHelpers.getUserAddress(req.session.user._id);      
    res.render('users/address',{user:true, address})
    } catch (error) {
      console.log(error);
    }
  }

  const deleteAddress = (req,res)=>{
    try {
      let addressId = req.params.id;
      addressHelpers.deleteAddress(addressId).then(()=>{
        res.redirect('/address')
      }).catch(error=>{
        console.log(error)
      })
      
    } catch (error) {
      console.log(error)
    }
  }

  const profilePage = async(req,res)=>{
    try {
      let userData = await userHelpers.getUsertDetails(req.session.user._id);
      res.render('users/profile', {user:true, userData})
    } catch (error) {
      return error
    }
  }

  const changePassword = async(req,res)=>{
    try {
      console.log('_+_+_+_+_+_+_');
      console.log(req.body);
      if(req.body.newPassword === req.body.confirmPassword){
        let password = await userHelpers.changePassword(req.body);
        res.redirect('/profile')
      }else{
        req.session.passwordError = 'password error';
        res.redirect('/dash-board')
      }
    } catch (error) {
      
    }
  }

  const orderCancel = (req,res)=>{
    try {
      orderHelpers.cancelOrder(req.params.id);
      res.redirect('/orders')
      
    } catch (error) {
      console.log(error)
    }
  }

  const productOrderCancel = (req, res)=>{
    try {
      let orderId = req.query.orderId
      let productId = req.query.productId
      console.log("-=======-=========-=");
      console.log(orderId +" "+ productId);
      console.log("-=======-=========-=");
  
      orderHelpers.productOrderCancel(orderId,productId)
      res.redirect('/view-order-products/'+orderId)
      
    } catch (error) {
      console.log(error)
    }
  }

  const paypalPayment = (req, res) => {
    try {
      const create_payment_json = {
        "intent": "sale",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": "http://localhost:3000/order-success/"+req.params.id,
          "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
          "amount": {
            "currency": "USD",
            "total": '25.00'
          },
        }]
      }
    
    
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === 'approval_url') {
              console.log("**************orderID*****************")
              console.log(req.params.id);
              console.log("*******************************")
                  res.redirect(payment.links[i].href);
            }
          }
        }
      });
      
    } catch (error) {
      console.log(error)
    }

  }
  
  const paypalOrderSuccess = async(req,res)=>{
    try {
      console.log("*********orderId success*****************");
      console.log(req.params.id);
      console.log("**************************");
      await cartHelpers.deleteCart();
      userHelpers.changePaymentStatus(req.params.id).then(()=>{
        res.render('users/order-success', {user:true, vUser:req.session.user});
      }).catch(error=>{
        console.log(error)
      })
      
    } catch (error) {
      console.log(error)
    }
  }

  const paypalOrderCancel = (req, res) => {
    try {
      res.send('Cancelled')
      
    } catch (error) {
      console.log(error)
    }
  }

  const wishlist = async(req,res)=>{
    try {
      let items = await wishlistHelpers.getWishListItems(req.session.user._id)
      console.log(items);
      res.render('users/wish-list', {user:true, vUser:req.session.user, items});
      
    } catch (error) {
      console.log(error)
    }
  }

  const addToWishList = (req,res)=>{
    try {
      console.log('api call');
      console.log("************add to wishlist*****************");
      wishlistHelpers.addToWishList(req.params.id, req.session.user._id).then(()=>{
        // res.render('users/cart', {user:true})
        // res.redirect('/')
        res.json({status:true})
      }).catch(error=>{
        console.log(error)
      })
      
    } catch (error) {
      console.log(error)
    }
  }

  const removeWishListItem = async(req,res)=>{
    try {
      await wishlistHelpers.removeWishListItem(req.session.user._id, req.params.id)
      res.redirect('/wish-list')
      
    } catch (error) {
      console.log(error)
    }
  }

  const returnOrder = async(req,res)=>{
    try {
      let status = await orderHelpers.updateOrderStatus(req.body);
      console.log(status);
      orderHelpers.returnOrder(req.body).then(()=>{
        res.redirect('/orders')
      }).catch(error=>{
        console.log(error)
      })
      
    } catch (error) {
      console.log(error)
    }
  }

  module.exports = {
    locals,
    homePage,
    signUpPage,
    doSignup,
    loginPage,
    doLogin,
    otpLoginPage,
    doOtpLogin,
    otpVerifyPage,
    doOtpVerify,
    doOtpResent,
    logout,
    viewProduct,
    searchProduct,
    searchProducts,
    doFilterProduct,
    getCart,
    addToCart,
    changeProductQuantity,
    removeCart,
    placeOrder,
    checkout,
    verifyPayment,
    orderSuccess,
    dashBoard,
    addressPage,
    addAddress,
    doAddAddress,
    editAddress,
    deleteAddress,
    profilePage,
    changePassword,
    orderCancel,
    productOrderCancel,
    applyCoupon,
    getUserOrders,
    paypalPayment,
    paypalOrderSuccess,
    paypalOrderCancel,
    viewOrderProducts,
    wishlist,
    addToWishList,
    removeWishListItem,
    returnOrder
  }