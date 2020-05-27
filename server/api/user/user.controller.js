const userModel = require("./user.model");
const sendRsp = require("../../utils/response").sendRsp;
const moment = require("moment");
const log = require("../../libs/log")(module);
const MSG = require("../../config/message");
const getUserService = require("./userService.js");

//get all the stories information
const getAllUsers = async (req, res) => {
    try{
        if(!req.params.id){
            return sendRsp(res,"400", "store id missing")
        }
        const getAllUsersData = await getUserService.getAllUsersData(req);
        sendRsp(res,"200","get users data successfully",getAllUsersData);
    }catch(err){
        return sendRsp(res,"400","get users data failed",err);
    }
};

//get one story information
const getUser = (req, res) => {
    
};

//Creating new story
const createUser = async(req, res) => {
    try{
        req.checkBody("StoreId", "Missing Query Params").notEmpty();
        req.checkBody("Firstname", "Missing Query Params").notEmpty();
        req.checkBody("Lastname", "Missing Query Params").notEmpty();
        req.checkBody("Email", "Missing Query Params").notEmpty();
        const errors = req.validationErrors();
        if (errors) {
            return sendRsp( res,400,MSG.GLOBAL_VALUES.missingParamsMsg,util.inspect(errors));
        }
        const createUserData = await getUserService.createUser(req.body);
            return sendRsp(res,"200","User Created successfully",createUserData);
        }catch(err){
            return sendRsp(res,"400","Create user failed",err);
        }
};

//update existing story information
const updateUser = async (req, res) => {
    try{
        if(!req.params.id){
            return sendRsp(res,"400", " user id is missing")
        }
        const createUserData = await getUserService.updateUser(req.params.id , req.body);
            return sendRsp(res,"200","User Created successfully",createUserData);
        }catch(err){
            return sendRsp(res,"400","Create user failed",err);
        }
};


module.exports = {
    getAllUsers,
    getUser,
    createUser,
    updateUser
}