import 'reflect-metadata';
import { IQuery } from '../interfaces';
import { QUERY_HANDLER_METADATA, QUERY_METADATA } from './Constants';
import { v4 } from 'uuid';


export const QueryHandlerDecorator = (query: IQuery): ClassDecorator => {
  return (target: object) => {
    if (!Reflect.hasMetadata(QUERY_METADATA, query)) {
      Reflect.defineMetadata(QUERY_METADATA, { id: v4() }, query);
    }
    Reflect.defineMetadata(QUERY_HANDLER_METADATA, query, target);
  };
};