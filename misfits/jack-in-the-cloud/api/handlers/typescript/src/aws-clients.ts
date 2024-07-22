import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SFNClient } from '@aws-sdk/client-sfn';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { PowerTools } from '@the-band-of-misfits/jimmy-the-deckhand-utils';

const _dynamoDbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const _stepFunctionsClient = new SFNClient({});

export const dynamoDbClient = () => {
  return PowerTools.tracer().captureAWSv3Client(_dynamoDbClient);
};

export const stepFunctionsClient = () => {
  return PowerTools.tracer().captureAWSv3Client(_stepFunctionsClient);
};
