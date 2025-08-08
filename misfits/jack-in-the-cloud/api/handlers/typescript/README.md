# Jack in the Cloud – API Handlers (TypeScript)

_Last Updated: August 8, 2025_

## Overview

This package contains the TypeScript AWS Lambda handlers that implement the Jack in the Cloud HTTP API using the AWS PDK Type Safe API runtime. The handlers are thin, type‑safe adapters around the core service logic from `@the-band-of-misfits/jack-in-the-cloud-service`.

Each handler:
- Parses and validates requests using the generated Type Safe API runtime
- Invokes the domain service to perform the operation
- Returns a typed response conforming to the Smithy model
- Adds observability via shared interceptors and utilities

## What’s implemented here

Currently implemented handlers under `src/`:
- `create-timer.ts` – handles CreateTimer requests and creates a new timer
- `update-timer.ts` – handles UpdateTimer requests and modifies an existing timer
- `cancel-timer.ts` – handles CancelTimer requests and cancels an existing timer
- `fire-timer.ts` – internal operation invoked by Step Functions to deliver a timer when it fires

Supporting utilities:
- `aws-clients.ts` – lazily-instantiated AWS SDK v3 clients (DynamoDB, Step Functions, SNS) wrapped with tracing from PowerTools

The Create/Update/Cancel handlers are referenced by the API Gateway routes provisioned in the Infra package. The Fire handler is used internally by the Step Functions state machine.

## Environment variables

Handlers expect the following environment variables to be provided by the infrastructure:
- `MACHINE_ARN` – ARN of the Step Functions state machine orchestrating timers
- `TABLE_NAME` – name of the DynamoDB table storing timers
- `TOPICS_ARN` – ARN of the SNS topic used for notifications

Make sure your CDK stack wires these values to the Lambda functions.

## Key dependencies

- `@the-band-of-misfits/jack-in-the-cloud-api-typescript-runtime` – generated runtime (types, marshalling, handler wrappers)
- `@the-band-of-misfits/jack-in-the-cloud-service` – domain logic for timer operations
- `@the-band-of-misfits/jimmy-the-deckhand-utils` – shared utilities: logging, tracing, metrics, ISO8601 helpers
- AWS SDK v3 clients: DynamoDB, Step Functions, SNS

## Observability

Handlers use the Type Safe API `INTERCEPTORS` plus the `MonitoringInterceptor` from the utilities package to enable consistent logging, metrics, and tracing. AWS SDK clients are wrapped with `PowerTools.tracer().captureAWSv3Client(...)` to propagate traces.

## Scripts

This package is managed by projen. From the repository root, you can run package‑scoped scripts with pnpm filters:

- Build: `pnpm -F @the-band-of-misfits/jack-in-the-cloud-api-typescript-handlers build`
- Test: `pnpm -F @the-band-of-misfits/jack-in-the-cloud-api-typescript-handlers test`
- Watch: `pnpm -F @the-band-of-misfits/jack-in-the-cloud-api-typescript-handlers watch`
- Lint: `pnpm -F @the-band-of-misfits/jack-in-the-cloud-api-typescript-handlers eslint`

Alternatively, within this directory you can run the same commands directly (they delegate to `npx projen ...`).

## Local development

1. Install deps at the repo root:
   - `pnpm install`
2. Build just this package:
   - `pnpm -F @the-band-of-misfits/jack-in-the-cloud-api-typescript-handlers build`
3. Run tests:
   - `pnpm -F @the-band-of-misfits/jack-in-the-cloud-api-typescript-handlers test`

Note: Some handlers depend on environment variables. For unit tests, mock these values and AWS SDK clients.

## Project structure

```
api/handlers/typescript/
├─ package.json
├─ README.md  ← you are here
└─ src/
   ├─ aws-clients.ts       # Traced AWS v3 clients (DynamoDB, SFN, SNS)
   ├─ create-timer.ts      # CreateTimer Lambda handler
   ├─ update-timer.ts      # UpdateTimer Lambda handler
   ├─ cancel-timer.ts      # CancelTimer Lambda handler
   └─ fire-timer.ts        # FireTimer internal Lambda handler (Step Functions)
```

## How handlers are wired

Each file exports two symbols:
- A type‑safe handler function (e.g., `createTimer`) that contains the operation logic
- An AWS Lambda entrypoint named `handler` created by the generated wrapper (e.g., `createTimerHandler(...)`)

Infrastructure binds the `handler` export to a Lambda function and injects required env vars.

## Related documentation

- Jack in the Cloud – Project Overview: `../../README.md`
- API – Type Safe API overview: `../README.md`
- API Model (Smithy): `../model/README.md`
- Infrastructure (CDK): `../../infra/README.md`
- Service implementation: `../../service/README.md`

## Troubleshooting

- Missing env vars: ensure CDK stack sets MACHINE_ARN, TABLE_NAME, and TOPICS_ARN on the functions
- AWS client permissions: verify IAM policies allow access to DynamoDB, Step Functions, and SNS
- Type errors during build: ensure the runtime and service packages in the workspace are built first
