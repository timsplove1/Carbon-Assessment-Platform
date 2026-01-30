export async function onRequestPost(context) {
  const { records, user_id, dept_name } = await context.request.json();
  const db = context.env.DB;
  const stmts = records.map(r => {
    const finalItem = r.item_name === 'other'? r.custom_info : r.item_name;
    return db.prepare("INSERT INTO submissions (user_id, dept_name, item_name, activity_value, evidence_url) VALUES (?,?,?,?,?)")
           .bind(user_id, dept_name, finalItem, parseFloat(r.value), r.url);
  });
  await db.batch(stmts);
  return Response.json({ success: true });
}
