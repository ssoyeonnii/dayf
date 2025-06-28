// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// 🔐 아래 두 값은 Supabase 프로젝트에서 발급받은 URL과 API 키로 교체하세요
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_API_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
