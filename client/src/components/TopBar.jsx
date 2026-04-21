// client/src/components/TopBar.jsx
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

const routeLabels = {
  "/dashboard":           "Legal Assistant",
  "/dashboard/contracts": "Contract Generator",
  "/dashboard/analyze":   "Document Analyzer",
  "/dashboard/profile":   "Profile",
};

export default function TopBar() {
  const { user } = useContext(AuthContext);
  const { pathname } = useLocation();

  const pageTitle = routeLabels[pathname] ?? "NyayaAI";

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
      {/* Page title */}
      <h1 className="text-base font-semibold text-gray-800">{pageTitle}</h1>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {user?.isPremium && (
          <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2.5 py-1 rounded-full">
            ✦ Premium
          </span>
        )}
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-sm select-none">
          {user?.name?.[0]?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}