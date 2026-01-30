export async function onRequestPost(context) {
  const { dept_id, item_name } = await context.request.json();
  await context.env.DB.prepare("INSERT INTO catalog (dept_id, item_name) VALUES (?,?)").bind(dept_id, item_name).run();
  return Response.json({ success: true });
}
