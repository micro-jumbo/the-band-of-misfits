import { aws_dynamodb, aws_iam, RemovalPolicy } from "aws-cdk-lib";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class DynamoTable extends Construct {
  public readonly table: Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.table = new Table(this, "Table", {
      partitionKey: { name: "id", type: aws_dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      timeToLiveAttribute: "ttl",
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
    });
  }

  public get tableName(): string {
    return this.table.tableName;
  }

  public grantWriteData(grantee: aws_iam.IGrantable): void {
    this.table.grantWriteData(grantee);
  }

  public grantReadData(grantee: aws_iam.IGrantable): void {
    this.table.grantReadData(grantee);
  }
}
