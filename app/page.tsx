import { Suspense } from "react";
import Kleidi from "./components/Kleidi";

export default function Home() {
  return (
    <Suspense>
      <Kleidi />
    </Suspense>
  );
}
