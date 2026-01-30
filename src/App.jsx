import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";

export default function CarbonForm() {
  const { register, control, watch, handleSubmit } = useForm();
  const selectedDept = watch("dept_id"); // 監控部門選單
  const [catalogOptions, setCatalogOptions] = useState();

  // 當部門改變時，從後端抓取該部門專屬的選項
  useEffect(() => {
    if (selectedDept) {
      fetch(`/api/catalog?dept_id=${selectedDept}`)
       .then(res => res.json())
       .then(data => setCatalogOptions(data));
    }
  },);

  // 以類別 1 為例，建立動態陣列
  const { fields, append, remove } = useFieldArray({ control, name: "cat1" });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <select {...register("dept_id")}>
        <option value="1">製造部</option>
        <option value="2">管理部</option>
      </select>

      <h3>類別 1：直接排放</h3>
      {fields.map((field, index) => (
        <div key={field.id}>
          {/* 下拉選單只顯示屬於該類別的項目 */}
          <select {...register(`cat1.${index}.item_name`)}>
            {catalogOptions.filter(o => o.category === 1).map(opt => (
              <option value={opt.item_name}>{opt.item_name}</option>
            ))}
            <option value="other">其他 (自填)</option>
          </select>
          
          <input type="number" {...register(`cat1.${index}.value`)} placeholder="活動數據量" />
          <button onClick={() => remove(index)}>刪除</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ item_name: "", value: 0 })}>
        新增紀錄
      </button>

      <button type="submit">提交盤查數據</button>
    </form>
  );
}
