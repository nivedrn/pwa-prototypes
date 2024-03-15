/** @type {import('next').NextConfig} */
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
              protocol: 'https',
              hostname: 's3.amazonaws.com',
              port: '',
            },
          ]
	},
    reactStrictMode: false,
};

export default nextConfig;
