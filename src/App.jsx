import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold">C</div>
          <h1 className="text-lg font-black tracking-tight">碳盤查數據門戶</h1>
        </div>
        <div className="flex gap-6 items-center">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-blue-600">{user.username}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{user.dept_name}</p>
          </div>
          {user.role === 'admin' && (
            <button onClick={() => setIsAdminView(!isAdminView)} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold text-sm hover:bg-blue-100 transition-all border border-blue-100 shadow-sm">
              {isAdminView? "返回填報頁" : "管理員後台"}
            </button>
          )}
          <button onClick={() => setUser(null)} className="text-sm font-bold text-red-500 px-3 py-2 rounded-lg transition-all hover:bg-red-50">安全登出</button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
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
    else alert("帳號或密碼錯誤");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm">
        <h2 className="text-3xl font-black text-center mb-10 text-slate-800">登入系統</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input name="username" placeholder="帳號" required className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input name="password" type="password" placeholder="密碼" required className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none" />
          <button className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all">進入系統</button>
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
    if (user) {
      fetch(`/api/catalog?dept_id=${user.dept_id}`).then(res => res.json()).then(data => setCatalog(data ||));
    }
  }, [user]);

  const onSubmit = async (data) => {
    const res = await fetch("/api/submit", { method: "POST", body: JSON.stringify({...data, user_id: user.id, dept_name: user.dept_name }) });
    if (res.ok) { alert("數據提交成功！已存入 D1。"); reset(); }
  };

  return (
    <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-xl border border-slate-100">
      <h2 className="text-2xl font-black text-slate-800 mb-8 underline decoration-blue-200 underline-offset-8">填報問卷：{user.dept_name}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {fields.map((field, index) => {
          const selected = watch(`records.${index}.item_name`);
          return (
            <div key={field.id} className="relative p-8 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">盤查項目</label>
                <select {...register(`records.${index}.item_name`)} required className="w-full bg-white rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">-- 請選取 --</option>
                  {catalog.map(c => <option key={c.id} value={c.item_name}>{c.item_name}</option>)}
                  <option value="other">--- 其它 (手動補充說明) ---</option>
                </select>
              </div>
              {selected === 'other' && (
                <div className="md:col-span-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">項目說明</label>
                  <input {...register(`records.${index}.custom_info`)} required placeholder="請輸入項目名稱" className="w-full rounded-xl p-3 shadow-sm" />
                </div>
              )}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">活動量數值</label>
                <input type="number" step="any" {...register(`records.${index}.value`)} required placeholder="數值" className="w-full rounded-xl p-3 shadow-sm" />
              </div>
              <div className="md:col-span-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">佐證網址 (Google Drive)</label>
                <input {...register(`records.${index}.url`)} required placeholder="https://drive..." className="w-full rounded-xl p-3 shadow-sm text-blue-600 font-bold underline" />
              </div>
              <div className="md:col-span-1 text-right">
                <button type="button" onClick={() => remove(index)} className="p-3 text-red-400 hover:text-red-600 transition-colors font-bold">刪除</button>
              </div>
            </div>
          );
        })}
        <button type="button" onClick={() => append({ item_name: "", value: "", url: "" })} className="w-full border-2 border-dashed border-slate-200 py-4 rounded-2xl text-slate-400 font-bold hover:bg-white hover:border-blue-300 transition-all">+ 新增填報項目</button>
        <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest">確認提交結果</button>
      </form>
    </div>
  );
}

function AdminPortal() {
  const = useState();
  const = useState("catalog");
  const refreshDepts = () => fetch("/api/admin/depts").then(res => res.json()).then(data => setDepts(data ||));
  useEffect(() => { refreshDepts(); },);

  return (
    <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-xl border border-slate-100 min-h-[600px]">
      <div className="flex gap-8 border-b mb-10 overflow-x-auto">
        <button onClick={() => setActiveTab("catalog")} className={`pb-4 font-black text-xs uppercase tracking-widest ${activeTab === 'catalog'? "text-blue-600 border-b-2 border-blue-600" : "text-slate-300"}`}>清單維護</button>
        <button onClick={() => setActiveTab("users")} className={`pb-4 font-black text-xs uppercase tracking-widest ${activeTab === 'users'? "text-blue-600 border-b-2 border-blue-600" : "text-slate-300"}`}>員工帳號管理</button>
        <button onClick={() => setActiveTab("depts")} className={`pb-4 font-black text-xs uppercase tracking-widest ${activeTab === 'depts'? "text-blue-600 border-b-2 border-blue-600" : "text-slate-300"}`}>部門架構設定</button>
      </div>
      {activeTab === 'catalog' && <CatalogManager depts={depts} />}
      {activeTab === 'users' && <UserManager depts={depts} />}
      {activeTab === 'depts' && <DeptManager onUpdate={refreshDepts} depts={depts} />}
    </div>
  );
}

