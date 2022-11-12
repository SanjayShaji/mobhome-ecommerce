var db = require('../config/connection')
var objectId = require('mongodb').ObjectId
const collection = require('../collections/collection')


module.exports = {

    // getAllProducts: () => {
    //     return new Promise(async (resolve, reject) => {
    //         let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
    //         resolve(product);
    //     })
    // },

    getAllProducts : ()=>{
        return new Promise(async(resolve, reject)=>{
            try {
                
                let product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                    {
                        $lookup: {
                            from: 'brand',
                            localField: 'brand',
                            foreignField: '_id',
                            as: 'brandDetails'
                        }
                    },
                    {
                        $unwind: "$brandDetails"
                    },
                    {
                        $lookup : {
                            from : 'category',
                            localField : 'category',
                            foreignField : '_id',
                            as : 'categoryDetails'
                        }
                    },
                    {
                        $unwind: "$categoryDetails"
                    },

                    {
                        $addFields: {
                            // discountOffer : {$cond : [ {$gt : [{$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}]}, {$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}] },
                            discountOff: {$cond: { if: {$gt : ["$discount", "$categoryDetails.discount"]}, then: {$toInt: "$discount"}, else: {$toInt:"$categoryDetails.discount"} }},
                        }
                    },
                    {
                        $addFields :{
                            discountedAmount: {$round : {$divide : [{$multiply: [{$toInt: "$price"}, {$toInt:"$discountOff"}]}, 100]} },
                        }
                    },
                    {
                        $addFields : {
                            priceAfterDiscount: {$round: {$subtract: [{$toInt: "$price"}, {$toInt:"$discountedAmount"}]} }
                        }
                    }
    
                ]).toArray()
                console.log(product);
                resolve(product)
            } catch (error) {
                console.log(error);
            }
        })
    },

    // getProductDetails: (productId) => {
    //     return new Promise((resolve, reject) => {
    //         db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) }).then(data => {
    //             resolve(data)
    //             console.log('****************************');
    //             console.log(data);
    //             console.log('****************************');
    //         })
    //     })
    // },

    getProductDetails: (productId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                    {
                        $match: {
                            _id: objectId(productId)
                        }
                    },
                    {
                        $lookup: {
                            from: 'brand',
                            localField: 'brand',
                            foreignField: '_id',
                            as: 'brandDetails'
                        }
                    },
                    {
                        $unwind: "$brandDetails"
                    },
                    {
                        $lookup: {
                            from: 'category',
                            localField: 'category',
                            foreignField: '_id',
                            as: 'categoryDetails'
                        }
                    },
                    {
                        $unwind: "$categoryDetails"
                    },

                ]).toArray()
                resolve(products[0])
            } catch (error) {
                reject(error)
            }
        })
    },

    addProduct: (productData) => {
        products = {
            name: productData.name,
            brand: objectId(productData.brand),
            description: productData.description,
            price: parseInt(productData.price),
            discount: productData.discount,
            // discountedAmount: productData.price*productData.discount/100,
            // priceAfterDiscount: productData.price - productData.price*productData.discount/100,
            stock: parseInt(productData.stock),
            category: objectId(productData.category),
            status: productData.status,
            img: productData.img
        }
        return new Promise(async (resolve, reject) => {   
                db.get().collection(collection.PRODUCT_COLLECTION).insertOne(products).then((data) => {
                    console.log(data)
                    resolve(data)
                }).catch(error=>{
                    reject(error)
                })
        })
    },

    updateProduct: (productId, product) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(productId) },
                {
                    $set: {
                        name: product.name,
                        brand: objectId(product.brand),
                        category: product.category,
                        description: product.description,
                        price: parseInt(product.price),
                        discount: product.discount,
                        stock:parseInt(product.stock),
                        category: objectId(product.category),
                        img: product.img
                    }
                }).then(data => {
                    console.log('//////////////////////////////////////////');
                    console.log(data);
                    console.log('//////////////////////////////////////////');
                    resolve(data);
                }).catch(error=>{
                    reject(error)
                })
        })
    },

    blockProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let deleteProduct = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(productId) }, {
                    $set: { status: false }
                })
                console.log('**************************************');
                console.log(deleteProduct);
                console.log('**************************************');
    
                resolve(deleteProduct)
                
            } catch (error) {
                console.log(error)
            }
        })
    },

    unblockProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let restoreProduct = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(productId) }, {
                    $set: { status: true }
                })
                resolve(restoreProduct)
                
            } catch (error) {
                console.log(error);
            }
        })
    },

    deleteProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            let destroyProduct = await db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(productId) });
            resolve(destroyProduct);
        })
    },

    filterProduct: (filterItems) => {
        console.log("................................");
        console.log(filterItems);
        console.log("................................");

        return new Promise(async (resolve, reject) => {
            if (Array.isArray(filterItems)) {
                filterItems.forEach(convert);
                function convert(item, index, arr) {
                    arr[index] = objectId(item)
                }
                console.log("-=-=-=-=-=-=-=-=-=-=-=-=");
                console.log(filterItems);
                console.log("-=-=-=-=-=-=-=-=-=-=-=-=");

                let filter = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                    brand: { $in: filterItems }
                }).toArray()
                console.log(filter);
                resolve(filter)
            } else {
                // let filterArray = filterItems;
                let filterData = objectId(filterItems)
                console.log("==========================");
                console.log(filterData);
                console.log("==========================");

                let filter = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                    brand: { $in: [filterData] }
                }).toArray()
                console.log(filter);
                resolve(filter)
            }
        })
    },

    guestUserCart: (cartItems)=>{
        return new Promise(async(resolve, reject)=>{
            cartItems.forEach((item, index, arr)=>{
                return arr[index] = objectId(item)
            })

            let cart = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                _id: {$in : cartItems}
            }).toArray();
            console.log(cart);
            resolve(cart)
        })
    },

    searchProduct : (payload)=>{
        return new Promise(async(resolve,reject)=>{
            let search = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                name: {$regex: new RegExp('^'+payload+'.*', 'i')}
            }).toArray();
            search = search.slice(0,10);
            resolve(search)
        })
    },

    getProductsCount : ()=>{
        return new Promise(async(resolve,reject)=>{
            let count = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments();
            console.log("count"+count);
            resolve(count)
        })
    },

    getStockCount : (productId)=>{
        return new Promise(async(resolve,reject)=>{
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: objectId(productId)})
            console.log("============stock======");
            console.log(product.stock)
            resolve(product.stock)
        })
    },

    // stockUpdate : (productId, stockNum)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let product = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: objectId(productId)},
    //         {
    //             $inc: {stock: -stockNum}
    //         })
    //         resolve(product)
    //     })
    // },

    getPaginatedResult : (limit, startIndex)=>{
        console.log("-=--=--=-=-=-=");
        console.log(limit);
        console.log(startIndex);
        console.log("-=--=--=-=-=-=");

        return new Promise(async(resolve,reject)=>{
            // let result= await db.get().collection(collection.PRODUCT_COLLECTION).find().limit({toInt:limit}).skip(startIndex).toArray()
            let result = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $skip: startIndex
                },
                {
                    $limit: limit
                    
                }
            ]).toArray()
            resolve(result)
        })
    },

    getOrderPaginatedResult : (limit, startIndex)=>{
        console.log("-=--=--=-=-=-=");
        console.log(limit);
        console.log(startIndex);
        console.log("-=--=--=-=-=-=");

        return new Promise(async(resolve,reject)=>{
            // let result= await db.get().collection(collection.PRODUCT_COLLECTION).find().limit({toInt:limit}).skip(startIndex).toArray()
            let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $skip: startIndex
                },
                {
                    $limit: limit
                    
                }
            ]).toArray()
            resolve(result)
        })
    },

}