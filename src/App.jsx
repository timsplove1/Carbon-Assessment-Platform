import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">C</div>
          <h1 className="text-xl font-bold">碳盤查採集系統</h1>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium">歡迎: {user.username} ({user.dept_name})</span>
          {user.role === 'admin' && (
            <button onClick={() => setIsAdminView(!isAdminView)} className="text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded transition">
              {isAdminView? "返回填報" : "管理後台"}
            </button>
          )}
          <button onClick={() => setUser(null)} className="text-sm text-red-500">登出</button>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-6">
        {isAdminView? <AdminPortal /> : <UserForm user={user} />}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const handleLogin = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const res = await fetch("/api/login", { method: "POST", body: JSON.stringify(data) });
    if (res.ok) onLogin(await res.json());
    else alert("登入失敗");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-sm">
        <h2 className="text-3xl font-black text-center mb-8">系統登入</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input name="username" placeholder="帳號" required className="w-full border-b-2 p-3 outline-none focus:border-blue-600" />
          <input name="password" type="password" placeholder="密碼" required className="w-full border-b-2 p-3 outline-none focus:border-blue-600" />
          <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition">登入系統</button>
        </form>
      </div>
    </div>
  );
}

function UserForm({ user }) {
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
    if (res.ok) { alert("數據提交成功！"); reset(); }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">填報數據：{user.dept_name}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => {
          const selected = watch(`records.${index}.item_name`);
          return (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-5 bg-slate-50 rounded-lg relative border">
              <div>
                <label className="text-xs font-bold text-slate-400">項目</label>
                <select {...register(`records.${index}.item_name`)} className="w-full border rounded p-2 bg-white">
                  <option value="">-- 請選取 --</option>
                  {catalog.map(c => <option key={c.id} value={c.item_name}>{c.item_name}</option>)}
                  <option value="other">其他 (手動填寫)</option>
                </select>
              </div>
              {selected === 'other' && (
                <div>
                  <label className="text-xs font-bold text-slate-400">補充說明</label>
                  <input {...register(`records.${index}.custom_info`)} placeholder="請輸入項目名稱" className="w-full border rounded p-2" />
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-slate-400">數據量</label>
                <input type="number" step="any" {...register(`records.${index}.value`)} required className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400">Drive 佐證連結</label>
                <input {...register(`records.${index}.url`)} placeholder="https://drive..." required className="w-full border rounded p-2 text-blue-600" />
              </div>
              <button type="button" onClick={() => remove(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6">✕</button>
            </div>
          );
        })}
        <button type="button" onClick={() => append({ item_name: "", value: "", url: "" })} className="w-full border-2 border-dashed py-3 rounded-lg text-slate-400 mb-8">+ 新增一行</button>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow hover:bg-blue-700">提交數據</button>
      </form>
    </div>
  );
}

function AdminPortal() {
  const = useState();
  const = useState("catalog");

  const refreshDepts = () => fetch("/api/admin/depts").then(res => res.json()).then(setDepts);
  useEffect(() => { refreshDepts(); },);

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="flex gap-6 border-b mb-8">
        <button onClick={() => setActiveTab("catalog")} className={`pb-3 font-bold ${activeTab === 'catalog'? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400"}`}>清單維護</button>
        <button onClick={() => setActiveTab("users")} className={`pb-3 font-bold ${activeTab === 'users'? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400"}`}>會員管理</button>
        <button onClick={() => setActiveTab("depts")} className={`pb-3 font-bold ${activeTab === 'depts'? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400"}`}>部門設定</button>
      </div>
      {activeTab === 'catalog' && <CatalogManager depts={depts} />}
      {activeTab === 'users' && <UserManager depts={depts} />}
      {activeTab === 'depts' && <DeptManager onUpdate={refreshDepts} depts={depts} />}
    </div>
  );
}

function DeptManager({ depts, onUpdate }) {
  const addDept = async (e) => {
    e.preventDefault();
    const name = new FormData(e.target).get("name");
    await fetch("/api/admin/depts", { method: "POST", body: JSON.stringify({ name }) });
    alert("部門已新增"); e.target.reset(); onUpdate();
  };
  return (
    <div className="space-y-6">
      <form onSubmit={addDept} className="flex gap-4">
        <input name="name" placeholder="輸入新部門名稱" required className="flex-1 border rounded p-2" />
        <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold">確認新增</button>
      </form>
      <div className="grid grid-cols-2 gap-2">
        {depts.map(d => <div key={d.id} className="p-2 bg-slate-50 border rounded flex justify-between"><span>{d.name} (ID: {d.id})</span></div>)}
      </div>
    </div>
  );
}

function CatalogManager({ depts }) {
  const = useState("");
  const [items, setItems] = useState();

  useEffect(() => {
    if (selectedDept) fetch(`/api/catalog?dept_id=${selectedDept}`).then(res => res.json()).then(setItems);
  },);

  const addItem = async (e) => {
    e.preventDefault();
    const item_name = new FormData(e.target).get("item_name");
    await fetch("/api/admin/catalog", { method: "POST", body: JSON.stringify({ dept_id: selectedDept, item_name }) });
    alert("已加入選項"); e.target.reset();
    fetch(`/api/catalog?dept_id=${selectedDept}`).then(res => res.json()).then(setItems);
  };

  const deleteItem = async (id) => {
    await fetch(`/api/admin/catalog?id=${id}`, { method: "DELETE" });
    setItems(items.filter(i => i.id!== id));
  };

  return (
    <div className="space-y-6">
      <select onChange={(e) => setSelectedDept(e.target.value)} className="w-full border p-3 rounded bg-slate-50">
        <option value="">-- 先選擇欲維護的部門 --</option>
        {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      {selectedDept && (
        <div className="animate-in fade-in">
          <form onSubmit={addItem} className="flex gap-2 mb-6">
            <input name="item_name" placeholder="輸入新增項目名稱" required className="flex-1 border rounded p-2" />
            <button className="bg-green-600 text-white px-6 rounded font-bold">新增</button>
          </form>
          <div className="space-y-2">
            {items.map(i => (
              <div key={i.id} className="p-3 border rounded flex justify-between items-center">
                <span>{i.item_name}</span>
                <button onClick={() => deleteItem(i.id)} className="text-red-500 text-sm font-bold">刪除</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UserManager({ depts }) {
  const addUser = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    await fetch("/api/admin/users", { method: "POST", body: JSON.stringify(data) });
    alert("員工帳號已建立"); e.target.reset();
  };
  return (
    <form onSubmit={addUser} className="space-y-4 max-w-lg">
      <input name="username" placeholder="員工帳號" required className="w-full border rounded p-2" />
      <input name="password" type="password" placeholder="員工密碼" required className="w-full border rounded p-2" />
      <select name="dept_id" required className="w-full border rounded p-2">
        <option value="">-- 分配部門 --</option>
        {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">確認建立員工帳號</button>
    </form>
  );
}