function CatalogManager({ depts }) {
  const = useState("");
  const [items, setItems] = useState();

  useEffect(() => {
    if (selectedDept) fetch(`/api/catalog?dept_id=${selectedDept}`).then(res => res.json()).then(data => setItems(data ||));
  },);

  const addItem = async (e) => {
    e.preventDefault();
    const item_name = new FormData(e.target).get("item_name");
    await fetch("/api/admin/catalog", { method: "POST", body: JSON.stringify({ dept_id: selectedDept, item_name }) });
    alert("已加入該部門選單");
    e.target.reset();
    fetch(`/api/catalog?dept_id=${selectedDept}`).then(res => res.json()).then(data => setItems(data ||));
  };

  const deleteItem = async (id) => {
    if (!window.confirm("刪除此項？")) return;
    await fetch(`/api/admin/catalog?id=${id}`, { method: "DELETE" });
    setItems(items.filter(i => i.id!== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">第一步：選取維護部門</label>
        <select onChange={(e) => setSelectedDept(e.target.value)} className="w-full border-none bg-white rounded-xl p-4 shadow-sm focus:ring-2 focus:ring-blue-500 font-bold text-blue-700 outline-none">
          <option value="">-- 請選擇部門 --</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      {selectedDept && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <form onSubmit={addItem} className="flex gap-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <input name="item_name" placeholder="新增項目 (如: 公務車油耗)" required className="flex-1 border-none bg-white rounded-xl p-4 shadow-sm outline-none" />
            <button className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">加入選單</button>
          </form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(i => (
              <div key={i.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex justify-between items-center group shadow-sm hover:border-blue-300 transition-all">
                <span className="font-bold text-slate-700">{i.item_name}</span>
                <button onClick={() => deleteItem(i.id)} className="text-red-400 hover:text-red-600 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all uppercase">刪除</button>
              </div>
            ))}
          </div>
        </div>
      )}
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
    <div className="space-y-10 animate-in fade-in duration-500">
      <form onSubmit={addDept} className="flex gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <input name="name" placeholder="新部門名稱" required className="flex-1 border-none bg-white rounded-xl p-4 shadow-sm outline-none focus:ring-2 focus:ring-blue-500" />
        <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">新增部門架構</button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {depts.map(d => (
          <div key={d.id} className="p-6 bg-white border border-slate-200 rounded-2xl flex justify-between items-center group shadow-sm transition-all hover:border-blue-300">
            <span className="font-bold text-slate-700">{d.name}</span>
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-md text-slate-400 font-bold uppercase tracking-widest">ID: {d.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserManager({ depts }) {
  const addUser = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    await fetch("/api/admin/users", { method: "POST", body: JSON.stringify(data) });
    alert("同仁帳號已成功建立"); e.target.reset();
  };
  return (
    <div className="max-w-2xl bg-slate-50 p-10 rounded-3xl border border-slate-200 shadow-inner animate-in fade-in duration-500">
      <h3 className="text-xl font-black text-slate-800 mb-8 underline decoration-blue-200 underline-offset-8 tracking-tighter">建立同仁帳號</h3>
      <form onSubmit={addUser} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <input name="username" placeholder="設定帳號" required className="w-full border-none bg-white rounded-xl p-4 shadow-sm focus:ring-2 focus:ring-blue-500 font-medium" />
          <input name="password" type="password" placeholder="設定密碼" required className="w-full border-none bg-white rounded-xl p-4 shadow-sm focus:ring-2 focus:ring-blue-500 font-medium" />
        </div>
        <select name="dept_id" required className="w-full border-none bg-white rounded-xl p-4 shadow-sm focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 transition-all">
          <option value="">-- 指派所屬部門 --</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-black transition-all">確認建立同仁</button>
      </form>
    </div>
  );
}
