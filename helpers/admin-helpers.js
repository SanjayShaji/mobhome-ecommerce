
var db = require('../config/connection');
const bcrypt = require('bcrypt');
var objectId = require('mongodb').ObjectId;
const collection = require('../collections/collection');

require('dotenv').config();

const admin = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
};

module.exports = {

    doAdminLogin: (adminData)=>{
        return new Promise(async(resolve, reject)=>{
            let adminResponse = {};
            if(adminData.email === admin.email && adminData.password === admin.password){
                adminResponse.admin = admin;
                adminResponse.adminStatus = true;
                resolve(adminResponse);
            }else {
                console.log('admin Login failed');
                resolve({ adminStatus: false });
            }
        });
    },


    // getAllProducts: async (cb) => {
    //     await db.get().collection('product').find().toArray().then((ta) => {
    //         cb(ta);
    //     });
    // }, 

};