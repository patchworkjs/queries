import { Subject } from 'rxjs';
import {IQueryPublisher} from './interfaces/IQueryPublisher';
import {IQuery} from './interfaces/IQuery'; 

export  class DefaultQueryPublisher<QueryBase extends IQuery>
  implements IQueryPublisher<QueryBase> {
  constructor(private subject: Subject<QueryBase>) {}

  publish<T extends QueryBase>(query: T) {
    this.subject.next(query);
  }
}