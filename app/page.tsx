import S3Button from "@/components/S3Button";
import AddNote from "@/components/AddingNotes";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import NewPromptModal from "@/components/newPrompt";
export default function Home() {
  return (
    <div className="flex h-screen flex-col space-y-4">
      <h1 className="text-2xl">Curiocity x WDB</h1>
      <S3Button />
      <AddNote />
      <DeleteConfirmationModal />
      <NewPromptModal />

      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl">Design System </h1>
        <div className="flex">
          <div className="h-16 w-32 bg-fileRed text-textPrimary"> fileRed </div>
          <div className="h-16 w-32 bg-fileOrange text-textPrimary">
            {" "}
            fileOrange{" "}
          </div>
          <div className="h-16 w-32 bg-fileBlue text-textPrimary">
            {" "}
            fileBlue
          </div>
          <div className="h-16 w-32 bg-fileLightTeal text-textPrimary">
            {" "}
            fileLightTeal
          </div>
          <div className="h-16 w-32 bg-fileGreen text-textPrimary">
            {" "}
            fileGreen{" "}
          </div>
          <div className="h-16 w-32 bg-accentPrimary text-textPrimary">
            {" "}
            accentPrimary{" "}
          </div>
          <div className="h-16 w-32 bg-accentSecondary text-textPrimary">
            {" "}
            accentSecondary{" "}
          </div>
          <div className="h-16 w-32 bg-bgPrimary text-textPrimary">
            {" "}
            bgPrimary{" "}
          </div>
          <div className="h-16 w-32 bg-bgSecondary text-textPrimary">
            {" "}
            bgSecondary{" "}
          </div>
          <div className="h-16 w-32 bg-textPrimary text-textSecondary">
            {" "}
            textPrimary{" "}
          </div>
          <div className="h-16 w-32 bg-textSecondary text-textPrimary">
            {" "}
            textSecondary{" "}
          </div>
        </div>
      </div>
    </div>
  );
}
