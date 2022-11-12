var db = require('../config/connection')
var objectId = require('mongodb').ObjectId
const collection = require('../collections/collection')


module.exports = {
    getAllBannerDetails: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let bannerDetails = await db.get().collection(collection.BANNER_COLLECTION).find().toArray();
                resolve(bannerDetails)
                
            } catch (error) {
                reject(error)
            }
        })
    },


        getAllBannerDetails: ()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let bannerDetails = await db.get().collection(collection.BANNER_COLLECTION).find().toArray();
                resolve(bannerDetails)
                
            } catch (error) {
                reject(error)
            }
        })
    },

    getBannerDetails: (bannerId)=>{
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.BANNER_COLLECTION).findOne({ _id: objectId(bannerId) }).then(data => {
                    resolve(data)
                    console.log('****************************');
                    console.log(data);
                    console.log('****************************');
                })
                
            } catch (error) {
                reject(error)
            }
        })
    },

    addBanner: (bannerData)=>{
        
        return new Promise(async(resolve,reject)=>{
            try {
                let banner = await db.get().collection(collection.BANNER_COLLECTION).insertOne(bannerData);
                resolve(banner);
                
            } catch (error) {
                reject(error)
            }
        })
    },

    updateBanner: (bannerId, banner) => {
        console.log(bannerId);
        console.log(banner)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).updateOne({ _id: objectId(bannerId) },
                {
                    $set: {
                        name: banner.name,
                        description: banner.description,
                        img: banner.img
                    }
                }).then(data => {
                    console.log('//////////////////////////////////////////');
                    console.log(data)
                    console.log('//////////////////////////////////////////');
                    resolve(data);
                }).catch(error=>{
                    reject(error)
                })
        })
    },

    deleteBanner: (bannerId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let banner = await db.get().collection(collection.BANNER_COLLECTION).deleteOne({ _id: objectId(bannerId) });
                resolve(banner);
                
            } catch (error) {
                console.log(error)
            }
        })
    },
}