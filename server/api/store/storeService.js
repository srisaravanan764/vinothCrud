const moment = require("moment");
const storeModel = require("./store.model");
const userModel  = require("../user/user.model")

const getAllStoriesData = async (req) =>{
    try{
        let query ={};
        if(req.query.StoreId){
            query={Id: parseInt(req.query.StoreId)};
        };
        const getStores = await storeModel.find(query,{_id:0,Id:1,Name:1}).exec()
        return getStores;
    }catch(err){
        return err
    }
 }

 const updateStoreData = async (req) =>{
    try{
        let query ={};
        if(req.params.id){
            query={ Id: req.params.id};
        };
        let fieldsData = {
            Phone : req.body.Phone ? req.body.Phone : "",
            Name:req.body.Name ? req.body.Name : "",
            Domain : req.body.Domain ? req.body.Domain : "", 
            Status : req.body.Status ? req.body.Status : false,
            Street : req.body.Street ? req.body.Street : "",
            State :req.body.State ? req.body.State : "",
        }
        
        const getStores = await storeModel.updateOne(query,{$set : fieldsData}, {upsert:true,new:true}).exec()
        return getStores;
    }catch(err){
        return err
    }
 }

 const searchStores = async (req) =>{
    try{
        let query ={};
        if(req.query.storeName){
            query={Name: { $regex:req.query.storeName, $options: "i" }};
        };
      //  { $regex:req.query.storeName, $options: "si" }
                //{ name: { $in: [ /^acme/i,
        const getStores = await storeModel.find(query,{_id:0,Id:1,Name:1}).limit(5).exec()
        return getStores;
    }catch(err){
        return err
    }
 }

 const customerCount = async (req) =>{
    
    try{
        let query ={};
        if(req.query.storeName){
            query={};
        };

        const getStores = await userModel.aggregate([
            {
              $lookup: {
                from: "stories",
                localField: "StoreId",
                foreignField: "Id",
                as: "StoryData"
              },
            },
            { "$unwind": "$StoryData" },
            {
                "$group": { 
                    "_id": "$StoryData",
                    "total": { "$sum": 1 }
                }
            },
            {
                $sort : {total : -1}
            },
            {
                $project : {
                    _id :1,
                    total:1
                }
            }
          ]).exec();
          let respone = [...getStores].map(getData =>{
            return {
                '_id' : getData['_id']['_id'],
                'Id' : getData['_id']['Id'],
                'StoreId' : getData['_id']['StoreId'],
                'Name' : getData['_id']['Name'],
                'total' : getData['total']}
            
          })
        return respone;
    }catch(err){
        return err
    }
 }

 module.exports = {
    getAllStoriesData,
    updateStoreData,
    searchStores,
    customerCount
 }