import { Button } from "../ui/button";
import { SidebarTrigger } from "../ui/sidebar";

export function NavigationBar() {
    return (
        <>
        <div className="flex gap-2 w-full p-4 items-center bg-red-100">
            <SidebarTrigger />
            <div className="flex justify-between w-full items-center">
            <h1>Leave Management System</h1>
            <Button>Login</Button>
            </div>
        </div>
        </>
    )
}