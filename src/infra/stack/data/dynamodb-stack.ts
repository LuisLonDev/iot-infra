
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';


export class DynamoDBStack extends Stack {
    public readonly connectionsTable: Table;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.connectionsTable = new Table(this, 'ConnectionsTable', {
            partitionKey: { name: 'thingName', type: AttributeType.STRING },
            sortKey: {name: 'connectionId', type: AttributeType.STRING  },
            removalPolicy: RemovalPolicy.DESTROY,
        });
    }
}
