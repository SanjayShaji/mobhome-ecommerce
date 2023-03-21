var db = require('../config/connection')
var objectId = require('mongodb').ObjectId
const collection = require('../collections/collection')

module.exports = {
    placeOrder: (order, products, total, userId) => {

        return new Promise(async(resolve, reject) => {
            let orderPendingCheck = await db.get().collection(collection.ORDER_COLLECTION).findOne({userId: objectId(userId), status: 'pending'});
            console.log("][][[][][]]]");
            console.log(orderPendingCheck);
            console.log("][][[][][]]]");
            if(!orderPendingCheck){
            console.log(order, products, total);
            let status = order.paymentMethod === 'COD' || 'wallet' ? 'placed' : 'pending'
            
            if(order.paymentMethod == 'wallet'){
                total = parseInt(total)
                let userWallet = await db.get().collection(collection.USER_COLLECTION).updateOne({_id: objectId(userId)}, {
                    $inc : {wallet: -total}
                });
        
            }

            let orderObj = {
                // deliveryDetails: {
                //     addressId: objectId(order.addressId),
                // userId: objectId(order.userId),
                // lastName: order.lastName,
                // country: order.country,
                // address: order.address,
                // city: order.city,
                // state: order.state,
                // pincode: order.pincode,
                // phone: order.phone,
                // email: order.email
                // },
                addressId: objectId(order.addressId),
                userId: objectId(order.userId),
                paymentMethod: order.paymentMethod,
                products: products,
                totalPrice: order.totalPrice,
                totalDiscount: order.totalDiscount,
                totalAmount: total,
                discountedPrice: order.discountedPrice,
                totalPriceAfterOffer : order.totalPriceAfterOffer,
                status: status,
                date: new Date().toISOString().slice(0, 10),
                createdAt: new Date()
            }
            
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {

                // db.get().collection('cart').deleteOne({ user: objectId(userId) })
                db.get().collection('order').updateOne({_id: objectId(response.insertedId)}, {
                    $set : {'products.$[].status' : 'placed'}
                }, {upsert:true})
                resolve(response.insertedId);
            })
        }else{
            let order = await db.get().collection(collection.ORDER_COLLECTION).updateOne({userId: objectId(userId), _id: objectId(orderPendingCheck._id)},
            {
                $set: {status: 'placed'}
            })
            console.log("======ordeIdpending=====");
            console.log(order.insertedId);
            console.log("======ordeIdpending=====");

            resolve(orderPendingCheck._id)
        }
        })
    },

    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).sort({'createdAt': -1}).toArray();
            resolve(orders)
        })
    },

    getUserWalletOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) , paymentMethod : 'wallet'}).sort({'createdAt': -1}).toArray();
            resolve(orders)
        })
    },

    // getUserOrder: (userId, orderId)=>{
    //     return new Promise(async(resolve, reject)=>{

    //         let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({
    //             _id: objectId(orderId), userId: objectId(userId)
    //         })
    //         resolve(order)
    //     })
    // },

    getOrderedAddress: (orderId)=>{
        return new Promise(async(resolve, reject)=>{
            let address = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {_id: objectId(orderId)}
                },
                {
                    $lookup: {
                        from: 'address',
                        localField: 'addressId',
                        foreignField: '_id',
                        as: 'addressDetails'
                    }
                },
                {
                    $unwind: '$addressDetails'
                },
            ]).toArray();
            console.log("address-----00");
            console.log(address);
            console.log("address-----00");

            resolve(address[0])

        })
    },

    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        status: '$products.status'
                    }
                },
                {
                    $lookup: {
                        from: 'product',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product'
                },
                ///////////////////////
                {
                    $lookup: {
                        from: 'brand',
                        localField: 'product.brand',
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
                        localField: 'product.category',
                        foreignField: '_id',
                        as: 'categoryDetails'
                    }
                },
                {
                    $unwind: "$categoryDetails"
                },
                {
                    $addFields: {
                        // discountOffer : {$cond : [ {$gt : [{$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}]}, {$toInt: "$productOffer"}, {$toInt:"$categoryDetails.discount"}] },
                        discountOff: {$cond: { if: {$gt : ["$product.discount", "$categoryDetails.discount"]}, then: {$toInt: "$discount"}, else: {$toInt:"$categoryDetails.discount"} }},
                    }
                },
                {
                    $addFields :{
                        discountedAmount: {$round : {$divide : [{$multiply: [{$toInt: "$product.price"}, {$toInt:"$discountOff"}]}, 100]} },
                    }
                },
                {
                    $addFields : {
                        priceAfterDiscount: {$round: {$subtract: [{$toInt: "$product.price"}, {$toInt:"$discountedAmount"}]} }
                    }
                }

            ]).toArray();
            console.log("--------orderhelpers orders view========");
            console.log(orderProducts);
            console.log("--------orderhelpers orders view========");
            resolve(orderProducts)
        })
    },

    getOrderAmountDetails: (orderId)=>{
        return new Promise(async (resolve, reject) => {
            let getOrderAmountDetails = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id: objectId(orderId)})
            console.log("--------getOrderAmountDetails orders view========");
            console.log(getOrderAmountDetails);
            console.log("--------getOrderAmountDetails orders view========");
            resolve(getOrderAmountDetails)
        })
    },

    cancelOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                {
                    $set: { status: 'cancelled', orderCancelled: true }
                }, { upsert: true }
            );
            resolve(order);
        })
    },

    productOrderCancel: (orderId, productId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let order = await db.get().collection(collection.ORDER_COLLECTION).updateOne(
                    {
                    _id: objectId(orderId), 'products.item' : objectId(productId)
                },
                {
                    $set: {'products.$.status' : 'cancelled'}
                }
                )
            } catch (error) {
                
            }
        })
    },

    updateOrderStatus: (data) => {
        return new Promise(async (resolve, reject) => {
            console.log(data);
            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id: objectId(data.orderId)})
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id: objectId(data.userId)})
            
            if(data['status'] == 'cancelled' && order.paymentMethod != 'COD'){
            if(user.wallet){
                await db.get().collection(collection.USER_COLLECTION).updateOne({_id: objectId(data.userId)}, {
                    $inc: {wallet: order.totalAmount}
            })
            }else{
                await db.get().collection(collection.USER_COLLECTION).updateOne({_id: objectId(data.userId)}, {
                    $set: {wallet: order.totalAmount}
            })
            }
        }
            let updateStatus = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(data.orderId), userId: objectId(data.userId) },
                {
                    $set: { status: data.status }
                }
            )
            resolve(updateStatus);
        })
    },

    updateProductStatus: (data)=>{
        return new Promise(async(resolve,reject)=>{
            let updateStatus = await db.get().collection(collection.ORDER_COLLECTION).updateOne(
                {
                    _id: objectId(data.orderId), userId: objectId(data.userId), 'products.item': objectId(data.productId)
                },
            {
                $set: {'products.$.status': data.status}
            }
            )
        })
    },

    returnOrder: (orderData)=>{
        return new Promise(async(resolve, reject)=>{
            let order = await db.get().collection('return').insertOne(orderData);
            resolve(order);
        })
    },

    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray();
            resolve(orders);
        })
    },
    

    // updateOrderStatus: (data) => {
    //     return new Promise(async (resolve, reject) => {
    //         console.log(data);

    //         let updateStatus = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(data.orderId), userId: objectId(data.userId) },
    //             {
    //                 $set: { status: data.status }
    //             }
    //         )
    //         resolve(updateStatus);
    //     })
    // },


    getOrderAllDetails: () => {
        return new Promise(async (resolve, reject) => {

            let details = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                
                {
                    $lookup: {
                        from: 'address',
                        localField: 'addressId',
                        foreignField: '_id',
                        as: 'addressDetails'
                    }
                },
                {
                    $unwind: '$addressDetails'
                },
                {
                    $sort: {'createdAt': -1}
                }

            ]).toArray()
            console.log(details);
            resolve(details)
        })
    },

    getTotalSaleGraph : ()=> {
        return new Promise(async (resolve, reject) => {
            let dailySales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { status: { $nin: ['cancelled', 'pending'] } }
                },
                {
                    $group: {
                        _id: {$dateToString:{format: "%Y-%m-%d", date: "$createdAt"}},
                        total: { $sum: "$totalAmount" }
                    }
                },
                {
                    $sort: {
                        '_id': -1,
                    }
                },
                {
                    $limit: 7
                },
                {
                    $sort: {
                        '_id': 1,
                    }
                }
            ]).toArray()

            let monthlySales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { status: { $nin: ['cancelled', 'pending'] } }
                },
                {
                    $group: {
                        _id: {$dateToString:{format: "%Y-%m", date: "$createdAt"}},
                        total: { $sum: "$totalAmount" }
                    }
                },
                {
                    $sort: {
                        '_id': -1,
                    }
                },
                {
                    $limit: 7
                },
                {
                    $sort: {
                        '_id': 1,
                    }
                }
            ]).toArray()

            let yearlySales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { status: { $nin: ['cancelled', 'pending'] } }
                },
                {
                    $group: {
                        _id: {$dateToString:{format: "%Y", date: "$createdAt"}},

                        total: { $sum: "$totalAmount" }
                    }
                },
                {
                    $sort: {
                        '_id': -1,
                    }
                },
                {
                    $limit: 7
                },
                {
                    $sort: {
                        '_id': 1,
                    }
                }
            ]).toArray()
            console.log(dailySales, monthlySales, yearlySales);
            resolve({ dailySales, monthlySales, yearlySales });
        })
    },

    getSalesReport : ()=>{
        let month = new Date().getMonth()+1 
        let year = new Date().getFullYear()
        return new Promise(async(resolve,reject)=>{
            let weeklyReport = await db.get().collection(collection.ORDER_COLLECTION).find({
                createdAt: {
                    $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
                }
            }).toArray()

            let monthlyReport = await db.get().collection(collection.ORDER_COLLECTION).find({
                 "$expr": { "$eq": [{ "$month": "$createdAt" }, month] } 
                }).toArray()

            let yearlyReport = await db.get().collection(collection.ORDER_COLLECTION).find({
                "$expr": { "$eq": [{ "$year": "$createdAt" }, year] } 
            }).toArray()
            resolve({weeklyReport, monthlyReport, yearlyReport})
        })
    },

    getPaymentGraph: ()=>{
        return new Promise(async(resolve, reject)=>{
            let totalPayments = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({
                status : {$nin: ['cancelled']}
            })

            let totalCOD = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({
                paymentMethod: 'COD', status: {$nin: ['cancelled', 'pending']}
            })

            let totalUPI = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({
                paymentMethod: 'UPI', status: {$nin: ['cancelled', 'pending']}
            })

            let totalPaypal = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({
                paymentMethod: 'paypal', status: {$nin: ['cancelled', 'pending']}
            })

            let percentageCOD = Math.round(totalCOD/totalPayments*100);
            let percentageUPI = Math.round(totalUPI/totalPayments*100);
            let percentagePaypal = Math.round(totalPaypal/totalPayments*100);

            console.log(totalPayments, totalCOD, totalUPI, totalPaypal)
            resolve({percentageCOD, percentageUPI, percentagePaypal})
        })
    },

}