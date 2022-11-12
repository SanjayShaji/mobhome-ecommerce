var db = require('../config/connection')
var objectId = require('mongodb').ObjectId
const collection = require('../collections/collection')

module.exports = {
    cartCheck: () => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).find().toArray();
            resolve(cart)
        })

    },

    // getCartProducts: (userId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([

    //             {
    //                 $match: { user: objectId(userId) }
    //             },
    //             {
    //                 $unwind: '$products'
    //             },
    //             {
    //                 $project: {
    //                     item: '$products.item',
    //                     quantity: '$products.quantity'
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     from: 'product',
    //                     localField: 'item',
    //                     foreignField: '_id',
    //                     as: 'products'
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     item: 1,
    //                     quantity: 1,
    //                     product: 1,
    //                     total: { $multiply: ['$quantity', { $toInt: '$product.price' }] }
    //                 }
    //             }
    //             // {
    //             //     $lookup:{
    //             //         from:"product",
    //             //         let:{productList: "$products"},
    //             //         pipeline: [
    //             //             {
    //             //                 $match:{
    //             //                     $expr: {
    //             //                         $in:['$_id','$$productList']
    //             //                     }
    //             //                 }
    //             //             },
    //             //         ],
    //             //         as:"cartItems",
    //             //     }
    //             // }
    //         ]).toArray();
    //         console.log('**********************cartIems****************');
    //         console.log(cartItems);
    //         console.log('**********************cartIems****************');
    //         resolve(cartItems);
    //     })
    // },

    getCartProducts: (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {user: objectId(userId)}
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: 'product',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products' 
                    }
                },
                {
                    $project: {
                        item:1, quantity: 1, product: {$arrayElemAt: ["$products", 0]}
                    }
                },
                {
                    $lookup : {
                        from: 'category',
                        localField: 'product.category',
                        foreignField: '_id',
                        as: 'categoryDetails'
                    }
                },
                {
                    $unwind: '$categoryDetails'
                },
                {
                    $project: {
                        item:1, quantity: 1, product:1, categoryDetails: 1,
                        discountOff: {$cond: { if: {$gt : ["$product.discount", "$categoryDetails.discount"]}, then: {$toInt: "$product.discount"}, else: {$toInt:"$categoryDetails.discount"} }},
    
                    }
                },
                {
                    $addFields: {
                        
                        discountedAmount: {$round : {$divide : [{$multiply: [{$toInt: "$product.price"}, {$toInt:"$discountOff"}]}, 100]} },
                    }
                },
                {
                    $addFields: {
                        
                        priceAfterDiscount: {$round: {$subtract: [{$toInt: "$product.price"}, {$toInt:"$discountedAmount"}]} }
                    }
                },
                {
                    $addFields: {
                        
                        totalAfterDiscount: { $multiply: ['$quantity', { $toInt: '$priceAfterDiscount' }] }
                    }
                }
            ]).toArray();
            console.log("===============cartItems==================");
            console.log(cartItems);
            console.log("===============cartItems==================");

            resolve(cartItems);

        })
    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) });
            if (cart) {
                count = cart.products.length
            }
            resolve(count);
        })
    },

    changeProductQuantity: (details) => {
        details.count = parseInt(details.count);
        // console.log(details.count, details.product);
        return new Promise(async(resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                    {
                        $set: { 'products.$.quantity': 1 }
                    }
                ).then((response) => {
                    resolve({ limit: true })
                })
            } else {

                 await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: objectId(details.product)},
                {
                    $inc: {stock: -details.count}
                })
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': details.count }
                    }
                ).then((response) => {
                    console.log('**********change-product-quantity');
                    console.log(response);
                    console.log('**********change-product-quantity');
                    //  resolve(true)
                    resolve({ status: true })
                })
            }
        })
    },

    addToCart: (productId, userId) => {
        let productObj = {
            item: objectId(productId),
            quantity: 1,
        }
        return new Promise(async (resolve, reject) => {
            // let stock = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(productId)})
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) });
            if (userCart) {
                let productExist = userCart.products.findIndex(product => product.item == productId)
                // console.log(productExist);
                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: objectId(productId)},{$inc: {stock: -1}})
                if (productExist != -1) {
                        reject({status:false})
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { products: productObj }

                        }).then(() => {
                            resolve();
                        })
                }

            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [productObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then(() => {
                    resolve();
                })
            }
        })
    },

    AddToGuestUserCart : (cartItems, userId)=>{
        return new Promise(async(resolve,reject)=>{
             await cartItems.forEach(async(item, index, array)=>{
                array[index] = objectId(item);
                let productObj = {
                    item: array[index],
                    quantity : 1
                }
                let cartItem = await db.get().collection(collection.CART_COLLECTION).findOne({user: objectId(userId), 'products.item': productObj.item})
                console.log("=========cart item===============");
                console.log(cartItem);
                console.log("=========cart item===============");
                if(cartItem!=null){
                    await db.get().collection(collection.CART_COLLECTION).updateOne({user: objectId(userId), 'products.item': productObj.item}, {
                        $inc: {'products.$.quantity': 1}
                    })
                }else{

                  await db.get().collection(collection.CART_COLLECTION).updateOne({user: objectId(userId)},
                    {
                        $push: {products: productObj}
                    })
                }
            })
            console.log("===============guestUserCart=============");
            console.log(cartItems);
            console.log("===============guestUserCart=============");

            resolve()
            // let productObj = {

            // }
            // let userCart = await db.get().collection(collection.CART_COLLECTION).find({user: objectId(userId)})
        })
    },

    removeCart: (productId,quantity, userId) => {
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: objectId(productId)},
            {
                $inc: {stock: parseInt(quantity)} 
            })
            db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(productId) }, {
                $pull: { products: { item: objectId(productId) } }
            }).then(() => {

                resolve({ removeCart: true });
            })
        })
    },

    deleteCart: (userId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let cart =await db.get().collection(collection.CART_COLLECTION).deleteOne({user: objectId(userId)});
                resolve(cart)
            } catch (error) {
                reject(error)
            }
        })
    },


    getTotalPrice: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                let totalPrice = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: 'product',
                            localField: 'item',
                            foreignField: '_id',
                            as: 'products'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
                        }
                    },

                    {
                        $group: {
                            _id: null, price: { $sum: { $multiply: ['$quantity', { $toInt: '$product.price' }] } }
                        }
                    }

                ]).toArray();

                console.log('*******************total-price*************');
                console.log(totalPrice);
                console.log('*******************total-price*************');
                resolve(totalPrice[0].price);
            } else {
                resolve(cart)
            }
        })

    },


    getTotalDiscountedAmount : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart = await db.get().collection(collection.CART_COLLECTION).find().toArray();
            if(cart){
            let totalDiscountedAmount = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {user: objectId(userId)}
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: 'product',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products' 
                    }
                },
                {
                    $project: {
                        item:1, quantity: 1, product: {$arrayElemAt: ["$products", 0]}
                    }
                },
                {
                    $lookup : {
                        from: 'category',
                        localField: 'product.category',
                        foreignField: '_id',
                        as: 'categoryDetails'
                    }
                },
                {
                    $unwind: '$categoryDetails'
                },
                {
                    $addFields : {
                        discountOff: {$cond: { if: {$gt : ["$product.discount", "$categoryDetails.discount"]}, then: {$toInt: "$product.discount"}, else: {$toInt:"$categoryDetails.discount"} }},

                    }
                }, {
                    $addFields : {
                        discountedAmount: {$round : {$divide : [{$multiply: [{$toInt: "$product.price"}, {$toInt:"$discountOff"}]}, 100]} },
                    }
                },
                {
                    $group: {
                        _id: null, totalDiscount: { $sum: { $multiply: ['$quantity', { $toInt: '$discountedAmount' }] } }
                        
                    }
                }
            ]).toArray();
            console.log("*********totalDiscountedAmount");
            console.log(totalDiscountedAmount);
            console.log("*********totalDiscountedAmount");
            resolve(totalDiscountedAmount[0].totalDiscount);
            console.log(totalDiscountedAmount[0].totalDiscount);

        }else{
            resolve(cart)
        }
            // console.log(cart);
        })
    },

    getTotalAmount : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart = await db.get().collection(collection.CART_COLLECTION).find().toArray();
            if(cart){
            let totalAmount = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {user: objectId(userId)}
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: 'product',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products' 
                    }
                },
                {
                    $project: {
                        item:1, quantity: 1, product: {$arrayElemAt: ["$products", 0]}
                    }
                },
                {
                    $lookup : {
                        from: 'category',
                        localField: 'product.category',
                        foreignField: '_id',
                        as: 'categoryDetails'
                    }
                },
                {
                    $unwind: '$categoryDetails'
                },
                {
                    $addFields : {
                        discountOff: {$cond: { if: {$gt : ["$product.discount", "$categoryDetails.discount"]}, then: {$toInt: "$product.discount"}, else: {$toInt:"$categoryDetails.discount"} }},

                    }
                },
                {
                    $addFields: {
                        discountedAmount: {$round : {$divide : [{$multiply: [{$toInt: "$product.price"}, {$toInt:"$discountOff"}]}, 100]} },
                    }
                },
                {
                    $addFields : {
                        priceAfterDiscount: {$round: {$subtract: [{$toInt: "$product.price"}, {$toInt:"$discountedAmount"}]} }

                    }
                },
                {
                    $group: {
                        _id: null, total: { $sum: { $multiply: ['$quantity', { $toInt: '$priceAfterDiscount' }] } }
                    }
                }
            ]).toArray();
            console.log("*********total-amount");
            console.log(totalAmount);
            console.log("*********total-amount");
            resolve(totalAmount[0].total);
            console.log(totalAmount[0].total);

        }else{
            resolve(cart)
        }
            // console.log(cart);
        })
    },

    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) });
            console.log("errrororororo");
            console.log(cart);
            console.log("errrororororo");

            if(cart != null){
                resolve(cart.products)
            }else{
                resolve()
            }
        })
    },

    // getCartProductList : (userId)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         try {
    //             let cart = await db.get().collection(collection.CART_COLLECTION).aggregate([{
    //                 $match: {user: objectId(userId)}
    //             }]).toArray()
    //             resolve(cart[0].products)
                
    //         } catch (error) {
    //             console.log(error)
    //         }
    //     })
    // }
}





