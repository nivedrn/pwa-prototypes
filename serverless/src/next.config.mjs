/** @type {import('next').NextConfig} */

import withPWA from "next-pwa";

const nextConfig = {
	redirects: async () => {
		return [
			{
				source: "/profile",
				destination: "/profile/info",
				permanent: true,
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "s3.amazonaws.com",
				port: "",
			},
		],
	},
	reactStrictMode: false,
};

export default withPWA({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
  })(nextConfig);
