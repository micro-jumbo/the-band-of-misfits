import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { ApplicationStack as JackInTheCloudStack } from "../src/stacks/application-stack";

test("Snapshot", () => {
  const app = new App();
  const stack = new JackInTheCloudStack(app, "test");

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
