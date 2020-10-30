'use strict';
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const lambda = new AWS.Lambda();
const contactemail = "contactsales@jaam.co";
const contactTemplate = "CONTACT_SALES_JAAM";
const contactTemplateuser = "CONTACT_SALES_ACK";

// Post Contactus details
module.exports.postcontactus = async (event, context, callback) => {         
  let responseBody = '';
  let statusCode = 0;    
  let statusMsg = '';
  let errorMsg = '';
  const data = JSON.parse(event.body);

  // Send email
  const lambdaName = process.env.FUNCTIONNAME;
    
  const toEmailVal = contactemail;   // To user - data.email
  const fromEmailVal = contactemail;  
  const contactTemplatedata = data;

  const payloadStr = JSON.stringify({
    fromEmail: fromEmailVal, 
    toEmail: toEmailVal,
    templateName: contactTemplate,
    templateData: contactTemplatedata
  });
  
  const params = {
    FunctionName: lambdaName,
    InvocationType: 'Event',
    Payload: payloadStr    
  };

  try {
    const result = await lambda.invoke(params).promise();     
    //responseBody = JSON.stringify(result, null, 2);
    responseBody = "Email sent successfully";
    statusCode = 200;
  } catch(err) {
    responseBody = `Unable to send email ${err}`;
    statusCode = 400;
  } 

  // To user
  const toEmailValuser = data.email;    // To user - data.email
  const fromEmailValuser = contactemail;  
  const contactTemplatedatauser = data;

  const userpayloadStr = JSON.stringify({
    fromEmail: fromEmailValuser, 
    toEmail: toEmailValuser,
    templateName: contactTemplateuser,
    templateData: contactTemplatedatauser
  });
  
  const userparams = {
    FunctionName: lambdaName,
    InvocationType: 'Event',
    Payload: userpayloadStr    
  };

  try {
    const result = await lambda.invoke(userparams).promise();     
    //responseBody = JSON.stringify(result, null, 2);
    responseBody = "Email sent successfully to user";
    statusCode = 200;
  } catch(err) {
    responseBody = `Unable to send email ${err}`;
    statusCode = 400;
  } 

  // Insert Contact data into DB    
    const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    const contactTable = process.env.TABLENAME;

    const contactData = {
      TableName: contactTable,
      Item: {
        id: uuidv4(),
        createdTime: Date.now(),
        email: data.email,
        companyName: data.companyName,
        employeeCount: data.employeeCount,
        phone: data.phone,
        country: data.country,
        state: data.state,
        zipCode: data.zipCode,
        additionalInfo: data.additionalInfo
      }
    };
  
    try {
      const data = await db.put(contactData).promise();
      responseBody = JSON.stringify(data.Items);
      statusCode = 200;
      statusMsg = "Success";
    } catch(err) {
      responseBody = `Unable to save your data ${err}`;
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
        data: responseBody,
        statusMessage: statusMsg,
        errorMessage: errorMsg
      })
    };
  
    return response;
};
  
// // Get all Contactus details
// module.exports.getcontactus = async (event, context, callback) => {
//     const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
//     const contactTable = process.env.TABLENAME;  
    
//     let responseBody = '';
//     let statusCode = 0;
//     let statusMsg = '';
//     let errorMsg = '';

//     const contactData = {
//       TableName: contactTable
//     };
  
//     try {
//       const data = await db.scan(contactData).promise();
//       responseBody = JSON.stringify(data.Items);
//       statusCode = 200;
//       statusMsg = "Success";
//     } catch(err) {
//       responseBody = `Unable to retrieve Contactus data ${err}`;
//       statusCode = 400;
//       errorMsg = 'true';
//     }    
//     const response = {
//       statusCode,
//       headers: {
//         'Access-Control-Allow-Headers' : 'Content-Type',
//         'Access-Control-Expose-Headers': 'Access-Control-Allow-Origin',
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Credentials': true,
//         'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         data: responseBody,
//         statusMessage: statusMsg,
//         errorMessage: errorMsg
//       })
//     };
  
//     return response;
// };