import { Link } from "react-router-dom";

export default function Button({ text, link }) {
  return (
    <Link
      to={link}
      className="bg-[#F80093] w-full h-[60px] text-white font-bold rounded-[12px] flex items-center justify-center"
    >
      {text}
    </Link>
  );
}
