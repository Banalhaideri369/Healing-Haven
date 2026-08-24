---
name: Neon connection validation
description: How to distinguish API availability from usable Neon PostgreSQL credentials.
---

Treat an HTTP-healthy Express service as separate from a database-healthy application. The API can listen successfully even when its first Drizzle query fails because the configured Neon credential is stale or invalid.

**Why:** A rejected database password left the health endpoint responsive while all course endpoints returned server errors, which made the frontend appear to have no course content.

**How to apply:** Before schema pushes or seed runs, verify the configured database connection. After updating the credential, restart the API and test a database-backed endpoint, not only the health endpoint.