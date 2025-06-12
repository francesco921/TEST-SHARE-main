import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wwsixavpruvuoesctzdh.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3c2l4YXZwcnV2dW9lc2N0emRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTUzNDksImV4cCI6MjA2NTI5MTM0OX0.9WgcS1pifqYalOI9kpJkBE1MWgBoBhoy3n7nqOs0GPw";

export const supabase = createClient(supabaseUrl, supabaseKey);
