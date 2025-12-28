
"use client";

import { useRouter } from "expo-router";

 
interface BordNavbarProps {
  date: string | Date;
  params: {
    organizationId: string;
    orderId: string;
  };
  data: any; // serialized order
}

export function BordNabar({ date, params, data }: BordNavbarProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-50 border-b bg-white">
      <div className="flex h-14 items-center gap-3 px-4">
        {/* Back Button */}
        <button
          onClick={() =>
            router.push(`/organization/${params.organizationId}/order`)
          }
          className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium hover:bg-gray-100"
        >
          {/* <ArrowLeft className="h-4 w-4" /> */}
          Back
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-300" />

        {/* Title */}
        <div className="flex flex-col">
          <span className="text-sm font-semibold">
            Order Details
          </span>
          <span className="text-xs text-gray-500">
            {new Date(date).toDateString()}
          </span>
        </div>

        {/* Right Side */}
        <div className="ml-auto text-xs text-gray-500">
          Order ID: <span className="font-medium">{data?.id}</span>
        </div>
      </div>
    </div>
  );
}
