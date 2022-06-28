import { QUERY_HANDLER_METADATA, QUERY_METADATA } from "./decorators/Constants";
import {
  QueryHandlerNotFoundException,
  InvalidQueryHandlerException,
} from "./exceptions";
//import { DefaultQueryPubSub } from './helpers/default-query-pubsub';
import {
  IQuery,
  IQueryBus,
  IQueryHandler,
  IQueryPublisher,
  IQueryResult,
} from "./interfaces";
import { QueryMetadata } from "./interfaces/IQueryMetadata";
import { ObservableBus } from "./ObservableBus";
import { DefaultQueryPublisher } from "./DefaultQueryPublisher";
import { MetadataForHandlerNotFoundException } from "./exceptions/MetadataForHandlerNotFoundException";

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

export type QueryHandlerType<
  QueryBase extends IQuery = IQuery,
  QueryResultBase extends IQueryResult = IQueryResult
> = Type<IQueryHandler<QueryBase, QueryResultBase>>;

type queryBusProps<CommandBase> = {
  publisher: IQueryPublisher<CommandBase>;
};

export class QueryBus<QueryBase extends IQuery = IQuery>
  extends ObservableBus<QueryBase>
  implements IQueryBus<QueryBase>
{
  private handlers = new Map<string, IQueryHandler<QueryBase, IQueryResult>>();
  props: queryBusProps<QueryBase>;

  constructor() {
    super();
    this.props = { publisher: this.useDefaultPublisher() };
  }

  get publisher(): IQueryPublisher<QueryBase> {
    return this.props.publisher;
  }

  set publisher(publisher: IQueryPublisher<QueryBase>) {
    this.props.publisher = publisher;
  }

  async execute<T extends QueryBase, TResult = any>(
    query: T
  ): Promise<TResult> {
    const queryId = this.getQueryId(query);
    const handler = this.handlers.get(queryId);
    if (!handler) {
      throw new QueryHandlerNotFoundException(queryId);
    }

    this.next(query);
    const result = await handler.execute(query);
    return result as TResult;
  }

  bind<T extends QueryBase, TResult = any>(
    handler: IQueryHandler<T, TResult>,
    queryId: string
  ) {
    this.handlers.set(queryId, handler);
  }

  register(handlers: IQueryHandler<QueryBase>[] = []) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  protected registerHandler(handler: IQueryHandler<QueryBase>) {
    const target = this.reflectQueryId(handler);
    if (!target) {
      throw new InvalidQueryHandlerException();
    }
    this.bind(handler as IQueryHandler<QueryBase, IQueryResult>, target);
  }

  private getQueryId(query: QueryBase): string {
    const { constructor: queryType } = Object.getPrototypeOf(query);
    const queryMetadata: QueryMetadata = Reflect.getMetadata(
      QUERY_METADATA,
      queryType
    );
    if (!queryMetadata) {
      throw new QueryHandlerNotFoundException(queryType.name);
    }

    return queryMetadata.id;
  }

  private reflectQueryId(
    handler: IQueryHandler<QueryBase>
  ): string {


    const query: Type<QueryBase> = Reflect.getMetadata(
      QUERY_HANDLER_METADATA,
      handler.constructor
    );

    if(query===undefined)
    {
        
        throw new MetadataForHandlerNotFoundException(handler.constructor.name);
    }

    const queryMetadata: QueryMetadata = Reflect.getMetadata(
      QUERY_METADATA,
      query
    );
    return queryMetadata.id;
  }

  private useDefaultPublisher() {
    return new DefaultQueryPublisher<QueryBase>(this);
  }
}
