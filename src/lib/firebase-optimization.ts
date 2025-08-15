import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const publicStatsCache = new Map<string, { data: any; expires: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

interface BatchOperation {
  collection: string;
  docId: string;
  data: any;
  operation: 'set' | 'update' | 'delete';
}

class FirebaseBatchManager {
  private operations: BatchOperation[] = [];
  private timeout: NodeJS.Timeout | null = null;
  private readonly MAX_BATCH_SIZE = 500;
  private readonly BATCH_DELAY = 1000;

  add(operation: BatchOperation) {
    this.operations.push(operation);
    
    if (this.operations.length >= this.MAX_BATCH_SIZE) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  private scheduleFlush() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    this.timeout = setTimeout(() => {
      this.flush();
    }, this.BATCH_DELAY);
  }

  async flush(): Promise<void> {
    if (this.operations.length === 0) return;

    const batch = adminDb.batch();
    const currentOps = [...this.operations];
    this.operations = [];

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    try {
      for (const op of currentOps) {
        const ref = adminDb.collection(op.collection).doc(op.docId);
        
        switch (op.operation) {
          case 'set':
            batch.set(ref, op.data);
            break;
          case 'update':
            batch.update(ref, op.data);
            break;
          case 'delete':
            batch.delete(ref);
            break;
        }
      }

      await batch.commit();
      console.log(`✅ Batch committed: ${currentOps.length} operations`);
    } catch (error) {
      console.error('❌ Batch commit failed:', error);
      this.operations.unshift(...currentOps);
    }
  }
}

export const batchManager = new FirebaseBatchManager();

export async function getCachedStats(key: string, fetcher: () => Promise<any>): Promise<any> {
  const cached = publicStatsCache.get(key);
  
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const data = await fetcher();
  publicStatsCache.set(key, {
    data,
    expires: Date.now() + CACHE_DURATION
  });

  return data;
}

export class DistributedCounter {
  private collection: string;
  private docId: string;
  private shards: number;

  constructor(collection: string, docId: string, shards = 10) {
    this.collection = collection;
    this.docId = docId;
    this.shards = shards;
  }

  async increment(field: string, value = 1): Promise<void> {
    const shardId = Math.floor(Math.random() * this.shards);
    const shardRef = adminDb
      .collection(this.collection)
      .doc(this.docId)
      .collection('shards')
      .doc(`shard_${shardId}`);

    batchManager.add({
      collection: `${this.collection}/${this.docId}/shards`,
      docId: `shard_${shardId}`,
      data: {
        [field]: FieldValue.increment(value),
        lastUpdated: new Date()
      },
      operation: 'update'
    });
  }

  async getCount(field: string): Promise<number> {
    const shardsSnapshot = await adminDb
      .collection(this.collection)
      .doc(this.docId)
      .collection('shards')
      .get();

    let total = 0;
    shardsSnapshot.forEach(doc => {
      const data = doc.data();
      total += data[field] || 0;
    });

    return total;
  }
}

export class FeedbackStatsAggregator {
  private counter: DistributedCounter;

  constructor() {
    this.counter = new DistributedCounter('feedback_stats', 'aggregated');
  }

  async recordFeedback(type: string, priority: string, category: string): Promise<void> {
    await Promise.all([
      this.counter.increment('total'),
      this.counter.increment(`type_${type}`),
      this.counter.increment(`priority_${priority}`),
      this.counter.increment(`category_${category}`)
    ]);

    batchManager.add({
      collection: 'feedback_stats',
      docId: 'public',
      data: {
        lastUpdated: new Date(),
        totalSubmissions: FieldValue.increment(1),
        [`byType.${type}`]: FieldValue.increment(1),
        [`byCategory.${category}`]: FieldValue.increment(1),
        [`byPriority.${priority}`]: FieldValue.increment(1)
      },
      operation: 'update'
    });
  }

  async getStats(): Promise<any> {
    return getCachedStats('feedback_public_stats', async () => {
      const statsDoc = await adminDb.collection('feedback_stats').doc('public').get();
      
      if (!statsDoc.exists) {
        const initialStats = {
          totalSubmissions: 0,
          byType: { bug: 0, feature: 0, improvement: 0, ui: 0, content: 0, general: 0 },
          byCategory: { gameplay: 0, technical: 0, content: 0, community: 0, accessibility: 0, performance: 0 },
          byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
          lastUpdated: new Date()
        };
        
        await adminDb.collection('feedback_stats').doc('public').set(initialStats);
        return initialStats;
      }
      
      return statsDoc.data();
    });
  }
}

export const FirebaseOptimizations = {
  async getFeedbackSummaries() {
    return adminDb.collection('feedback')
      .select('title', 'type', 'priority', 'status', 'createdAt')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
  },

  async getCriticalFeedback() {
    return adminDb.collection('feedback')
      .where('priority', '==', 'critical')
      .where('status', '==', 'open')
      .select('title', 'description', 'contactEmail', 'createdAt')
      .limit(10)
      .get();
  },

  async batchDeleteOldLogs(cutoffDate: Date) {
    const oldLogsQuery = adminDb.collection('security_logs')
      .where('timestamp', '<', cutoffDate)
      .limit(500);

    const snapshot = await oldLogsQuery.get();
    
    if (snapshot.empty) return 0;

    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return snapshot.docs.length;
  },

  async updateFeedbackStatus(feedbackId: string, newStatus: string, adminNote?: string) {
    return adminDb.runTransaction(async (transaction) => {
      const feedbackRef = adminDb.collection('feedback').doc(feedbackId);
      const feedbackDoc = await transaction.get(feedbackRef);

      if (!feedbackDoc.exists) {
        throw new Error('Feedback not found');
      }

      const updateData: any = {
        status: newStatus,
        updatedAt: new Date()
      };

      if (adminNote) {
        updateData.adminResponse = adminNote;
      }

      if (newStatus === 'resolved' || newStatus === 'closed') {
        updateData.resolvedAt = new Date();
      }

      transaction.update(feedbackRef, updateData);

      const statsRef = adminDb.collection('feedback_stats').doc('public');
      transaction.update(statsRef, {
        [`byStatus.${newStatus}`]: FieldValue.increment(1),
        lastUpdated: new Date()
      });
    });
  }
};

export class FirebaseCleanup {
  static async cleanupOldLogs() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const collections = ['security_logs', 'error_logs', 'admin_notifications'];
    let totalDeleted = 0;

    for (const collection of collections) {
      const deleted = await FirebaseOptimizations.batchDeleteOldLogs(cutoffDate);
      totalDeleted += deleted;
      console.log(`🧹 Cleaned ${deleted} old records from ${collection}`);
    }

    return totalDeleted;
  }

  static async compactOldStats() {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
  }
}

if (process.env.NODE_ENV === 'production') {
  setInterval(async () => {
    try {
      await FirebaseCleanup.cleanupOldLogs();
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }, 24 * 60 * 60 * 1000);
}

export const feedbackStatsAggregator = new FeedbackStatsAggregator();
