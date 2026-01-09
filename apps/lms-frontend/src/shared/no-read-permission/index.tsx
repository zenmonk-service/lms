import { Lock } from "lucide-react";

export default function NoReadPermission() {
  return (
    <div className="min-h-[calc(100vh-185px)] flex flex-col items-center justify-center p-8 rounded-2xl border border-border">
      <div className="flex items-center justify-center mb-4">
        <Lock className="w-12 h-12" />
      </div>
      <h2 className="text-xl font-bold">Access Denied</h2>
      <p className="text-xs text-center mb-4">
        You do not have permission to view organization users.
        <br />
        Please contact your administrator if you need access.
      </p>
    </div>
  );
}
