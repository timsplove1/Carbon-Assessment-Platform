export async function onRequestPost(context) {
  const { username, password, dept_id } = await context.request.json();
  await context.env.DB.prepare("INSERT INTO users (username, password, dept_id) VALUES (?,?,?)")
   .bind(username, password, dept_id).run();
  return Response.json({ success: true });
}
