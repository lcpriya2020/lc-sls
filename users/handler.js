'use strict';
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Users
// Post Users data
module.exports.postusers = async (event, context, callback) => {
  const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
  const usersTable = process.env.TABLENAME;
    
  let responseBody = '';
  let statusCode = 0;

  const data = JSON.parse(event.body);
  const usersData = {
    TableName: usersTable,
    Item: {
      id: uuidv4(),
      createdTime: Date.now(),  
      firstname: data.firstname,
      lastname: data.lastname,
      profileurl: data.profileurl,
      userToken: data.userToken,
      provider: data.provider,
      email: data.email,
      socialId: data.socialId
    }
  };

  try {
    const data = await db.put(usersData).promise();
    responseBody = JSON.stringify(data.Items);
    statusCode = 200;
  } catch(err) {
    responseBody = `Unable to create User details ${err}`;
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

// Get all users data
module.exports.getusers = async (event, context, callback) => {
  const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
  const usersTable = process.env.TABLENAME;  
  
  let responseBody = '';
  let statusCode = 0;

  const usersData = {
    TableName: usersTable
  };

  try {
    const data = await db.scan(usersData).promise();
    responseBody = JSON.stringify(data.Items);
    statusCode = 200;
  } catch(err) {
    responseBody = `Unable to retrieve Users ${err}`;
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
