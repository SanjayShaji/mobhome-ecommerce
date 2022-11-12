

function addToCart(proId){
    $.ajax({
        url: '/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count = $('#cart-count').html()
                let guestCartCount = $('#guest-cart-count').html()

                count= parseInt(count)+1
                guestCartCount = parseInt(guestCartCount)+1
                $("#cart-count").html(count)
                $('#guest-cart-count').html(guestCartCount)
                
                Swal.fire({
                    // position: 'top-end',
                    icon: 'success',
                    title: 'Item added to cart',
                    showConfirmButton: false,
                    timer: 500
                  })
                // location.reload()
                document.getElementById('cart'+proId).innerHTML = `<a href="/cart">Go To Cart</a>`
            }
        }
    })
}

function changeQuantity(cartId, productId, userId, count){
    let quantity = parseInt(document.getElementById(productId).innerHTML);
    count = parseInt(count)
    $.ajax({
        url:'/change-product-quantity',
        data:{
            user: userId,
            cart: cartId,
            product: productId,
            count: count,
            quantity: quantity
        },
        method:'post',
        success:(response)=>{
            if(response.limit){
                document.getElementById(productId).innerHTML=quantity
                // alert("product removed from cart");
                // location.reload();
            }else{

                console.log(response)
                quantity=document.getElementById(productId).innerHTML=quantity+count

                // let price=parseInt(document.getElementById('price'+productId).innerHTML)
                let priceAfterDiscount=document.getElementById('priceAfterDiscount'+productId).innerHTML   
                let totalAfterDiscount = document.getElementById('totalAfterDiscount'+productId).innerHTML= priceAfterDiscount*quantity
                console.log(totalAfterDiscount)
                
                document.getElementById('totalPrice').innerHTML = response.totalPrice
                document.getElementById('totalAmount').innerHTML= response.totalAmount
                document.getElementById('totalDiscount').innerHTML= response.totalDiscount
                let stock = document.getElementById('Stock'+productId).innerHTML = response.stock
                // let stock = response.stock
                
                if(stock<=0){
                    
                    document.getElementById('stockStatus'+productId).innerHTML = "out of stock"
                    document.getElementById('stockStatus'+productId).style.color = "red"
                    document.getElementById('quantityButton'+productId).setAttribute("disabled","disabled");
                    // document.getElementById('quantityButton'+productId).style.display = 'none'
                }else{
                    document.getElementById('stockStatus'+productId).innerHTML = ""
                    document.getElementById('quantityButton'+productId).removeAttribute("disabled");
                    // document.getElementById('quantityButton'+productId).style.display = 'block'

                }
                console.log(stock)
                // document.getElementById('totalStock').

            }
        }
    })
}

function addToWishList(productId){
$.ajax({
    url: '/add-to-wish-list/'+productId,
    method: 'get',
    success: (response)=>{
        if(response.status){
            let count = $('#wish-list-count').html();
            count = parseInt(count)+1;
            $('#wish-list-count').html(count)
            document.getElementById('wishlist'+productId).innerHTML = `<i class="bi bi-heart-fill text-danger"></i>`
        }
    }
})

}


