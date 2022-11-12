var db = require('../config/connection')
var objectId = require('mongodb').ObjectId
const collection = require('../collections/collection')


module.exports = {
    getALlCategories: ()=>{
        return new Promise(async(resolve,reject)=>{
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();
            resolve(category)
        })
    },

    addCategory: (categoryData) => {
        return new Promise(async (resolve, reject) => {
            console.log(categoryData);
            let categoryCount = await db.get().collection(collection.CATEGORY_COLLECTION).estimatedDocumentCount();
            console.log(categoryCount);
            if(categoryCount!=0){
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({name: categoryData.name});
            console.log(category);
            if(category!=null){
            if(categoryData.name===category.name){
                db.get().collection(collection.CATEGORY_COLLECTION).updateOne({name: categoryData.name},
                    {
                        $addToSet: {subCategories: categoryData.subCategory} 
                    }
                    )
                    resolve();
                }
            }else{
                let data = {
                    name : categoryData.name,
                    discount: categoryData.discount,
                    subCategories : [categoryData.subCategory]
                }
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(data).then(data => {
                    resolve(data);
                })
            }
            }else{
                let data = {
                    name : categoryData.name,
                    discount: categoryData.discount,
                    subCategories : [categoryData.subCategory]
                }
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(data).then(data => {
                    resolve(data);
                })
            }
        })
    },

    addDiscount: (discountData)=>{
        return new Promise(async(resolve,reject)=>{
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({name:discountData.category});
            if(category!=null){
            if(discountData.category === category.name){
                let discount = await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({name:discountData.category},
                    {
                        $set: {discount: discountData.discount}
                    })
                resolve(discount)
            }}else{
                resolve()
            }
        })
    },



    getCategoryDetails: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();
            resolve(category)
        })
    },
}