/* eslint-disable no-case-declarations,default-case */

const exec = require('child_process').execSync;

const arg = process.argv[2];
const tableName = 'Todo';

switch (arg) {
case 'create':
    const createCommand = `aws dynamodb create-table \\
                               --table-name '${tableName}' \\
                               --key-schema '[{"AttributeName":"todo_id","KeyType": "HASH"}]' \\
                               --attribute-definitions '[ {"AttributeName":"todo_id","AttributeType": "S"}]' \\
                               --provisioned-throughput '{"ReadCapacityUnits": 5,"WriteCapacityUnits": 5}' \\
                               --endpoint-url http://localhost:8000`;

    console.log(createCommand);
    exec(createCommand);
    break;
case 'delete':
    const dropCommand = `aws dynamodb delete-table \\
                           --table-name '${tableName}' \\
                           --endpoint-url http://localhost:8000`;

    console.log(dropCommand);
    exec(dropCommand);
    break;
case 'seed':
    const seedCommands = [];
    seedCommands.push(`aws dynamodb put-item \\
                           --table-name '${tableName}' \\
                           --endpoint-url http://localhost:8000  \\
                           --item '{
                             "todo_id": {"S":"1001"},
                             "active":{"BOOL":true},
                             "description":{"S":"What TODO next?"}                            
                           }'`);
    seedCommands.push(`aws dynamodb put-item \\
                           --table-name '${tableName}' \\
                           --endpoint-url http://localhost:8000  \\
                           --item '{
                             "todo_id": {"S":"1002"},     
                             "active":{"BOOL":true},
                             "description":{"S":"It is not complete todo"}                                                                               
                           }'`);
    seedCommands.push(`aws dynamodb put-item \\
                           --table-name '${tableName}' \\
                           --endpoint-url http://localhost:8000  \\
                           --item '{
                             "todo_id": {"S":"1003"},     
                             "active":{"BOOL":false},
                             "description":{"S":"It is complete todo"}                                                                               
                           }'`);

    seedCommands.forEach((command) => {
        console.log(command);
        exec(command);
    });
    break;
}
