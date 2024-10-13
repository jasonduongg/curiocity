import CustomSwitch from "@/components/CustomSwitch";
import S3Button from "@/components/S3Button";

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <h1 className="text-2xl">
        <span className="text-wdbBlue">Web Development</span> at Berkeley
      </h1>
      <p>
        Full-stack web development project template. Check the README for more
        information!
      </p>
      <CustomSwitch />
      <S3Button />
    </div>
  );
}
