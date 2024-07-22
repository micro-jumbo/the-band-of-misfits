import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SFNClient } from "@aws-sdk/client-sfn";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { PowerTools } from "@the-band-of-misfits/jimmy-the-deckhand-utils";

const getClient = (type: "dynamo" | "step-functions" | "sns") => {
  switch (type) {
    case "dynamo":
      return DynamoDBDocumentClient.from(new DynamoDBClient({}));
    case "sns":
      return new SnsClient({});
    case "step-functions":
      return new SFNClient({});
  }
};

export const dynamoDbClient = () => {
  return PowerTools.tracer().captureAWSv3Client(getClient("dynamo"));
};

export const stepFunctionsClient = () => {
  return PowerTools.tracer().captureAWSv3Client(getClient("step-functions"));
};

export const snsClient = () => {
  return PowerTools.tracer().captureAWSv3Client(getClient("sns"));
};
