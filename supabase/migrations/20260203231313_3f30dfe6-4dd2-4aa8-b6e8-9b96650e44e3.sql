-- Add column to track monthly credit usage
ALTER TABLE public.users 
ADD COLUMN generations_used_this_month integer NOT NULL DEFAULT 0;

-- Add column to track the month for usage reset
ALTER TABLE public.users 
ADD COLUMN usage_reset_month integer NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE);

-- Add column to track year for proper reset across years
ALTER TABLE public.users 
ADD COLUMN usage_reset_year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Create a function to reset monthly usage if needed
CREATE OR REPLACE FUNCTION public.check_and_reset_monthly_usage()
RETURNS trigger AS $$
DECLARE
  current_month integer := EXTRACT(MONTH FROM CURRENT_DATE);
  current_year integer := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
  -- If the month or year has changed, reset the usage counter
  IF NEW.usage_reset_month != current_month OR NEW.usage_reset_year != current_year THEN
    NEW.generations_used_this_month := 0;
    NEW.usage_reset_month := current_month;
    NEW.usage_reset_year := current_year;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-reset usage on any user table access
CREATE TRIGGER reset_monthly_usage_trigger
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.check_and_reset_monthly_usage();