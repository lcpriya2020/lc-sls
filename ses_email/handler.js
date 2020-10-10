'use strict';
const AWS = require('aws-sdk');

const SES = new AWS.SES({region: 'us-east-2'});

// ASYNCHRONOUS
module.exports.sendemail = async (event, context) => {      

    const to = event.toEmail;
    const from = event.fromEmail;
    const templateName = event.templateName;
    const templateData = JSON.stringify(event.templateData);
  
    const params = {        
        Destination: {
            ToAddresses: [ to ]
        },
        Source: from,
        Template: templateName,
        TemplateData: templateData 
    };

    try{
        await SES.sendTemplatedEmail(params).promise();
        context.succeed('Successful');
    } catch(err) {
        context.fail(err);
    }  
 };
