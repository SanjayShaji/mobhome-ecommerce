const productHelpers = require('../helpers/product-helpers');
const categoryHelpers = require('../helpers/category-helpers');
const brandHelpers = require('../helpers/brand-helpers');
const orderHelpers = require('../helpers/order-helpers');
const cartHelpers = require('../helpers/cart-helpers');
const couponHelpers = require('../helpers/coupon-helpers');
const addressHelpers = require('../helpers/address-helpers');
const userHelpers = require('../helpers/user-helpers');
const wishlistHelpers = require('../helpers/wishlist-helpers');
const bannerHelpers = require('../helpers/banner-helpers');
const reviewHelpers = require('../helpers/review-helpers');

require('dotenv').config();

const accountSID = process.env.ACCOUNTSID;
const authToken = process.env.AUTHTOKEN;
const serviceID = process.env.SERVICEID;
const client = require('twilio')(accountSID, authToken);


/////////////////////////////////////////////////
paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.CLIENT_SECRET
});

//////////////////////////////////////////////////////
let cartCount = null;
let wishListCount = null;
let guestUserCart = [];
// let guestAddToCart = null
// let wishlistArray = null;

module.exports = {
    locals: async function (req, res, next) {
        try {
            if (req.session.user) {
                if (req.session.guestUserCartCount) {
                    guestAddToCart = await cartHelpers.AddToGuestUserCart(req.session.guestUserCart, req.session.user._id);
                    req.session.guestUserCart = null;
                    req.session.guestUserCartCount = 0;
                    guestUserCart = [];
                }
                res.locals.userLoggedIn = true;
                res.locals.userName = req.session.user.name;
                cartCount = await cartHelpers.getCartCount(req.session.user._id);
                wishListCount = await wishlistHelpers.getWishListCount(req.session.user._id);

                res.locals.cartCount = cartCount;
                res.locals.wishListCount = wishListCount;

            } else {
                if (req.session.guestUserCart) {
                    res.locals.guestUserCart = req.session.guestUserCart;
                    res.locals.guestUserCartCount = req.session.guestUserCartCount;
                    res.locals.result = await productHelpers.guestUserCart(req.session.guestUserCart);
                    res.locals.cartCount = 0;
                    res.locals.wishListCount = null;
                } else {
                    res.locals.guestUserCartCount = 0;

                }
            }
            req.app.locals.layout = 'layout';
            next(); // pass control to the next handler

        } catch (error) {
            console.log(error);
        }
    },

    homePage: async function (req, res, next) {
        try {
            let vUser = req.session.user;
            let brand = await brandHelpers.getAllBrandDetails();
            let products = await productHelpers.getAllProducts();
            let recommendedProducts = await productHelpers.getAllRecommendedProducts();
            let banner = await bannerHelpers.getAllBannerDetails();
            // let averageReview = await reviewHelpers.averageReview();
            let cart = '';
            let wishlist = '';
            let cartCount = '';
            let wishListCount = '';
            if (req.session.userLoggedIn) {
                wishListCount = await wishlistHelpers.getWishListCount(req.session.user._id);

                cartCount = await cartHelpers.getCartCount(req.session.user._id);
                if (res.locals.wishListCount) {
                    wishlist = await wishlistHelpers.getWishListProductList(req.session.user._id);
                }
                if (res.locals.cartCount) {
                    cart = await cartHelpers.getCartProductList(req.session.user._id);
                }
            }
            console.log('==========check===cart===============');
            console.log(cart);
            console.log('=============cart===============');

            console.log('=======wishlist==========');
            console.log(wishlist);
            console.log('==========wishlist==============');

            console.log('===========session');
            console.log(req.session);
            console.log('========================');
            console.log(res.locals);
            res.render('users/home', { vUser, brand, products, recommendedProducts, cartCount, wishlist, wishListCount, cart, banner, user: true });

        } catch (error) {
            console.log(error);
        }
    },

    signUpPage: (req, res, next) => {
        try {
            if (req.session.signupErr) {
                res.render('users/signup', { signupErr: req.session.signupErr });
                console.log(req.session);
                return req.session.signupErr = false;
            }
            res.render('users/signup', { user: true });

        } catch (error) {
            console.log(error);
        }
    },

    doSignup: (req, res) => {
        try {
            userHelpers.doSignup(req.body).then((data) => {
                console.log(data);
                userHelpers.getUsertDetails(data.insertedId).then(response => {
                    req.session.userLoggedIn = true;
                    req.session.user = response;
                    res.redirect('/');
                    console.log(response);
                });
            }).catch(err => {
                if (err)
                    throw err;
                // res.redirect('/signup')
            });

        } catch (error) {
            console.log(error);
        }
    },

    loginPage: (req, res, next) => {
        try {
            if (req.session.userLoggedIn) {
                res.redirect('/');
            } else {
                res.render('users/login', { user: true, links: true, loginErr: req.session.loginErr });
                req.session.loginErr = false;
            }

        } catch (error) {
            console.log(error);
        }
    },

    doLogin: (req, res) => {
        try {
            userHelpers.doLogin(req.body).then(response => {
                if (response.status) {
                    if (response.user.status) {
                        req.session.userLoggedIn = true;
                        req.session.user = response.user;
                        console.log(req.session);
                        res.redirect('/');
                    } else {
                        req.session.loginErr = 'user is blocked';
                        res.redirect('/login');
                    }
                } else {
                    req.session.loginErr = 'invalid user';
                    res.redirect('/login');
                }
            }).catch(error => {
                console.log(error);
            });

        } catch (error) {
            console.log(error);
        }
    },

    otpLoginPage: (req, res) => {
        try {
            if (req.session.otpLoginErr) {
                res.render('users/otp-login', { user: true, otpLoginErr: req.session.otpLoginErr });
                return req.session.otpLoginErr = false;
            }
            res.render('users/otp-login', { user: true });

        } catch (error) {
            console.log(error);
        }
    },

    doOtpLogin: (req, res) => {
        try {
            userHelpers.doOtpLogin(req.body).then((response) => {
                if (response.status) {
                    if (response.user.status) {
                        req.session.phoneNumber = req.body.phoneNumber;
                        console.log(req.session);
                        client.verify.services(serviceID).verifications.create({
                            to: `+91${req.body.phoneNumber}`,
                            channel: 'sms',
                        }).then((data) => {
                            if (data) {
                                console.log('verification sent');
                                res.redirect('/otp-verify');
                            }
                        });
                    } else {
                        req.session.otpLoginErr = 'user is blocked';
                        res.redirect('/otp-login');
                    }
                } else {
                    req.session.otpLoginErr = 'Invalid phone number';
                    res.redirect('/otp-login');
                }
            }).catch(error => {
                console.log(error);
            });

        } catch (error) {
            console.log(error);
        }
    },

    otpVerifyPage: (req, res) => {
        try {
            if (req.session.otpCodeErr) {
                res.render('users/otp-verify', { otpCodeErr: req.session.otpCodeErr });
                return req.session.otpCodeErr = false;
            }
            res.render('users/otp-verify', { user: true });

        } catch (error) {
            console.log(error);
        }
    },

    doOtpVerify: (req, res) => {
        try {
            req.session.code = req.body.code;

            client.verify.services(serviceID).verificationChecks.create({
                to: `+91${req.session.phoneNumber}`,
                code: req.session.code
            }).then((data) => {
                if (data.status === 'approved') {
                    console.log('user is verified');
                    userHelpers.doOtpLogin(req.session).then((response) => {
                        if (response.status) {
                            req.session.user = response.user;
                            req.session.userLoggedIn = true;
                            req.session.phoneNumber = false;
                            console.log(req.session);
                            res.redirect('/');
                        }
                    });
                } else {
                    req.session.otpCodeErr = 'Invalid otp-number';
                    console.log('user is not verified');
                    res.redirect('/otp-verify');
                }
            }).catch(error => {
                console.log(error);
            });

        } catch (error) {
            console.log(error);
        }
    },

    doOtpResent: (req, res) => {
        try {
            client.verify.services(serviceID).verifications.create({
                to: `+91${req.session.phoneNumber}`,
                channel: 'sms',
            }).then((data) => {
                if (data) {
                    console.log('otp resent sent');
                    res.redirect('/otp-verify');
                }
            }).catch(error => {
                console.log(error);
            });

        } catch (error) {
            console.log(error);
        }
    },

    logout: (req, res) => {
        try {
            req.session.user = null;
            req.session.userLoggedIn = false;
            res.redirect('/login');

        } catch (error) {
            console.log(error);
        }
    },

    viewProduct: async(req, res, next) => {
        try {
            let productId = req.params.id;
            let product = await productHelpers.getProductDetails(productId);
            let reviews = await reviewHelpers.getReviews(productId)
            let averageReview =await reviewHelpers.averageReview(productId)
            let reviewsCount = reviews.length
            let reviewRateOutOfFive = (averageReview/100)*5
            let reviewRate = reviewRateOutOfFive.toFixed(1)
            let reviewError = ""
            if(req.session.reviewError){
                reviewError = req.session.reviewError
            }
            console.log(product);
            console.log(reviews);
            console.log(reviewsCount);
            console.log(averageReview);
            console.log(reviewRate);
            res.render('./users/view-product', { vUser: req.session.user, product, reviews, reviewsCount, reviewError, averageReview, reviewRate, user: true });
            req.session.reviewError = ""
        } catch (error) {
            console.log(error);
        }
    },

    productList: async (req, res, next) => {
        try {
            // let user = req.session.user;
            // let products = await productHelpers.getAllProducts();
            let products = res.paginatedResults.products;

            let results = res.paginatedResults;
            console.log(results);
            let brandIds = '';
            // let filter  = await userHelpers
            let categories = await categoryHelpers.getALlCategories();
            let brands = await brandHelpers.getAllBrandDetails();
            if (req.session.filterProduct) {
                products = req.session.filterProduct;
                brandIds = req.session.brandIds;
            }
            res.render('users/product-list', { user: true, vUser: req.session.user, products, brandIds, results, categories, brands });
            req.session.filterProduct = false;

        } catch (error) {
            console.log(error);
        }
    },

    searchProduct: async (req, res) => {
        try {
            let payload = req.body.payload.trim();
            let search = await productHelpers.searchProduct(payload);
            console.log(payload);
            res.send({ payload: search });

        } catch (error) {
            console.log(error);
        }
    },

    doFilterProduct: async (req, res) => {
        try {
            console.log('/////////////////////');
            console.log(req.body);
            let brands = req.body
            if (Array.isArray(req.body)) {
                req.session.brandIds = brands;
            } else {
                req.session.brandIds = Object.brands;
            }
            console.log('/////////////////////');
            // let categories = await userHelpers.getALlCategories();
            // let brands = await userHelpers.getAllBrandDetails();
            productHelpers.filterProduct(req.body.brand).then((products) => {
                req.session.filterProduct = products;
                console.log(req.session);
                res.redirect('/product-list/?page=1');
                // res.render('users/search-product', {user: true, products, categories, brands})
            }).catch(error => {
                console.log(error);
            });

        } catch (error) {
            console.log(error);
        }

    },


    getCart: async (req, res) => {
        try {
            // let cart = await userHelpers.cartCheck();
            if (req.session.userLoggedIn) {
                let cartCount = await cartHelpers.getCartCount(req.session.user._id);
                if (cartCount != 0) {
                    req.session.user.cartCount = cartCount;
                    let cartItems = await cartHelpers.getCartProducts(req.session.user._id);
                    let totalPrice = await cartHelpers.getTotalPrice(req.session.user._id);
                    let totalAmount = await cartHelpers.getTotalAmount(req.session.user._id);
                    let totalDiscount = await cartHelpers.getTotalDiscountedAmount(req.session.user._id);
                    let couponPrice = await couponHelpers.getCouponPrice(req.session.user._id, totalPrice);
                    return res.render('users/cart', { user: true, totalPrice, totalDiscount, totalAmount, cartItems, couponPrice, cartCount, vUser: req.session.user });
                }
            }
            console.log('===================session====================');
            console.log(req.session);
            console.log('===================session====================');
            console.log(res.locals);
            res.render('users/cart', { user: true, vUser: req.session.user });

        } catch (error) {
            console.log(error);
        }

    },

    addToCart: async (req, res) => {
        try {
            if (req.session.userLoggedIn) {
                // req.session.guestUserCart =null
                console.log('api call');
                cartHelpers.addToCart(req.params.id, req.session.user._id).then(async () => {
                    let response = {};
                    response.status = true;
                    res.json(response);
                }).catch((error) => {
                    res.json({ status: false });
                    console.log(error);
                });

            } else {
                guestUserCart.push(req.params.id);
                req.session.guestUserCart = guestUserCart;
                req.session.guestUserCartCount = req.session.guestUserCart.length;
                console.log('--=--cart-=-=');
                console.log(req.params.id);
                console.log(req.session);
                console.log(res.locals);
                console.log('--=--cart-=-=');
                let response = {};
                response.status = true;
                response.cart = req.session.guestUserCart;
                res.json(response);
            }

        } catch (error) {
            console.log(error);
        }
    },

    changeProductQuantity: (req, res) => {
        try {
            console.log(req.body);
            cartHelpers.changeProductQuantity(req.body).then(async (resp) => {
                let response = {};
                response.totalPrice = await cartHelpers.getTotalPrice(req.body.user);
                response.totalAmount = await cartHelpers.getTotalAmount(req.body.user);
                response.totalDiscount = await cartHelpers.getTotalDiscountedAmount(req.body.user);
                response.stock = await productHelpers.getStockCount(req.body.product);
                response.limit = resp.limit;
                res.json(response);
            }).catch(error => {
                console.log(error);
            });

        } catch (error) {
            console.log(error);
        }
    },

    removeCart: (req, res) => {
        try {
            let productId = req.params.productId;
            let quantity = req.params.quantity;
            console.log(quantity);
            if (req.session.userLoggedIn) {
                cartHelpers.removeCart(productId, quantity, req.session.user._id).then(() => {
                    res.redirect('/cart');
                });
            }

        } catch (error) {
            console.log(error);
        }
    },

    placeOrder: async (req, res) => {
        try {
            let cart = await cartHelpers.getCartCount(req.session.user._id);
            if (cart) {
                let totalPrice = await cartHelpers.getTotalPrice(req.session.user._id);
                let totalAmount = await cartHelpers.getTotalAmount(req.session.user._id);
                let totalDiscount = await cartHelpers.getTotalDiscountedAmount(req.session.user._id);
                let address = await addressHelpers.getUserAddress(req.session.user._id);
                let applyCouponResult = '';
                let walletError = ''
                if(req.session.walletError){
                    walletError = req.session.walletError
                    console.log(req.session);
                }
                if (req.session.applyCoupon) {
                    applyCouponResult = req.session.applyCoupon;
                    console.log(req.session);
                }
                res.render('users/place-order', { user: true, vUser: req.session.user, applyCouponResult, walletError, totalPrice, totalAmount, totalDiscount, address });
            } else {
                res.redirect('/cart');
            }

        } catch (error) {
            console.log(error);
        }
    },


    applyCoupon: async (req, res) => {
        try {
            console.log(req.body);
            let code = req.body.code;
            let total = await cartHelpers.getTotalAmount(req.session.user._id);
            let applyCoupon = await couponHelpers.applyCoupon(req.body, total, req.session.user._id);
            console.log(applyCoupon);
            console.log(total);
            req.session.applyCoupon = applyCoupon;
            req.session.applyCoupon.code = code;

            res.redirect('place-order');
            // req.session.applyCoupon.couponAppliedStatus = ''
            // res.json(applyCoupon)
        } catch (error) {
            console.log(error);
        }
    },

    checkout: async (req, res) => {
        try {
            console.log(req.body);
            let userData = await userHelpers.getUsertDetails(req.session.user._id);
            let products = await cartHelpers.getCartProductList(req.body.userId);
            let totalPrice = await cartHelpers.getTotalAmount(req.session.user._id);
            // let totalAmount = await cartHelpers.getTotalAmount(req.session.user._id);
            // let totalDiscount = await cartHelpers.getTotalDiscountedAmount(req.session.user._id);
            // let orderPendingCheck = await orderHelpers
            console.log(req.body);
            console.log("userData.wallet");
            console.log(userData.wallet);
            console.log(totalPrice);
            console.log("userData.wallet");
            if(req.body['paymentMethod'] == 'wallet'){
                if(userData.wallet < totalPrice){
                    req.session.walletError = 'insufficient wallet amount'
                    return res.json({walletError: true})
                }
            }
            orderHelpers.placeOrder(req.body, products, totalPrice, req.session.user._id).then((orderId) => {
                if (req.body['paymentMethod'] == 'COD') {
                    res.json({ codSuccess: true });
                } else if (req.body['paymentMethod'] == 'paypal') {
                    res.json({ paypal: true, orderId: orderId });
                } else if (req.body['paymentMethod'] == 'wallet') {
                    res.json({ wallet: true });
                } else {
                    userHelpers.generateRazorPay(orderId, totalPrice).then((response) => {
                        console.log(response);
                        res.json(response);
                    });
                }
            }).catch(error => {
                console.log(error);
            });

        } catch (error) {
            console.log(error);
        }
    },

    verifyPayment: (req, res) => {
        try {
            console.log('******************');
            console.log(req.body);
            console.log('******************');

            userHelpers.verifyPayment(req.body).then(() => {
                userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
                    console.log('payment successful');
                    res.json({ status: true });
                });
            }).catch((err) => {
                console.log(err);
                res.json({ status: false });
            });

        } catch (error) {
            console.log(error);
        }
    },

    orderSuccess: async (req, res) => {
        try {
            await orderHelpers.getOrderAllDetails(req.session.user._id);
            await cartHelpers.deleteCart(req.session.user._id);
            res.render('users/order-success', { user: true, vUser: req.session.user });
            req.session.applyCoupon = '';

        } catch (error) {
            console.log(error);
        }

    },

    getUserOrders: async (req, res) => {
        try {
            let orders = await orderHelpers.getUserOrders(req.session.user._id);
            res.render('users/orders', { user: true, vUser: req.session.user, orders });

        } catch (error) {
            console.log(error);
        }

    },

    viewOrderProducts: async (req, res) => {
        try {
            let orderId = req.params.id;
            console.log('****************' + orderId);
            let orderDetails = await orderHelpers.getOrderProducts(orderId);
            console.log('*************************');
            console.log(orderDetails);
            console.log('*************************');

            res.render('users/view-order-products', { user: true, vUser: req.session.user, orderId, orderDetails });

        } catch (error) {
            console.log(error);
        }
    },

    invoice: async (req, res) => {
        try {
            let orderId = req.params.id;
            let orders = await orderHelpers.getOrderedAddress(orderId);
            console.log('/////////////order/////////////');
            console.log(orders);
            console.log('/////////////order/////////////');
            let orderProducts = await orderHelpers.getOrderProducts(orderId);
            console.log(orderProducts);
            res.render('users/invoice', { user: true, vUser: req.session.user, orderId, orders, orderProducts });
        } catch (error) {
            console.log(error);
        }
    },

    addAddress: (req, res) => {
        try {
            res.render('users/add-address', { user: true, vUser: req.session.user });

        } catch (error) {
            console.log(error);
        }
    },

    doAddAddress: async (req, res) => {
        try {
            await addressHelpers.addAddress(req.body, req.session.user._id);
            res.redirect('/address');

        } catch (error) {
            console.log(error);
        }
    },

    editAddress: async (req, res) => {
        try {
            await addressHelpers.editAddress(req.params.id, req.body);
            res.redirect('/dash-board');

        } catch (error) {
            console.log(error);
        }
    },

    dashBoard: async (req, res) => {
        try {
            res.render('users/dash-board', { user: true, vUser: req.session.user });

        } catch (error) {
            console.log(error);
        }
    },

    addressPage: async (req, res) => {
        try {
            let address = await addressHelpers.getUserAddress(req.session.user._id);
            res.render('users/address', { user: true, vUser: req.session.user, address });
        } catch (error) {
            console.log(error);
        }
    },

    deleteAddress: (req, res) => {
        try {
            let addressId = req.params.id;
            addressHelpers.deleteAddress(addressId).then(() => {
                res.redirect('/address');
            }).catch(error => {
                console.log(error);
            });

        } catch (error) {
            console.log(error);
        }
    },

    profilePage: async (req, res) => {
        try {
            let userData = await userHelpers.getUsertDetails(req.session.user._id);
            res.render('users/profile', { user: true, vUser: req.session.user, userData });
        } catch (error) {
            return error;
        }
    },

    walletPage: async (req, res) => {
        try {
            let userData = await userHelpers.getUsertDetails(req.session.user._id);
            let orders = await orderHelpers.getUserWalletOrders(req.session.user._id);
            res.render('users/wallet', { user: true, vUser: req.session.user, userData, orders });
        } catch (error) {
            return error;
        }
    },

    addWallet: async (req, res) => {
        try {
            console.log('_+_+_+_+_+_+_');
            console.log(req.body);
            if (req.body.wallet > 0) {
                let wallet = await userHelpers.addWallet(req.session.user._id, req.body.wallet);
                req.session.user = wallet
                res.redirect('/wallet');
            } else {
                // req.session.walletError = 'wallet error';
                res.redirect('/wallet');
            }
        } catch (error) {
        }
    },

    changePassword: async (req, res) => {
        try {
            console.log('_+_+_+_+_+_+_');
            console.log(req.body);
            if (req.body.newPassword === req.body.confirmPassword) {
                let password = await userHelpers.changePassword(req.body);
                res.redirect('/profile');
            } else {
                req.session.passwordError = 'password error';
                res.redirect('/dash-board');
            }
        } catch (error) {
        }
    },

    orderCancel: (req, res) => {
        try {
            orderHelpers.cancelOrder(req.params.id);
            res.redirect('/orders');

        } catch (error) {
            console.log(error);
        }
    },

    productOrderCancel: (req, res) => {
        try {
            let orderId = req.query.orderId;
            let productId = req.query.productId;
            console.log('-=======-=========-=');
            console.log(orderId + ' ' + productId);
            console.log('-=======-=========-=');

            orderHelpers.productOrderCancel(orderId, productId);
            res.redirect('/view-order-products/' + orderId);

        } catch (error) {
            console.log(error);
        }
    },

    paypalPayment: (req, res) => {
        try {
            create_payment_json = {
                'intent': 'sale',
                'payer': {
                    'payment_method': 'paypal'
                },
                'redirect_urls': {
                    'return_url': 'http://mobhome.cf/order-success/' + req.params.id,
                    'cancel_url': 'http://mobhome.cf/cancel'
                },
                'transactions': [{
                    'amount': {
                        'currency': 'USD',
                        'total': '25.00'
                    },
                }]
            };


            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    for (let i = 0; i < payment.links.length; i++) {
                        if (payment.links[i].rel === 'approval_url') {
                            console.log('**************orderID*****************');
                            console.log(req.params.id);
                            console.log('*******************************');
                            res.redirect(payment.links[i].href);
                        }
                    }
                }
            });

        } catch (error) {
            console.log(error);
        }

    },

    paypalOrderSuccess: async (req, res) => {
        try {
            console.log('*********orderId success*****************');
            console.log(req.params.id);
            console.log('**************************');
            await cartHelpers.deleteCart(req.session.user._id);
            userHelpers.changePaymentStatus(req.params.id).then(() => {
                res.render('users/order-success', { user: true, vUser: req.session.user });
            }).catch(error => {
                console.log(error);
            });

        } catch (error) {
            console.log(error);
        }
    },

    paypalOrderCancel: (req, res) => {
        try {
            res.send('Cancelled');

        } catch (error) {
            console.log(error);
        }
    },

    wishlist: async (req, res) => {
        try {
            let items = await wishlistHelpers.getWishListItems(req.session.user._id);
            console.log(items);
            res.render('users/wish-list', { user: true, vUser: req.session.user, items });

        } catch (error) {
            console.log(error);
        }
    },

    addOrRemovewishList: async (req, res) => {
        try {
            console.log('api call');
            console.log('************add or remove wishlist*****************');
            let result = await wishlistHelpers.addOrRemoveWishlist(req.params.id, req.session.user._id)
            // res.render('users/cart', {user:true})
            // res.redirect('/')
            console.log(result)
            res.json(result);
            //  }).catch(error => {
            //      console.log(error);
            //  });

        } catch (error) {
            console.log(error);
        }
    },

    addReview : async(req, res)=>{
        try {
            // let reviewError = ""
            console.log(req.body)
            let review = await reviewHelpers.addReview(req.session.user._id, req.body)
            if(review.status == false){
                req.session.reviewError = "purchase this product to rate"
            }
            console.log(review)
            res.redirect(`/view-product/${req.body.productId}`)
        } catch (error) {
            console.log(error);
        }
    },
    

    //  addToWishList: (req, res) => {
    //      try {
    //          console.log('api call');
    //          console.log('************add to wishlist*****************');
    //          wishlistHelpers.addToWishList(req.params.id, req.session.user._id).then(() => {
    //              // res.render('users/cart', {user:true})
    //              // res.redirect('/')
    //              res.json({ status: true });
    //          }).catch(error => {
    //              console.log(error);
    //          });

    //      } catch (error) {
    //          console.log(error);
    //      }
    //  },

    //  removeWishListItem: async (req, res) => {
    //      try {
    //          await wishlistHelpers.removeWishListItem(req.session.user._id, req.params.id);
    //          res.json({ status: true });

    //      } catch (error) {
    //          console.log(error);
    //      }
    //  },

    returnOrder: async (req, res) => {
        try {
            let status = await orderHelpers.updateOrderStatus(req.body);
            console.log(status);
            orderHelpers.returnOrder(req.body).then(() => {
                res.redirect('/orders');
            }).catch(error => {
                console.log(error);
            });

        } catch (error) {
            console.log(error);
        }
    },
}

