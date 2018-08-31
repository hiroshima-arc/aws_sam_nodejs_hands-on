/* eslint-disable no-case-declarations,default-case */

const exec = require('child_process').execSync;

const arg = process.argv[2];
const tableName = 'Todo';

switch (arg) {
case 'create':
    const createCommand = `aws dynamodb create-table \
        --table-name '${tableName}' \
        --key-schema '[{"AttributeName":"todo_id","KeyType": "HASH"}]' \
        --attribute-definitions '[ {"AttributeName":"todo_id","AttributeType": "S"}]' \
        --provisioned-throughput '{"ReadCapacityUnits": 5,"WriteCapacityUnits": 5}' \
        --endpoint-url http://localhost:8000`;

    exec(createCommand);
    break;
case 'delete':
    const dropCommand = `aws dynamodb delete-table \\
                           --table-name '${tableName}' \\
                           --endpoint-url http://localhost:8000`;

    exec(dropCommand);
    break;
}
