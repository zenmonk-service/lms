import Image from "next/image";

interface NoDataFoundProps {
  title?: string;
  message?: string;
}

const NoDataFound = ({ message, title }: NoDataFoundProps) => {
  return (
    <div className="flex flex-col items-center">
      <Image
        src={"/no-data-found.svg"}
        height={300}
        width={300}
        alt="no-data-found"
      />
      <h3 className="font-black text-2xl">{title || "No Data Found"}</h3>
      {message && (
        <p className="text-balance text-center text-muted-foreground text-xs max-w-sm">
          {message}
        </p>
      )}
    </div>
  );
};

export default NoDataFound;
