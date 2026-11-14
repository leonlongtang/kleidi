import { afmProcedure } from "../../lib/procedure/afm.ts";
import ApplicationForm from "./ApplicationForm";

export default function MockAadePage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">Αίτηση απόδοσης ΑΦΜ και κλειδάριθμου</h1>
      <p className="mb-6 text-sm text-gray-600">Συμπληρώστε τα στοιχεία σας και επισυνάψτε τα δικαιολογητικά.</p>
      <ApplicationForm fields={afmProcedure.fields} />
    </>
  );
}
