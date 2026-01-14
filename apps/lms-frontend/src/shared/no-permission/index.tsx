import Image from "next/image";
import NoPermissionSvg from "@/assets/svg/no-permission.svg";

interface NoPermissionProps {
  moduleName: string;
}

const NoPermission = ({ moduleName }: NoPermissionProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border border-border bg-card shadow-sm">
      <Image
        src={NoPermissionSvg}
        width={300}
        height={300}
        alt="No Permission"
      />
      <div className="flex flex-col justify-center items-center">
        <h2 className="text-4xl font-black tracking-tighter">
          Permission Required
        </h2>
        <p className="max-w-md font-medium leading-relaxed">
          Your current authority tier does not include management rights for{" "}
          <span className="font-bold">{moduleName}</span>. Please contact your
          system administrator to elevate your credentials.
        </p>
      </div>
    </div>
  );
};

export default NoPermission;
