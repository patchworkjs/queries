export class MetadataForHandlerNotFoundException  extends Error {
    constructor(handlerName:string) {
      super(
        `The metadata for "${handlerName}" handler was not found!`,
      );
    }
  }