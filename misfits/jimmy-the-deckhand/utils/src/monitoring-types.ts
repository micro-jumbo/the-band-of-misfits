import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';
import { Tracer } from '@aws-lambda-powertools/tracer';

interface PowerToolsProps {
  logger: Logger;
  metrics: Metrics;
  tracer: Tracer;
}

export class PowerTools {
  public static init(props: PowerToolsProps) {
    PowerTools._instance = new PowerTools(
      props.logger,
      props.metrics,
      props.tracer,
    );
  }

  public static instance() {
    return PowerTools._instance;
  }

  public static logger(): Logger {
    return PowerTools._instance.logger;
  }

  public static metrics(): Metrics {
    return PowerTools._instance.metrics;
  }

  public static tracer(): Tracer {
    return PowerTools._instance.tracer;
  }

  private static _instance: PowerTools;

  constructor(
    public readonly logger: Logger,
    public readonly metrics: Metrics,
    public readonly tracer: Tracer,
  ) {}

  public success() {
    this.metrics.addMetric('Success', MetricUnits.Count, 1);
    this.metrics.addMetric('Error', MetricUnits.Count, 0);
  }

  public failure() {
    this.metrics.addMetric('Success', MetricUnits.Count, 0);
    this.metrics.addMetric('Error', MetricUnits.Count, 1);
  }
}

export class MonitoringInterceptor {
  public static intercept = async <
    Req extends {
      interceptorContext: {
        [key: string]: any;
      };
      chain: { next: (request: any) => Promise<any> };
    },
    Resp,
  >(
    request: Req,
  ): Promise<Resp> => {
    try {
      const logger = request.interceptorContext?.logger ?? new Logger();
      const metrics = request.interceptorContext?.metrics ?? new Metrics();
      const tracer = request.interceptorContext?.tracer ?? new Tracer();
      PowerTools.init({ logger, metrics, tracer });
      const result = await request.chain.next(request);
      PowerTools.instance().success();
      return result;
    } catch (error) {
      console.error(error);
      // PowerTools.instance().failure();
      throw error;
    }
  };
}
