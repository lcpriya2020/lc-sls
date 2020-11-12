# jaam-apisls
Read me
Using for server less api service for Jaam.co

// CRUD operations for Meeting table
// Post meeting data
module.exports.postmeeting = async (event, context, callback) => {
  const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
  const meetingTable = process.env.TABLENAME;
    
  let responseBody = '';
  let statusCode = 0;

  const data = JSON.parse(event.body);
  const meetingData = {
    TableName: meetingTable,
    Item: {
      id: uuidv4(),  
      meetingToken: data.meetingToken,   
      meetingId: Math.floor(10000000 + Math.random() * 90000000),
      passcode: Math.floor(10000 + Math.random() * 90000),
      role: "host",
      enablePasscode: false,
      email: data.email,
      createdTime: Date.now(),
      theme: data.theme,
      themeImage: data.themeImage,
    }
  };

  try {
    const data = await db.put(meetingData).promise();
    responseBody = JSON.stringify(data.Items);
    statusCode = 200;
  } catch(err) {
    responseBody = `Unable to create meeting ID ${err}`;
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
      message: responseBody
    })
  };

  return response;
};

// Get all meeting data
module.exports.getmeeting = async (event, context, callback) => {
  const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
  const meetingTable = process.env.TABLENAME;  
  
  let responseBody = '';
  let statusCode = 0;

  const meetingData = {
    TableName: meetingTable
  };

  try {
    const data = await db.scan(meetingData).promise();
    responseBody = JSON.stringify(data.Items);
    statusCode = 200;
  } catch(err) {
    responseBody = `Unable to retrieve meeting IDs ${err}`;
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
      message: responseBody
    })
  };

  return response;
};

// Get single meeting data by id
module.exports.getonemeeting = async (event, context, callback) => {
  const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
  const meetingTable = process.env.TABLENAME;  
  
  let responseBody = '';
  let statusCode = 0;

  const id = event.pathParameters.id;
  const meetingData = {
    TableName: meetingTable,
    Key: {
      id: id
    }
  };

  try {
    const data = await db.get(meetingData).promise();
    responseBody = JSON.stringify(data.Item);
    statusCode = 200;
  } catch(err) {
    responseBody = `Unable to retrieve meeting ID ${err}`;
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
      message: responseBody
    })
  };

  return response;
};

// Update meeting data
module.exports.updatemeeting = async (event, context, callback) => {
  const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
  const meetingTable = process.env.TABLENAME;
    
  let responseBody = '';
  let statusCode = 0;

  const id = event.pathParameters.id;
  const data = JSON.parse(event.body);
  const { email } = data;  
  const meetingData = {
    TableName: meetingTable,
    Key: {
      id: id
    },
    ConditionExpression: 'attribute_exists(id)',
    UpdateExpression: 'SET email = :email',   
    ExpressionAttributeValues: {
      ':email': email,
    },
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    const data = await db.update(meetingData).promise();
    responseBody = JSON.stringify(data.Item);
    statusCode = 200;
  } catch(err) {
    responseBody = `Unable to create meeting ID ${err}`;
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
      message: responseBody
    })
  };

  return response;
};

//Delete meeting data
module.exports.deletemeeting = async (event, context, callback) => {
  const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
  const meetingTable = process.env.TABLENAME;
    
  let responseBody = '';
  let statusCode = 0;

  const id = event.pathParameters.id;    
  const meetingData = {
    TableName: meetingTable,
    Key: {
      id: id
    }
  };

  try {
    const data = await db.delete(meetingData).promise();
    responseBody = JSON.stringify(data.Item);
    statusCode = 200;
  } catch(err) {
    responseBody = `Unable to remove meeting ID ${err}`;
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
      message: responseBody
    })
  };

  return response;
};

//Reminder email function
// // const scheduleemail = "contactsales@jaam.co";
// // const scheduleTemplateuser = "CONTACT_SALES_ACK";

