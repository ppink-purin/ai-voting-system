// Simple admin authentication helper

export function checkAdminAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return false;
  }

  // Expected format: "Bearer <password>"
  const [type, password] = authHeader.split(' ');

  if (type !== 'Bearer') {
    return false;
  }

  const adminPassword = process.env.ADMIN_PASSWORD || 'admin2024';

  return password === adminPassword;
}
