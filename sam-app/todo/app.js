/* eslint-disable no-unused-vars,no-shadow */
const AWS = require('aws-sdk');

const tableName = process.env.TABLE_NAME;
const awsRegion = process.env.AWS_REGION || 'ap-northeast-1';
const makeClient = () => {
    const options = {
        region: awsRegion,
    };
    if (process.env.AWS_SAM_LOCAL) {
        options.endpoint = 'http://dynamodb:8000';
    }
    return new AWS.DynamoDB.DocumentClient(options);
};

const dynamo = makeClient();

// API Gateway's Lambda proxy integration requires a
// Lambda function to return JSON in this format;
// see the Developer Guide for further details
const createResponse = (statusCode, body) => ({
    statusCode,
    body,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    },
});

// API call to create a TODO item

exports.create = async (event) => {
    const params = {
        TableName: tableName,
        Item: JSON.parse(event.body),
    };
    let data;
    try {
        data = await dynamo.put(params).promise();
    } catch (err) {
        console.log(`CREATE ITEM FAILED FOR todo_id = ${params.Item.todo_id}, WITH ERROR: ${err}`);
        return createResponse(500, err);
    }

    console.log(`CREATE ITEM SUCCEEDED FOR todo_id = ${params.Item.todo_id}`);
    return createResponse(200, `TODO item created with todo_id = ${params.Item.todo_id}\n`);
};


// API call to retrieve all TODO items

exports.getAll = async (event) => {
    const params = {
        TableName: tableName,
    };
    let data;

    try {
        data = await dynamo.scan(params).promise();
    } catch (err) {
        console.log(`GET ALL ITEMS FAILED, WITH ERROR: ${err}`);
        return createResponse(500, err);
    }

    if (!data.Items) {
        console.log('NO ITEMS FOUND FOR GET ALL API CALL');
        return createResponse(404, 'ITEMS NOT FOUND\n');
    }

    console.log(`RETRIEVED ALL ITEMS SUCCESSFULLY WITH count = ${data.Count}`);
    return createResponse(200, `${JSON.stringify(data.Items)}\n`);
};


// API calls related to active TODO items

exports.getActive = async (event) => {
    const params = {
        TableName: tableName,
        FilterExpression: 'active = :active',
        ExpressionAttributeValues: { ':active': true },
    };
    let data;

    try {
        data = await dynamo.scan(params).promise();
    } catch (err) {
        console.log(`GET ACTIVE ITEMS FAILED, WITH ERROR: ${err}`);
        return createResponse(500, err);
    }

    if (!data.Items) {
        console.log('NO ACTIVE ITEMS FOUND FOR GET ACTIVE API CALL');
        return createResponse(404, 'ITEMS NOT FOUND\n');
    }

    console.log(`RETRIEVED ACTIVE ITEMS SUCCESSFULLY WITH count = ${data.Count}`);
    return createResponse(200, `${JSON.stringify(data.Items)}\n`);
};


exports.updateActive = async (event) => {
    const params = {
        TableName: tableName,
        Item: JSON.parse(event.body),
    };
    let data;

    try {
        data = await dynamo.put(params).promise();
    } catch (err) {
        console.log(`UPDATE ACTIVE FAILED FOR todo_id = ${params.Item.todo_id}, WITH ERROR: ${err}`);
        return createResponse(500, err);
    }

    console.log(`UPDATE ACTIVE SUCCEEDED FOR todo_id = ${params.Item.todo_id}`);
    return createResponse(200, `TODO item updated with todo_id = ${params.Item.todo_id}\n`);
};


// API calls related to complete TODO items

exports.getComplete = async (event) => {
    const params = {
        TableName: tableName,
        FilterExpression: 'active = :active',
        ExpressionAttributeValues: { ':active': false },
    };
    let data;

    try {
        data = await dynamo.scan(params).promise();
    } catch (err) {
        console.log(`GET COMPLETE ITEMS FAILED, WITH ERROR: ${err}`);
        return createResponse(500, err);
    }

    if (!data.Items) {
        console.log('NO ITEMS FOUND FOR GET COMPLETE API CALL');
        return createResponse(404, 'COMPLETE ITEMS NOT FOUND\n');
    }

    console.log(`RETRIEVED COMPLETE ITEMS SUCCESSFULLY WITH count = ${data.Count}`);
    return createResponse(200, `${JSON.stringify(data.Items)}\n`);
};


exports.markComplete = async (event) => {
    const item = JSON.parse(event.body);
    item.active = false;

    const params = {
        TableName: tableName,
        Item: item,
    };
    let data;

    try {
        data = await dynamo.put(params).promise();
    } catch (err) {
        console.log(`MARK COMPLETE FAILED FOR todo_id = ${item.todo_id}, WITH ERROR: ${err}`);
        return createResponse(500, err);
    }

    console.log(`MARK COMPLETE SUCCEEDED FOR todo_id = ${item.todo_id}`);
    return createResponse(200, `TODO item marked complete with todo_id = ${item.todo_id}\n`);
};

function deleteIndividualItem(todoId) {
    const params = {
        TableName: tableName,
        Key: {
            todo_id: todoId,
        },
        ReturnValues: 'ALL_OLD',
    };

    const dbDelete = params => dynamo.delete(params).promise();

    dbDelete(params).then((data) => {
        if (!data.Attributes) {
            console.log(`ITEM NOT FOUND FOR DELETION WITH ID = ${todoId}`);
            return;
        }
        console.log(`DELETED ITEM SUCCESSFULLY WITH id = ${todoId}`);
    }).catch((err) => {
        console.log(`DELETE ITEM FAILED FOR id = ${todoId}, WITH ERROR: ${err}`);
    });
}

exports.deleteComplete = async (event) => {
    const params = {
        TableName: tableName,
        FilterExpression: 'active = :active',
        ExpressionAttributeValues: { ':active': false },
    };
    let data;

    // there is no batch delete in the AWS SDK for DynamoDB,
    // so we must delete completed items one by one
    try {
        data = await dynamo.scan(params).promise();
    } catch (err) {
        console.log(`GET ITEMS FOR DELETION FAILED, WITH ERROR: ${err}`);
        return createResponse(500, err);
    }

    if (!data.Items) {
        console.log('NO ITEMS FOUND FOR DELETION API CALL');
        return createResponse(404, 'NO ITEMS FOUND FOR DELETION\n');
    }

    console.log(`NUMBER OF ITEMS TO DELETE = ${data.Count}`);
    const ids = data.Items.map(item => item.todo_id);
    ids.forEach(id => deleteIndividualItem(id));
    return createResponse(200, `${data.Count} items submitted for deletion\n`);
};
