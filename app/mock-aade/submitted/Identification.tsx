"use client";

import { useState } from "react";
import type { IdentificationOption } from "../../../lib/procedure/afm.ts";
import { formatDateEl, type GridDay } from "../slots.ts";

// Greek labels for the §3.1.2 identification options (ids match lib/procedure/afm.ts).
const OPTIONS: { id: IdentificationOption["id"]; labelEl: string }[] = [
  { id: "myaadelive_appointment", labelEl: "Ραντεβού βιντεοκλήσης μέσω myAADElive" },
  { id: "direct_video_call", labelEl: "Άμεση βιντεοκλήση με τον πρώτο διαθέσιμο υπάλληλο" },
  { id: "tax_office_visit", labelEl: "Αυτοπρόσωπη προσέλευση στη Δ.Ο.Υ." },
];

export default function Identification({ grid }: { grid: GridDay[] }) {
  const [method, setMethod] = useState<IdentificationOption["id"]>("myaadelive_appointment");
  const [booked, setBooked] = useState<{ date: string; time: string } | null>(null);

  return (
    <section className="space-y-6 border border-gray-300 bg-white p-6">
      <fieldset>
        <legend className="mb-2 text-lg font-semibold">Ταυτοποίηση</legend>
        <p className="mb-2 text-sm text-gray-600">Επιλέξτε τον τρόπο ταυτοποίησής σας:</p>
        {OPTIONS.map((o) => (
          <label key={o.id} className="block py-1">
            <input
              type="radio"
              id={o.id}
              name="identification"
              value={o.id}
              checked={method === o.id}
              onChange={() => setMethod(o.id)}
              className="mr-2"
            />
            {o.labelEl}
          </label>
        ))}
      </fieldset>

      {method === "myaadelive_appointment" && (
        <div>
          <h2 className="mb-2 font-semibold">myAADElive: διαθέσιμα ραντεβού</h2>
          <div className="grid grid-cols-5 gap-2">
            {grid.map((day) => (
              <div key={day.date}>
                <p className="mb-1 text-xs font-medium">{formatDateEl(day.date)}</p>
                {day.slots.map((slot) => (
                  <button
                    key={slot.id}
                    id={slot.id}
                    type="button"
                    onClick={() => setBooked({ date: day.date, time: slot.time })}
                    className={`mb-1 block w-full border px-2 py-1 text-sm ${
                      booked?.date === day.date && booked.time === slot.time
                        ? "border-blue-900 bg-blue-900 text-white"
                        : "border-gray-400 bg-white hover:bg-blue-50"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            ))}
          </div>
          {booked && (
            <p id="booking-confirmation" role="status" className="mt-4 border border-green-700 bg-green-50 p-3">
              Το ραντεβού σας επιβεβαιώθηκε: <strong>{formatDateEl(booked.date)}</strong> στις{" "}
              <strong>{booked.time}</strong>. Συνδεθείτε στη βιντεοκλήση με το διαβατήριό σας.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
