'use strict';
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

module.exports.login = async (event, context, callback) => {
  const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
  const usersTable = process.env.TABLENAME_USERS;
  const meetingsTable = process.env.TABLENAME_MEETINGS;  
    
  let resBodyUser = '';
  let resBodyMeeting = '';
  let statusCode = 0;

  const data = JSON.parse(event.body);
  
  try {

    const users = {
      TableName: usersTable,
      ExpressionAttributeValues: {
        ":v_socialID":  data.socialId,
        ":v_provider":  data.provider,
    },
    FilterExpression: "socialId = :v_socialID AND provider = :v_provider"
    };
   
    var usersResult = await db.scan(users).promise(); 
    //resBodyUser = JSON.stringify(usersResult.Items.length);   
    
    if(usersResult === null || usersResult.Items === null || usersResult.Items.length === 0)
    {
      resBodyUser = `Unable to get User details`;
      resBodyMeeting = `Unable to get Meeting details`;
      statusCode = 403;
    }
    else
    {
        const meetingData = {
          TableName: meetingsTable,              
          ExpressionAttributeValues: {
              ":v_meetingToken":  "2Y5PHBpKBa6NZsB9Ku8cDF",
              ":v_email":  data.email
          },

          FilterExpression: "meetingToken = :v_meetingToken AND email = :v_email"
        };

        try {
          const meetingResult = await db.scan(meetingData).promise();
          resBodyUser = JSON.stringify(usersResult.Items);
          resBodyMeeting = JSON.stringify(meetingResult.Items);           
          statusCode = 200;
        } catch(err) {
          resBodyMeeting = `Unable to retrieve Meeting data ${err}`;
          statusCode = 403;
        }      
    }    
  } catch(err) {
    resBodyUser = `Unable to get User details ${err}`;
    resBodyMeeting = `Unable to get meeting details ${err}`;
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
      users: resBodyUser,
      meetingsData: resBodyMeeting
    })
  };

  return response;
};
