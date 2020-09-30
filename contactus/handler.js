'use strict';
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Post Contactus details
module.exports.postcontactus = async (event, context, callback) => {
    const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    const contactTable = process.env.TABLENAME;
      
    let responseBody = '';
    let statusCode = 0;
    
    const data = JSON.parse(event.body);
    const contactData = {
      TableName: contactTable,
      Item: {
        id: uuidv4(),
        createdTime: Date.now(),
        email: data.email,
        companyname: data.companyName,
        empcount: data.employeeCount,
        phone: data.phone,
        country: data.country,
        state: data.state,
        zipcode: data.zipCode,
        info: data.additionalInfo
      }
    };
  
    try {
      const data = await db.put(contactData).promise();
      responseBody = JSON.stringify(data.Items);
      statusCode = 200;
    } catch(err) {
      responseBody = `Unable to save your data ${err}`;
      statusCode = 403;
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
        //data
        message: responseBody
      })
    };
  
    return response;
};
  
// Get all Contactus details
module.exports.getcontactus = async (event, context, callback) => {
    const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    const contactTable = process.env.TABLENAME;  
    
    let responseBody = '';
    let statusCode = 0;
  
    const contactData = {
      TableName: contactTable
    };
  
    try {
      const data = await db.scan(contactData).promise();
      responseBody = JSON.stringify(data.Items);
      statusCode = 200;
    } catch(err) {
      responseBody = `Unable to retrieve Contactus data ${err}`;
      statusCode = 403;
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
        message: responseBody
      })
    };
  
    return response;
};