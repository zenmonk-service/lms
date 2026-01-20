import Image from "next/image";
const NoDataFound = () => {
  return (
    <div className="flex flex-col items-center">
      <Image
        src={"/no-data-found.svg"}
        height={300}
        width={300}
        alt="no-data-found"
      />
      <h3 className="font-black text-2xl">No Data Found</h3>
      <p className="text-balance text-center text-muted-foreground text-xs max-w-sm">
        Your leave dashboard is currently empty. Start by submitting your first
        request to track approvals and manager feedback.
      </p>
    </div>
  );
};

export default NoDataFound;
