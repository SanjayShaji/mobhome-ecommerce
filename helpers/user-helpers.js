var db = require('../config/connection')
const collection = require('../collections/collection')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
require("dotenv").config();

var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});

module.exports = {

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    // doSignup: (user, callback)=>{
    //     console.log(user)
    //     db.get().collection(collection.USER_COLLECTION).insertOne(user).then((data)=>{
    //         console.log(data.insertedId);
    //         callback(data); 
    //     })
    // },

    doSignup: (userData) => {

        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10);
            console.log(userData.password)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data)
            })
        })
    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("Login success");
                        response.user = user;
                        response.status = true;
                        console.log(response)
                        resolve(response);
                    } else {
                        console.log("user is blocked");
                        response.status = false
                        resolve(response)
                    }
                })
            } else {
                response.status = false;
                resolve(response)
            }
        })
    },

    doOtpLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ phoneNumber: userData.phoneNumber })
            if (user) {
                console.log("otp login successful");
                response.user = user;
                response.status = true;
                console.log(response);
                resolve(response);
            } else {
                console.log("otp logiin failed");
                resolve({ status: false })
            }
        })
    },

    

    // doOtpVerify : (userData)=>{
    //     return new Promise(async(resolve, reject)=>{
    //         let user = await db.get().collection(collection.USER_COLLECTION).find();

    //     })
    // },
 
    doVerifySignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email });
            resolve(user);
        })
    },

    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).find().toArray();
            resolve(user);
        })
    },

    blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                { $set: { status: false } }
            )
            resolve(user)
        })
    },

    unblockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                { $set: { status: true } }
            )
            resolve(user)
        })
    },

    userStatusChecker: () => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).find({ status: true })
            resolve(user);

        })
    },

    // getCategoryDetails: () => {
    //     return new Promise(async (resolve, reject) => {
    //         let category = await db.get().collection('category').find().toArray();
    //         resolve(category)
    //     })
    // },


    
    getUsertDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
            resolve(user);
        })
    },
    
    changePassword: (userData)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
                if (user) {
                    bcrypt.compare(userData.oldPassword, user.password).then(async(status) => {
                        if (status) {
                            let password = await bcrypt.hash(userData.confirmPassword, 10);

                            let passwordUpdate = await db.get().collection(collection.USER_COLLECTION).updateOne({email: userData.email},
                                {
                                    $set: {password : password}
                                }) 
                            console.log("password changed successfully");
                            
                            console.log(passwordUpdate)
                            resolve(passwordUpdate);
                        } else {
                            console.log("incorrect password");
                            
                            resolve({status: false})
                        }
                    })
                } else {
                    response.status = false;
                    resolve(response)
                }
            } catch (error) {
                
            }
        })
    },

    generateRazorPay: (orderId, total) => {
        return new Promise((resolve, reject) => {

            instance.orders.create({
                amount: total*100,
                currency: "INR",
                receipt: "" + orderId,

            }, (err, order) => {
                if (err) throw err
                console.log("New Order: ", order);
                resolve(order)
            })
        })
    },

    verifyPayment: (details) => {
        return new Promise(async (resolve, reject) => {
            try {
                const { createHmac } = await import('node:crypto');
                const secret = '81JVXgUekXFKGnjpfpcbyfsw';
                const hash = createHmac('sha256', secret)
                    .update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
                    .digest('hex');
    
                    if(hash===details['payment[razorpay_signature]']){
                        resolve()
                    }else{
                        reject()
                    }
                console.log(hash);
                
            } catch (error) {
                console.log(error)
            }
            
        })
    },

    changePaymentStatus: (orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('order').updateOne({_id: objectId(orderId)},
                {
                    $set: {
                        status: 'placed'
                    }
                }
                ).then(()=>{
                    resolve();
                })
        })
},


}

