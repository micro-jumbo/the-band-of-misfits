# Jack in the Cloud

![jack-in-the-cloud](../../assets/jack-in-the-cloud.jpg)

Jack in the Cloud is a service that delivers scheduled notifications. It offers three operations: `CreateTimer`,
`UpdateTimer`, and `CancelTimer`. Each `Timer` comes with a `type`, `payload`, and `fireAt` timestamp. Whenever a
`Timer` is set to fire (at `fireAt`), the `payload` is delivered to the target specified during deployment for the given
`type`. Target can be anything that can subscribe to SNS topic, so: SQS, Lambda, HTTP endpoint, etc.

## Deployment

In your CDK stack, add the following:

```typescript
// create a new JackInTheCloudStack
const jackOfTheCloudsStack = new JackInTheCloudStack(
  exampleStack,
  'JackInTheCloudStack',
  { env: devEnv },
);
// add subscriber to Timers with type 'hello'
jackOfTheCloudsStack.addSubscriber(
  new aws_sqs.Queue(exampleStack, 'HelloQueue'),
  ['hello'],
);
```

Stack will output API endpoint that can be used to create, update and cancel timers.
