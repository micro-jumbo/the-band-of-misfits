import { CreateTimerCommand, JackInTheCloudClient } from '@the-band-of-misfits/jack-in-the-cloud-api-client';

async function create() {
  const client = new JackInTheCloudClient({
    endpoint: 'https://qnlq9qijg3.execute-api.us-east-1.amazonaws.com/prod/',
  });
  const result = await client.send(new CreateTimerCommand({
    payload: {
      fireAt: new Date(),
      payload: 'blablaba',
      type: 'normalka',
    },
  }));
  console.log(`Created timer with id [${result.id}`);
}

create().catch((err) => {console.log(err);});