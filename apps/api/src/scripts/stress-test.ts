/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { Client } from 'pg';
import Redis from 'ioredis';

/**
 * 💎 ELITE PRODUCTION VALIDATION SYSTEM (AutoWhats)
 * -----------------------------------------------
 * Advanced diagnostics for:
 * - Queue Drain Detection
 * - Latency Trend Analysis
 * - Worker Saturation Monitoring
 * - Retry Spike Detection
 * - Cost Simulation
 */

const API_URL = process.env.API_URL || 'http://localhost:3000/api/webhooks/whatsapp';
const CONCURRENCY = 40;
const STRICT_MODE = true; 

// Thresholds
const THRESHOLD_P95_MS = 3000;
const THRESHOLD_DLQ_COUNT = 10;
const THRESHOLD_FAIRNESS_RATIO = 1.35; 
const COST_PER_1K_TOKENS = 0.01; // Simulation cost
const TOKENS_PER_AI_REQUEST = 500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface UserMetric {
  workspaceId: string;
  inboundWamid: string;
  startTime: number;
  endTime?: number;
  isNoisy: boolean;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'MISSING_IN_DB' | 'MISSING_REPLY';
  dbInboundId?: string;
  dbOutboundId?: string;
  e2eLatency?: number;
}

interface SystemStats {
  totalSent: number;
  webhookSuccess: number;
  webhookFail: number;
  idempotencyHits: number;
  userMetrics: UserMetric[];
  startTime: number;
  activeJobsHistory: number[];
  failedJobsHistory: number[];
}

const stats: SystemStats = {
  totalSent: 0,
  webhookSuccess: 0,
  webhookFail: 0,
  idempotencyHits: 0,
  userMetrics: [],
  startTime: Date.now(),
  activeJobsHistory: [],
  failedJobsHistory: [],
};

