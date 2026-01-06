export class HttpError extends Error {
  readonly name = 'HttpError';
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly method: string;
  readonly body: unknown | string | null;
  readonly headers: Headers;

  constructor(args: {
    message: string;
    status: number;
    statusText: string;
    url: string;
    method: string;
    body: unknown | string | null;
    headers: Headers;
  }) {
    super(args.message);
    this.status = args.status;
    this.statusText = args.statusText;
    this.url = args.url;
    this.method = args.method;
    this.body = args.body;
    this.headers = args.headers;

    // Boilerplate to make `instanceof` work correctly for extended Error classes
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ResponseParseError extends Error {
  readonly name = 'ResponseParseError';
  readonly url: string;
  readonly method: string;
  readonly status: number;
  readonly statusText: string;
  readonly contentType: string | null;
  readonly bodyText: string | null;

  constructor(args: {
    message: string;
    url: string;
    method: string;
    status: number;
    statusText: string;
    contentType: string | null;
    bodyText: string | null;
  }) {
    super(args.message);
    this.url = args.url;
    this.method = args.method;
    this.status = args.status;
    this.statusText = args.statusText;
    this.contentType = args.contentType;
    this.bodyText = args.bodyText;

    // Boilerplate to make `instanceof` work correctly for extended Error classes
    Object.setPrototypeOf(this, new.target.prototype);
  }
}


