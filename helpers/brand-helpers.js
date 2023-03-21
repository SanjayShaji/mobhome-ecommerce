var db = require('../config/connection');
var objectId = require('mongodb').ObjectId;
const collection = require('../collections/collection');


module.exports = {
    addBrand : (details)=>{
        return new Promise(async(resolve,reject)=>{
            let brand = await db.get().collection(collection.BRAND_COLLECTION).insertOne(details);
            resolve(brand);
        });
    },

    updateBrand: (brandId, brand) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).updateOne({ _id: objectId(brandId) },
                {
                    $set: {
                        name: brand.name,
                        description: brand.description,
                        img: brand.img
                    }
                }).then(data => {
                console.log('//////////////////////////////////////////');
                console.log(data);
                console.log('//////////////////////////////////////////');
                resolve(data);
            }); 
        });
    },

    getBrandDetails: (brandId)=>{
        return new Promise(async(resolve,reject)=>{
            let brand = await db.get().collection(collection.BRAND_COLLECTION).findOne({_id: objectId(brandId)});
            resolve(brand);
        });
    },

    deleteBrand: (brandId)=>{
        return new Promise(async(resolve,reject)=>{
            let brand = await db.get().collection(collection.BRAND_COLLECTION).deleteOne({_id: objectId(brandId)});
            resolve(brand);
        });
    },

    getAllBrandDetails: ()=>{
        return new Promise(async(resolve,reject)=>{
            let brand= await db.get().collection(collection.BRAND_COLLECTION).find().toArray();
            resolve(brand);
        });
    },

};
