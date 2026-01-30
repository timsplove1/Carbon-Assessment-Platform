import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";

export default function App() { // 改名為 App 以符合 main.jsx 呼叫
  const { register, control, watch, handleSubmit, reset } = useForm({
    defaultValues: { dept_id: "1" }
  });
  const selectedDept = watch("dept_id");
  const [catalogOptions, setCatalogOptions] = useState(); // 給予預設陣列避免報錯

  // 當部門改變時，抓取選單清單
  useEffect(() => {
    if (selectedDept) {
      fetch(`/api/catalog?dept_id=${selectedDept}`)
       .then(res => res.json())
       .then(data => setCatalogOptions(data ||))
       .catch(err => console.error("抓取清單失敗:", err));
    }
  },); // 確保這裡有加

  // 定義 1~6 類別的動態控制項
  const categoryHooks = {
    1: useFieldArray({ control, name: "cat1" }),
    2: useFieldArray({ control, name: "cat2" }),
    3: useFieldArray({ control, name: "cat3" }),
    4: useFieldArray({ control, name: "cat4" }),
    5: useFieldArray({ control, name: "cat5" }),
    6: useFieldArray({ control, name: "cat6" }),
  };

  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        alert("提交成功！");
        reset(); // 清空表單
      }
    } catch (err) {
      alert("提交失敗，請檢查網路。");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h1>碳盤查數據採集系統</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>填報部門：</label>
        <select {...register("dept_id")}>
          <option value="1">製造部</option>
          <option value="2">管理部</option>
          {/* 您可以根據 D1 資料庫內容動態增加選項 */}
        </select>

        {.[1, 2, 3, 4, 5, 6]map((catNum) => (
          <div key={catNum} style={{ marginTop: "20px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
            <h3>類別 {catNum}</h3>
            {categoryHooks[catNum].fields.map((field, index) => {
              // 監控目前選中的項目名稱
              const itemName = watch(`cat${catNum}.${index}.item_name`);
              return (
                <div key={field.id} style={{ marginBottom: "10px" }}>
                  <select {...register(`cat${catNum}.${index}.item_name`)} style={{ marginRight: "10px" }}>
                    <option value="">-- 請選擇項目 --</option>
                    {catalogOptions
                     .filter(o => o.category === catNum)
                     .map((opt, i) => (
                        <option key={i} value={opt.item_name}>{opt.item_name}</option>
                      ))}
                    <option value="other">其他 (自填)</option>
                  </select>

                  {/* 如果選「其他」，顯示手動輸入框 */}
                  {itemName === "other" && (
                    <input
                      {...register(`cat${catNum}.${index}.custom_name`)}
                      placeholder="請輸入項目名稱"
                      style={{ marginRight: "10px" }}
                    />
                  )}

                  <input
                    type="number"
                    step="any"
                    {...register(`cat${catNum}.${index}.value`)}
                    placeholder="活動數據量"
                  />
                  
                  <button type="button" onClick={() => categoryHooks[catNum].remove(index)} style={{ marginLeft: "10px" }}>
                    刪除
                  </button>
                </div>
              );
            })}
            <button type="button" onClick={() => categoryHooks[catNum].append({ item_name: "", value: "" })}>
              + 新增類別 {catNum} 紀錄
            </button>
          </div>
        ))}

        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <button type="submit" style={{ padding: "10px 40px", fontSize: "18px", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "5px" }}>
            確認提交盤查數據
          </button>
        </div>
      </form>
    </div>
  );
}
