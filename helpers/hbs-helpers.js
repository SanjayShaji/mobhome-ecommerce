
module.exports = {

    count: (index)=> {
       return index+1
        
    },

    ifEquals:(value1,value2,value3,options)=>{

        if(value1==value2){
            if(value3){
                return options.fn(value3)
            }
           return options.fn()
        }else{
            if(value3)
            {   
                return options.inverse(value3);      
            }

            return options.inverse();   
        }
    },

    ifStatusEquals:(status, value1, value2, value3, value4, options)=>{

        if(status==value1 || status==value2 || status==value3){
            if(value4){
                return options.fn(value4)
            }
           return options.fn()
        }
        // else{
        //     if(value4)
        //     {   
        //         return options.inverse(value4);      
        //     }

        //     return options.inverse();   
        // }
    },

    ifFiltered : (brandId, filteredBrands, value3, options )=>{
        console.log("=======filtered=============");
        console.log(filteredBrands);
        console.log(brandId);
        console.log("====================");

        filteredBrands.filter((brand)=>{
            if(brand.brandDetails._id == brandId){
                return options.fn(value3)
            }
            return options.fn()
        })

    },

    ifCouponEquals : (value1, value2, value3, value4, options)=>{
        if(value1==true && value2==false && value3==false){
            if(value4){
                return options.fn(value4)
            }
           return options.fn()

        }
    },
    
    addedToCartCheck:(productId,cartArray,options)=>{
        if(cartArray){
            function doesAnyWishlistIdMatch(product){
                
                return productId.toString() == product.item.toString()
            }
            if(cartArray.some(doesAnyWishlistIdMatch)){
                return options.fn()
            }else{
                return options.inverse();   
            }
        }else{
            return options.inverse();   
        }
        
    },
    guestUserCartCheck :(productId, cartArray, options)=>{
        if(cartArray){
            function doesAnyCartIdMatch(product){
                return productId.toString() == product.toString()
            }
            if(cartArray.some(doesAnyCartIdMatch)){
                return options.fn()
            }else{
                return options.inverse()
            }
        }else{
            return options.inverse()

        }
    },
    
    brandFilterCheckBox:(brandArray,brandId,options)=>{
        if(brandArray){
            function doesAnyBrandIdMatch(element){
                return brandId==element
            }
            if(brandArray.brand.some(doesAnyBrandIdMatch)){
                return options.fn()
            }else{
                return options.inverse();   
            }
        }else{
            return options.inverse();   
        }
        
    },

    wishlistHeartIcon :(productId,cartArray,options)=>{
        if(cartArray){
            function doesAnyWishlistIdMatch(product){
                
                return productId.toString() == product.item.toString()
            }
            if(cartArray.some(doesAnyWishlistIdMatch)){
                return options.fn()
            }else{
                return options.inverse();   
            }
        }else{
            return options.inverse();   
        }
        
    },

    // wishlistHeartIcon:(productId,wishlistArray,options)=>{
    //     if(wishlistArray){
    //         function doesAnyWishlistIdMatch(wishlist){
    //             return productId == wishlist._id
    //         }
    //         if(wishlistArray.some(doesAnyWishlistIdMatch)){
    //             return options.fn()
    //         }else{
    //             return options.inverse();   
    //         }
    //     }else{
    //         return options.inverse();   
    //     }
        
    // },
    
    // ifCartEquals : (id, cart, options){
        
    // }
     
}

// {{#ifEquals this.orderDetails.status 'return-approved' false }}
//                         <td class="text-center">
//                             <h6 class="badge bg-success" style="font-size: 15px;">{{../this.orderDetails.status}}</h6>
//                         </td>
//                         {{else}}
//                         <td class="text-center">
//                             <select class="form-select form-select-sm mx-auto" id="selectStatus{{../this.orderDetails._id}}" style="width:80%;" onchange="changeStatus('{{../this.orderDetails._id}}')" name="status" aria-label=".form-select-lg example">
//                                 <option value="{{../this.orderDetails.status}}" hidden selected>{{../this.orderDetails.status}}</option>
//                                 <option value='cancelled'>cancelled</option>
//                                 <option value='placed'>placed</option>
//                                 <option value="shipped">shipped</option>
//                                 <option value="delivered">delivered</option>
//                             </select>
//                         </td>
// {{/ifEquals}}