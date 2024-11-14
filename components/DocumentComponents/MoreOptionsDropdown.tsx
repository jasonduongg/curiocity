import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import DeleteConfirmationModal from "../ModalComponents/DeleteConfirmationModal";

interface MoreOptionsDropdownProps {
  documentId?: string;
  refreshState: () => void;
}

const MoreOptionsDropdown: React.FC<MoreOptionsDropdownProps> = ({
  documentId,
  refreshState,
}) => {
  const handleEdit = () => {
    console.log(`Edit document with ID: ${documentId}`);
  };

  //   const handleDelete = () => {
  //     console.log(`Delete document with ID: ${documentId}`);
  //     refreshState();
  //   };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 text-white">
          <span className="sr-only">Open menu</span>
          ...
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DeleteConfirmationModal
          documentId={documentId}
          refreshState={refreshState}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MoreOptionsDropdown;
