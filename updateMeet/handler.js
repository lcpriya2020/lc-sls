'use strict';
const AWS = require('aws-sdk');

module.exports.updateMeet = async (event, context, callback) => {
  const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
  const meetingsTable = process.env.TABLENAME_MEETINGS;      
  
  let resBodyMeeting = '';
  let statusCode = 0;
  
  const data = JSON.parse(event.body);   

    try {

    const meetingData = {
      TableName: meetingsTable,
      ExpressionAttributeValues: {
        ":v_meetingId":  data.roomName,
        ":v_meetingToken":  data.token,
        ":v_email":  data.email
    },
    FilterExpression: "meetingId = :v_meetingId AND meetingToken = :v_meetingToken AND email = :v_email"
    };
   
    const meetingResult = await db.scan(meetingData).promise(); 
    const meetingList = meetingResult.Items;
    const meetingPK = meetingList[0].id;    

    if(meetingResult === null || meetingResult.Items === null || meetingResult.Items.length === 0)
    {
      resBodyMeeting = `Unable to get Meeting details`;
      statusCode = 400;
    }
    else
    {        
      try {
      if(data.passcode) {             
          let updateExpPasscode = 'SET passcode = :passcode';
          let ExpValPasscode = {
            ':passcode': data.passcode
          };
          const updatePCData = {
            TableName: meetingsTable,
            Key: {
              id: meetingPK
            },
            ConditionExpression: 'attribute_exists(id)',
            UpdateExpression: updateExpPasscode,   
            ExpressionAttributeValues: ExpValPasscode,
            ReturnValues: 'UPDATED_NEW'
          };
         
            const UpdatedPC = await db.update(updatePCData).promise();        
            const meetingPCNew = await db.scan(meetingData).promise(); 
            resBodyMeeting = JSON.stringify(meetingPCNew.Items);   
            statusCode = 200;           
      } 

      const enPC = JSON.stringify(data.enablePasscode);
      console.log('enPC: ', enPC);
      if(enPC) {         
          let enablePasscodeVal = true;
          if(data.enablePasscode === true) enablePasscodeVal = true;
          if(data.enablePasscode === false) enablePasscodeVal = false;
          
          let updateExpPasscode = 'SET enablePasscode = :enablePasscode';
          let ExpValPasscode = {
            ':enablePasscode': enablePasscodeVal
          };    
          const updateEnablePCData = {
            TableName: meetingsTable,
            Key: {
              id: meetingPK
            },
            ConditionExpression: 'attribute_exists(id)',
            UpdateExpression: updateExpPasscode,   
            ExpressionAttributeValues: ExpValPasscode,
            ReturnValues: 'UPDATED_NEW'
          };
         
            const UpdatedEnablePC = await db.update(updateEnablePCData).promise();        
            const meetingEnablePCNew = await db.scan(meetingData).promise(); 
            resBodyMeeting = JSON.stringify(meetingEnablePCNew.Items);   
            statusCode = 200;          
      }

      if(data.themeName  && data.selectedTheme) {                   
          let updateExpPasscode = 'SET theme = :theme, themeImage = :themeImage';
          let ExpValPasscode = {
            ':theme': data.themeName,
            ':themeImage': data.selectedTheme
          };   
          const updatethemeData = {
            TableName: meetingsTable,
            Key: {
              id: meetingPK
            },
            ConditionExpression: 'attribute_exists(id)',
            UpdateExpression: updateExpPasscode,   
            ExpressionAttributeValues: ExpValPasscode,
            ReturnValues: 'UPDATED_NEW'
          };
          
            const Updatedtheme = await db.update(updatethemeData).promise();        
            const meetingthemeNew = await db.scan(meetingData).promise(); 
            resBodyMeeting = JSON.stringify(meetingthemeNew.Items);   
            statusCode = 200;          
      } 
      } catch(err) {
        resBodyMeeting = `Unable to update data for meeting ID ${err}`;
        statusCode = 400;         
      }  
    }  
  } catch(err) {
    resBodyMeeting = `Unable to get meeting details ${err}`;
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
          data: resBodyMeeting 
        })
    };

    return response;
  
};
