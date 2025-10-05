import { ModeToggle } from "@/components/ui/theme-toggler.tsx";
import { navigationMenuTriggerStyle } from "./ui/navigation-menu";
import { Github } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  return (
    <header className="flex items-center h-14 px-4 border-b">
      <div className="mr-6 flex items-center gap-2 font-bold">CSVQL</div>
      <a
        rel={"noreferrer"}
        target={"_blank"}
        href="https://github.com/Yug34/csvql"
        className={cn(navigationMenuTriggerStyle(), "border-2 border-gray-500")}
      >
        <Github className={"mr-2"} />
        Source Code
      </a>
      <nav className="flex-1 justify-end hidden md:flex">
        <ModeToggle />
      </nav>
    </header>
  );
}
