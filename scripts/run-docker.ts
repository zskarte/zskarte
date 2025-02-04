import { exec as cbExec } from 'child_process';
import { promisify } from 'util';
import waitOn from 'wait-on';
const exec = promisify(cbExec);

// Function to check if Docker is installed
const checkDockerInstalled = async () => {
  try {
    const { stdout } = await exec('docker --version');
    return `Docker is installed: ${stdout.trim()}`;
  } catch (error) {
    throw new Error('Docker is not installed or not in PATH.');
  }
};

// Function to check if Docker daemon is running
const checkDockerRunning = async () => {
  try {
    const { stdout } = await exec('docker info');
    return 'Docker daemon is running.';
  } catch (error) {
    throw new Error('Docker daemon is NOT running.');
  }
};

// Main function to check both conditions
const checkDockerStatus = async () => {
  try {
    const installedMessage = await checkDockerInstalled();
    console.log(installedMessage);

    const runningMessage = await checkDockerRunning();
    console.log(runningMessage);
  } catch (error) {
    console.error(error.message);
  }
};

(async () => {
  await checkDockerStatus();
  await exec('docker-compose up -d');
  await waitOn({
    resources: ['http://localhost:7050/login'],
    delay: 1000,
    interval: 100,
    simultaneous: 1,
    timeout: 60000,
    tcpTimeout: 1000,
    window: 1000,
  });
})();
