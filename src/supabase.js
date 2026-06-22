import { createClient } from "@supabase/supabase-js";

const url = "https://bzioitmlhkyycodnduhj.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6aW9pdG1saGt5eWNvZG5kdWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzYxNzksImV4cCI6MjA5NzcxMjE3OX0.bWqYWWVh5WdUxxIV9r4Dy5Ieua7bn4YYo9NVY1_LiqI";

export const supabase = createClient(url, key);
export const ADMIN_CODE = "se22l97em";
