-- Fix reset_monthly_usage function to include search_path for security
-- This prevents SQL injection through search path manipulation attacks
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_month integer;
  current_year integer;
  affected_rows integer;
BEGIN
  current_month := EXTRACT(MONTH FROM CURRENT_DATE);
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);

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