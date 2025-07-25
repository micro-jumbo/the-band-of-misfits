import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SFNClient } from '@aws-sdk/client-sfn';
import { SNSClient } from '@aws-sdk/client-sns';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { PowerTools } from '@the-band-of-misfits/jimmy-the-deckhand-utils';

let _dynamoDbClient :DynamoDBDocumentClient | undefined = undefined;
let _stepFunctionsClient: SFNClient | undefined = undefined;
let _snsClient: SNSClient | undefined = undefined;

export const dynamoDbClient = () => {
  if (_dynamoDbClient) {
    return _dynamoDbClient;
  }
  _dynamoDbClient = PowerTools.tracer().captureAWSv3Client(DynamoDBDocumentClient.from(new DynamoDBClient({})));
  return _dynamoDbClient;
};

export const stepFunctionsClient = () => {
  if (_stepFunctionsClient) {
    return _stepFunctionsClient;
  }
  _stepFunctionsClient = PowerTools.tracer().captureAWSv3Client(new SFNClient({}));
  return _stepFunctionsClient;
};

export const snsClient = () => {
  if (_snsClient) {
    return _snsClient;
  }
  _snsClient = PowerTools.tracer().captureAWSv3Client(new SNSClient({}));
  return _snsClient;
};
