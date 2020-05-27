"use strict";

const customerModel = require("./customer.model");
const log = require("../../libs/log")(module);
const MSG = require("../../config/message");
const sendRsp = require("../../utils/response").sendRsp;
var util = require("util");
//Get All customers
exports.index = (req, res) => {
  const queryObj = {};
  queryObj.deleted = false;
  queryObj.role = "customer";
  customerModel
    .find(queryObj, null, {})
    .lean()
    .exec()
    .then(customer => {
      // console.log("customers ",customers);
      let listCustomer = customer.map(customer => {
        return {
          _id: customer._id,
          name: customer.name,
          email: customer.email,
          role: customer.role
        };
      });

      return sendRsp(res, 200, MSG.USER.successMsgGetPlural, {
        total: customer.length,
        customers: listCustomer
      });
    })
    .catch(err => {
      log.error(MSG.POST.errorMsgGetPlural, err);
      return sendRsp(res, 500, MSG.USER.errorMsgGetPlural);
    });
};

//Get A Single customer Details
exports.show = (req, res) => {
  const id = req.params.id;

  if (id == "") {
    log.error("500", MSG.USER.errorMsg);
    return sendRsp(res, 500, MSG.USER.errorMsg);
  }
  const params = {
    _id: id
  };

  const selectData = {
    _id: 1,
    name: 1,
    email: 1,
    role: 1
  };
  // console.log("params ",params);

  customerModel
    .find(params, selectData)
    .exec()
    .then(customer => {
      if (customer.length > 0) {
        log.info(MSG.USER.successMsgGetSingular);
        return sendRsp(res, 200, MSG.USER.successMsgGetSingular, customer);
      } else {
        log.error(MSG.USER.notFoundMsgSingular, err);
        return sendRsp(res, 404, MSG.USER.notFoundMsgSingular);
      }
    })
    .catch(err => {
      log.error(MSG.USER.notFoundMsgSingular, err);
      return sendRsp(res, 404, MSG.USER.notFoundMsgSingular);
    });
};

//update customer
exports.update = (req, res) => {
  const customerId = req.params.id;
  if (customerId == "") {
    log.error("500", MSG.USER.errorMsg);
    return sendRsp(res, 500, MSG.USER.errorMsg);
  }
  const updateObj = {
    name: req.body.name
  };
  customerModel.findByIdAndUpdate(
    customerId,
    updateObj,
    { new: true },
    (err, customer) => {
      if (!customer) {
        log.error("404", MSG.USER.notFoundMsgSingular);
        return sendRsp(res, 404, MSG.USER.notFoundMsgSingular);
      }
      if (err) {
        log.error("500", MSG.USER.errorMsg);
        return sendRsp(res, 500, MSG.USER.errorMsg);
      }
      log.info("200", MSG.USER.successMsgUpdate);
      return sendRsp(res, 200, MSG.USER.successMsgUpdate, {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        role: customer.role
        // customer
      });
    }
  );
};

//remove customer
exports.deleteCustomer = (req, res) => {
  const deleteId = req.params.mailid;
  console.log("deleteId ", deleteId);

  if (!deleteId) {
    log.error("301", "Id is required");
    return sendRsp(res, 301, "Id is required");
  }
  const customerDelete = customerModel.deleteOne({ email: deleteId }).exec();
  customerDelete
    .then(customerData => {})
    .catch(err => {
      log.error("404", MSG.CLIENT.notFoundMsgSingular, err);
      return sendRsp(res, 404, MSG.CLIENT.notFoundMsgSingular, err);
    });
};
exports.createUser = (req, res) => {
  req.checkBody("email", "Missing Param").notEmpty();
  req.checkBody("password", "Missing Query Param").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    log.error("400", MSG.GLOBAL_VALUES.missingParamsMsg);
    sendRsp(res, 400, MSG.GLOBAL_VALUES.missingParamsMsg, util.inspect(errors));
    return;
  }
  const customerName = req.body.name ? req.body.name : req.body.name;
  customerModel.find(
    { email: req.body.email, deleted: false },
    (err, customerUser) => {
      if (err) {
        log.error("error in getting Cusotmer users", err);
        return sendRsp(res, 500, "error in getting Customer users");
      }

      if (
        customerUser.length > 0 &&
        customerUser[0].email.toString() == req.body.email
      ) {
        log.error("409", MSG.GLOBAL_VALUES.emailExistMsg);
        return sendRsp(res, 409, MSG.GLOBAL_VALUES.emailExistMsg);
      }
      var newCustomer = new customerModel({
        name: customerName,
        email: req.body.email
      });

      if (req.body.password) {
        newCustomer.password = req.body.password;
      }
      newCustomer.save((err, newCustomerData) => {
        if (err) {
          log.error("Error in creating Customer", err);
          return sendRsp(res, 500, "Error in creating Customer");
        }

        if (!newCustomerData) {
          log.error("Error in creating Customer", err);
          return sendRsp(res, 500, "Error in creating Customer");
        } else {
          log.info("201", "Customer Created Successfully");
          return sendRsp(res, 201, "Customer Created Successfully", {
            Customer: {
              username: newCustomerData.email,
              role: newCustomerData.role,
              id: newCustomerData.id,
              name: newCustomerData.name
            }
          });
        }
      });
    }
  );
};
