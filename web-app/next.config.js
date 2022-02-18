const withPlugins = require("next-compose-plugins");
const withImages = require("next-images");
const withTM = require("next-transpile-modules")([
  "@iconify-icons/cryptocurrency/matic",
  "@iconify-icons/cryptocurrency/usd",
]);

const nextConfig = {
  webpack: (config) => config,
};

module.exports = withPlugins([withImages, withTM], nextConfig);
