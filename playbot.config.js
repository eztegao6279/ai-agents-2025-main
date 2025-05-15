const config = {
  baseUrl: "https://dronjo.wopee.io",
  // baseUrl: "https://www.amazon.com/",

  frameworkPath: "tests",
  analysisPath: "experiments/1-AI-PW-Bot/playbot-data",

  aiProvider: process.env.AI_PROVIDER || "openai",
  aiModel: process.env.AI_MODEL || "gpt-4o-mini",
  apiKey: process.env.AZURE_API_KEY || "",

  azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT || "",
  azureDeploymentName: process.env.AZURE_DEPLOYMENT_NAME || "",
};
export default config;
