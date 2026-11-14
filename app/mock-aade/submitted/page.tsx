import { Suspense } from "react";
import { connection } from "next/server";
import { applicationNumber, bookingGrid } from "../slots.ts";
import Identification from "./Identification";

async function Receipt() {
  await connection();
  const now = new Date();
  return (
    <>
      <div className="mb-6 border border-green-700 bg-green-50 p-4">
        <p className="font-semibold text-green-900">Η αίτησή σας υποβλήθηκε επιτυχώς.</p>
        <p>
          Αριθμός αίτησης: <strong id="application-number">{applicationNumber(now)}</strong>
        </p>
      </div>
      <Identification grid={bookingGrid(now)} />
    </>
  );
}

export default function SubmittedPage() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Υποβολή αίτησης</h1>
      <Suspense fallback={<p>Φόρτωση…</p>}>
        <Receipt />
      </Suspense>
    </>
  );
}
