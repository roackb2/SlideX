import { withSupabase } from "npm:@supabase/server@^1";
import { createClient } from "npm:@supabase/supabase-js@^2";

const bucket = "presentation-images";
const deleteBatchSize = 100;
const listPageSize = 100;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const handler = {
  fetch: withSupabase({ auth: "user" }, async (request, context) => {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
      const body: unknown = await request.json();
      const presentationId = presentationIdFromBody(body);
      if (!presentationId) {
        return Response.json({ error: "Invalid presentation ID" }, { status: 400 });
      }

      const { data: userData, error: userError } = await context.supabase.auth.getUser();
      if (userError || !userData.user) {
        return Response.json({ error: "Authentication required" }, { status: 401 });
      }

      const { data: ownedPresentation, error: ownershipError } = await context.supabase
        .from("presentations")
        .select("id")
        .eq("id", presentationId)
        .maybeSingle();

      if (ownershipError) throw ownershipError;
      if (!ownedPresentation) {
        return Response.json({ error: "Presentation not found or access denied" }, { status: 404 });
      }

      const admin = createServiceRoleClient();
      const prefix = `${userData.user.id}/${presentationId}`;
      const paths: string[] = [];

      for (let offset = 0; ; offset += listPageSize) {
        const { data, error } = await admin.storage.from(bucket).list(prefix, {
          limit: listPageSize,
          offset,
          sortBy: { column: "name", order: "asc" }
        });
        if (error) throw error;

        paths.push(...data.filter((item) => item.id).map((item) => `${prefix}/${item.name}`));
        if (data.length < listPageSize) break;
      }

      for (let index = 0; index < paths.length; index += deleteBatchSize) {
        const { error } = await admin.storage
          .from(bucket)
          .remove(paths.slice(index, index + deleteBatchSize));
        if (error) throw error;
      }

      const { data: deletedPresentation, error: deleteError } = await admin
        .from("presentations")
        .delete()
        .eq("id", presentationId)
        .eq("user_id", userData.user.id)
        .select("id")
        .maybeSingle();

      if (deleteError) throw deleteError;
      if (!deletedPresentation) {
        return Response.json({ error: "Presentation not found or access denied" }, { status: 404 });
      }

      return Response.json({ deleted: true, removedImages: paths.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete presentation";
      return Response.json({ error: message }, { status: 500 });
    }
  })
};

export default handler;

function createServiceRoleClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service role environment is not configured");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function presentationIdFromBody(value: unknown) {
  if (!value || typeof value !== "object" || !("presentationId" in value)) return null;
  const presentationId = value.presentationId;
  return typeof presentationId === "string" && uuidPattern.test(presentationId) ? presentationId : null;
}
