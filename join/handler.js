'use strict';
const AWS = require('aws-sdk');

module.exports.join = async (event, context, callback) => {
  const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
  const meetingsTable = process.env.TABLENAME_MEETINGS;  
    
  let resBodyMeeting = '';
  let statusCode = 0;

  const data = JSON.parse(event.body);
  
  try {

    const meetingData = {
      TableName: meetingsTable,
      ExpressionAttributeValues: {
        ":v_meetingId":  data.roomName
    },
    FilterExpression: "meetingId = :v_meetingId"
    };
   
    var meetingResult = await db.scan(meetingData).promise(); 
    //resBodyMeeting = meetingResult.Items;

    if(meetingResult === null || meetingResult.Items === null || meetingResult.Items.length === 0)
    {
      resBodyMeeting = `Unable to get Meeting details`;
      statusCode = 403;
    }
    else
    {
      if(data.enablePasscode && data.passcode === '16730')
      {
        resBodyMeeting = JSON.stringify(meetingResult.Items);           
        statusCode = 200;
      }
      else if (!data.enablePasscode) {
        resBodyMeeting = JSON.stringify(meetingResult.Items);           
        statusCode = 200;
      }
      else
      {
        resBodyMeeting = `Unable to get Meeting details`;
        statusCode = 403;
      }    
    }    
  } catch(err) {
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
      meetingsData: resBodyMeeting
    })
  };

  return response;
};
