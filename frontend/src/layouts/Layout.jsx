import Navbar from "../components/ui/Navbar";
import Sidebar from "../components/ui/Sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="sidebar-print-hide">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="navbar-print-hide">
          <Navbar />
        </div>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}