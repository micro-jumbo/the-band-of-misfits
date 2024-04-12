import { CreateTimerCommand, JackInTheCloudClient } from '@the-band-of-misfits/jack-in-the-cloud-api-client';

async function createTimer() {
  const client = new JackInTheCloudClient({
    endpoint: `https://${process.env.API_ID}.execute-api.${process.env.CDK_DEFAULT_REGION}.amazonaws.com/prod/`,
  });
  const result = await client.send(new CreateTimerCommand({
    payload: {
      fireAt: new Date(),
      payload: 'blablaba',
      type: 'normalka',
    },
  }));
  console.log(`Created timer with id [${result.id}]`);
}

createTimer().catch((err) => {console.log(err);});