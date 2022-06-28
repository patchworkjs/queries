import { injectable } from 'inversify';
import { Observable, Subject } from 'rxjs';


export class ObservableBus<T> extends Subject<T> {
  constructor() {
    super();
  }

}