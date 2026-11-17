export class DomainError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);

    this.name = new.target.name;
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
