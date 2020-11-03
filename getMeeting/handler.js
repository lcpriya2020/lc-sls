'use strict';
const AWS = require('aws-sdk');

// GET MEETING 
module.exports.getMeeting = async (event, context, callback) => {
    const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    const usersTable = process.env.TABLENAME_USERS;
    const meetingsTable = process.env.TABLENAME_MEETINGS;  

    let resBodyUser = '';
    let resBodyMeeting = '';
    let fName = '';
    let lName = '';
    let statusCode = 0;
    let statusMsg = '';
    let errorMsg = '';

    const data = JSON.parse(event.body);   
    const meetId = parseInt(data.meetingId);
    const meetingsData = {
      TableName: meetingsTable,              
      ExpressionAttributeValues: {
          ":v_meetingId":  meetId         
      },
      FilterExpression: "meetingId = :v_meetingId"
    };      

    try {
      const meetingResult = await db.scan(meetingsData).promise();
      if(meetingResult === null || meetingResult.Items === null || meetingResult.Items.length === 0)
      {
        resBodyMeeting = `Unable to get Meeting details`;
        statusCode = 400;
        errorMsg = 'true';
      }
      else
      {
        const meetingList = meetingResult.Items;
        const meetingEmail = meetingList[0].email;
        const meetingToken = meetingList[0].meetingToken;
          
        const usersData = {
          TableName: usersTable,              
          ExpressionAttributeValues: {
              ":v_userToken":  meetingToken,
              ":v_email": meetingEmail 
          },
          FilterExpression: "userToken = :v_userToken AND email = :v_email"
        };      

        try {
          const userResult = await db.scan(usersData).promise();
          if(userResult === null || userResult.Items === null || userResult.Items.length === 0)
          {
            resBodyUser = `Unable to get User details`;
            statusCode = 400;
            errorMsg = 'true';
          }
          else
          {
            resBodyUser = userResult.Items[0]; 

            fName = userResult.Items[0].firstname;
            lName = userResult.Items[0].lastname;

            let meetingResultFinal = {...meetingResult.Items[0], "token" : meetingResult.Items[0].meetingToken};
            delete meetingResultFinal.meetingToken;

            resBodyMeeting = meetingResultFinal;
            statusCode = 200;
            statusMsg = 'Success';
          }
        } catch(err) {
          resBodyMeeting = `Unable to retrieve user data ${err}`;
          statusCode = 400;
          errorMsg = 'true';
        }
      }        
    } catch(err) {
      resBodyUser = `Unable to retrieve User data ${err}`;
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
          meetingsData: {...resBodyMeeting,
                        firstName: fName,
                        lastname: lName
            },
          },
          statusMessage: statusMsg,
          errorMessage: errorMsg
        })
    };

    return response;
};