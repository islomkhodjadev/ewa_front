// components/common/Message.jsx
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Message({ owner, text, embedding }) {
  const isUser = owner === "user";
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const modalRef = useRef(null);

  useEffect(() => {
    console.log("component message being rerendered");
  }, []);

  const groupMediaByType = (data) => {
    if (!data) return { images: [], videos: [], files: [] };

    const groups = {
      images: [],
      videos: [],
      files: [],
    };

    data.forEach((item) => {
      const fileUrl =
        item.file_url || `https://e0c612b5fe2e.ngrok-free.app${item.file}`;
      const fileExtension = item.file?.split(".").pop()?.toLowerCase() || "";
      const fileName = item.file?.split("/").pop() || "file";

      const mediaItem = {
        ...item,
        fileUrl,
        fileExtension,
        fileName,
      };

      if (
        ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(
          fileExtension
        )
      ) {
        groups.images.push(mediaItem);
      } else if (
        [
          "mp4",
          "webm",
          "ogg",
          "avi",
          "mkv",
          "wmv",
          "flv",
          "m4v",
          "3gp",
        ].includes(fileExtension)
      ) {
        groups.videos.push(mediaItem);
      } else {
        groups.files.push(mediaItem);
      }
    });

    return groups;
  };

  const openMediaModal = (media, index, type) => {
    const mediaGroups = groupMediaByType(embedding.data);
    let allMedia = [];

    if (mediaGroups.images.length > 0) {
      allMedia = allMedia.concat(
        mediaGroups.images.map((item) => ({ ...item, type: "image" }))
      );
    }
    if (mediaGroups.videos.length > 0) {
      allMedia = allMedia.concat(
        mediaGroups.videos.map((item) => ({ ...item, type: "video" }))
      );
    }

    let combinedIndex = 0;
    if (type === "image") {
      combinedIndex = index;
    } else if (type === "video") {
      combinedIndex = mediaGroups.images.length + index;
    }

    setSelectedMedia(allMedia);
    setCurrentIndex(combinedIndex);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setCurrentIndex(0);
  };

  const goToNext = () => {
    if (selectedMedia && currentIndex < selectedMedia.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (selectedMedia && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!startX) return;

    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
      setStartX(0);
    }
  };

  const handleTouchEnd = () => {
    setStartX(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowRight") goToNext();
    if (e.key === "ArrowLeft") goToPrev();
  };

  useEffect(() => {
    if (selectedMedia) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [selectedMedia, currentIndex]);

  const renderMediaModal = () => {
    if (!selectedMedia || selectedMedia.length === 0) return null;

    const currentItem = selectedMedia[currentIndex];

    return (
      <div
        ref={modalRef}
        className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
        onClick={closeModal}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            closeModal();
          }}
          className="absolute top-6 right-6 text-white text-3xl z-10 bg-black bg-opacity-60 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-80 transition-all active:scale-95"
        >
          ✕
        </button>

        {selectedMedia.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl z-10 bg-black bg-opacity-60 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-80 transition-all active:scale-95"
              >
                ‹
              </button>
            )}

            {currentIndex < selectedMedia.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl z-10 bg-black bg-opacity-60 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-80 transition-all active:scale-95"
              >
                ›
              </button>
            )}
          </>
        )}

        <div
          className="relative max-w-full max-h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {currentItem.type === "image" ? (
            <img
              src={currentItem.fileUrl}
              alt="Изображение"
              className="max-w-full max-h-full object-contain rounded-lg select-none"
              draggable={false}
            />
          ) : (
            <video
              controls
              autoPlay
              className="max-w-full max-h-full rounded-lg select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <source
                src={currentItem.fileUrl}
                type={`video/${currentItem.fileExtension}`}
              />
              Ваш браузер не поддерживает видео тег.
            </video>
          )}
        </div>

        {selectedMedia.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-60 px-4 py-2 rounded-full text-base font-medium">
            {currentIndex + 1} / {selectedMedia.length}
          </div>
        )}
      </div>
    );
  };

  const renderMediaGroups = () => {
    if (!embedding || !embedding.data) return null;

    const mediaGroups = groupMediaByType(embedding.data);
    const hasImages = mediaGroups.images.length > 0;
    const hasVideos = mediaGroups.videos.length > 0;
    const hasFiles = mediaGroups.files.length > 0;

    if (!hasImages && !hasVideos && !hasFiles) return null;

    return (
      <div className="mt-3 space-y-3">
        {hasImages && (
          <div
            className={`grid gap-2 ${
              mediaGroups.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {mediaGroups.images.map((image, index) => (
              <div
                key={index}
                className="cursor-pointer transform hover:scale-105 transition-transform duration-200 active:scale-95"
                onClick={() => openMediaModal(image, index, "image")}
              >
                <img
                  src={image.fileUrl}
                  alt="Изображение"
                  className="w-full h-auto rounded-lg object-cover max-h-48 select-none"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        )}

        {hasVideos && (
          <div className="grid grid-cols-1 gap-3">
            {mediaGroups.videos.map((video, index) => (
              <div
                key={index}
                className="cursor-pointer transform hover:scale-105 transition-transform duration-200 active:scale-95 relative"
                onClick={() => openMediaModal(video, index, "video")}
              >
                <video
                  className="w-full rounded-lg max-h-64 bg-black select-none"
                  poster={video.thumbnail || undefined}
                  preload="metadata"
                  draggable={false}
                >
                  <source
                    src={video.fileUrl}
                    type={`video/${video.fileExtension}`}
                  />
                  Ваш браузер не поддерживает видео тег.
                </video>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-10 transition-all">
                  <div className="text-white text-4xl bg-black bg-opacity-50 rounded-full w-16 h-16 flex items-center justify-center">
                    ▶
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasFiles && (
          <div className="space-y-2">
            {mediaGroups.files.map((file, index) => {
              const getFileIcon = (ext) => {
                if (ext === "mov") return "🎬";
                if (["pdf"].includes(ext)) return "📄";
                if (["doc", "docx"].includes(ext)) return "📝";
                if (["xls", "xlsx"].includes(ext)) return "📊";
                if (["zip", "rar", "7z"].includes(ext)) return "📦";
                if (["txt"].includes(ext)) return "📃";
                return "📎";
              };

              const getFileTypeText = (ext) => {
                if (ext === "mov") return "Видеофайл MOV";
                if (ext === "pdf") return "PDF документ";
                if (["doc", "docx"].includes(ext)) return "Word документ";
                if (["xls", "xlsx"].includes(ext)) return "Excel таблица";
                if (["zip", "rar", "7z"].includes(ext)) return "Архив";
                if (["txt"].includes(ext)) return "Текстовый файл";
                return "Файл";
              };

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors active:scale-95"
                  onClick={() => window.open(file.fileUrl, "_blank")}
                >
                  <span className="text-2xl">
                    {getFileIcon(file.fileExtension)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {file.fileName}
                    </div>
                  </div>
                  <span className="text-blue-500 text-sm font-medium whitespace-nowrap">
                    Открыть
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Б";

    const units = ["Б", "КБ", "МБ", "ГБ"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <>
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
        <div
          className={`max-w-[80%] min-w-0 p-4 rounded-2xl ${
            isUser
              ? "bg-[#F80093] rounded-br-none"
              : "bg-white border border-gray-200 rounded-bl-none"
          }`}
        >
          {text && (
            <div
              className={`${
                isUser ? "text-white" : "text-gray-900"
              } mb-2 text-sm prose prose-sm max-w-none break-words overflow-wrap-anywhere whitespace-pre-wrap`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre: ({ node, children, ...props }) => (
                    <pre
                      className="overflow-x-auto bg-gray-100 p-3 rounded-md text-xs max-w-full block"
                      {...props}
                    >
                      {children}
                    </pre>
                  ),
                  code: ({ node, inline, className, children, ...props }) => {
                    if (inline) {
                      return (
                        <code
                          className={`${className} bg-gray-100 px-1 rounded text-xs`}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <div className="overflow-x-auto">
                        <code
                          className={`${className} block text-xs`}
                          {...props}
                        >
                          {children}
                        </code>
                      </div>
                    );
                  },
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
          )}
          {!isUser && renderMediaGroups()}
        </div>
      </div>

      {renderMediaModal()}
    </>
  );
}
