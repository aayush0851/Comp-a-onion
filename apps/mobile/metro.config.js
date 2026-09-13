const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// firebase v9+ ships as conditional "exports" subpaths (firebase/app, firebase/storage) —
// Metro needs this on to resolve them instead of falling back to legacy main/browser fields.
config.resolver.unstable_enablePackageExports = true;

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
