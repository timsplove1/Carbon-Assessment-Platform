export async function onRequestPost(context) {
  const { dept_id, item_name } = await context.request.json();
  await context.env.DB.prepare("INSERT INTO catalog (dept_id, item_name) VALUES (?,?)").bind(dept_id, item_name).run();
  return Response.json({ success: true });
}
export async function onRequestDelete(context) {
  const { searchParams } = new URL(context.request.url);
  await context.env.DB.prepare("DELETE FROM catalog WHERE id =?").bind(searchParams.get('id')).run();
  return Response.json({ success: true });
}
