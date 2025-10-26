// Kelas error kustom untuk error handling yang lebih baik
export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // Ini penting agar 'instanceof' berfungsi dengan benar
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

