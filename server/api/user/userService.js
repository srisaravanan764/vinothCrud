let userModels = require("./user.model");
const moment = require("moment");



const getAllUsersData = async (req) =>{
    try{
    let query ={};
    if(req.params.id){
        query={StoreId: parseInt(req.params.id)};
    };
    const getUsers = await userModels.find(query,{_id:0,Firstname:1,Lastname:1,Email:1}).exec()    
    return getUsers;
    }catch(err){
        return err
    }
 }

 const createUser = async (userData) =>{
    try{
        let userInsert  = new userModels(userData);
        await userInsert.save((err, userData) => {
            if(err){
                return err
            }
            return userData;
        });

    }catch(err){
        return err
    }
 }

 const updateUser = async (Id,updateData) =>{
    try{
        let updateuUserData = {
            StoreId : updateData.StoreId ,
            Firstname : updateData.Firstname ,
            Lastname : updateData.Lastname ,
            Phone : updateData.Phone ,
            Email: updateData.Email
        }
        let updateResp = await userModels.findOneAndUpdate({Id: parseInt(Id) }, {$set :updateuUserData }, {upsert:true},(err, userData) => {
            if(err){
                return err
            }
            return userData;
        });
        return updateResp;

    }catch(err){
        return err
    }
 }

 module.exports = {
    getAllUsersData,
    createUser,
    updateUser
 }