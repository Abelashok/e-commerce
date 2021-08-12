var db=require('../config/connection')
var collection=require('../config/collections')
var objectId=require('mongodb').ObjectID
const { response } = require('express')
const { ObjectID } = require('bson')
module.exports={
    
    addProduct:(products,callback)=>{
        products.price=parseInt(products.price)
        db.get().collection('products').insertOne(products).then((data)=>{
            
            callback(data.ops[0]._id)

        })
    },
    getAllProducts:()=>{
       return new Promise(async(resolve,reject)=>{
           let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
           resolve(products)
       })
    },
    deleteProduct:(proId)=>{
      return new Promise((resolve,reject)=>{
          console.log(proId);
          console.log(objectId(proId));
        db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(proId)}).then((response)=>{
            resolve(response)
        }) 
      })  
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        
    })
},
updateProduct:(proId,proDetails)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
            $set:{
                name:proDetails.name,
                description:proDetails.description,
                category:proDetails.category,
                price:proDetails.price
            }
        }).then((response)=>{
            resolve()
        })
    })
}
}