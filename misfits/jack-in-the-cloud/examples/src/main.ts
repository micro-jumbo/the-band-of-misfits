import { JackInTheCloudStack } from '@the-band-of-misfits/jack-in-the-cloud-infra';
import { App, aws_sqs, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    // define resources here...
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();
const exampleStack = new MyStack(app, 'JackInTheCloudExampleStack', { env: devEnv });

const jackOfTheCloudsStack = new JackInTheCloudStack(
  exampleStack,
  'JackInTheCloudStack',
  { env: devEnv },
);
jackOfTheCloudsStack.addSubscriber(new aws_sqs.Queue(exampleStack, 'Queue'));
jackOfTheCloudsStack.addSubscriber(
  new aws_sqs.Queue(exampleStack, 'HelloQueue'),
  ['hello'],
);
jackOfTheCloudsStack.addSubscriber(
  new aws_sqs.Queue(exampleStack, 'KittyQueue'),
  ['kitty'],
);
jackOfTheCloudsStack.addSubscriber(
  new aws_sqs.Queue(exampleStack, 'HelloKittyQueue'),
  ['hello', 'kitty'],
);

app.synth();
