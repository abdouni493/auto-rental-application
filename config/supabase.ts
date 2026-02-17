import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwgryklsfevvnprspoed.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Z3J5a2xzZmV2dm5wcnNwb2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyODEyNDcsImV4cCI6MjA4Njg1NzI0N30.P8iA_-IKlJxpY89FtHpo2Fc98Ve2sOaZXY2XikKQ4tg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
