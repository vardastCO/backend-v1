// apm.ts
import * as apm from 'elastic-apm-node';

export async function initializeApm() {
  try {
    await apm.start({
      serviceName: 'vardast-nest-apps',
      serverUrl: 'http://apm-server:8200',
      environment: 'production'
    });
    console.log('Elastic APM initialized successfully.');
  } catch (error) {
    console.log('Error starting Elastic APM Node.js Agent:', error);
  }
}
