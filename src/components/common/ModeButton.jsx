// components/common/ModeButton.jsx
export default function ModeButton({ index, text, onclick, type = "mode" }) {
  const getButtonStyle = () => {
    switch (type) {
      case "role":
        return "bg-purple-600 hover:bg-purple-700";
      case "button":
        return "bg-blue-600 hover:bg-blue-700";
      default: // mode
        return "bg-pink-600 hover:bg-pink-700";
    }
  };

  return (
    <button
      onClick={onclick}
      className={`p-2 rounded text-white text-sm font-medium transition-colors ${getButtonStyle()}`}
    >
      {text}
    </button>
  );
}
