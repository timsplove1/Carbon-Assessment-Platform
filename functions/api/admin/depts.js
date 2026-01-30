export async function onRequestGet(context) {
  const { results } = await context.env.DB.prepare("SELECT * FROM depts").all();
  return Response.json(results);
}
export async function onRequestPost(context) {
  const { name } = await context.request.json();
  await context.env.DB.prepare("INSERT INTO depts (name) VALUES (?)").bind(name).run();
  return Response.json({ success: true });
}
