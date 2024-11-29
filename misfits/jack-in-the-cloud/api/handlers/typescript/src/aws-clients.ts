import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SFNClient } from '@aws-sdk/client-sfn';
import { SNSClient } from '@aws-sdk/client-sns';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { PowerTools } from '@the-band-of-misfits/jimmy-the-deckhand-utils';

export const dynamoDbClient = () => {
  return PowerTools.tracer().captureAWSv3Client(DynamoDBDocumentClient.from(new DynamoDBClient({})));
};

export const stepFunctionsClient = () => {
  return PowerTools.tracer().captureAWSv3Client(new SFNClient({}));
};

export const snsClient = () => {
  return PowerTools.tracer().captureAWSv3Client(new SNSClient({}));
};
