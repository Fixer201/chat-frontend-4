export function mapApiError(error: any): string {
  return error?.message || 'An unexpected error occurred';
}
