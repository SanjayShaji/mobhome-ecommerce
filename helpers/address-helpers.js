var db = require('../config/connection')
const collection = require('../collections/collection')
var objectId = require('mongodb').ObjectId

module.exports = {
    addAddress: (addressDetails, userId) => {
        try {
            let details = {
                userId: objectId(userId),
                firstName: addressDetails.firstName,
                lastName: addressDetails.lastName,
                country: addressDetails.country,
                address: addressDetails.address,
                city: addressDetails.city,
                state: addressDetails.state,
                pincode: addressDetails.pincode,
                phone: addressDetails.phone,
                email: addressDetails.email
            }
            return new Promise(async (resolve, reject) => {
                let address = await db.get().collection(collection.ADDRESS_COLLECTION).insertOne(details);
                resolve(address);
            }).catch(error=>{
                console.log(error)
            })
            
        } catch (error) {
            console.log(error)
        }
    },

    getUserAddress: async (userId) => {
        console.log("userIdjdfhhfjdhf");
        console.log(userId)
        console.log("userIdjdfhhfjdhf");
            return await new Promise(async (resolve, reject) => {
                try {
                    let address = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId: objectId(userId) }).toArray()
                    console.log(address)
                    resolve(address)
                    
                } catch (error) {
                    console.log(error)
                }
            })
    },

    getAddress: async (addressId)=>{
        console.log("addresfefjdfhkj");
        console.log(addressId)
        console.log("addresfefjdfhkj");
        try {
            return await new Promise(async (resolve, reject) => {
                let address = await db.get().collection(collection.ADDRESS_COLLECTION).findOne(
                    {
                        _id: objectId(addressId)
                    })
                resolve(address)
            })
        } catch (error) {
            console.log(error)
        }
    },

    editAddress : (addressId, addressDetails)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let address = await db.get().collection(collection.ADDRESS_COLLECTION).updateOne({_id: objectId(addressId)},
                {
                    $set: {
                        firstName: addressDetails.firstName,
                        lastName: addressDetails.lastName,
                        country: addressDetails.country,
                        address: addressDetails.address,
                        city: addressDetails.city,
                        state: addressDetails.state,
                        pincode: addressDetails.pincode,
                        phone: addressDetails.phone,
                        email: addressDetails.email
                    } 
                })
                resolve(address)
            } catch (error) {
                reject(error)
            }
        })
    },

    deleteAddress : (addressId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let address = await db.get().collection(collection.ADDRESS_COLLECTION).deleteOne(
                    {
                        _id:objectId(addressId)
                    })
                resolve(address)
            } catch (error) {
                reject(error)
            }
        })
    }
}