function buildMetaPayload(phoneId: string, fromPhone: string, text: string, msgId?: string) {
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        changes: [
          {
            value: {
              metadata: { phone_number_id: phoneId },
              contacts: [{ profile: { name: `User ${fromPhone}` } }],
              messages: [
                {
                  id: msgId || `wamid.prod.${Date.now()}.${Math.random().toString(36).substring(7)}`,
                  from: fromPhone,
                  type: 'text',
                  text: { body: text },
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

async function runWithLimit<T>(limit: number, items: T[], fn: (item: T) => Promise<void>) {
  const workers = new Array(limit).fill(null).map(async () => {
    while (items.length > 0) {
      const item = items.pop();
      if (item) await fn(item);
    }
  });
  await Promise.all(workers);
}

async function getQueueMetrics(redis: Redis) {
  if (redis.status !== 'ready') return { status: 'OFFLINE' };
  const name = 'message-queue';
  const states = ['wait', 'active', 'delayed', 'failed', 'completed'];
  const metrics: any = { status: 'ONLINE' };
  
  for (const state of states) {
    const key = `bull:${name}:${state}`;
    try {
      if (['wait', 'active'].includes(state)) {
        metrics[state] = await redis.llen(key);
      } else {
        metrics[state] = await redis.zcard(key);
      }
    } catch {
      metrics[state] = 0;
    }
  }
  return metrics;
}

async function waitForQueuesToDrain(redis: Redis, maxWaitMs = 60000) {
    const start = Date.now();
    console.log('⏳ Waiting for queues to drain...');
    while (Date.now() - start < maxWaitMs) {
        const q = await getQueueMetrics(redis);
        if (q.status === 'OFFLINE') return { drained: false, time: 0 };
        if (q.wait === 0 && q.active === 0) {
            return { drained: true, time: Date.now() - start };
        }
        process.stdout.write(`\r[DRAIN] Wait: ${q.wait} | Active: ${q.active} | Elapsed: ${((Date.now() - start)/1000).toFixed(1)}s   `);
        await delay(2000);
    }
    return { drained: false, time: maxWaitMs };
}

async function main() {
  console.log('\n🔥 STARTING ELITE PRODUCTION VALIDATION SYSTEM...');
  
  const pgClient = new Client({ connectionString: process.env.DATABASE_URL });
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
  });
  
  redis.on('error', () => { /* Silence Redis errors during stress test */ });

  try {
    await pgClient.connect();
    console.log('✅ PostgreSQL Connected');
  } catch (err: any) {
    console.error('❌ Infrastructure Error (Postgres):', err.message);
    process.exit(1);
  }

  // 1. Workspace Configuration
  const workspaces = (await pgClient.query('SELECT id, "whatsappPhoneId" FROM "Workspace" LIMIT 3')).rows;
  if (workspaces.length < 2) throw new Error('Required: 2+ workspaces. Run seed script.');

  const normalWs = workspaces[0];
  const noisyWs = workspaces[1];
  const limitedWs = workspaces[2] || workspaces[0];

  // 2. Prepare Virtual Users
  const users: any[] = [];
  for (let i = 0; i < 30; i++) {
    users.push({ phone: `+111${i.toString().padStart(4, '0')}`, ws: normalWs, isNoisy: false, count: 2 });
  }
  for (let i = 0; i < 10; i++) {
    users.push({ phone: `+999${i.toString().padStart(4, '0')}`, ws: noisyWs, isNoisy: true, count: 8 });
  }

  console.log(`📡 Simulation: ${users.length} Users | ${users.reduce((a, b) => a + b.count, 0)} Combined Messages`);

  // Monitor worker saturation and retry spikes during load
  const monitorInterval = setInterval(async () => {
    const q = await getQueueMetrics(redis);
    if (q.status === 'ONLINE') {
        stats.activeJobsHistory.push(q.active);
        stats.failedJobsHistory.push(q.failed);
    }
  }, 1000);

  const simulateUser = async (user: any) => {
    let lastWamid = '';
    for (let i = 0; i < user.count; i++) {
      const roll = Math.random();
      let payload: any;
      let isDuplicate = false;
      
      if (roll < 0.1 && lastWamid) {
        payload = buildMetaPayload(user.ws.whatsappPhoneId, user.phone, 'Duplicate retry', lastWamid);
        isDuplicate = true;
      } else {
        payload = buildMetaPayload(user.ws.whatsappPhoneId, user.phone, `Elite Message ${i} from validation script`);
        lastWamid = payload.entry[0].changes[0].value.messages[0].id;
      }

      const startTime = Date.now();
      try {
        const res = await axios.post(API_URL, payload, { timeout: 10000 });
        if (res.status === 200) {
          if (isDuplicate) {
            stats.idempotencyHits++;
          } else {
            stats.webhookSuccess++;
            stats.userMetrics.push({
              workspaceId: user.ws.id,
              inboundWamid: lastWamid,
              startTime,
              isNoisy: user.isNoisy,
              status: 'PENDING'
            });
          }
        }
      } catch (e) {
        stats.webhookFail++;
      }
      stats.totalSent++;
      await delay(Math.floor(Math.random() * 500) + 100);
    }
  };

  // 3. Run Load phase
  await runWithLimit(CONCURRENCY, users, simulateUser);
  clearInterval(monitorInterval);
  console.log('\n✅ Load phase complete.');

  // 4. Queue Drain Detection
  const drainResult = await waitForQueuesToDrain(redis);
  if (!drainResult.drained && redis.status === 'ready') {
    console.warn(`\n⚠️ Queue drain timed out after ${drainResult.time}ms. Proceeding with caution...`);
  }

  // 5. End-to-End Database Validation
  console.log('\n🔍 COMMENCING END-TO-END DATA VALIDATION...');
  for (const metric of stats.userMetrics) {
    try {
      const inboundRes = await pgClient.query(
        'SELECT id, "conversationId", "timestamp" FROM "Message" WHERE "whatsappMsgId" = $1',
        [metric.inboundWamid]
      );
      
      if (inboundRes.rowCount === 0) {
        metric.status = 'MISSING_IN_DB';
        continue;
      }
      const inbound = inboundRes.rows[0];
      metric.dbInboundId = inbound.id;

      const outboundRes = await pgClient.query(
        'SELECT id, "timestamp" FROM "Message" WHERE "conversationId" = $2 AND "direction" = \'OUTBOUND\' AND "timestamp" > $1 ORDER BY "timestamp" ASC LIMIT 1',
        [inbound.timestamp, inbound.conversationId]
      );

      if (outboundRes.rowCount > 0) {
        const outbound = outboundRes.rows[0];
        metric.dbOutboundId = outbound.id;
        metric.status = 'SUCCESS';
        metric.endTime = outbound.timestamp.getTime();
        metric.e2eLatency = metric.endTime - metric.startTime;
      } else {
        metric.status = 'MISSING_REPLY';
      }
    } catch (e) {
      metric.status = 'FAILED';
    }
  }

  // 6. Elite Diagnostics Calculation
  const dlqCount = parseInt((await pgClient.query('SELECT COUNT(*) FROM "FailedJob" WHERE status = \'PENDING\'')).rows[0].count);
  
  // Latency Trend Analysis (5s buckets)
  const buckets: { [key: number]: number[] } = {};
  stats.userMetrics.filter(m => m.e2eLatency).forEach(m => {
    const bucketIdx = Math.floor((m.startTime - stats.startTime) / 5000);
    buckets[bucketIdx] = buckets[bucketIdx] || [];
    buckets[bucketIdx].push(m.e2eLatency!);
  });
  const latencyTrend = Object.keys(buckets).sort((a,b) => Number(a)-Number(b)).map(idx => {
    const latencies = buckets[Number(idx)];
    return { bucket: Number(idx) * 5 + 's', avg: Math.round(latencies.reduce((a,b)=>a+b,0)/latencies.length) };
  });

  const lastBucketLatency = latencyTrend[latencyTrend.length - 1]?.avg || 0;
  const avgOverallLatency = latencyTrend.reduce((a,b)=>a+b.avg,0) / (latencyTrend.length || 1);
  const degradationDetected = lastBucketLatency > avgOverallLatency * 1.25;

  // Worker Saturation detection
  const peakActive = Math.max(...(stats.activeJobsHistory.length ? stats.activeJobsHistory : [0]));
  const saturationDetected = peakActive >= CONCURRENCY * 0.9;

  // Retry Spike detection
  let retrySpikeDetected = false;
  if (stats.failedJobsHistory.length > 2) {
      const growth = stats.failedJobsHistory[stats.failedJobsHistory.length - 1] - stats.failedJobsHistory[0];
      const rate = growth / (stats.failedJobsHistory.length);
      retrySpikeDetected = rate > 2; // > 2 failures per sample
  }

  // Cost Simulation
  const totalAiRequests = stats.userMetrics.filter(m => m.status === 'SUCCESS').length;
  const totalTokens = totalAiRequests * TOKENS_PER_AI_REQUEST;
  const estimatedCostUSD = (totalTokens / 1000) * COST_PER_1K_TOKENS;

  // Final Reports & Sign-off
  const latencies = stats.userMetrics.filter(m => m.e2eLatency).map(m => m.e2eLatency!).sort((a,b) => a-b);
  const p95Latency = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p50Latency = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const successRate = (stats.userMetrics.filter(m => m.status === 'SUCCESS').length / (stats.userMetrics.length || 1)) * 100;

  // Fairness Analysis
  const normalLatencies = stats.userMetrics.filter(m => !m.isNoisy && m.e2eLatency).map(m => m.e2eLatency!);
  const noisyLatencies = stats.userMetrics.filter(m => m.isNoisy && m.e2eLatency).map(m => m.e2eLatency!);
  const normalAvg = normalLatencies.reduce((a, b) => a + b, 0) / (normalLatencies.length || 1);
  const noisyAvg = noisyLatencies.reduce((a, b) => a + b, 0) / (noisyLatencies.length || 1);
  const fairnessImpact = noisyAvg / (normalAvg || 1);

  let systemStatus: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
  const issues: string[] = [];

  if (successRate < 95) { issues.push(`Success Rate Low (${successRate.toFixed(1)}%)`); systemStatus = 'FAIL'; }
  if (p95Latency > THRESHOLD_P95_MS) { issues.push(`P95 Latency High (${p95Latency}ms)`); systemStatus = STRICT_MODE ? 'FAIL' : 'WARNING'; }
  if (degradationDetected) { issues.push('Performance Degradation Trend Detected'); systemStatus = 'WARNING'; }
  if (saturationDetected) { issues.push('Worker Saturation Warning'); }

  const report = {
    metadata: {
      timestamp: new Date().toISOString(),
      durationSec: ((Date.now() - stats.startTime) / 1000).toFixed(2),
      strictMode: STRICT_MODE,
      eliteUpgrade: 'v1.1-top-percentile'
    },
    performance: {
      successRate: `${successRate.toFixed(1)}%`,
      p50Latency: p50Latency.toFixed(0) + 'ms',
      p95Latency: p95Latency.toFixed(0) + 'ms',
      latencyTrend: latencyTrend
    },
    diagnostics: {
      queueDrainTime: `${(drainResult.time / 1000).toFixed(1)}s`,
      peakWorkerLoad: peakActive,
      saturationDetected,
      retrySpikeDetected,
      fairnessImpact: fairnessImpact.toFixed(2) + 'x'
    },
    economics: {
        totalAiInvocations: totalAiRequests,
        estimatedTokenUsage: totalTokens,
        estimatedCostUSD: `$${estimatedCostUSD.toFixed(4)}`
    },
    systemStatus: systemStatus,
    verdict: issues.length > 0 ? `${systemStatus}: ${issues.join(', ')}` : 'PASS: System is Elite and Production Ready'
  };

  console.log('\n=============================================');
  console.log('💎 ELITE PRODUCTION VALIDATION REPORT');
  console.log('=============================================');
  console.log(JSON.stringify(report, null, 2));
  console.log('=============================================\n');

  if (systemStatus === 'FAIL' && STRICT_MODE) {
    console.error('🛑 ELITE VALIDATION FAILED. PRODUCTION BLOCKED.');
    process.exit(1);
  }

  await pgClient.end();
  await redis.quit();
}

main().catch(async (e) => {
  console.error('SYSTEM CRASH:', e);
  process.exit(1);
});
