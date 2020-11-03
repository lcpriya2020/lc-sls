'use strict';
const AWS = require('aws-sdk');

// GET USER - Verify user from both users and meetings table
module.exports.getUser = async (event, context, callback) => {
    const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    const usersTable = process.env.TABLENAME_USERS;
    const meetingsTable = process.env.TABLENAME_MEETINGS;  

    let resBodyUser = '';
    let resBodyMeeting = '';
    let statusCode = 0;
    let statusMsg = '';
    let errorMsg = '';

    const data = JSON.parse(event.body);   
  
    const usersData = {
      TableName: usersTable,
      ExpressionAttributeValues: {
        ":v_userToken":  data.token
    },
    FilterExpression: "userToken = :v_userToken"
    };
  
    try {
      const usersResult = await db.scan(usersData).promise();
      
      if(usersResult === null || usersResult.Items === null || usersResult.Items.length === 0)
      {
        resBodyUser = `Unable to get User details`;
        resBodyMeeting = `Unable to get Meeting details`;
        statusCode = 400;
      }
      else
      {
      const userList = usersResult.Items;
      const useremail = userList[0].email;
          
        const meetingData = {
          TableName: meetingsTable,              
          ExpressionAttributeValues: {
              ":v_meetingToken":  data.token,
              ":v_email": useremail 
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
          errorMsg = resBodyMeeting;
        }
      }        
    } catch(err) {
      resBodyUser = `Unable to retrieve User data ${err}`;
      statusCode = 400;
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