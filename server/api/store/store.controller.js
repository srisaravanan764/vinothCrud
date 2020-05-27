const sendRsp = require("../../utils/response").sendRsp;
const moment = require("moment");
const log = require("../../libs/log")(module);
const MSG = require("../../config/message");
const userStrores = require("./storeService.js");
//Retrieving a Store by ID and Retrieving list of Stores
const getAllStores = async (req, res) => {
    try{
        const getAllStoresData = await userStrores.getAllStoriesData(req);
        return sendRsp(res,"200","get users data successfully",getAllStoresData);
    }catch(err){
        return sendRsp(res,"400","get users data failed",err);
    }

};

//get one story information
const getStore = async (req, res) => {
    try{
            const getAllStoresData = await userStrores.getAllStoriesData(req);
            return sendRsp(res,"200","get users data successfully",getAllStoresData);
        }catch(err){
            return sendRsp(res,"400","get users data failed",err);
        }
};

//Creating new story
const updateStore = async (req, res) => {
    try{
        req.checkBody("StoreId", "Missing Query Params").notEmpty();
        req.checkBody("Firstname", "Missing Query Params").notEmpty();
        req.checkBody("Lastname", "Missing Query Params").notEmpty();
        req.checkBody("Email", "Missing Query Params").notEmpty();
        const errors = req.validationErrors();
        if (errors) {
            return sendRsp( res,400,MSG.GLOBAL_VALUES.missingParamsMsg,util.inspect(errors));
        }
        const updateStoreData = await userStrores.updateStoreData(req);
        return sendRsp(res,"200","Update Store successfully", updateStoreData);
        }catch(err){
        return sendRsp(res,"400","Update Store failed",err);
        }    
};

const searchStores = async (req, res) => {
    try{
    const searchStoresData = await userStrores.searchStores(req);
    const respData = searchStoresData.length == 0 ? "No data match" : searchStoresData;
        return  sendRsp(res,"200","search users data successfully",{
        length : searchStoresData.length,
        data : respData
    });
    }catch(err){
        return sendRsp(res,"400","search users data failed",err);
    }
};

const customerCount = async (req, res) => {
    try{
        
    const customerCountData = await userStrores.customerCount(req);
    const respData = customerCountData.length == 0 ? "No data match" : customerCountData;
        return sendRsp(res,"200","search users data successfully",{
        length : customerCountData.length,
        data : respData
    });
    }catch(err){
        return sendRsp(res,"400","search users data failed",err);
    }
};

//customerCount

//update existing story information
const createStore = (req, res) => {};

 module.exports = {
    getAllStores,
    getStore ,
    createStore ,
    updateStore,
    searchStores,
    customerCount
 }