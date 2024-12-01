import PromiseFtp from 'promise-ftp';

const MAX_CONNECTIONS = 6;

// Define the type for an FTP connection
export type FtpConnection = PromiseFtp;

// Define the type for the queue items
type QueueItem = {
  resolve: (ftp: FtpConnection) => void;
  reject: (error: unknown) => void;
};

// Connection pool to manage reusable connections
const connectionPool: FtpConnection[] = [];

// Queue to hold pending connection requests
const connectionQueue: QueueItem[] = [];

// Flag to track whether a connection attempt is in progress
let isConnecting = false;

/**
 * Gets an FTP connection from the pool or establishes a new one.
 * Manages a queue for pending connections if the maximum connections are reached.
 *
 * @returns {Promise<FtpConnection>} A Promise that resolves with an FTP connection.
 */
async function getConnection(): Promise<FtpConnection> {
  if (connectionPool.length > 0) {
    return connectionPool.pop() as FtpConnection;
  }

  if (isConnecting || connectionQueue.length >= MAX_CONNECTIONS) {
    return new Promise<FtpConnection>((resolve, reject) =>
      connectionQueue.push({ resolve, reject }),
    );
  }

  const ftp = new PromiseFtp();

  try {
    isConnecting = true;
    await ftp.connect({
      host: process.env.FTP_HOST as string,
      user: process.env.FTP_USERNAME as string,
      password: process.env.FTP_PASSWORD as string,
    });
    isConnecting = false;

    // Process queued requests if there are any
    if (connectionQueue.length > 0) {
      const { resolve } = connectionQueue.shift() as QueueItem;
      resolve(ftp);
    }
    return ftp;
  } catch (error) {
    isConnecting = false;
    console.error('FTP connection error:', error);

    // Reject the first queued connection request if an error occurs
    if (connectionQueue.length > 0) {
      const { reject } = connectionQueue.shift() as QueueItem;
      reject(error);
    }
    throw error;
  }
}

/**
 * Releases an FTP connection back to the pool or closes it.
 *
 * @param {FtpConnection} ftp - The FTP connection to release.
 * @returns {Promise<void>} A Promise that resolves when the connection is released.
 */
async function releaseConnection(ftp: FtpConnection): Promise<void> {
  try {
    // Check the connection status (method assumed to be available on PromiseFtp)
    const connectionStatus = ftp.getConnectionStatus(); // Replace with actual PromiseFtp status-check method if different.

    if (
      connectionStatus === 'connected' &&
      connectionPool.length < MAX_CONNECTIONS
    ) {
      connectionPool.push(ftp);
    } else {
      await ftp.end();
    }

    if (connectionQueue.length > 0) {
      const { resolve } = connectionQueue.shift() as QueueItem;
      resolve(ftp);
    }
  } catch (error) {
    console.error('Error while releasing connection:', error);

    // Reject the next queued request if an error occurs
    if (connectionQueue.length > 0) {
      const { reject } = connectionQueue.shift() as QueueItem;
      reject(error);
    }
  }
}

export { getConnection, releaseConnection };
