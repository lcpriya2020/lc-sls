'use strict';
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();

module.exports.userExpiry = async (event, context, callback) => {      
    const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    const usersTable = process.env.TABLENAME_USERS;

    let resBodyUser = '';   
    let statusCode = 0;
    let statusMsg = '';
    let errorMsg = '';
    
    try {

        const users = {
          TableName: usersTable,       
          ExpressionAttributeValues: {
            ":ln": "expired"
          },
          FilterExpression: "lastname = :ln"        
        };        
       
        const usersResult = await db.scan(users).promise();   
        
        if(usersResult === null || usersResult.Items === null || usersResult.Items.length === 0)
        {
          resBodyUser = `User not available in database`;
          statusCode = 400;
          errorMsg = 'true';
        }
        else
        {    
            console.log('count: ', usersResult.Items.length);
            const userList = usersResult.Items;

            for (let i in userList) {                           
              console.log(`${i}: ${userList[{i}].email}`);
            };       

                resBodyUser = usersResult.Items;
                statusCode = 200;
        }  

    } catch(err) {
        resBodyUser = `Unable to get User details ${err}`;
        statusCode = 400;
        errorMsg = resBodyUser;
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
          data: resBodyUser,
          statusMessage: statusMsg,
          errorMessage: errorMsg
        })
    };
    
    return response;
 };