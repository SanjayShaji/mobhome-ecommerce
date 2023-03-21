var db = require('../config/connection');
var objectId = require('mongodb').ObjectId;
const collection = require('../collections/collection');


module.exports = {

    addCoupon :(data)=>{
        return new Promise(async(resolve,reject)=>{
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).insertOne(data);
            resolve(coupon);
        });
    },

    couponAllDetails :()=>{
        return new Promise(async(resolve, reject)=>{
            let coupons = await db.get().collection(collection.COUPON_COLLECTION).find().toArray();
            resolve(coupons);
        });
    },

    deleteCoupon : (couponId)=>{
        return new Promise(async(resolve,reject)=>{
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id: objectId(couponId)});
            resolve(coupon);
        });
    },
    

    applyCoupon: ({ code }, total, userId) => {

        let response = {};

        let d = new Date();
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        let year = d.getFullYear();



        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;


        let time = [year, month, day].join('-');

        console.log(code, total, userId);
        return new Promise(async (resolve, reject) => {
            let couponFind = await db.get().collection(collection.COUPON_COLLECTION).findOne({ code: code });
            if (couponFind) {
                response.couponFind = true;
                let currentDate = time;
                console.log(currentDate);
                console.log(couponFind.expiryDate);
                if (currentDate > couponFind.expiryDate) {
                    response.expiredCoupon = true;
                    response.couponAppliedStatus = 'Sorry, Coupon is expired';
                    console.log(response.couponExpired);
                    resolve(response);
                } else {
                    response.expiredCoupon = false;
                    let couponAlreadyApplied = await db.get().collection('appliedCoupon').findOne({ userId: objectId(userId), couponId: couponFind._id });
                    if (couponAlreadyApplied) {

                        response.appliedCoupon = true;
                        response.couponAppliedStatus = 'Coupon already Applied';
                        resolve(response);

                    } else {
                        response.appliedCoupon = false;
                        response.couponAppliedStatus = 'Coupon Successfully applied';
                        let couponDiscountpercentage = couponFind.discount;
                        let discountPrice = Math.round((couponDiscountpercentage / 100) * total);
                        let totalPriceAfterOffer = Math.round(total - discountPrice);
                        response.totalPriceAfterOffer = Math.round(totalPriceAfterOffer);
                        response.discountPrice = discountPrice;

                        appliedCouponObj = {
                            userId: objectId(userId),
                            couponId: couponFind._id
                        };
                        db.get().collection('appliedCoupon').insertOne(appliedCouponObj);
                        resolve(response);
                        db.get().collection('user').updateOne({ _id: objectId(userId) },
                            {
                                $set: { couponId: couponFind._id }
                            }, { upsert: true }
                        );
                        // Swal.fire({
                        //     // position: 'top-end',
                        //     icon: 'success',
                        //     title: 'Coupon successfully applied',
                        //     showConfirmButton: false,
                        //     timer: 1500
                        //   })

                    }
                }
            } else {
                response.couponFind = false;
                response.couponAppliedStatus = 'Coupon not found';
                resolve(response);
            }

        });
    },



    getCouponPrice: (userId, total) => {
        let totalPrice = total;
        console.log(totalPrice);
        return new Promise((resolve, reject) => {
            db.get().collection('cart').aggregate([
                {
                    $match: { user: objectId(userId) }
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
                    $project: {
                        user: { $arrayElemAt: ['$user', 0] }
                    }

                },
                {
                    $lookup: {
                        from: collection.COUPON_COLLECTION,
                        localField: 'user.couponId',
                        foreignField: '_id',
                        as: collection.COUPON_COLLECTION
                    }
                },
                {
                    $project: {
                        user: 1, coupon: { $arrayElemAt: ['$coupon', 0] }
                    }
                },
                {
                    $project: {
                        discountedPrice: { $multiply: [{ $divide: [{ $toInt: '$coupon.discount' }, 100] }, totalPrice] }, coupon: 1
                    }
                },
                {
                    $project: {
                        discountedPrice: 1,
                        totalAfterDiscount: { $subtract: [totalPrice, '$discountedPrice'] },
                        couponId: '$coupon._id',

                    }
                }

            ]).toArray().then((response) => {
                console.log('********getDiscountPrice**********');
                console.log(response);
                console.log('********getDiscountPrice**********');
                resolve(response);

            });
        });
    },
};


