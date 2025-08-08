# Jack in the Cloud Service Implementation

_Last Updated: July 30, 2025_

## Overview

This directory contains the core service implementation for Jack in the Cloud. The service layer implements the business logic for timer management, including creating, updating, and canceling timers, as well as the execution of timers when they fire.

## Service Components

### Timer Management

The timer management components handle the lifecycle of timers:

- **Timer Creation**: Validates and stores new timer requests
- **Timer Updates**: Modifies existing timers with new parameters
- **Timer Cancellation**: Removes scheduled timers from the system
- **Timer Execution**: Processes timers when they fire and delivers notifications

### Data Storage

The service uses DynamoDB for persistent storage of timer data:

- **Timer Table**: Stores timer configurations, including type, payload, and fire time
- **Timer Status**: Tracks the status of timers (pending, executed, canceled)
- **Timer History**: Maintains a record of timer executions for auditing and debugging

### Notification Delivery

When timers fire, the notification delivery system:

- **Payload Processing**: Prepares the timer payload for delivery
- **Type-based Routing**: Routes notifications to subscribers based on timer type
- **Delivery Confirmation**: Tracks successful delivery of notifications
- **Error Handling**: Manages failed deliveries with appropriate error responses

## Implementation Details

### Timer Lifecycle

1. **Creation**: When a timer is created, it's stored in DynamoDB with a status of "pending"
2. **Scheduling**: A Step Functions execution is scheduled to trigger at the specified fire time
3. **Execution**: When the fire time is reached, the timer is retrieved and its payload is delivered
4. **Completion**: After successful delivery, the timer status is updated to "executed"

### Error Handling

The service implements robust error handling:

- **Validation Errors**: Returns appropriate error responses for invalid timer parameters
- **Concurrency Issues**: Handles race conditions when multiple operations target the same timer
- **Delivery Failures**: Implements retry logic for failed notification deliveries
- **System Errors**: Logs detailed error information for debugging and monitoring

### Performance Optimizations

The service includes several optimizations for high performance:

- **Efficient DynamoDB Access Patterns**: Uses appropriate partition and sort keys
- **Batch Processing**: Processes multiple timers in batch operations when possible
- **Connection Pooling**: Reuses connections to improve performance
- **Caching**: Implements caching for frequently accessed data

## Development

### Local Development

To develop and test the service locally:

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run unit tests:
   ```bash
   pnpm test
   ```

3. Start the local development server:
   ```bash
   pnpm start
   ```

### Testing

The service includes comprehensive tests:

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test interactions between components
- **End-to-End Tests**: Test the complete timer lifecycle

### Debugging

For debugging issues in the service:

1. Enable debug logging by setting the `LOG_LEVEL` environment variable to `debug`
2. Use the CloudWatch dashboard to monitor service metrics
3. Check the CloudWatch logs for detailed error information

## Integration with Other Components

The service integrates with other components of Jack in the Cloud:

- **API Layer**: Receives requests from the API handlers
- **Infrastructure**: Uses the AWS resources provisioned by the infrastructure layer
- **Client SDK**: Provides the functionality exposed by the client SDK

## Additional Resources

- [Jack in the Cloud Documentation](../README.md)
- [AWS SDK for JavaScript Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- [AWS Step Functions Developer Guide](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html)
