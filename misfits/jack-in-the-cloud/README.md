# Jack in the Cloud

![jack-in-the-cloud](../../assets/jack-in-the-cloud.jpg)

## Overview

Jack in the Cloud is a managed AWS-compatible service that delivers scheduled notifications and events based on timers. Think of it as a serverless cron job or scheduled task service that's fully integrated with the AWS ecosystem. When you need something to happen at a specific time in the future, Jack in the Cloud will make it happen.

## Features

- **Schedule-based Notifications**: Create timers that fire at specified times
- **Flexible Delivery**: Send notifications to any SNS-compatible target (SQS, Lambda, HTTP endpoints, etc.)
- **Typed Payloads**: Route different notification types to different subscribers
- **Full Control**: Create, update, and cancel timers as needed
- **AWS Integration**: Built on AWS services with CDK deployment
- **TypeScript SDK**: Easy-to-use client for interacting with the service
- **CloudWatch Dashboard**: Comprehensive monitoring of all service components and metrics

## Architecture

Jack in the Cloud is built on several AWS services working together:

1. **API Gateway**: Exposes REST endpoints for timer management
2. **Lambda Functions**: Process API requests and manage timer state
3. **DynamoDB**: Stores timer configurations and state
4. **Step Functions**: Orchestrates the timer execution workflow
5. **SNS**: Delivers notifications to subscribers when timers fire

The service exposes three main operations:
- `CreateTimer`: Schedule a new notification
- `UpdateTimer`: Modify an existing timer
- `CancelTimer`: Remove a scheduled notification

Each `Timer` consists of:
- `type`: Category used for routing to specific subscribers
- `payload`: The data to deliver when the timer fires
- `fireAt`: Timestamp indicating when the timer should execute

## Deployment

Jack in the Cloud is designed to be deployed to your AWS account using AWS CDK.

### Prerequisites

- AWS Account
- AWS CDK installed and configured
- Node.js and npm/pnpm

### Deployment Steps

1. Add the package to your project:
   ```bash
   pnpm add @the-band-of-misfits/jack-in-the-cloud-infra
   ```

2. In your CDK stack, add the following:

   ```typescript
   // create a new JackInTheCloudStack
   const jackOfTheCloudsStack = new JackInTheCloudStack(
     exampleStack,
     'JackInTheCloudStack',
     { env: devEnv },
   );

   // add subscriber to all timer types
   jackOfTheCloudsStack.addSubscriber(new aws_sqs.Queue(exampleStack, 'AllTypesQueue'));

   // add subscriber to specific timer types
   jackOfTheCloudsStack.addSubscriber(
     new aws_sqs.Queue(exampleStack, 'HelloQueue'),
     ['hello'],
   );
   ```

3. Deploy using CDK:
   ```bash
   cdk deploy
   ```

4. The stack will output an API endpoint URL that can be used to interact with the service.

## Usage

Jack in the Cloud provides a TypeScript client that follows the AWS SDK v3 pattern.

### Installation

```bash
pnpm add @the-band-of-misfits/jack-in-the-cloud-api-client
```

### Basic Usage

```typescript
import {
  CancelTimerCommand,
  CreateTimerCommand,
  JackInTheCloudClient,
  UpdateTimerCommand,
} from '@the-band-of-misfits/jack-in-the-cloud-api-client';
import { ISO8601 } from '@the-band-of-misfits/jimmy-the-deckhand-utils';

async function manageTimers() {
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

### Handling Timer Events

Timer events will be delivered to the SQS queues or other SNS subscribers you configured during deployment. You can process these events using standard AWS patterns for consuming from your target service.

### Monitoring with CloudWatch Dashboard

Jack in the Cloud comes with a comprehensive CloudWatch dashboard that provides visibility into all components of the service. The dashboard includes:

- API Gateway metrics (requests, latency, errors)
- Lambda function metrics (invocations, errors, duration)
- DynamoDB metrics (read/write capacity, throttled requests)
- SNS metrics (message publishing and delivery)
- Step Functions metrics (executions and their status)
- Custom timer operation metrics

The dashboard is automatically created as part of the deployment and can be accessed from the CloudWatch console under Dashboards with the name `JackInTheCloud-Dashboard`.

## Use Cases

- Scheduling delayed notifications to users
- Implementing retry mechanisms with increasing delays
- Scheduling batch processing tasks
- Creating time-based workflow orchestration
- Implementing timeouts for long-running processes

## Contributing

Contributions are welcome! Please see the main project README for contribution guidelines.
