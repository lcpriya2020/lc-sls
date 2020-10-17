'use strict';
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Post meeting data
module.exports.postmeeting = async (event, context, callback) => {
    const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    const meetingTable = process.env.TABLENAME;
      
    let responseBody = '';
    let statusCode = 0;
  
    const data = JSON.parse(event.body);
    const meetingData = {
      TableName: meetingTable,
      Item: {
        id: uuidv4(),  
        meetingToken: data.meetingToken,   
        meetingId: Math.floor(10000000 + Math.random() * 90000000),
        passcode: Math.floor(10000 + Math.random() * 90000),
        role: "host",
        enablePasscode: false,
        email: data.email,
        createdTime: Date.now(),
        theme: data.theme,
        themeImage: data.themeImage
      }
    };
  
    try {
      const data = await db.put(meetingData).promise();
      responseBody = JSON.stringify(data.Items);
      statusCode = 200;
    } catch(err) {
      responseBody = `Unable to create meeting ID ${err}`;
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