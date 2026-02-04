-- Risk 4 Fix: Monthly credit reset via scheduled function

-- Create a function to reset monthly usage for all users
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month integer;
  current_year integer;
  affected_rows integer;
BEGIN
  current_month := EXTRACT(MONTH FROM CURRENT_DATE);
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);

  -- Reset generations_used_this_month for users whose reset month/year is old
  UPDATE public.users
  SET 
    generations_used_this_month = 0,
    usage_reset_month = current_month,
    usage_reset_year = current_year
  WHERE 
    usage_reset_month != current_month 
    OR usage_reset_year != current_year;

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  RAISE NOTICE 'Monthly usage reset complete. Affected users: %', affected_rows;
END;
$$;

COMMENT ON FUNCTION reset_monthly_usage() IS 'Resets generations_used_this_month for all users at the start of each month. Run via pg_cron or scheduled edge function.';

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION reset_monthly_usage() TO service_role;
