var db = require('../config/connection')
var objectId = require('mongodb').ObjectId
const collection = require('../collections/collection')


module.exports = {
    addReview: (userId, reviewData) => {
        reviewData.rating = parseInt(reviewData.rating) / 5 * 100
        data = {
            product: objectId(reviewData.productId),
            user: objectId(userId),
            review: reviewData.review,
            rating: reviewData.rating,
            createdAt: new Date()
        }
        return new Promise(async (resolve, reject) => {
            let review = await db.get().collection(collection.REVIEW_COLLECTION).insertOne(data)
            console.log(review)
            resolve(review)
        })
    },

    getReviews: async (productId) => {
        return new Promise(async (resolve, reject) => {
            let reviews = await db.get().collection(collection.REVIEW_COLLECTION).aggregate([
                {
                    $match: { product: objectId(productId) }
                },
                {
                    $lookup: {
                        from: 'user',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                }
            ]).toArray()
            resolve(reviews)
        })
    },

    getReviewsCount: async (productId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let review = await db.get().collection(collection.REVIEW_COLLECTION).find({ product: objectId(productId) });
            if (review) {
                count = review.products.length;
            }
            resolve(count);
        });
    },

    averageReview: async (productId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let review = await db.get().collection(collection.REVIEW_COLLECTION).find({ product: objectId(productId) }).toArray();
            console.log(review);
            if(review){
                count = review.length
            }
            let average = 0
            let reviewTotal = await db.get().collection(collection.REVIEW_COLLECTION).aggregate([
                { $match: { product: objectId(productId) } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$rating" }
                    }
                }
            ]).toArray();
            // console.log(reviewTotal);
            let total = 0
            if(reviewTotal.length != 0){
                total = reviewTotal[0].total
                average = Math.round((total/(count*100))*100)
            }

            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: objectId(productId)});
            
            if(product.reviewsRating != average || product.reviewsCount != count){
                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: objectId(productId)}, {
                    $set: {reviewsRating : average, reviewsCount: count}
                });
            }
            
            console.log(average);
            resolve(average);
        });

    }
}