'use strict';
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Post Feedback details
module.exports.postfeedback = async (event, context, callback) => {
    const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    const feedbackTable = process.env.TABLENAME;
      
    let responseBody = '';
    let statusCode = 0;
  
    const data = JSON.parse(event.body);
    const feedbackData = {
      TableName: feedbackTable,
      Item: {
        id: uuidv4(),
        createdTime: Date.now(),
        feedbackAbout: data.feedbackAbout,
        feedback: data.feedback,
        feedbackImg: "no-image"
      }
    };
  
    try {
      const data = await db.put(feedbackData).promise();
      responseBody = JSON.stringify(data.Items);
      statusCode = 200;
    } catch(err) {
      responseBody = `Unable to save your feedback ${err}`;
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
  
// Get all Feedback details
module.exports.getfeedback = async (event, context, callback) => {
    const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    const feedbackTable = process.env.TABLENAME;  
    
    let responseBody = '';
    let statusCode = 0;
  
    const feedbackData = {
      TableName: feedbackTable
    };
  
    try {
      const data = await db.scan(feedbackData).promise();
      responseBody = JSON.stringify(data.Items);
      statusCode = 200;
    } catch(err) {
      responseBody = `Unable to retrieve feedback data ${err}`;
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