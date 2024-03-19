/** @type {import('next').NextConfig} */

import withPWA from "next-pwa";

const nextConfig = {
    reactStrictMode: false,
    redirects: async () => {
		return [
			{
				source: "/api/:path*",
				destination: process.env.API_GATEWAY_URL + "/:path*",
				permanent: true,
			},
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
              protocol: 'https',
              hostname: 's3.amazonaws.com',
              port: '',
            },
          ]
	},
};

export default withPWA({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
  })(nextConfig);

