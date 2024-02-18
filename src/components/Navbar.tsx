import {ModeToggle} from "@/components/theme-toggler.tsx";

export default function Navbar() {
    return (
        <header className="flex items-center h-14 px-4 border-b">
            <div className="mr-6 flex items-center gap-2">
                <PackageIcon className="h-6 w-6" />
                <span className="font-semibold">Acme Inc</span>
            </div>
            <nav className="flex-1 justify-end hidden md:flex">
                <ModeToggle/>
            </nav>
        </header>
    )
}

const PackageIcon = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </svg>
    )
}