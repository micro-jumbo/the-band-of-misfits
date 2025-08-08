# Jack in the Cloud Examples

_Last Updated: July 30, 2025_

## Overview

This directory contains example projects demonstrating how to use Jack in the Cloud in various scenarios. These examples are designed to help you understand how to integrate and use the service in your own applications.

## Examples

### Basic Timer Example

A simple example showing how to create, update, and cancel timers using the Jack in the Cloud client.

```typescript
import {
  CancelTimerCommand,
  CreateTimerCommand,
  JackInTheCloudClient,
  UpdateTimerCommand,
} from '@the-band-of-misfits/jack-in-the-cloud-api-client';
import { ISO8601 } from '@the-band-of-misfits/jimmy-the-deckhand-utils';

async function basicTimerExample() {
  // Initialize the client with your API endpoint
  const client = new JackInTheCloudClient({
    endpoint: 'https://your-api-id.execute-api.region.amazonaws.com/prod/',
  });

  // Create a timer that will fire in 60 seconds
  const createResult = await client.send(
    new CreateTimerCommand({
      fireAt: ISO8601.toDate(ISO8601.add(ISO8601.now(), 60, 'seconds')),
      payload: 'Your notification payload',
      type: 'notification-type',
    }),
  );
  console.log(`Created timer with id: ${createResult.id}`);

  // Update the timer to fire later with a different payload
  const updateResult = await client.send(
    new UpdateTimerCommand({
      id: createResult.id,
      fireAt: ISO8601.toDate(ISO8601.add(ISO8601.now(), 120, 'seconds')),
      payload: 'Updated notification payload',
      type: 'notification-type',
    }),
  );
  console.log(`Updated timer with id: ${updateResult.id}`);

  // Cancel the timer
  await client.send(new CancelTimerCommand({ id: createResult.id }));
  console.log(`Cancelled timer with id: ${createResult.id}`);
}
```

### CDK Deployment Example

An example showing how to deploy Jack in the Cloud to your AWS account using CDK.

```typescript
import * as cdk from 'aws-cdk-lib';
import * as aws_sqs from 'aws-cdk-lib/aws-sqs';
import { JackInTheCloudStack } from '@the-band-of-misfits/jack-in-the-cloud-infra';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'ExampleStack', {
  env: { account: '123456789012', region: 'us-east-1' },
});

// Create a new JackInTheCloudStack
const jackInTheCloudStack = new JackInTheCloudStack(
  stack,
  'JackInTheCloudStack',
  { env: { account: '123456789012', region: 'us-east-1' } },
);

// Add subscriber to all timer types
jackInTheCloudStack.addSubscriber(new aws_sqs.Queue(stack, 'AllTypesQueue'));

// Add subscriber to specific timer types
jackInTheCloudStack.addSubscriber(
  new aws_sqs.Queue(stack, 'HelloQueue'),
  ['hello'],
);
```

### SQS Consumer Example

An example showing how to consume timer events from an SQS queue.

```typescript
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

async function consumeTimerEvents() {
  const sqsClient = new SQSClient({ region: 'us-east-1' });
  
  // Receive messages from the queue
  const receiveResponse = await sqsClient.send(
    new ReceiveMessageCommand({
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/TimerEventsQueue',
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    })
  );
  
  if (receiveResponse.Messages) {
    for (const message of receiveResponse.Messages) {
      // Process the timer event
      const timerEvent = JSON.parse(message.Body || '{}');
      console.log('Received timer event:', timerEvent);
      
      // Process the event based on its type
      if (timerEvent.type === 'notification-type') {
        console.log('Processing notification:', timerEvent.payload);
        // Your business logic here
      }
      
      // Delete the message from the queue
      await sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/TimerEventsQueue',
          ReceiptHandle: message.ReceiptHandle,
        })
      );
    }
  }
}
```

## Running the Examples

To run these examples:

1. Deploy Jack in the Cloud to your AWS account following the instructions in the [main README](../README.md)
2. Update the endpoint URLs and queue URLs in the examples with your actual values
3. Install the required dependencies:
   ```bash
   pnpm add @the-band-of-misfits/jack-in-the-cloud-api-client @the-band-of-misfits/jimmy-the-deckhand-utils
   ```
4. Run the example code in your application

## Additional Resources

- [Jack in the Cloud Documentation](../README.md)
- [AWS SDK for JavaScript Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
