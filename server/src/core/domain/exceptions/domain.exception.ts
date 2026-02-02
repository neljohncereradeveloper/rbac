export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status_code: number,
  ) {
    super(message);
    this.name = 'DomainException';
  }
}
