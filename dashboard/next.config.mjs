/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The vault parser uses Node's fs/child_process at request time, so keep
  // these modules server-only and out of any client bundle.
  serverExternalPackages: ["gray-matter", "globby"],
};

export default nextConfig;
