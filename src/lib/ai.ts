// ==========================================
// Smart Campus - Mock AI Classification Service
// ==========================================

import { AIClassification, IssueCategory, IssuePriority } from './types';
import { CATEGORY_CONFIG, CATEGORY_DEPARTMENT_MAP } from './constants';

// ==========================================
// Keyword-based Classification Rules
// ==========================================

interface ClassificationRule {
  keywords: string[];
  category: IssueCategory;
  priorityBoost?: IssuePriority;
  safetyConcern?: boolean;
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  // Electrical - Critical
  { keywords: ['spark', 'sparks', 'sparking', 'electric shock', 'short circuit', 'fire', 'burning smell', 'smoke from wire', 'exposed wire'], category: 'electrical', priorityBoost: 'critical', safetyConcern: true },
  // Electrical - High
  { keywords: ['power outage', 'power cut', 'no power', 'no electricity', 'blackout', 'main switch', 'circuit breaker', 'tripped'], category: 'electrical', priorityBoost: 'high' },
  // Electrical - Medium
  { keywords: ['flickering', 'light not working', 'tube light', 'bulb', 'fan not working', 'ac not working', 'air conditioning', 'switch broken', 'socket', 'plug point', 'electrical', 'wiring', 'voltage', 'water cooler'], category: 'electrical' },

  // Plumbing - High
  { keywords: ['flooding', 'flooded', 'water damage', 'pipe burst', 'major leak', 'sewage', 'sewage overflow', 'drain blocked', 'clogged drain'], category: 'plumbing', priorityBoost: 'high', safetyConcern: true },
  // Plumbing - Medium
  { keywords: ['no water', 'water supply', 'tap', 'taps', 'leaking', 'leak', 'dripping', 'water pressure', 'plumbing', 'pipe', 'toilet', 'washroom', 'bathroom', 'flush', 'water heater', 'geyser'], category: 'plumbing' },

  // IT/AV
  { keywords: ['projector', 'hdmi', 'display', 'screen', 'computer', 'desktop', 'laptop', 'printer', 'wifi', 'wi-fi', 'internet', 'network', 'lan', 'server', 'software', 'system', 'av equipment', 'audio', 'speaker', 'microphone', 'smart board', 'webcam'], category: 'it_av' },

  // Security - High
  { keywords: ['theft', 'stolen', 'break in', 'intruder', 'suspicious person', 'vandalism', 'threatening', 'fight', 'assault'], category: 'security', priorityBoost: 'high', safetyConcern: true },
  // Security - Medium
  { keywords: ['cctv', 'camera', 'security', 'guard', 'lock', 'key', 'access card', 'gate', 'safety', 'emergency exit'], category: 'security' },

  // Cleanliness / Housekeeping
  { keywords: ['dirty', 'unclean', 'not cleaned', 'cleaning', 'garbage', 'trash', 'dustbin', 'waste', 'sweeping', 'mopping', 'stain', 'smell', 'odor', 'pest', 'cockroach', 'rat', 'insect', 'mosquito', 'hygiene', 'sanitation', 'overflowing'], category: 'cleanliness' },

  // Furniture
  { keywords: ['chair', 'desk', 'table', 'bench', 'cupboard', 'cabinet', 'rack', 'shelf', 'whiteboard', 'blackboard', 'podium', 'furniture', 'drawer'], category: 'furniture' },

  // Civil / Infrastructure
  { keywords: ['wall', 'ceiling', 'floor', 'tile', 'crack', 'broken window', 'window', 'door', 'roof', 'paint', 'peeling', 'damp', 'seepage', 'ramp', 'staircase', 'railing', 'construction'], category: 'civil' },

  // Transport
  { keywords: ['bus', 'transport', 'vehicle', 'parking', 'route', 'driver', 'delay', 'late bus', 'shuttle'], category: 'transport' },

  // Housekeeping (hostel specific)
  { keywords: ['hostel', 'room maintenance', 'bed', 'mattress', 'curtain', 'wardrobe', 'mess', 'food', 'canteen'], category: 'housekeeping' },
];

// ==========================================
// Priority Keywords
// ==========================================

