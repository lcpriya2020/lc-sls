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

    const data = JSON.parse(event.body);
    console.log(data);
  
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
        statusCode = 403;
      }
      else
      {
      const userList = usersResult.Items;
      const useremail = userList.email;
      console.log(userList);
      console.log(useremail);
      
        const meetingData = {
          TableName: meetingsTable,              
          ExpressionAttributeValues: {
              ":v_meetingToken":  data.token,
              //":v_email":  "jit.test2020@gmail.com"
              ":v_email":  "sundarasokan1@gmail.com"
          },
          FilterExpression: "meetingToken = :v_meetingToken AND email = :v_email"
        };
        console.log(meetingData);

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
      resBodyUser = `Unable to retrieve User data ${err}`;
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