// module.exports.sendReminder = async (event, context, callback) => {      
//     const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
//     const usersTable = process.env.TABLENAME_USERS;
//     const lambdaName = process.env.FUNCTIONNAME;

//     let resBodyUser = '';   
//     let statusCode = 0;
//     let statusMsg = '';
//     let errorMsg = '';
    
//     try {

//         const users = {
//           TableName: usersTable,       
//           ExpressionAttributeValues: {
//             ":ln": "expired"
//           },
//           FilterExpression: "lastname = :ln"        
//         };        
       
//         const usersResult = await db.scan(users).promise();   
        
//         if(usersResult === null || usersResult.Items === null || usersResult.Items.length === 0)
//         {
//           resBodyUser = `User not available in database`;
//           statusCode = 400;
//           errorMsg = 'true';
//         }
//         else
//         {    
//             console.log('count: ', usersResult.Items.length);
//             const userList = usersResult.Items;
//             // const useremail = userList[0].email;  

//             for (let i in userList) {                           
//               console.log(`${i}: ${userList[{i}].email}`);
//             };
           
//                 // // Send reminder email to expired users
//                 // const toEmailValuser = useremail;    // To expired users emailID from DB
//                 // const fromEmailValuser = scheduleemail;                  
//                 // const scheduleTemplatedatauser = {
//                 //     name: 'Testname',
//                 //     email: 'Testemail'
//                 //   };

//                 // const userpayloadStr = JSON.stringify({
//                 //     fromEmail: fromEmailValuser, 
//                 //     toEmail: toEmailValuser,
//                 //     templateName: scheduleTemplateuser,
//                 //     templateData: scheduleTemplatedatauser
//                 // });
                
//                 // const userparams = {
//                 //     FunctionName: lambdaName,
//                 //     InvocationType: 'Event',
//                 //     Payload: userpayloadStr    
//                 // };

//                 // try {
//                 //     const result = await lambda.invoke(userparams).promise();     
//                 //     resBodyUser = usersResult.Items; 
//                 //     statusCode = 200; 
//                 //     statusMsg = 'Success';  
//                 // } catch(err) {
//                 //     resBodyUser = `Unable to send email to users ${err}`;
//                 //     statusCode = 400;
//                 //     errorMsg = 'true';
//                 // } 

//                 resBodyUser = usersResult.Items;
//                 statusCode = 200;
//         }  

//     } catch(err) {
//         resBodyUser = `Unable to get User details ${err}`;
//         statusCode = 400;
//         errorMsg = 'true';
//     }     

//     const response = {
//         statusCode,
//         headers: {
//           'Access-Control-Allow-Headers' : 'Content-Type',
//           'Access-Control-Expose-Headers': 'Access-Control-Allow-Origin',
//           'Access-Control-Allow-Origin': '*',
//           'Access-Control-Allow-Credentials': true,
//           'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           data: resBodyUser,
//           statusMessage: statusMsg,
//           errorMessage: errorMsg
//         })
//     };
    
//     return response;
//  };

// YML function example
  getmeeting:
    handler: handler.getmeeting
    environment:
      TABLENAME: { "Ref": "meetings" }
    events:
      - http:
          path: /meeting
          method: get  
          cors: true   
  getonemeeting:
    handler: handler.getonemeeting
    environment:
      TABLENAME: { "Ref": "meetings" }
    events:
      - http:
          path: /meeting/{id}
          method: get  
          cors: true  
  getcontactus:
    handler: contactus/handler.getcontactus
    environment:
      TABLENAME: { "Ref": "contactus" }
    events:
      - http:
          path: /contactus
          method: get
          cors: true   
  getfeedback:
    handler: feedback/handler.getfeedback
    environment:
      TABLENAME: { "Ref": "feedbacks" }
    events:
      - http:
          path: /feedback
          method: get
          cors: true     
  getpartnership:
    handler: partnership/handler.getpartnership
    environment:
      TABLENAME: { "Ref": "partnership" }
    events:
      - http:
          path: /partnership
          method: get
          cors: true

