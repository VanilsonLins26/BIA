import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function test() {
  // We don't have the user's login session easily, but we can try calling the RPC with a dummy UUID to see if it gives a "function not found" error, or if it just returns false.
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: "00000000-0000-0000-0000-000000000000",
    _role: "admin",
  });
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
