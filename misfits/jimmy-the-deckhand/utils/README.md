# Jimmy the Deckhand - Utils

![jimmy-the-deckhand](../../../assets/jimmy-the-deckhand-saw.png)

## Overview

Jimmy the Deckhand Utils is a collection of utility functions and types to help with common tasks in TypeScript projects. These utilities are designed to be simple, type-safe, and easy to use.

## Installation

```bash
# Using npm
npm install @the-band-of-misfits/jimmy-the-deckhand-utils

# Using yarn
yarn add @the-band-of-misfits/jimmy-the-deckhand-utils

# Using pnpm
pnpm add @the-band-of-misfits/jimmy-the-deckhand-utils
```

## Utilities

### ISO8601 Date Utilities

A set of utilities for working with ISO8601 date and time formats in a type-safe way.

#### Features

- Type-safe ISO8601 date strings
- Conversion between ISO8601 strings and JavaScript Date objects
- Date comparison functions
- Date arithmetic (adding time units)
- Current date/time in ISO8601 format

#### Usage

```typescript
import { ISO8601 } from '@the-band-of-misfits/jimmy-the-deckhand-utils';

// Get current time in ISO8601 format
const now = ISO8601.now();
console.log(now); // e.g. "2025-07-30T15:52:00.000Z"

// Create ISO8601 date from string
const date = ISO8601.fromString('2025-07-30T15:52:00.000Z');

// Create ISO8601 date from Date object
const dateFromObj = ISO8601.fromDate(new Date());

// Convert ISO8601 date to Date object
const dateObj = ISO8601.toDate(date);

// Compare dates
const isBefore = ISO8601.isBefore(date, now);
const isAfter = ISO8601.isAfter(date, now);

// Add time units
const tomorrow = ISO8601.add(now, 1, 'days');
const inOneHour = ISO8601.add(now, 1, 'hours');
const inTwoMinutes = ISO8601.add(now, 2, 'minutes');
const inThirtySeconds = ISO8601.add(now, 30, 'seconds');
```

### Request Handler

Utilities for handling HTTP requests in a standardized way, particularly useful for AWS Lambda functions.

#### Usage

```typescript
import { createRequestHandler } from '@the-band-of-misfits/jimmy-the-deckhand-utils';

// Create a request handler for a Lambda function
const handler = createRequestHandler(async (event) => {
  // Process the event
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' }),
  };
});

// Export the handler for use in AWS Lambda
export { handler };
```

### Monitoring Types

Type definitions for monitoring and metrics, useful for standardizing monitoring across services.

#### Usage

```typescript
import { MetricDimension, MetricUnit } from '@the-band-of-misfits/jimmy-the-deckhand-utils';

// Define metric dimensions
const dimensions: MetricDimension[] = [
  { name: 'Service', value: 'MyService' },
  { name: 'Environment', value: 'Production' },
];

// Use metric units
const unit: MetricUnit = 'Count';
```

### TypeScript Utility Types

General-purpose TypeScript utility types to enhance type safety and developer experience.

#### Usage

```typescript
import { DeepReadonly } from '@the-band-of-misfits/jimmy-the-deckhand-utils';

// Create a deeply readonly object
const config: DeepReadonly<{
  api: {
    url: string;
    timeout: number;
  };
}> = {
  api: {
    url: 'https://api.example.com',
    timeout: 5000,
  },
};
```

## Contributing

Contributions are welcome! Please see the main project README for contribution guidelines.

## License

This project is licensed under the terms specified in the LICENSE file at the root of the repository.
