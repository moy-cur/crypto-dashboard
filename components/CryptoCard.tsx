import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PriceEntry } from "types/common";

type CryptoCardProps = {
  id: string;
  data: PriceEntry;
};

const CryptoCard: React.FC<CryptoCardProps> = ({ id, data }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800
        text-gray-800 dark:text-gray-200
        border border-gray-200 dark:border-gray-600
        rounded-2xl shadow-md p-6
        flex flex-col items-center"
        >
      <h2 className="text-xl font-bold">{id}</h2>
      <p className="text-sm text-gray-600">💵 USD:</p>
      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
        {data?.usd ? `$${parseFloat(data.usd).toFixed(2)}` : "..."}
      </p>
      <p className="text-sm text-gray-600 mt-3">₿ BTC:</p>
      <p className="text-md font-semibold text-orange-500 dark:text-orange-300">
        {data?.btc ? parseFloat(data.btc).toFixed(8) : "..."}
      </p>
    </div>
  );
};

export default CryptoCard;
