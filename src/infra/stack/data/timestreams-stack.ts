import { Stack, StackProps } from "aws-cdk-lib";
import { CfnDatabase, CfnTable } from "aws-cdk-lib/aws-timestream";
import { Construct } from "constructs";


export class TimestreamStack extends Stack {
  public readonly database: CfnDatabase;
  public readonly table: CfnTable;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Define the Timestream database
    this.database = new CfnDatabase(this, 'MyTimestreamDatabase', {
      databaseName: 'iotDB',

    });

    // Define the Timestream table
    this.table = new CfnTable(this, 'MyTimestreamTable', {
      databaseName: this.database.ref,
      tableName: 'measurements',
    });
  }
}
