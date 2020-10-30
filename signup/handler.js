'use strict';
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const TokenGenerator = require("uuid-token-generator");

module.exports.signup = async (event, context, callback) => {
  const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
  const usersTable = process.env.TABLENAME_USERS;
  const meetingsTable = process.env.TABLENAME_MEETINGS;  
    
  let resBodyUser = '';
  let resBodyMeeting = '';
  let statusCode = 0;

  const tokgen = new TokenGenerator();
  var userToken = tokgen.generate();

  const data = JSON.parse(event.body);
  
  const usersData = {
    TableName: usersTable,
    Item: {
      id: uuidv4(),
      createdTime: Date.now(),  
      firstname: data.firstname,
      lastname: data.lastname,
      profileurl: data.profileurl,
      userToken: userToken,
      provider: data.provider,
      email: data.email,
      socialId: data.socialId
    }
  };

  const meetingData = {
    TableName: meetingsTable,
    Item: {
      id: uuidv4(),  
      meetingToken: userToken,   
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
      const userRes = await db.put(usersData).promise();

      const meetingRes = await db.put(meetingData).promise();

      let meetingResultFinal = {...meetingData.Item, "token" : meetingData.Item.meetingToken};
      delete meetingResultFinal.meetingToken;

      let userResultFinal = {...usersData.Item, "token" : usersData.Item.userToken};
      delete userResultFinal.userToken;

      resBodyUser = userResultFinal;
      resBodyMeeting = meetingResultFinal;    

      statusCode = 200;
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

          let userResultFinal = {...usersData.Item, "token" : usersData.Item.userToken};
          delete userResultFinal.userToken;

          resBodyUser = userResultFinal;
          resBodyMeeting = meetingResultFinal;           
          statusCode = 200;
        } catch(err) {
          resBodyMeeting = `Unable to retrieve Meeting data ${err}`;
          statusCode = 400;
        }      
    }    
  } catch(err) {
    resBodyUser = `Unable to create User details ${err}`;
    resBodyMeeting = `Unable to create meeting details ${err}`;
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
      users: resBodyUser,
      meetingsData: resBodyMeeting
    })
  };

  return response;
};
