import { Lock } from "lucide-react";

export default function NoReadPermission() {
  return (
    <div className="min-h-[calc(100vh-164px)] flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 rounded-xl shadow-lg p-8 border border-orange-200 mt-3.5">
      <div className="flex items-center justify-center mb-4">
        <Lock className="w-12 h-12 text-orange-400 drop-shadow-lg" />
      </div>
      <h2 className="text-xl font-bold text-orange-700 mb-2">Access Denied</h2>
      <p className="text-gray-600 text-center mb-4">
        You do not have permission to view organization users.<br />
        Please contact your administrator if you need access.
      </p>
    </div>
  );
}