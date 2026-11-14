// Renders the demo's specimen documents to public/specimen/*.png: node scripts/specimen.mjs
// Invented person, invented numbers, no emblems, no MRZ, SPECIMEN across every card. Never a real document.
import { chromium } from "playwright";

const priya = {
  surname: "RAMAN",
  given: "PRIYA",
  nationality: "INDIAN",
  sex: "F",
  dob: "14/03/1996",
  pob: "CHENNAI",
  father: "ARJUN RAMAN",
  mother: "MEERA RAMAN",
};

const row = (label, value) =>
  `<div class="f"><div class="l">${label}</div><div class="v">${value}</div></div>`;

const card = (title, subtitle, fields, tint) => `<!doctype html><html><head><meta charset="utf-8"><style>
  body { margin: 0; background: #fff; font-family: Arial, sans-serif; }
  .card { position: relative; width: 860px; height: 540px; margin: 20px; border-radius: 22px; overflow: hidden;
          background: linear-gradient(135deg, ${tint}, #f4f1ea 70%); border: 2px solid #8a8577; padding: 28px 34px;
          box-sizing: border-box; }
  h1 { margin: 0; font-size: 26px; letter-spacing: 1px; color: #2d2a24; }
  h2 { margin: 2px 0 22px; font-size: 15px; font-weight: normal; color: #4d493f; }
  .body { display: flex; gap: 30px; }
  .photo { width: 170px; height: 215px; border: 2px solid #8a8577; background: #ddd8cc; flex: none; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 26px; flex: 1; }
  .l { font-size: 12px; color: #5d584d; text-transform: uppercase; }
  .v { font-size: 21px; font-weight: bold; color: #1d1b17; }
  .stamp { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
           font-size: 120px; font-weight: bold; color: rgba(200, 30, 30, 0.28); transform: rotate(-18deg);
           letter-spacing: 12px; pointer-events: none; }
  .note { position: absolute; bottom: 16px; left: 34px; font-size: 13px; color: #a01d1d; font-weight: bold; }
</style></head><body><div class="card" id="card">
  <h1>${title}</h1><h2>${subtitle}</h2>
  <div class="body">
    <svg class="photo" viewBox="0 0 170 215"><circle cx="85" cy="80" r="42" fill="#b9b2a2"/>
      <ellipse cx="85" cy="200" rx="70" ry="62" fill="#b9b2a2"/></svg>
    <div class="grid">${fields.map(([l, v]) => row(l, v)).join("")}</div>
  </div>
  <div class="stamp">SPECIMEN</div>
  <div class="note">SPECIMEN · DEMO ONLY · NOT A VALID DOCUMENT · INVENTED PERSON</div>
</div></body></html>`;

const docs = {
  passport: card("PASSPORT", "Specimen for the Kleidi demo · Type P · Issuing state: India (IND)", [
    ["Surname", priya.surname],
    ["Given names", priya.given],
    ["Passport no.", "X1234567"],
    ["Nationality", priya.nationality],
    ["Date of birth", priya.dob],
    ["Sex", priya.sex],
    ["Place of birth", priya.pob],
    ["Place of issue", "CHENNAI"],
    ["Date of issue", "02/01/2024"],
    ["Date of expiry", "01/01/2034"],
    ["Name of father", priya.father],
    ["Name of mother", priya.mother],
  ], "#cfd8e8"),
  "residence-permit": card("ΑΔΕΙΑ ΔΙΑΜΟΝΗΣ · RESIDENCE PERMIT", "Specimen for the Kleidi demo · Greece", [
    ["Επώνυμο / Surname", priya.surname],
    ["Όνομα / Given names", priya.given],
    ["Αριθμός / Permit no.", "RP0004217"],
    ["Ιθαγένεια / Nationality", "IND"],
    ["Ημ. γέννησης / Date of birth", priya.dob],
    ["Φύλο / Sex", priya.sex],
    ["Τύπος / Type", "ΕΡΓΑΣΙΑ / EMPLOYMENT"],
    ["Έκδοση / Issued", "20/10/2026"],
    ["Λήξη / Valid until", "19/10/2028"],
    ["Αρχή / Authority", "ΑΠΟΚ. ΔΙΟΙΚΗΣΗ ΑΤΤΙΚΗΣ"],
  ], "#d9e6d3"),
};

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
for (const [name, html] of Object.entries(docs)) {
  await page.setContent(html);
  await page.locator("#card").screenshot({ path: `public/specimen/${name}.png` });
  console.log(`public/specimen/${name}.png`);
}
await browser.close();
