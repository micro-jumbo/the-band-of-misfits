import { Context } from 'aws-lambda';

export type ChainedRequest<Request, Response> = {
  input: Request;
  event: Request;
  context: Context;
  interceptorContext: { [key: string]: any };
  chain?: {
    next: (request: ChainedRequest<Request, Response>) => Promise<Response>;
  };
};

export type ChainedHandler<Request, Response> = (
  request: ChainedRequest<Request, Response>,
  // input: Request & {
  //   chain: { next: (input: Request) => Promise<Response> };
  // },
) => Promise<Response>;

const buildHandlerChain = <Request, Response>(
  handlers: ChainedHandler<Request, Response>[],
): {
  next: (input: ChainedRequest<Request, Response>) => Promise<Response>;
} => {
  if (handlers.length === 0) {
    return {
      next: () => {
        throw new Error('No handler found');
      },
    };
  }
  const [currentHandler, ...remainingHandlers] = handlers;
  return {
    next: (request: ChainedRequest<Request, Response>): Promise<Response> => {
      return currentHandler({
        ...request,
        chain: buildHandlerChain(remainingHandlers),
      });
    },
  };
};

export const handleChainedRequest =
  <Request, Response>(operationId: string, ...interceptors: any[]) =>
    (event: Request, context: any): Promise<Response> => {
      const interceptorContext = { operationId };
      const request: ChainedRequest<Request, Response> = {
        input: event,
        event,
        context,
        interceptorContext,
      };
      return buildHandlerChain<Request, Response>(interceptors).next(request);
    };
