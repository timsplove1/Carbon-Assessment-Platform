export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const deptId = searchParams.get('dept_id');
  const { results } = await context.env.DB.prepare("SELECT * FROM catalog WHERE dept_id =?").bind(deptId).all();
  return Response.json(results);
}
