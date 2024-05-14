# Jack in the Cloud

![jack-in-the-cloud](../../assets/jack-in-the-cloud.jpg)

Jack in the Cloud is a service that delivers scheduled notifications. It exposes two operations: `CreateTimer` and `CancelTimer`. 
Each `Timer` has a `type`, `payload` and `fireAt` timestamp. Whenever Timer fires (at `fireAt`), `payload` is delivered to target specified during deployment for give `type`.

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

Stack will output API endpoint that can be used to create and cancel timers.
