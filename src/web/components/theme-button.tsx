import { globalState$ } from "../state";
import { Moon, Sun } from "@solar-icons/react";

export default function ThemeButton() {
  console.log(globalState$.colorMode.get());

  return (
    <button
      type="button"
      className="p-2 rounded-md cursor-pointer dark:text-moonlightWhite hover:bg-neutral-400/10 dark:hover:bg-neutral-400/5"
      onClick={() => {
        if (globalState$.colorMode.get() === "dark") {
          globalState$.colorMode.set("light");
        } else {
          globalState$.colorMode.set("dark");
        }
      }}
    >
      {globalState$.colorMode.get() === "dark" ? (
        <Sun size={15} />
      ) : (
        <Moon size={15} />
      )}
    </button>
  );
}
