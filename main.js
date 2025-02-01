const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class ConfigLoader {
  constructor(configDir, env = 'dev') {
    this.configDir = configDir;
    this.env = env;
    this.configs = {};
    this.currentNamespace = null;
  }

  _loadFile(filePath) {
    const ext = path.extname(filePath);

    if (ext === '.yaml' || ext === '.yml') {
      return yaml.load(fs.readFileSync(filePath, 'utf8'));
    } else if (ext === '.json') {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      throw new Error(`Unsupported config file format: ${ext}`);
    }
  }

  _getNamespaceFilePath(namespace) {
    return path.join(this.configDir, `${namespace}.yaml`);
  }

  load(namespace) {
    if (this.configs[namespace]) {
      this.currentNamespace = namespace; 
      return this;
    }

    const filePath = this._getNamespaceFilePath(namespace);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Configuration for namespace '${namespace}' not found at ${filePath}`);
    }

    const configData = this._loadFile(filePath);

    this.configs[namespace] = configData;
    this.currentNamespace = namespace;

    return this; 
  }

  get(configName) {
    if (!this.currentNamespace) {
      throw new Error('No namespace loaded. Please call load(namespace) first.');
    }

    const config = this.configs[this.currentNamespace];

    if (!config.hasOwnProperty(configName)) {
      throw new Error(`Config '${configName}' not found in namespace '${this.currentNamespace}'`);
    }

    return config[`${configName}_${this.env}`];
  }
}


