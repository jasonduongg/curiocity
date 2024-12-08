import { NextResponse } from "next/server";

export const runtime = "edge";

const LLAMA_CLOUD_API_KEY = process.env.LLAMA_CLOUD_API_KEY;

interface ResponseData {
  pages: {
    text?: string;
    md?: string;
    images?: { url: string }[];
  }[];
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("myFile");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileBlob =
      file instanceof Blob ? file : new Blob([file], { type: file.type });

    const uploadFormData = new FormData();
    uploadFormData.append("file", fileBlob, file.name);

    const uploadResponse = await fetch(
      "https://api.cloud.llamaindex.ai/api/parsing/upload",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${LLAMA_CLOUD_API_KEY}`,
        },
        body: uploadFormData,
      },
    );
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(`Upload failed: ${errorData.message}`);
    }

    const uploadResult = await uploadResponse.json();
    const jobId = uploadResult.id;
    console.log(jobId);

    let jobStatus = "";
    while (jobStatus !== "SUCCESS") {
      const statusResponse = await fetch(
        `https://api.cloud.llamaindex.ai//api/v1/parsing/job/${jobId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${LLAMA_CLOUD_API_KEY}`,
          },
        },
      );

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        throw new Error(`Status check failed: ${errorData.message}`);
      }

      const statusResult = await statusResponse.json();
      jobStatus = statusResult.status;

      if (jobStatus === "ERROR") {
        throw new Error("Parsing job failed.");
      } else if (jobStatus !== "COMPLETED") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    console.log("reached1");
    const imageResult = await fetch(
      `https://api.cloud.llamaindex.ai/api/parsing/job/${jobId}/result/json`,
      {
        headers: {
          Authorization: `Bearer ${LLAMA_CLOUD_API_KEY}`,
          Accept: "text/markdown",
        },
      },
    );
    if (!imageResult.ok) {
      const errorData = await imageResult.json();
      throw new Error(`Result retrieval failed: ${errorData.message}`);
    }
    const images = [];
    const data: ResponseData = await imageResult.json();
    data.pages.forEach((page) => {
      if (page.images && page.images.length > 0) {
        page.images.forEach((image) => {
          images.push(image);
        });
      }
    });
    console.log("reached2_LOLL");
    const resultResponse = await fetch(
      `https://api.cloud.llamaindex.ai//api/v1/parsing/job/${jobId}/result/raw/markdown`,
      {
        headers: {
          Authorization: `Bearer ${LLAMA_CLOUD_API_KEY}`,
          Accept: "text/markdown",
        },
      },
    );
    console.log("reached3");
    if (!resultResponse.ok) {
      const errorData = await resultResponse.json();
      throw new Error(`Result retrieval failed: ${errorData.message}`);
    }

    const markdown = await resultResponse.text();
    console.log(markdown);
    return NextResponse.json({ markdown, images });
  } catch (error) {
    console.error("Error processing file:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
