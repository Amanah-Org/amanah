import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const { name, slug } = await readBody<{ name: string; slug: string }>(event);

  if (!name?.trim() || !slug?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Name and slug are required" });
  }

  const admin = useSupabaseAdmin();

  const { data: org, error: orgErr } = await admin
    .from("organizations")
    .insert({ name: name.trim(), slug: slug.trim(), owner_id: user.id })
    .select()
    .single();

  if (orgErr) {
    throw createError({
      statusCode: orgErr.code === "23505" ? 409 : 500,
      statusMessage: orgErr.message,
    });
  }

  const { error: memberErr } = await admin
    .from("organization_members")
    .insert({ organization_id: org.id, user_id: user.id, role: "admin", status: "active" });

  if (memberErr) {
    await admin.from("organizations").delete().eq("id", org.id);
    throw createError({ statusCode: 500, statusMessage: memberErr.message });
  }

  return org;
});
