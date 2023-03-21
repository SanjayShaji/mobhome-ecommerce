var db = require('../config/connection')
var objectId = require('mongodb').ObjectId

const collection = require('../collections/collection')


module.exports = {

    addOrRemoveWishlist : (productId, userId) => {
        let productObj = {
            item: objectId(productId),
            // quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ userId: objectId(userId) });
            if (userCart) {
                let productExist = userCart.products.findIndex(product => product.item == productId)
                if (productExist != -1) {
                    console.log("remove")
                    await db.get().collection(collection.WISHLIST_COLLECTION).updateOne({
                        userId: objectId(userId), 'products.item': objectId(productId)
                    },{
                        $pull : {products : {item: objectId(productId)}}
                    })                    
                    resolve({remove: true})
                    
                }else{
                    /////////////////////////////
                    console.log("add")
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ userId: objectId(userId) },
                        {
                            $push: { products: productObj }

                        }).then(() => {
                            resolve({add: true});
                        })
                    }
            } else {
                console.log("add")
                let wishListObj = {
                    userId: objectId(userId),
                    products: [productObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishListObj).then(() => {
                    resolve({add: true});
                })
            }
        })
    },


    getWishListCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let count = 0;
                let wishList = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ userId: objectId(userId) });
                if (wishList) {
                    count = wishList.products.length
                }
                console.log("*********wishlist count**********");
                console.log(count);
                resolve(count);
                console.log("*********wishlist count**********");
            } catch (e) {
                reject(e);
            }
        })
    },

    getWishListItems: (userId) => {
        return new Promise(async (resolve, reject) => {
            let items = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { userId: objectId(userId) }
                },
                {
                    $unwind: "$products"
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
                        item:1, quantity: 1, product: {$arrayElemAt: ['$products', 0]}
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
                        discountOff: {$cond: { if: {$gt : ['$product.discount', '$categoryDetails.discount']}, then: {$toInt: '$product.discount'}, else: {$toInt:'$categoryDetails.discount'} }},
    
                    }
                },
                {
                    $addFields: {
                        
                        discountedAmount: {$round : {$divide : [{$multiply: [{$toInt: '$product.price'}, {$toInt:'$discountOff'}]}, 100]} },
                    }
                },
                {
                    $addFields: {
                        
                        priceAfterDiscount: {$round: {$subtract: [{$toInt: '$product.price'}, {$toInt:'$discountedAmount'}]} }
                    }
                },
                // {
                //     $addFields: {
                        
                //         totalAfterDiscount: { $multiply: ['$quantity', { $toInt: '$priceAfterDiscount' }] }
                //     }
                // }
            ]).toArray();
            console.log(items);
            resolve(items);

        })
    },

    getWishListProductList : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({userId: objectId(userId)})
            resolve(wishlist.products)
        })
    },

}