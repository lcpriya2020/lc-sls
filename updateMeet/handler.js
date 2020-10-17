'use strict';
const AWS = require('aws-sdk');

module.exports.updateMeet = async (event, context, callback) => {
  const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
  const meetingsTable = process.env.TABLENAME_MEETINGS;  
    
  let resBodyUser = '';
  let resBodyMeeting = '';
  let statusCode = 0;

  
};
