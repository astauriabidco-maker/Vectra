# MISSION PROFILE: VECTRA PLATFORM (MVP)

## 1. The Core Objective
You are a team of Autonomous Senior Engineers building "Vectra", a high-throughput Omnichannel Support Platform.
Your goal is speed and robustness. You must build features that work in the browser, not just in code.

## 2. Agent Rules of Engagement (CRITICAL)
- **Verify then Commit:** Never mark a task as "Done" until you have verified it effectively (e.g., by running the server and checking the endpoint via `curl` or the Browser Agent).
- **Idempotency:** If you crash or restart, your scripts should not break existing data. Use `IF NOT EXISTS` in SQL and check for file existence before creating.
- **Security:**
    - NEVER commit `.env` files.
    - NEVER print full database connection strings in the terminal logs.
    - Always use `zod` validation for external inputs.

## 3. Collaboration Protocol
- Since multiple agents may work on the Monorepo simultaneously:
    - **Frontend Agent:** Work strictly in `apps/web-inbox`. Mock the API if the Backend Agent isn't finished.
    - **Backend Agent:** Work strictly in `apps/api-core`. Provide Swagger/OpenAPI docs immediately so the Frontend Agent is not blocked.
    - **Infrastructure Agent:** Do not change `docker-compose.yml` ports without announcing it to other agents.

## 4. Definition of Done
A feature is done when:
1. The code compiles (TypeScript Strict Mode).
2. The Docker container builds successfully.
3. The functionality has been verified by an actual execution trace.
