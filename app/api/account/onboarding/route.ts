import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/common/lib/supabase/serverClient";
import { workspaceOnboardingMetadataKey } from "@/features/workspace";

const privateNoStoreHeaders = {
  "cache-control": "private, no-store"
};

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { headers: privateNoStoreHeaders, status: 401 }
    );
  }

  const completedAt = data.user.user_metadata[workspaceOnboardingMetadataKey];
  return NextResponse.json(
    { completed: typeof completedAt === "string" && completedAt.length > 0 },
    { headers: privateNoStoreHeaders }
  );
}

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims?.sub) {
    return NextResponse.json(
      { error: "authentication_required" },
      { headers: privateNoStoreHeaders, status: 401 }
    );
  }

  const completedAt = new Date().toISOString();
  const { error } = await supabase.auth.updateUser({
    data: { [workspaceOnboardingMetadataKey]: completedAt }
  });

  if (error) {
    return NextResponse.json(
      { error: "onboarding_update_failed" },
      { headers: privateNoStoreHeaders, status: 500 }
    );
  }

  return NextResponse.json(
    { completed: true, completedAt },
    { headers: privateNoStoreHeaders }
  );
}
