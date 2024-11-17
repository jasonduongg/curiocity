// app/api/upload/route.js

import { NextResponse } from "next/server";

export const runtime = "edge";

const LLAMA_CLOUD_API_KEY = process.env.LLAMA_CLOUD_API_KEY;

export async function POST(req) {
  try {
    // Parse the incoming form data
    const formData = await req.formData();
    const file = formData.get("myFile");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert the file to a Blob
    const fileBlob =
      file instanceof Blob ? file : new Blob([file], { type: file.type });

    // Prepare the form data for the external API
    const uploadFormData = new FormData();
    uploadFormData.append("file", fileBlob, file.name);

    // Step 1: Upload the file to the external API
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

    // Step 2: Poll the job status until it's complete
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
        // Wait for a few seconds before checking again
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Step 3: Fetch the Markdown result
    const resultResponse = await fetch(
      `https://api.cloud.llamaindex.ai//api/v1/parsing/job/${jobId}/result/raw/markdown`,
      {
        headers: {
          Authorization: `Bearer ${LLAMA_CLOUD_API_KEY}`,
          Accept: "text/markdown",
        },
      },
    );

    if (!resultResponse.ok) {
      const errorData = await resultResponse.json();
      throw new Error(`Result retrieval failed: ${errorData.message}`);
    }

    const markdown = await resultResponse.text();
    console.log(markdown);
    return NextResponse.json({ markdown });
  } catch (error) {
    console.error("Error processing file:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
