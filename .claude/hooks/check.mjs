// Stop hook: Claude may not finish while lint, typecheck or tests fail. Exit 2 = block and send the output back.
import { spawnSync } from "node:child_process";

const r = spawnSync("npm run check", { shell: true, encoding: "utf8" });
if (r.status !== 0) {
  const tail = (r.stdout + r.stderr).split("\n").slice(-50).join("\n");
  console.error(`npm run check failed. Fix it before finishing:\n${tail}`);
  process.exit(2);
}
