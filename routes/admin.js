const express = require('express');
const router = express.Router();
// const adminHelpers = require('../helpers/admin-helpers')
const {verifyAdmin} = require('../middlewares/admin-verify')

const {
  dashBoard,
  loginPage,
  doLogin,
  logout,
  getAllUsers,
  blockUser,
  unblockUser,
  getProducts,
  editProductPage,
  addProductPage,
  addProduct,
  editProduct,
  blockProduct,
  unblockProduct,
  deleteProduct,
  getBanners, 
  addBanner, 
  editBanner, 
  deleteBanner,
  getBrand,
  addBrand,
  editBrand,
  getOrderAllDetails, 
  getOrderProducts, 
  updateOrderStatus, 
  salesReport,
  getCoupons,
  addCoupon,
  deleteCoupon,
  getCategory,
  addCategory,
  addCategoryDiscount,
  updateProductStatus,
  deleteBrand
} = require('../controllers/admin-controller')

const { upload,
  upload2,
  upload3
} = require('../public/javascripts/multer');



router.get('/', verifyAdmin, dashBoard);

router.get('/login', loginPage);

router.post('/login', doLogin)

router.get('/logout', logout)

router.get('/product-list', verifyAdmin, getProducts)

router.get('/add-product', verifyAdmin, addProductPage)

router.post('/add-product',verifyAdmin, upload.array('image'), addProduct)

router.get('/edit-product/:id', verifyAdmin, editProductPage)

router.post('/edit-product/:id', verifyAdmin, upload.array('image'), editProduct)

router.get('/block-product/:id', verifyAdmin, blockProduct)

router.get('/unblock-product/:id', verifyAdmin, unblockProduct)

router.get('/delete-product/:id', verifyAdmin, deleteProduct)

router.get('/user-list', verifyAdmin, getAllUsers)

router.get('/block-user/:id', verifyAdmin, blockUser)

router.get('/unblock-user/:id', verifyAdmin, unblockUser)

router.get('/brand-list', verifyAdmin, getBrand)

router.post('/add-brand', verifyAdmin, upload2.array('image'), addBrand)

router.post('/edit-brand/:id', verifyAdmin, upload2.array('image'),  editBrand)

router.get('/delete-brand/:id', verifyAdmin, deleteBrand)

router.get('/category-list', verifyAdmin, getCategory)

router.post('/add-category', verifyAdmin, addCategory)

router.post('/add-discount', verifyAdmin, addCategoryDiscount)

router.get('/order-list', verifyAdmin, getOrderAllDetails)

router.get('/view-orders/:id', verifyAdmin, getOrderProducts)

router.post('/updateOrderStatus', verifyAdmin, updateOrderStatus)

router.post('/update-order-product-status', verifyAdmin, updateProductStatus)

router.get('/sales-report', verifyAdmin, salesReport)

router.get('/banner-list', verifyAdmin, getBanners)

router.post('/add-banner', verifyAdmin, upload3.array('image'), addBanner)

router.post('/edit-banner/:id', verifyAdmin, upload3.array('image'), editBanner)

router.get('/delete-banner/:id', verifyAdmin, deleteBanner)

router.get('/coupon-list', verifyAdmin, getCoupons),

router.post('/add-coupon', verifyAdmin, addCoupon),

router.get('/delete-coupon/:id', deleteCoupon)


/////////////////////////////////////////////////////////////////////////


module.exports = router;
