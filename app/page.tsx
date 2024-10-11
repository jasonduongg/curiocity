import CustomSwitch from "@/components/CustomSwitch";
import TextEditor from "@/components/TextEditor";

export default function Home() {
  return (
    <div className="flex h-screen flex-col space-y-4">
      <h1 className="text-2xl">
        <span className="text-wdbBlue">Web Development</span> at Berkeley
      </h1>
      <p>
        Full-stack web development project template. Check the README for more
        information!
      </p>
      <CustomSwitch />
      <TextEditor />
    </div>
  );
}
