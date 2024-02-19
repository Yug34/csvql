import {ModeToggle} from "@/components/theme-toggler.tsx";

export default function Navbar() {
    return (
        <header className="flex items-center h-14 px-4 border-b">
            <div className="mr-6 flex items-center gap-2">
                SQL Editor
            </div>
            <nav className="flex-1 justify-end hidden md:flex">
                <ModeToggle/>
            </nav>
        </header>
    )
}