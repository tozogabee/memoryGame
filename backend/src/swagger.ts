import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const specPath = path.join(__dirname, '../openapi.yml');
const spec = yaml.load(fs.readFileSync(specPath, 'utf8'));

export default spec as object;