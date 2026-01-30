export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const deptId = searchParams.get('dept_id');
  // 從綁定的 D1 資料庫 (DB) 查詢
  const { results } = await context.env.DB.prepare(
    "SELECT category, item_name FROM inventory_catalog WHERE dept_id =?"
  ).bind(deptId).all();
  
  return Response.json(results);
}
