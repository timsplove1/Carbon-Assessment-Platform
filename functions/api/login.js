export async function onRequestPost(context) {
  const { username, password } = await context.request.json();
  const user = await context.env.DB.prepare(
    "SELECT u.*, d.name as dept_name FROM users u LEFT JOIN depts d ON u.dept_id = d.id WHERE username =? AND password =?"
  ).bind(username, password).first();
  if (!user) return new Response("Error", { status: 401 });
  return Response.json(user);
}
