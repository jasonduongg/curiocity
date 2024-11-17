import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

interface Props {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput = ({ placeholder, value, onChange }: Props) => {
  return (
    <div className="mb-4 flex w-full flex-col border-b-[1px] border-zinc-700 py-2">
      <div className="flex flex-row items-center rounded-lg">
        <MagnifyingGlassIcon className="h-5 w-5 text-textPrimary" />
        <input
          id="search"
          type="text"
          className="w-full bg-transparent px-2 py-1 text-sm text-textPrimary outline-none focus:outline-none"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default TextInput;
