export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const { results } = await context.env.DB.prepare("SELECT * FROM catalog WHERE dept_id =?").bind(searchParams.get('dept_id')).all();
  return Response.json(results);
}
