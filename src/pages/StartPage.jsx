import Button from "../components/common/Button";
export default function StartPage() {
  return (
    <div className="flex p-4 justify-between items-center flex-col h-screen bg-black py-8 gap-8">
      <div className="flex flex-col justify-between items-center gap-2">
        <img src="/logo.svg" alt="Логотип" className="w-32 h-32" />
        <h1 className="text-white font-bold">Виртуальный помощник</h1>
      </div>

      <img src="/hello.svg" alt="Иллюстрация приветствия" className=" h-60" />
      <Button link={"/loading"} text={"Начать"} />
    </div>
  );
}
