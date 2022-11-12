module.exports={
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
    indexing:(index)=>{
        return parseInt(index)+1;
    },
    statusColor:(value)=>{
        if(value==='cancelled'){
            return 'text-danger'
        }else if(value==='placed'){
            return 'text-success'
        }
    },
    wishlistHeartIcon:(productId,wishlistArray,options)=>{
        if(wishlistArray){
            function doesAnyWishlistIdMatch(wishlist){
                return productId == wishlist._id
            }
            if(wishlistArray.some(doesAnyWishlistIdMatch)){
                return options.fn()
            }else{
                return options.inverse();   
            }
        }else{
            return options.inverse();   
        }
        
    },
    
    calculateDiscount:(discount,amount)=>{
        return Math.floor(parseInt(amount)-((parseInt(discount)/100)*parseInt(amount)))
    },
    
    checkGreater:(categoryDiscount,productDiscount,options)=>{
        let discount =(parseInt(categoryDiscount)>parseInt(productDiscount))?categoryDiscount:productDiscount
        return options.fn(discount)
    },
    productCategoryDiscount:(productDiscount,categoryArray,brandId,options)=>{
            let category = categoryArray.filter((category)=>{
                            return category._id==brandId
            })
            let discount=0
            if(category.length!=0){
            discount =(parseInt(category[0].discount)>parseInt(productDiscount))?parseInt(category[0].discount):parseInt(productDiscount)
            }
         if(discount!=0){
            return options.fn({discount:discount})
         }else{
            return options.inverse()
         }
    },
    parser:(value)=>{
        return parseInt(value)
    },
    brandFilterCheckBox:(brandArray,brandId,options)=>{
        if(brandArray){
            function doesAnyBrandIdMatch(element){
                return brandId==element
            }
            if(brandArray.some(doesAnyBrandIdMatch)){
                return options.fn()
            }else{
                return options.inverse();   
            }
        }else{
            return options.inverse();   
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
}