const CRITICAL_KEYWORDS = ['fire', 'spark', 'sparks', 'electric shock', 'flooding', 'collapse', 'emergency', 'danger', 'life threatening', 'smoke', 'explosion', 'gas leak', 'structural damage'];
const HIGH_KEYWORDS = ['urgent', 'immediately', 'cannot', 'impossible', 'cancelled', 'blocked', 'damaged severely', 'broken completely', 'major', 'critical', 'safety concern', 'injured', 'stuck', 'trapped', 'hazard', 'wet floor', 'slippery'];
const LOW_KEYWORDS = ['minor', 'small', 'slight', 'cosmetic', 'when possible', 'not urgent', 'suggestion', 'improvement', 'nice to have'];

// ==========================================
// Mock AI Classifier
// ==========================================

export async function classifyIssue(description: string, imageUrl?: string): Promise<AIClassification> {
  // First attempt: Call our real backend classification route (which connects to Gemini if configured or runs server-side rule engine)
  try {
    const res = await fetch('/api/ai/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, imageUrl }),
    });

    if (res.ok) {
      const data: AIClassification = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Backend /api/ai/classify unavailable, using local client classifier engine:', err);
  }

  // Fallback: Local client-side rule evaluation with slight simulated delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  const text = description.toLowerCase();

  // Find matching category
  let bestMatch: { category: IssueCategory; safetyConcern: boolean; priorityBoost?: IssuePriority } | null = null;
  let bestScore = 0;

  for (const rule of CLASSIFICATION_RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (text.includes(keyword)) {
        score += keyword.split(' ').length; // Multi-word matches score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = {
        category: rule.category,
        safetyConcern: rule.safetyConcern || false,
        priorityBoost: rule.priorityBoost,
      };
    }
  }

  // Default to 'other' if no match
  const category: IssueCategory = bestMatch?.category || 'other';
  const safetyConcern = bestMatch?.safetyConcern || false;

  // Determine priority
  let priority: IssuePriority = 'medium';

  if (bestMatch?.priorityBoost) {
    priority = bestMatch.priorityBoost;
  } else {
    // Check priority keywords
    if (CRITICAL_KEYWORDS.some(k => text.includes(k))) {
      priority = 'critical';
    } else if (HIGH_KEYWORDS.some(k => text.includes(k))) {
      priority = 'high';
    } else if (LOW_KEYWORDS.some(k => text.includes(k))) {
      priority = 'low';
    }
  }

  // Determine department
  const departmentId = CATEGORY_DEPARTMENT_MAP[category];

  // Generate summary
  const summary = generateSummary(description, category);

  // Confidence based on match score
  const confidence = bestScore > 3 ? 0.95 : bestScore > 1 ? 0.85 : bestScore > 0 ? 0.7 : 0.5;

  // Department name mapping
  const deptNames: Record<string, string> = {
    dept_maintenance: 'Maintenance',
    dept_electrical: 'Electrical',
    dept_it: 'IT / AV Support',
    dept_housekeeping: 'Housekeeping',
    dept_security: 'Security',
    dept_transport: 'Transport',
    dept_admin: 'Administration',
  };

  return {
    category,
    categoryLabel: CATEGORY_CONFIG[category].label,
    priority,
    department: deptNames[departmentId] || 'Administration',
    departmentId,
    summary,
    safetyConcern,
    confidence,
  };
}

function generateSummary(description: string, category: IssueCategory): string {
  // Truncate and clean up the description for a summary
  const cleaned = description
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= 80) return cleaned;

  // Get first sentence or first 80 chars
  const firstSentence = cleaned.split(/[.!?]/)[0];
  if (firstSentence.length <= 100) return firstSentence + '.';

  return cleaned.substring(0, 80).trim() + '...';
}

// ==========================================
// Generate Title from Description
// ==========================================

export function generateTitle(description: string): string {
  const cleaned = description.replace(/\s+/g, ' ').trim();
  const firstSentence = cleaned.split(/[.!?\n]/)[0].trim();

  if (firstSentence.length <= 60) return firstSentence;
  return firstSentence.substring(0, 57).trim() + '...';
}

// ==========================================
// Image Analysis (Mock)
// ==========================================

export async function analyzeImage(imageUrl: string): Promise<{
  possibleIssue: string;
  confidence: number;
  category?: IssueCategory;
}> {
  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In a real app, this would call a vision API
  return {
    possibleIssue: 'Image analysis available with AI API key',
    confidence: 0.5,
  };
}
