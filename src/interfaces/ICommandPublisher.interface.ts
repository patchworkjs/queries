import {IQuery} from "./IQuery.interface";

export default interface IQueryPublisher<QueryBase extends IQuery = IQuery> {
    publish<T extends QueryBase = QueryBase>(query: T): any;
  }
