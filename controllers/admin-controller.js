const fs = require('fs')
const productHelpers = require('../helpers/product-helpers')
const categoryHelpers = require('../helpers/category-helpers')
const brandHelpers = require('../helpers/brand-helpers')
const orderHelpers = require('../helpers/order-helpers')
const bannerHelpers = require('../helpers/banner-helpers')
const couponHelpers = require('../helpers/coupon-helpers')
const userHelpers = require('../helpers/user-helpers')
const adminHelpers = require('../helpers/admin-helpers')
// const cartHelpers = require('../helpers/cart-helpers')
const addressHelpers = require('../helpers/address-helpers')
// const wishlistHelpers = require('../helpers/wishlist-helpers')


const dashBoard = async function (req, res, next) {
  try {
        let response = await orderHelpers.getTotalSaleGraph()
        let {dailySales,monthlySales,yearlySales} = response;
        let salesReport = await orderHelpers.getSalesReport();
        let {weeklyReport, monthlyReport, yearlyReport} = salesReport;
        console.log(weeklyReport, monthlyReport, yearlyReport);
      
        let paymentsReport = await orderHelpers.getPaymentGraph();
        let {percentageCOD, percentageUPI, percentagePaypal} = paymentsReport
        res.render('admin/dash-board' ,{admin:true, 
          dailySales, monthlySales, yearlySales,
          weeklyReport, monthlyReport, yearlyReport,
          percentageCOD, percentageUPI, percentagePaypal
          })    
    
  } catch (error) {
    console.log(error)
  }
   
  }

const loginPage = function (req, res, next) {
  try {
    if (req.session.adminLoggedIn) {
      res.redirect('/admin')
    } else {
      res.render('admin/login', { adminLoginErr: req.session.adminLoginErr });
      adminLoginErr = false;
  
    }
    
  } catch (error) {
    console.log(error)
  }
  }

