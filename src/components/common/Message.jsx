// components/common/Message.jsx
import { useEffect } from "react";
export default function Message({ owner, text, embedding }) {
  const isUser = owner === "user";

  useEffect(() => {
    // Query logic
    console.log("component message being rerendered");
  }, []);
  const renderMedia = () => {
    if (!embedding || !embedding.data) return null;

    return embedding.data.map((item, index) => {
      const fileUrl =
        item.file_url || `https://e0c612b5fe2e.ngrok-free.app${item.file}`;
      const fileExtension = item.file?.split(".").pop() || "";

      // Check if it's an image
      if (
        ["jpg", "jpeg", "png", "gif", "webp"].includes(
          fileExtension.toLowerCase()
        )
      ) {
        return (
          <img
            key={index}
            src={fileUrl}
            alt="Attachment"
            className="max-w-full mt-2 rounded"
          />
        );
      }

      // Check if it's a video
      if (["mp4", "webm", "ogg"].includes(fileExtension.toLowerCase())) {
        return (
          <video key={index} controls className="max-w-full mt-2 rounded">
            <source src={fileUrl} type={`video/${fileExtension}`} />
            Your browser does not support the video tag.
          </video>
        );
      }

      // For PDFs and other files, show a download link
      return (
        <a
          key={index}
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2 text-blue-400 underline"
        >
          Download {fileExtension.toUpperCase()} file
        </a>
      );
    });
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser ? "bg-[#F80093]" : "bg-white"
        }`}
      >
        <p className={`${isUser ? "text-white" : "text-black"}`}>{text}</p>
        {!isUser && renderMedia()}
      </div>
    </div>
  );
}
