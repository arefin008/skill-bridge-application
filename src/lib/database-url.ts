const REQUIRE_SSL_MODE = "require";
const VERIFY_FULL_SSL_MODE = "verify-full";

export function normalizeDatabaseUrl(connectionString: string): string {
  try {
    const databaseUrl = new URL(connectionString);
    const sslMode = databaseUrl.searchParams.get("sslmode");
    const usesLibpqCompat = databaseUrl.searchParams.has("uselibpqcompat");

    if (
      sslMode?.toLowerCase() === REQUIRE_SSL_MODE &&
      !usesLibpqCompat
    ) {
      databaseUrl.searchParams.set("sslmode", VERIFY_FULL_SSL_MODE);
      return databaseUrl.toString();
    }
  } catch {
    return connectionString;
  }

  return connectionString;
}
