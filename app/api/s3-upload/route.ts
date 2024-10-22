import { S3 } from "aws-sdk";
import { NextResponse } from 'next/server';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_S3_UPLOAD_REGION,
});

export async function POST(req: Request) {
  try{
    const body = await req.json();
    const { fileName, fileType } = body;
    console.log("Parsed request body:", { fileName, fileType });

    const s3Params = {
        Bucket: process.env.NEXT_PUBLIC_S3_UPLOAD_BUCKET,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
      };

      const signedUrl = await s3.getSignedUrlPromise("putObject", s3Params);

      return NextResponse.json({ url: signedUrl }, { status: 200 });
  } catch(error) {
    return NextResponse.json({ error: "Failed to create S3 signed URL" }, { status: 500 });
  }
}

export async function OPTIONS() {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
