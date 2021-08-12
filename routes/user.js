const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers');
var userHelpers=require('../helpers/user-helpers');
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }
  else{
    res.redirect('/login')
  }
 }
/* GET home page. */
router.get('/',async function(req, res, next) {
 let user=req.session.user
 console.log('hello')
 console.log(user);
 console.log('hello')
 let cartCount=null
 if(req.session.user){
 cartCount=await userHelpers.getCartCount(req.session.user._id)
 }
 productHelper.getAllProducts().then((products)=>{
  
    res.render('user/view-products',{products,user,cartCount})
    
   })
    
});
router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render('user/login',{"loginErr":req.session.LoginErr})
  req.session.LoginErr=false
  }
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup', (req,res)=>{
 userHelpers.doSignup(req.body).then((res)=>{
   console.log(res);
  
   req.session.user=response;
   req.session.loggedIn=true
   res.redirect('/login')
 }) 
})

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
   
      req.session.user=response.user
      req.session.loggedIn=true
      res.redirect('/')
    }else{
      req.session.loggedIn="invalid"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.user=null
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let totalValue=0 
  if(products.length>0){
    totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  }

  console.log(products);
  res.render('user/cart',{products,user:req.session.user._id,totalValue})
})
router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{ 
  console.log("api") ;
  console.log(req.body);
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
  // res.json({status:true})
   res.redirect('/')
  })
})
router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body)
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
   response.total=await userHelpers.getTotalAmount(req.body.user)
   res.json(response)
  })
})
router.post('/remove-from-cart',(req,res,next)=>{
  console.log(req.body)
  userHelpers.removeFrom(req.body).then(()=>{
    res.json(response)
  })
})
router.get('/place-order',verifyLogin, async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user});
})
router.post('/place-order',async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']=='COD'){
      res.json({codSuccess:true})
    }
    else {
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)
      })
    }
 
  })
  console.log(req.body);
})
router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})
router.get('/orders',verifyLogin,async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
 // console.log(orders)
  res.render('user/orders',{user:req.session.user,orders})
})
router.get('/view-order-products/:id',async(req,res)=>{
  console.log("hlooo");
  let products=await userHelpers.getOrderProducts(req.params.id)
 // console.log(products)
  res.render('user/view-order-products',{user:req.session.user,products})
})
router.post('/verify-payment',(req,res)=>{
  console.log(req.body)
  userHelpers.verifyPayment(req.body).then(()=>{
  userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
    console.log("payment success");
  res.json({status:true})
  })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:''})
  })
})

module.exports = router;
