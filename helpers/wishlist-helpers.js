var db = require('../config/connection')
var objectId = require('mongodb').ObjectId

const collection = require('../collections/collection')


module.exports = {
    addToWishList: (productId, userId) => {
        let productObj = {
            item: objectId(productId),
            // quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ userId: objectId(userId) });
            if (userCart) {
                let productExist = userCart.products.findIndex(product => product.item == productId)
                // console.log(productExist);
                if (productExist != -1) {
                    // db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ userId: objectId(userId), 'products.item': objectId(productId) },
                    //     {$inc: { 'products.$.quantity': 1 }}).then(() => {resolve()
                    // })
                    reject({status:false})
                } else {
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ userId: objectId(userId) },
                        {
                            $push: { products: productObj }

                        }).then(() => {
                            resolve();
                        })
                }

            } else {
                let wishListObj = {
                    userId: objectId(userId),
                    products: [productObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishListObj).then(() => {
                    resolve();
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
                    $lookup: {
                        from: 'product',
                        localField: 'products.item',
                        foreignField: '_id',
                        as: 'items'
                    }
                },
                {
                    $unwind: '$items'
                }
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

    removeWishListItem: (userId, productId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let items = await db.get().collection(collection.WISHLIST_COLLECTION).updateOne({
                    userId: objectId(userId), 'products.item': objectId(productId)
                },{
                    $pull : {products : {item: objectId(productId)}}
                })
                resolve(items)
            } catch (error) {
                reject(error)
            }
        })
    }
}