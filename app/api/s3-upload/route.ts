import { S3 } from "aws-sdk";
import { NextResponse } from "next/server";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.S3_UPLOAD_REGION,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const fileName = body.filename;
    const fileType = body.filetype;

    // Ensure both fileName and fileType are provided
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "Missing fileName or fileType" },
        { status: 400 },
      );
    }

    console.log("Parsed request body:", { fileName, fileType });

    const s3Params = {
      Bucket: process.env.S3_UPLOAD_BUCKET,
      Key: fileName,
      Expires: 60,
      ContentType: fileType,
    };

    // Generate signed URL for S3 upload
    const signedUrl = await s3.getSignedUrlPromise("putObject", s3Params);

    return NextResponse.json({ url: signedUrl }, { status: 200 });
  } catch (error) {
    console.error("Error creating S3 signed URL:", error);
    return NextResponse.json(
      { error: "Failed to create S3 signed URL" },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
