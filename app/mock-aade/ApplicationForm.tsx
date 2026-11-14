"use client";

import { useRouter } from "next/navigation";
import type { FormField } from "../../lib/procedure/afm.ts";

const inputClass = "w-full border border-gray-400 bg-white px-2 py-1.5";

function Input({ field }: { field: FormField }) {
  const common = { id: field.id, name: field.id, className: inputClass };
  if (field.type === "select") {
    return (
      <select {...common} defaultValue="">
        <option value="" disabled>
          -- Επιλέξτε --
        </option>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.labelEl}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "file") return <input {...common} type="file" accept="image/*,application/pdf" />;
  return <input {...common} type={field.type} />;
}

export default function ApplicationForm({ fields }: { fields: FormField[] }) {
  const router = useRouter();
  return (
    <form
      className="space-y-4 border border-gray-300 bg-white p-6"
      onSubmit={(e) => {
        e.preventDefault();
        router.push("/mock-aade/submitted");
      }}
    >
      {fields.map((field) => (
        <div key={field.id}>
          <label htmlFor={field.id} className="mb-1 block text-sm font-medium">
            {field.labelEl}
          </label>
          <Input field={field} />
        </div>
      ))}
      <button id="submit" type="submit" className="bg-blue-900 px-6 py-2 font-semibold text-white hover:bg-blue-800">
        Υποβολή
      </button>
    </form>
  );
}
