import {
  CreateTimerCommand,
  JackInTheCloudClient,
  UpdateTimerCommand,
} from "@the-band-of-misfits/jack-in-the-cloud-api-client";
import { ISO8601 } from "@the-band-of-misfits/jimmy-the-deckhand-utils";

async function createTimer() {
  const client = new JackInTheCloudClient({
    endpoint: `https://${process.env.API_ID}.execute-api.${process.env.CDK_DEFAULT_REGION}.amazonaws.com/prod/`,
  });
  const createResult = await client.send(
    new CreateTimerCommand({
      payload: {
        fireAt: ISO8601.toDate(ISO8601.add(ISO8601.now(), 60, "seconds")),
        payload: "blablaba",
        type: "normalka",
      },
    }),
  );
  console.log(`Created timer with id [${createResult.id}]`);
  const updateResult = await client.send(
    new UpdateTimerCommand({
      payload: {
        id: createResult.id,
        fireAt: ISO8601.toDate(ISO8601.add(ISO8601.now(), 120, "seconds")),
        payload: "updated",
        type: "normalka",
      },
    }),
  );
  console.log(`Updated timer with id [${updateResult.id}]`);
  // await client.send(new CancelTimerCommand({ id: createResult.id }));
  // console.log(`Cancelled timer with id [${createResult.id}]`);
}

createTimer().catch((err) => {
  console.log(err);
});
