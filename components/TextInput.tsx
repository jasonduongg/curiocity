import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

interface Props {
  placeholder: string;
}

const TextInput = ({ placeholder }: Props) => {
  return (
    <div className="flex w-full items-center">
      <MagnifyingGlassIcon className="h-6 w-6 text-textPrimary"></MagnifyingGlassIcon>
      <input
        id="username"
        type="text"
        className="ml-4 w-full bg-bgSecondary py-2 text-textPrimary selection:border-0"
        placeholder={placeholder}
      />
    </div>
  );
};

export default TextInput;
