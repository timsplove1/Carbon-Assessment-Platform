import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";

export default function App() {
  const [user, setUser] = useState(null); // 登入狀態
  const [isAdminMode, setIsAdminMode] = useState(false);

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b">
        <h1 className="text-xl font-bold text-blue-600">碳盤查採集系統</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium">歡迎: {user.username} ({user.dept_name})</span>
          {user.role === 'admin' && (
            <button onClick={() => setIsAdminMode(!isAdminMode)} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100">
              {isAdminMode? "返回填報頁" : "管理後台"}
            </button>
          )}
          <button onClick={() => setUser(null)} className="text-sm text-red-500">登出</button>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto p-6">
        {isAdminMode? <AdminPanel /> : <DataForm user={user} />}
      </main>
    </div>
  );
}

// --- 填報表單 ---
function DataForm({ user }) {
  const { register, control, watch, handleSubmit, reset } = useForm({
    defaultValues: { records: [{ item_name: "", value: "", url: "" }] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: "records" });
  const [catalog, setCatalog] = useState();

  useEffect(() => {
    fetch(`/api/catalog?dept_id=${user.dept_id}`).then(res => res.json()).then(setCatalog);
  }, [user]);

  const onSubmit = async (data) => {
    const res = await fetch("/api/submit", { method: "POST", body: JSON.stringify({...data, user_id: user.id, dept_name: user.dept_name }) });
    if (res.ok) { alert("數據已成功提交並存入 D1 資料庫！"); reset(); }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border">
      <h2 className="text-2xl font-bold mb-6">部門問卷：{user.dept_name}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => {
          const selected = watch(`records.${index}.item_name`);
          return (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-5 bg-gray-50 rounded-lg relative border border-gray-100">
              <div>
                <label className="text-xs font-bold text-gray-400">盤查項目</label>
                <select {...register(`records.${index}.item_name`)} className="w-full border rounded p-2 bg-white">
                  <option value="">-- 請選取 --</option>
                  {catalog.map(c => <option key={c.id} value={c.item_name}>{c.item_name}</option>)}
                  <option value="other">其他 (手動補充)</option>
                </select>
              </div>
              {selected === 'other' && (
                <div>
                  <label className="text-xs font-bold text-gray-400">補充說明</label>
                  <input {...register(`records.${index}.custom_info`)} placeholder="請輸入項目名稱" className="w-full border rounded p-2" />
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-gray-400">活動數據</label>
                <input type="number" step="any" {...register(`records.${index}.value`)} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400">Drive 佐證連結</label>
                <input {...register(`records.${index}.url`)} placeholder="https://..." className="w-full border rounded p-2 text-blue-600" />
              </div>
              <button type="button" onClick={() => remove(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md">✕</button>
            </div>
          );
        })}
        <button type="button" onClick={() => append({ item_name: "", value: "", url: "" })} className="w-full border-2 border-dashed py-3 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-500 transition mb-8">+ 新增紀錄</button>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow hover:bg-blue-700 transition">確認提交回報數據</button>
      </form>
    </div>
  );
}

// --- 管理後台 ---
function AdminPanel() {
  const = useState();
  useEffect(() => { fetch("/api/admin/depts").then(res => res.json()).then(setDepts); },);

  const handleAddUser = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    await fetch("/api/admin/users", { method: "POST", body: JSON.stringify(data) });
    alert("成功新增會員！"); e.target.reset();
  };

  const handleAddCatalog = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    await fetch("/api/admin/catalog", { method: "POST", body: JSON.stringify(data) });
    alert("成功更新部門清單選項！"); e.target.reset();
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="font-bold text-lg mb-4 text-gray-700 border-b pb-2">新增會員帳號</h3>
        <form onSubmit={handleAddUser} className="space-y-4">
          <input name="username" placeholder="帳號名稱" required className="w-full border rounded p-2" />
          <input name="password" type="password" placeholder="密碼" required className="w-full border rounded p-2" />
          <select name="dept_id" required className="w-full border rounded p-2">
            <option value="">-- 選取部門 --</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button className="w-full bg-blue-600 text-white py-2 rounded font-bold">確認新增</button>
        </form>
      </div>
      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="font-bold text-lg mb-4 text-gray-700 border-b pb-2">管理部門下拉清單</h3>
        <form onSubmit={handleAddCatalog} className="space-y-4">
          <select name="dept_id" required className="w-full border rounded p-2">
            <option value="">-- 選取部門 --</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input name="item_name" placeholder="新增清單項目 (如：公務車用油)" required className="w-full border rounded p-2" />
          <button className="w-full bg-green-600 text-white py-2 rounded font-bold">確認加入選項</button>
        </form>
      </div>
    </div>
  );
}

// --- 登入畫面 ---
function LoginScreen({ onLogin }) {
  const handleLogin = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const res = await fetch("/api/login", { method: "POST", body: JSON.stringify(data) });
    if (res.ok) onLogin(await res.json());
    else alert("帳號密碼錯誤，請洽管理員。");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-sm">
        <h2 className="text-3xl font-black text-gray-800 mb-8 text-center">系統登入</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input name="username" placeholder="管理員或員工帳號" required className="w-full border-b-2 p-3 outline-none focus:border-blue-500" />
          <input name="password" type="password" placeholder="密碼" required className="w-full border-b-2 p-3 outline-none focus:border-blue-500" />
          <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition">登入</button>
        </form>
      </div>
    </div>
  );
}
