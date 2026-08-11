import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Higher concurrency renders faster but eats RAM. Lower it if renders get killed.
Config.setConcurrency(null);
