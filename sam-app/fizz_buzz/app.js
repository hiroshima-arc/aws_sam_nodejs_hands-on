/* eslint-disable no-console */

const axios = require('axios');

const url = 'http://checkip.amazonaws.com/';
let response;


exports.lambda_handler = async (event, context, callback) => {
    try {
        const ret = await axios(url);
        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Hello Node.js lambda world',
                location: ret.data.trim(),
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };
    } catch (err) {
        console.log(err);
        callback(err, null);
    }

    callback(null, response);
};
