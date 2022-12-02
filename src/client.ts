/**
 * Imports
 */
import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { Connection, WorkflowClient } from '@temporalio/client';
import { example } from './workflows';
import { SMSRequest } from './types/sms';

/**
 * Clients
 */
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT;

const driver = async(payload: SMSRequest) => {
  /**
   * Temporal Boiler Plate
   */
  const env = getEnv();
  const {
    address,
    namespace,
    clientCertPath,
    clientKeyPath,
    serverNameOverride,
    serverRootCACertificatePath,
    taskQueue,
  } = env;
  let serverRootCACertificate: Buffer | undefined = undefined;
  if (serverRootCACertificatePath) {
    serverRootCACertificate = fs.readFileSync(serverRootCACertificatePath);
  }

  const connection = await Connection.connect({
    address,
    tls: {
      serverNameOverride,
      serverRootCACertificate,
      clientCertPair: {
        crt: fs.readFileSync(clientCertPath),
        key: fs.readFileSync(clientKeyPath),
      },
    },
  });
  const client = new WorkflowClient({ connection, namespace });
  // Run example workflow and await its completion
  const result = await client.execute(example, {
    taskQueue,
    workflowId: `my-business-id-${Date.now()}`,
    args: [payload],
  });
  return result;
}

app.post('/sms', async(req, res) => {
  const {body} = req;

  try {
    const result = await driver(body)
    res.send(result);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ReferenceError(`${name} environment variable is not defined`);
  }
  return value;
}

app.listen(PORT, () => console.log(`Listening on ${PORT}.\nNode Environment is on ${process.env.NODE_ENV} mode.`));

export interface Env {
  address: string;
  namespace: string;
  clientCertPath: string;
  clientKeyPath: string;
  serverNameOverride?: string; // not needed if connecting to Temporal Cloud
  serverRootCACertificatePath?: string; // not needed if connecting to Temporal Cloud
  taskQueue: string;
}

export function getEnv(): Env {
  return {
    address: requiredEnv('TEMPORAL_ADDRESS'),
    namespace: requiredEnv('TEMPORAL_NAMESPACE'),
    clientCertPath: requiredEnv('TEMPORAL_CLIENT_CERT_PATH'),
    clientKeyPath: requiredEnv('TEMPORAL_CLIENT_KEY_PATH'),
    serverNameOverride: process.env.TEMPORAL_SERVER_NAME_OVERRIDE,
    serverRootCACertificatePath: process.env.TEMPORAL_SERVER_ROOT_CA_CERT_PATH,
    taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'hello-world-mtls',
  };
}
