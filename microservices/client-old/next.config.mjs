/** @type {import('next').NextConfig} */
const nextConfig = {
	redirects: async () => {
		return [
			{
				source: "/api/:path*",
				destination: process.env.API_GATEWAY_URL + "/:path*",
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

export default nextConfig;
