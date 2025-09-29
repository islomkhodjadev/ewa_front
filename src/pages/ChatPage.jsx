import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { IoIosSend, IoIosOptions } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Message from "../components/common/Message";
import ModeButton from "../components/common/ModeButton";
import TypingIndicator from "../components/common/TypingIndicator";
import useWebSocket from "../hooks/UseWebsocket";
import { useBotClient } from "../providers/BotClientProvider";
import LoadingPage from "./LoadingPage";

export default function ChatPage() {
  const navigate = useNavigate();
  const { botClient, isLoading } = useBotClient();

  // All state hooks must be declared unconditionally
  const [modeOpen, setModeOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [dynamicButtons, setDynamicButtons] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [currentMode, setCurrentMode] = useState("chat");

  // All ref hooks must be declared unconditionally
  const messagesEndRef = useRef(null);
  const processedMessages = useRef(new Set());
  const errorLogged = useRef(false);

  // WebSocket state managed internally
  const [websocketUrl, setWebsocketUrl] = useState(null);

  // Get user info from botClient (with safe optional chaining)
  const first_name = botClient?.user?.first_name || "Пользователь";
  const user_id = botClient?.user?.id;

  // WebSocket hook - only called when we have a valid URL
  const {
    socket,
    isConnected,
    lastMessage,
    error: wsError,
    sendMessage: sendWsMessage,
    disconnect,
    connect,
  } = useWebSocket(websocketUrl, {
    maxReconnectAttempts: 3,
    reconnectDelay: 3000,
  });

  // Effect to set WebSocket URL only when we have valid user_id
  useEffect(() => {
    if (user_id && user_id !== "unknown") {
      const url = `wss://admin-helper.ewaproduct.com/ws/notifications/${user_id}/`;
      console.log("Setting WebSocket URL:", url);
      setWebsocketUrl(url);
    } else {
      console.log("No valid user_id, not setting WebSocket URL");
      setWebsocketUrl(null);
    }
  }, [user_id]); // Only re-run when user_id changes

  // All useEffect hooks must be declared unconditionally
  useEffect(() => {
    if (!isLoading && !botClient) {
      navigate("/loading");
    }
  }, [isLoading, botClient, navigate]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isWaitingForResponse]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.data) {
      const messageId = `${lastMessage.timeStamp}-${lastMessage.data.slice(
        0,
        20
      )}`;

      if (processedMessages.current.has(messageId)) {
        return;
      }

      processedMessages.current.add(messageId);

      try {
        const data = JSON.parse(lastMessage.data);
        console.log("Received WebSocket data:", data);

        if (data.status === "accepted") {
          console.log("Task accepted:", data);
          setCurrentTaskId(data.task_id);
          setIsWaitingForResponse(true);
        } else if (data.answer !== undefined) {
          console.log("Received answer:", data);

          if (data.buttons) {
            console.log("Setting buttons:", data.buttons);
            setDynamicButtons(data.buttons);
            setAvailableRoles([]);
          }

          if (data.roles) {
            console.log("Setting roles:", data.roles);
            setAvailableRoles(data.roles);
          }

          if (data.mode) {
            setCurrentMode(data.mode === "skynet" ? "skynet" : "chat");
          }

          if (data.task_id === currentTaskId || !currentTaskId) {
            const newMessage = {
              id: Date.now(),
              message: data.answer,
              embedding: data.embedding,
              owner: "system",
              created_at: new Date().toISOString(),
            };

            setMessages((prev) => sortMessages([...prev, newMessage]));
            setIsWaitingForResponse(false);
            setCurrentTaskId(null);
          }
        } else if (data.messages) {
          const sortedMessages = sortMessages(data.messages);
          setMessages(sortedMessages);

          if (data.mode) {
            setCurrentMode(data.mode === "skynet" ? "skynet" : "chat");
          }

          if (data.buttons) {
            console.log("Setting initial buttons:", data.buttons);
            setDynamicButtons(data.buttons);
          }

          if (data.roles) {
            console.log("Setting initial roles:", data.roles);
            setAvailableRoles(data.roles);
          }
        }
      } catch (error) {
        console.error(
          "Error parsing WebSocket message:",
          error,
          lastMessage.data
        );
      }
    }
  }, [lastMessage, currentTaskId]);

  // Handle WebSocket errors
  useEffect(() => {
    if (wsError && !errorLogged.current) {
      console.error("WebSocket error:", wsError);
      errorLogged.current = true;
      setTimeout(() => {
        errorLogged.current = false;
      }, 1000);
    }
  }, [wsError]);

  // All useCallback hooks must be declared unconditionally
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const sortMessages = useCallback((messagesArray) => {
    return [...messagesArray].sort((a, b) => a.id - b.id);
  }, []);

  const handleSendMessage = useCallback(
    (messageText = null, roleId = null, roleName = null) => {
      const messageToSend = messageText || inputMessage;

      if ((messageToSend.trim() === "" && !roleId) || isWaitingForResponse)
        return;

      const userMessage = {
        id: Date.now(),
        message: roleName || messageToSend,
        owner: "user",
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => sortMessages([...prev, userMessage]));

      let payload = { prompt: messageToSend };

      if (roleId) {
        payload = {
          prompt: roleName,
          role_id: parseInt(roleId),
        };
      }

      const success = sendWsMessage(JSON.stringify(payload));

      if (success) {
        if (!messageText) {
          setInputMessage("");
        }
        setIsWaitingForResponse(true);
      } else {
        console.error("Failed to send message");
      }
    },
    [inputMessage, isWaitingForResponse, sendWsMessage, sortMessages]
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleModeChange = useCallback(
    (modeCommand) => {
      handleSendMessage(modeCommand);
      setModeOpen(false);
    },
    [handleSendMessage]
  );

  const handleRoleSelect = useCallback(
    (roleId, roleName) => {
      handleSendMessage(roleName, roleId, roleName);
      setModeOpen(false);
    },
    [handleSendMessage]
  );

  const modeOptions = useMemo(() => {
    if (availableRoles.length > 0) {
      return availableRoles.map((role) => ({
        text: role.name || role.role_name,
        onClick: () =>
          handleRoleSelect(
            role.id || role.role_id,
            role.name || role.role_name
          ),
        type: "role",
      }));
    }

    if (dynamicButtons.length > 0) {
      return dynamicButtons.map((button, index) => ({
        text: button,
        onClick: () => handleModeChange(button),
        type: "button",
      }));
    }

    return [
      {
        text: currentMode === "skynet" ? "/ЧАТ" : "/Тренажер",
        onClick: () =>
          handleModeChange(currentMode === "skynet" ? "/ЧАТ" : "/Тренажер"),
        type: "mode",
      },
    ];
  }, [
    availableRoles,
    dynamicButtons,
    currentMode,
    handleRoleSelect,
    handleModeChange,
  ]);

  // Conditional return must be AFTER all hooks
  if (isLoading || !botClient) {
    return <LoadingPage />;
  }

  return (
    <div className="w-screen h-screen bg-black flex flex-col">
      <div className="fixed top-0 left-0 w-full h-[40px] flex items-center justify-between p-2 z-10">
        <img src="/logo.svg" alt="Logo" className="h-full w-[60px]" />
        <h1 className="font-bold text-white text-sm text-right ml-[30px]">
          Добро пожаловать, {first_name}
        </h1>
      </div>

      <div className="h-full w-full mt-[40px] overflow-y-auto p-2 pb-24">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col gap-4 w-full justify-center items-center">
            <img
              className="text-gray-500 opacity-70 w-[70%]"
              src="/logo.svg"
              alt=""
            />
            <h1 className="text-gray-500 text-center">
              Отправьте первое сообщение виртуальному помощнику
            </h1>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((message, idx) => (
              <Message
                key={message.id || idx}
                owner={message.owner}
                text={message.message}
                embedding={message.embedding}
              />
            ))}

            {isWaitingForResponse && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="w-full flex bg-transparent backdrop-blur-md justify-around flex-col items-center p-2">
        <div className="w-full flex justify-around items-center p-2">
          <IoIosOptions
            color="#F80093"
            size={30}
            onClick={() => setModeOpen(!modeOpen)}
            className="cursor-pointer"
          />

          <input
            type="text"
            placeholder={
              isConnected
                ? currentMode === "skynet"
                  ? "Режим Тренажер"
                  : "Режим ЧАТ"
                : "Нет связи"
            }
            className={`w-[80%] ${
              isConnected ? "bg-white" : "bg-red-300"
            } outline-none p-2 rounded-[12px]`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isWaitingForResponse || !isConnected}
          />
          <IoIosSend
            color={isWaitingForResponse || !isConnected ? "#ccc" : "#F80093"}
            size={30}
            onClick={() => handleSendMessage()}
            className={
              isWaitingForResponse || !isConnected
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }
          />
        </div>

        <div
          className={`${
            !modeOpen ? "hidden" : "block"
          } w-full grid grid-cols-2 gap-2 transition-all duration-300`}
        >
          {modeOptions.map((option, index) => (
            <ModeButton
              key={index}
              index={index}
              text={option.text}
              onclick={option.onClick}
              type={option.type}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
