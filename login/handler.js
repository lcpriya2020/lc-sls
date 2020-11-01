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
  let statusMsg = '';
  let errorMsg = '';

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
      statusCode = 400;
      errorMsg = 'true';      
    }
    else
    {
        const meetingData = {
          TableName: meetingsTable,              
          ExpressionAttributeValues: {
              ":v_meetingToken":  usersResult.Items[0].userToken,
              ":v_email":  data.email
          },

          FilterExpression: "meetingToken = :v_meetingToken AND email = :v_email"
        };

        try {
          const meetingResult = await db.scan(meetingData).promise();

          let meetingResultFinal = {...meetingResult.Items[0], "token" : meetingResult.Items[0].meetingToken};
          delete meetingResultFinal.meetingToken;

          let userResultFinal = {...usersResult.Items[0], "token" : usersResult.Items[0].userToken};
          delete userResultFinal.userToken;

          resBodyUser = userResultFinal;
          resBodyMeeting = meetingResultFinal;           
          statusCode = 200;
          statusMsg = "Success";
        } catch(err) {
          resBodyMeeting = `Unable to retrieve Meeting data ${err}`;
          statusCode = 400;
          errorMsg = 'true';
        }      
    }    
  } catch(err) {
    resBodyUser = `Unable to get User details ${err}`;
    resBodyMeeting = `Unable to get meeting details ${err}`;
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
      data: {
        users: resBodyUser,
        meetingData: resBodyMeeting
      },
      statusMessage: statusMsg,
      errorMessage: errorMsg      
    })
  };

  return response;
};
