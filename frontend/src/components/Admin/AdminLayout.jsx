import { useState } from "react";
import {FaBars} from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";

function AdminLayout() {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row relative">
            {/* Mobile Toggle */}
            <div className="flex md:hidden p-4 bg-gray-900 text-white z-20">
                <button onClick={toggleSidebar}><FaBars size={24}/></button>
                <h1 className="ml-4 text-xl font-medium">Admin Dashboard</h1>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden" onClick={toggleSidebar}></div>
            )}

            {/* Sidebar */}
            <div className={`bg-gray-900 w-3/5 md:w-64 text-white fixed md:relative
                left-0 top-0 h-screen transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 md:translate-x-0 md:static md:block z-20`}>
                {/* Admin Sidebar */}
                <AdminSidebar/>
            </div>

            <div className="flex-grow p-6 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
}

export default AdminLayout;