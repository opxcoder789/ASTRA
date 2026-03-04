import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dqqwwdhjueyrrtqugxrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxcXd3ZGhqdWV5cnJ0cXVneHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MjY4NTksImV4cCI6MjA4ODEwMjg1OX0.IcfCNE4XcLh84s1_cUaF-UvJsoWL5nz3XltzwsFgQiU';

export const supabase = createClient(supabaseUrl, supabaseKey);
