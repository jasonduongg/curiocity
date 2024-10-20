/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    NEXT_PUBLIC_S3_UPLOAD_BUCKET: process.env.NEXT_PUBLIC_S3_UPLOAD_BUCKET,
    NEXT_PUBLIC_S3_UPLOAD_REGION: process.env.NEXT_PUBLIC_S3_UPLOAD_REGION,
  },
};

export default nextConfig;
