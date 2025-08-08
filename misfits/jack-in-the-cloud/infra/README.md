# Jack in the Cloud Infrastructure

_Last Updated: July 30, 2025_

## Overview

This directory contains the AWS CDK infrastructure code for deploying Jack in the Cloud to your AWS account. The infrastructure is built using the AWS PDK (Prescriptive Development Kit) and AWS CDK (Cloud Development Kit).

## Architecture

Jack in the Cloud's infrastructure consists of several AWS services working together:

1. **API Gateway**: Exposes REST endpoints for timer management
2. **Lambda Functions**: Process API requests and manage timer state
3. **DynamoDB**: Stores timer configurations and state
4. **Step Functions**: Orchestrates the timer execution workflow
5. **SNS**: Delivers notifications to subscribers when timers fire
6. **CloudWatch**: Monitors the service and provides metrics and alarms

## Key Components

### JackInTheCloudStack

The main CDK stack that deploys all the necessary resources for Jack in the Cloud. It includes:

- API Gateway with routes for creating, updating, and canceling timers
- Lambda functions for handling API requests
- DynamoDB table for storing timer data
- Step Functions state machine for timer execution
- SNS topics for notification delivery
- CloudWatch dashboard for monitoring

### Subscriber Management

The stack provides methods for adding subscribers to timer notifications:

- `addSubscriber(subscriber, types?)`: Adds a subscriber to receive notifications for specific timer types or all types if no types are specified

## Deployment

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

3. Deploy using CDK:
   ```bash
   cdk deploy
   ```

4. The stack will output an API endpoint URL that can be used to interact with the service.

## Customization

You can customize the infrastructure by modifying the CDK stack properties:

- **Table capacity**: Adjust the read/write capacity of the DynamoDB table
- **API throttling**: Configure API Gateway throttling settings
- **Lambda settings**: Customize memory, timeout, and environment variables
- **Retention policies**: Set log retention periods for CloudWatch logs

## Monitoring

The infrastructure includes a CloudWatch dashboard that provides visibility into all components of the service. The dashboard includes:

- API Gateway metrics (requests, latency, errors)
- Lambda function metrics (invocations, errors, duration)
- DynamoDB metrics (read/write capacity, throttled requests)
- SNS metrics (message publishing and delivery)
- Step Functions metrics (executions and their status)
- Custom timer operation metrics

## Additional Resources

- [AWS PDK Developer Guide](https://aws.github.io/aws-pdk/developer_guides/infrastructure/index.html)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- [Jack in the Cloud Documentation](../README.md)
