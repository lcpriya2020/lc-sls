'use strict';
const AWS = require('aws-sdk');

module.exports.join = async (event, context, callback) => {
  const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
  const meetingsTable = process.env.TABLENAME_MEETINGS;  
    
  let resBodyMeeting = '';
  let statusCode = 0;
  let statusMsg = '';
  let errorMsg = '';

  const data = JSON.parse(event.body);

  const meetingId = parseInt(data.roomName);
  let passcode = data.passcode; 
  const pc = isNaN(passcode);
  if (pc) {
    passcode = data.passcode;
  } else
  {
    passcode = parseInt(data.passcode); 
  }
  
  try {

    const meetingData = {
      TableName: meetingsTable,
      ExpressionAttributeValues: {
        ":v_meetingId":  meetingId
    },
    FilterExpression: "meetingId = :v_meetingId"
    };
   
    var meetingResult = await db.scan(meetingData).promise(); 
    
    let meetingResultFinal = {...meetingResult.Items[0], "token" : meetingResult.Items[0].meetingToken};
    delete meetingResultFinal.meetingToken;

    if(meetingResult === null || meetingResult.Items === null || meetingResult.Items.length === 0)
    {
      resBodyMeeting = `Unable to get Meeting details`;
      statusCode = 400;
      errorMsg = 'true';
    }
    else
    {   
      const dbenablePC = meetingResult.Items[0].enablePasscode;
      const dbPC = meetingResult.Items[0].passcode;         

      if (dbenablePC && dbPC === passcode)
      {        
        console.log('EnablePC + PC');
        resBodyMeeting = meetingResultFinal;           
        statusCode = 200;
        statusMsg = "Success";
      }
      else if (!dbenablePC) {
        console.log('EnablePC');
        resBodyMeeting = meetingResultFinal;           
        statusCode = 200;
        statusMsg = "Success";
      }
      else
      {
        console.log('No EnablePC, PC');
        resBodyMeeting = `Invalid meeting details`;
        statusCode = 400;
        errorMsg = 'true';
      } 
    }
  
  } catch(err) {
    resBodyMeeting = `Invalid meeting ID ${err}`;
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
      data: resBodyMeeting,      
      statusMessage: statusMsg,
      errorMessage: errorMsg
    })
  };

  return response;
};
