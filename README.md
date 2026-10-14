# ATLAS

## Access

The web app opens directly into a shared demo-owner session; no login page or credentials are required. Initialize the API database and run the demo seed once before first use so the `atlas-demo` organization exists.

Anyone who can reach this deployment can access and modify the shared demo tenant with owner permissions. Use this no-login mode only for public demo data, not private or production workloads. The API still requires `AUTH_JWT_SECRET` to sign its automatically issued session tokens.