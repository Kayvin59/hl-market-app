import React from "react";

interface StatusMessageProps {
  status: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ status }) => {
  if (!status) return null;

  const isSuccess = status.includes("success");

  return (
    <div
      className={`mt-4 text-center p-2 rounded ${
        isSuccess ? "bg-teal-100 text-teal-700" : "bg-red-100 text-red-700"
      }`}
    >
      {isSuccess ? (
        <p>
          ✅ Order placed successfully.{" "}
          <a
            href={status.split("|")[1]}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-teal-700"
          >
            View on Explorer
          </a>
        </p>
      ) : (
        <p>{status}</p>
      )}
    </div>
  );
};

export default StatusMessage;
