import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-klie-owner-key", "Access-Control-Allow-Methods": "PUT, DELETE, OPTIONS" };
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const ownerKey = req.headers.get("x-klie-owner-key") || "";
  if (!ownerKey || ownerKey !== Deno.env.get("KLIE_OWNER_KEY")) return new Response("Invalid owner key", { status: 401, headers: cors });
  const url = new URL(req.url); const id = decodeURIComponent(url.pathname.split("/").pop() || "");
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id)) return new Response("Invalid media id", { status: 400, headers: cors });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  if (req.method === "PUT") {
    const bytes = new Uint8Array(await req.arrayBuffer());
    if (!bytes.length || bytes.length > 12 * 1024 * 1024) return new Response("Image must be between 1 byte and 12 MB", { status: 413, headers: cors });
    const type = req.headers.get("content-type") || "image/jpeg";
    if (!type.startsWith("image/")) return new Response("Only image uploads are allowed", { status: 415, headers: cors });
    const { error } = await supabase.storage.from("klie-media").upload(id, bytes, { contentType: type, upsert: true });
    if (error) return new Response(error.message, { status: 500, headers: cors });
    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
  }
  if (req.method === "DELETE") {
    const { error } = await supabase.storage.from("klie-media").remove([id]);
    if (error) return new Response(error.message, { status: 500, headers: cors });
    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
  }
  return new Response("Method not allowed", { status: 405, headers: cors });
});
