import ManageOrganizationsUser from "@/components/user/list-user";

export default function UserManagement() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-11/12 min-[1400px]:w-3/4 p-6">
        <ManageOrganizationsUser />
      </div>
    </div>
  );
}
