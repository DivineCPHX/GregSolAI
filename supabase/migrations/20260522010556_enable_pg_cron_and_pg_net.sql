/*
  # Enable pg_cron and pg_net for scheduled data refresh

  1. Extensions
    - Enable `pg_cron` for scheduled job execution
    - Enable `pg_net` for async HTTP requests from Postgres
  2. Scheduled Job
    - Create a cron job that calls the fetch-solana-coins edge function every 30 seconds
    - This keeps the memecoin data fresh without needing the Express server running
*/

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