const doLogin =  (req, res) => {
  try {
    adminHelpers.doAdminLogin(req.body).then(response => {
      console.log(response)
      if (response.adminStatus) {
        req.session.admin = response.admin;
        req.session.adminLoggedIn = true;
        res.redirect('/admin')
      } else {
        req.session.adminLoginErr = "Invalid admin"
        res.redirect('/admin/login')
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
      req.session.admin = null;
      req.session.adminLoggedIn = false;
      res.redirect('/admin/login')
      
    } catch (error) {
      console.log(error)
    }
  }

  const getAllUsers = (req, res) => {

    userHelpers.getAllUsers().then(usersData => {
      res.render('admin/user-list', { adminUser: req.session.admin, admin: true, usersData })
    }).catch(error=>{
      console.log(error)
    })
    // res.render('admin/user-list')  
  }

  const blockUser = (req, res) => {
    try {
      let userId = req.params.id;
      userHelpers.blockUser(userId).then(response => {
        if (response) {
          req.session.user = null;
          req.session.userLoggedIn = false;
          res.redirect('/admin/user-list')
        }
      }).catch(error=>{
        console.log(error)
      })
      
    } catch (error) {
      console.log(error)
    }
  }

  const unblockUser = async(req, res) => {
    try {
      let userId = req.params.id;
      userHelpers.unblockUser(userId).then(response => {
        if (response) {
          res.redirect('/admin/user-list')
        }
      })
      
    } catch (error) {
      console.log(error)
    }
  }

  const getBanners = async (req, res) => {
    try {
      let banner = await bannerHelpers.getAllBannerDetails()
      res.render('admin/banner-list', { admin: true, banner })
      
    } catch (error) {
      console.log(error)
    }
  }
  
  const addBanner = async(req, res) => {
    
    try {
      console.log(req.body);
    
      const files = req.files
      const file = files.map((file) => {
        return file
      })
      const fileName = file.map((file) => {
        return file.filename
      })
      const product = req.body
      product.img = fileName
    
      bannerHelpers.addBanner(req.body).then(data => {
        res.redirect('/admin/banner-list')
      }).catch(error=>{
        console.log(error)
      })
      
    } catch (error) {
      console.log(error)
    }
  }
  
  const editBanner = async(req, res) => {
    // const files = req.files
    // const file = files.map((file) => {
    //   return file
    // })
    // const fileName = file.map((file) => {
    //   return file.filename
    // })
    // const product = req.body
    // product.img = fileName
    try {
      let oldBannerDetails= await bannerHelpers.getBannerDetails(req.params.id)
    const file = req.files
    let filename
    req.body.img =(req.files.length!=0) ? (filename = file.map((file)=>{ return file.filename })) : oldBannerDetails.img
  
      bannerHelpers.updateBanner(req.params.id, req.body).then(response => {
    
        res.redirect('/admin/banner-list');
    
      }).catch(error=>{
        console.log(error)
      })
      
    } catch (error) {
      console.log(error)
    }
  
  }
  
  const deleteBanner = async(req, res) => {
    try {
      let bannerId = req.params.id
      let banner = await bannerHelpers.getBannerDetails(bannerId);
      fs.unlinkSync('public/images/banner-images/'+banner.img[0])
        await bannerHelpers.deleteBanner(bannerId)
        res.redirect('/admin/banner-list')
      
    } catch (error) {
      console.log(error)
    }
  }
  
  const getBrand = async(req,res)=>{
    try {
      let brand = await brandHelpers.getAllBrandDetails();
    res.render('admin/brand-list', {admin:true, brand})
      
    } catch (error) {
      console.log(error)
    }
}

const addBrand = (req, res) => {

  try {
    const files = req.files
    const file = files.map((file)=>{
        return file
    })
    const fileName = file.map((file)=>{
        return file.filename
    })
    const product = req.body
    product.img = fileName
    
    brandHelpers.addBrand(req.body).then(data => {
        res.redirect('/admin/brand-list')
        
    }).catch(error=>{
      console.log(error)
    })
    
  } catch (error) {
    console.log(error)
  }
}

const editBrand = (req, res) => {
  try {
    const files = req.files
    const file = files.map((file)=>{
        return file
    })
    const fileName = file.map((file)=>{
        return file.filename
    })
    const product = req.body
    product.img = fileName;
    
    brandHelpers.updateBrand(req.params.id, req.body).then(() => {
        res.redirect('/admin/brand-list');   
    }).catch(error=>{
      console.log(error)
    })
    
  } catch (error) {
    console.log(error)
  }
}

const deleteBrand = async(req, res) => {
  try {
    let brandId = req.params.id
    let brand = await brandHelpers.getBrandDetails(brandId);
    fs.unlinkSync('public/images/brand-images/'+brand.img[0])
      await brandHelpers.deleteBrand(brandId)
      res.redirect('/admin/brand-list')
    
  } catch (error) {
    console.log(error)
  }
}

const getCategory = (req, res) => {
  categoryHelpers.getCategoryDetails().then((category) => {
      res.render('admin/category-list', { category, admin: true })
  }).catch(error=>{
    console.log(error)
  })
}

const addCategory = (req, res) => {
  categoryHelpers.addCategory(req.body).then(data => {
      console.log(data);
      res.redirect('/admin/category-list')
  }).catch(error=>{
    console.log(error)
  })
}

const addCategoryDiscount = (req, res) => {
  try {
    console.log(req.body);
    categoryHelpers.addDiscount(req.body).then((data) => {
        console.log(data);
        res.redirect('/admin/category-list')
    }).catch(error=>{
      console.log(error)
    })
    
  } catch (error) {
    console.log(error)
  }
}

const getCoupons = (req, res) => {
  couponHelpers.couponAllDetails().then((coupon) => {
    console.log(coupon);
    res.render('admin/coupon-list', { admin: true, coupon });
  }).catch(error=>{
    console.log(error)
  })
}

const addCoupon = (req, res) => {
  couponHelpers.addCoupon(req.body).then(() => {
    res.redirect('/admin/coupon-list');
  }).catch(error=>{
    console.log(error);
  })
}

const deleteCoupon = (req, res) => {
  try {
    let couponId = req.params.id
    couponHelpers.deleteCoupon(couponId).then(() => {
      res.redirect('/admin/coupon-list');
    })
    
  } catch (error) {
    console.log(error)
  }
}

const getProducts = async(req, res) => {
  try {
    let data = await productHelpers.getAllProducts();
    console.log(data);
    res.render('admin/product-list', { data, admin: true })
    
  } catch (error) {
    console.log(error)
  }
}

const addProductPage = async(req, res, next) => {
  try {
    let category = await categoryHelpers.getCategoryDetails();
    let brand = await brandHelpers.getAllBrandDetails();
    res.render('admin/add-product', {admin: true, category, brand})
    
  } catch (error) {
    console.log(error)
  }
}

const addProduct = (req, res, next) => {
  try {
    const files = req.files
    const file = files.map((file)=>{
        return file
    })
    const fileName = file.map((file)=>{
        return file.filename
    })
    const product = req.body
    product.img = fileName
  
    productHelpers.addProduct(req.body).then(result => {
        res.redirect('/admin/product-list')
  
    }).catch(error=>{
      console.log(error)
    })
    
  } catch (error) {
    console.log(error)
  }
}

const editProductPage = async(req, res) => {
  try {
    let category = await categoryHelpers.getCategoryDetails();
    let brand = await brandHelpers.getAllBrandDetails();
    console.log('********************************');
    console.log(req.session)
    console.log('********************************');
  
    productHelpers.getProductDetails(req.params.id).then(productData => {
      console.log(productData)
      res.render('admin/edit-product', { productData: productData, category, brand, admin: true })
      
    }).catch(error=>{
      console.log(error)
    })
    
  } catch (error) {
    console.log(error);
  }
}

const editProduct = async(req, res) => {

  // const files = req.files
  // const file = files.map((file)=>{
  //     return file
  // })
  // const fileName = file.map((file)=>{
  //     return file.filename
  // })
  // const product = req.body
  // product.img = fileName
  
  try {
    let oldProductDetails= await productHelpers.getProductDetails(req.params.id)
    const file = req.files
    let filename
    req.body.img =(req.files.length!=0) ? (filename = file.map((file)=>{ return file.filename })) : oldProductDetails.img
  
  
    productHelpers.updateProduct(req.params.id, req.body).then(response => {
      res.redirect('/admin/product-list');
  
    }).catch(error=>{
      console.log(error);
    })
    
  } catch (error) {
    console.log(error)
  }
}

const blockProduct = (req, res) => {
  try {
    let productId = req.params.id;
    productHelpers.blockProduct(productId).then(() => {
      res.redirect('/admin/product-list')
    }).catch(error=>{
      console.log(error);
    })
    console.log(productId)
    
  } catch (error) {
    console.log(error)
  }
}

const unblockProduct = (req, res) => {
  try {
    let productId = req.params.id;
    productHelpers.unblockProduct(productId).then(() => {
      res.redirect('/admin/product-list')
    }).catch(error=>{
      console.log(error);
    })
    
  } catch (error) {
    console.log(error)
  }
}

const deleteProduct = async(req,res)=>{
  try {
    let productId = req.params.id;
    let products= await productHelpers.getProductDetails(productId)
    for(let i = 0; i<products.img.length; i++){
      fs.unlinkSync('public/images/product-images/'+products.img[i])
    }
    productHelpers.deleteProduct(productId).then(()=>{
      res.redirect('/admin/product-list')
    }).catch(error=>{
      console.log(error)
    })
    
  } catch (error) {
    console.log(error)
  }
}

const getOrderAllDetails = async(req,res)=>{
  try {
    // let orders = await adminHelpers.getAllOrders();
    let orders = await orderHelpers.getOrderAllDetails();
    res.render('admin/order-list', {orders, admin:true});
    
  } catch (error) {
    console.log(error)
  }
}

const getOrderProducts = async (req, res) => {
  try {
    let orderId = req.params.id;
    // let userId = req.params.userId
    console.log('orderId' + orderId);
    // console.log('userId'+userId);
    let orderProducts = await orderHelpers.getOrderProducts(orderId)
    let orderDetails = await orderHelpers.getOrderAmountDetails(orderId);
    let userAddress = await addressHelpers.getAddress(orderDetails.addressId)
    console.log("------orderDetails-----------");
    console.log(userAddress);
    console.log(orderDetails);
    console.log("------orderDetails-----------");
  
    res.render('admin/view-orders', { admin: true, orderProducts, orderDetails, userAddress })
    
  } catch (error) {
    console.log(error)
  }
}

const updateOrderStatus = (req, res) => {
  try {
    console.log(req.body);
    orderHelpers.updateOrderStatus(req.body).then(() => {
      res.redirect('/admin/order-list')
    }).catch(error=>{
      console.log(error);
    })
    
  } catch (error) {
    console.log(error);
  }
}

const updateProductStatus = (req,res)=>{
  orderHelpers.updateProductStatus(req.body).then(()=>{
    res.redirect('')
  }).catch(error=>{
    console.log(error);
  })
}

const salesReport = async (req, res) => {
  try {
    let response = await orderHelpers.getTotalSaleGraph()
    let { dailySales, monthlySales, yearlySales } = response;
    let salesReport = await orderHelpers.getSalesReport();
    let { weeklyReport, monthlyReport, yearlyReport } = salesReport
    console.log(weeklyReport, monthlyReport, yearlyReport);
    res.render('admin/sales-report', { admin: true, dailySales, monthlySales, yearlySales, weeklyReport, monthlyReport, yearlyReport })
    
  } catch (error) {
    console.log(error)
  }
}
  module.exports = {
    dashBoard,
    loginPage,
    doLogin,
    logout,
    getAllUsers,
    blockUser,
    unblockUser,
    getBanners,
    addBanner,
    editBanner,
    deleteBanner,
    getBrand,
    addBrand,
    editBrand,
    deleteBrand,
    getCategory,
    addCategory,
    addCategoryDiscount,
    getCoupons,
    addCoupon,
    deleteCoupon,
    getProducts,
    addProductPage,
    addProduct,
    editProductPage,
    editProduct,
    blockProduct,
    unblockProduct,
    deleteProduct,
    getOrderAllDetails,
    getOrderProducts,
    updateOrderStatus,
    updateProductStatus,
    salesReport
  }