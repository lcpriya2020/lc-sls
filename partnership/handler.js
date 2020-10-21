'use strict';
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Post Partnership details
module.exports.postpartnership = async (event, context, callback) => {
    const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    const partnershipTable = process.env.TABLENAME;
      
    let resBody = '';
    let statusCode = 0;
    let statusMsg = '';
    let errorMsg = '';
  
    const data = JSON.parse(event.body);
    const partnershipData = {
      TableName: partnershipTable,
      Item: {
        id: uuidv4(),
        createdTime: Date.now(),
        CompanyName: data.txtCompanyName,
        Website: data.txtWebsite,
        Address: data.txtAddress,
        City: data.txtCity,
        State: data.txtState,
        PostalCode: data.txtPostalCode,
        Country: data.txtCountry,
        CompanyRevenue: data.txtCompanyRevenue,
        NumberofEmployees: data.txtNumberofEmployees,
        ContactFirstName: data.txtContactFirstName,
        ContactLastName: data.txtContactLastName,
        ContactRole: data.txtContactRole,
        ContactEmail: data.txtContactEmail,
        ContactPhone: data.txtContactPhone,
        Geography: data.ddlGeography,
        Vendors: data.vendorOptions,
        AllowPrivacy: data.allowPrivacy      
      }
    };
    const dbData = {
      TableName: partnershipTable
    }
  
    try {
      const data = await db.put(partnershipData).promise();
      const dataNew = await db.scan(dbData).promise(); 
      resBody = JSON.stringify(dataNew.Items);
      statusCode = 200;
      statusMsg = 'Success';
    } catch(err) {
      resBody = `Unable to save your Partnership information ${err}`;
      statusCode = 400;
      errorMsg = 'true';
    }    

    const response = {
      statusCode,
      headers: {
        'Access-Control-Allow-Headers' : 'Content-Type',
        'Access-Control-Expose-Headers': 'Access-Control-Allow-Origin',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: resBody,
        statusMessage: statusMsg,
        errorMessage: errorMsg
      })
    };
  
    return response;
};
  
// Get all Partnership details
module.exports.getpartnership = async (event, context, callback) => {
    const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    const partnershipTable = process.env.TABLENAME;  
    
    let resBody = '';
    let statusCode = 0;
    let statusMsg = '';
    let errorMsg = '';
  
    const partnershipData = {
      TableName: partnershipTable
    };
  
    try {
      const data = await db.scan(partnershipData).promise();
      resBody = JSON.stringify(data.Items);
      statusCode = 200;
      statusMsg = 'Success';
    } catch(err) {
      resBody = `Unable to retrieve Partnership data ${err}`;
      statusCode = 400;
      errorMsg = 'true';
    }    
    const response = {
      statusCode,
      headers: {
        'Access-Control-Allow-Headers' : 'Content-Type',
        'Access-Control-Expose-Headers': 'Access-Control-Allow-Origin',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: resBody,
        statusMessage: statusMsg,
        errorMessage: errorMsg
      })
    };  
    return response;
};