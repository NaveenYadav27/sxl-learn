import { K8S_HANDS_ON_LABS } from './src/lib/k8sHandsOnLabs.ts';
import fs from 'fs';
fs.writeFileSync(process.argv[2], JSON.stringify(K8S_HANDS_ON_LABS, null, 2));
