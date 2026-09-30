import { NextRequest, NextResponse } from 'next/server';
import { CATEGORY_CONFIG, CATEGORY_DEPARTMENT_MAP } from '@/lib/constants';
import { IssueCategory, IssuePriority, AIClassification } from '@/lib/types';
import { departmentIdForCategory, departmentName } from '@/lib/server/database';

export const runtime = 'nodejs';

// Keyword rules for deterministic backend fallback / mock mode
const RULES = [
  { keywords: ['spark', 'sparks', 'shock', 'short circuit', 'fire', 'smoke', 'switchboard', 'bare wire', 'electrocution'], category: 'electrical' as IssueCategory, priority: 'critical' as IssuePriority, safety: true },
  { keywords: ['power cut', 'outage', 'blackout', 'breaker', 'tripped'], category: 'electrical' as IssueCategory, priority: 'high' as IssuePriority, safety: false },
  { keywords: ['fan', 'light', 'bulb', 'ac', 'air condition', 'socket', 'switch', 'cooler', 'wiring'], category: 'electrical' as IssueCategory, priority: 'medium' as IssuePriority, safety: false },
  { keywords: ['flooding', 'burst', 'pipe burst', 'sewage', 'clogged drain', 'major leak', 'overflowing toilet'], category: 'plumbing' as IssueCategory, priority: 'high' as IssuePriority, safety: true },
  { keywords: ['no water', 'tap', 'taps', 'water leak', 'dripping', 'flush', 'washroom', 'restroom', 'sink'], category: 'plumbing' as IssueCategory, priority: 'medium' as IssuePriority, safety: false },
  { keywords: ['projector', 'black screen', 'hdmi', 'display', 'screen', 'audio', 'speaker', 'mic', 'microphone', 'computer', 'monitor', 'wifi', 'internet', 'lan', 'smart board'], category: 'it_av' as IssueCategory, priority: 'medium' as IssuePriority, safety: false },
  { keywords: ['theft', 'stolen', 'fight', 'intruder', 'suspicious', 'assault', 'harassment'], category: 'security' as IssueCategory, priority: 'critical' as IssuePriority, safety: true },
  { keywords: ['cctv', 'guard', 'door lock', 'gate', 'id card', 'lost item'], category: 'security' as IssueCategory, priority: 'medium' as IssuePriority, safety: false },
  { keywords: ['dirty', 'garbage', 'trash', 'dustbin', 'cleaning', 'stain', 'cockroach', 'pest', 'smell', 'odor', 'insect'], category: 'cleanliness' as IssueCategory, priority: 'medium' as IssuePriority, safety: false },
  { keywords: ['broken chair', 'broken desk', 'table', 'bench', 'podium', 'furniture', 'whiteboard'], category: 'furniture' as IssueCategory, priority: 'low' as IssuePriority, safety: false },
  { keywords: ['broken window', 'glass', 'wall crack', 'ceiling leak', 'door broken', 'tiles', 'staircase', 'railing'], category: 'civil' as IssueCategory, priority: 'medium' as IssuePriority, safety: false },
  { keywords: ['bus', 'transport', 'parking', 'driver', 'shuttle'], category: 'transport' as IssueCategory, priority: 'medium' as IssuePriority, safety: false },
];

export async function POST(req: NextRequest) {
  try {
    const { description, imageUrl } = await req.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const text = description.toLowerCase();
    const apiKey = process.env.GEMINI_API_KEY;
    const isMock = process.env.MOCK_AI === 'true' || !apiKey;

    // Real AI integration using Gemini if available and enabled
    if (!isMock && apiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an AI for GRIET Smart Campus issue classification.
Analyze this reported problem: "${description}"
Respond with JSON matching this structure:
{
  "category": "plumbing" | "electrical" | "it_av" | "cleanliness" | "security" | "transport" | "furniture" | "civil" | "housekeeping" | "other",
  "priority": "low" | "medium" | "high" | "critical",
  "summary": "1 sentence concise summary",
  "safetyConcern": true | false
}`
                    }
                  ]
                }
              ],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const parsed = JSON.parse(candidateText);
            const validCategory: IssueCategory = parsed.category in CATEGORY_DEPARTMENT_MAP ? parsed.category : 'other';
            const validPriority: IssuePriority = ['low', 'medium', 'high', 'critical'].includes(parsed.priority) ? parsed.priority : 'medium';
            const departmentId = departmentIdForCategory(validCategory);

            const classification: AIClassification = {
              category: validCategory,
              categoryLabel: CATEGORY_CONFIG[validCategory]?.label || validCategory,
              priority: validPriority,
              department: departmentName(departmentId),
              departmentId,
              summary: parsed.summary || description.slice(0, 80),
              safetyConcern: Boolean(parsed.safetyConcern),
              confidence: 0.95,
            };
            return NextResponse.json(classification);
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to deterministic engine:', geminiError);
      }
    }

    // Deterministic Rule Engine Fallback / Mock AI Mode
    let matchedRule = null;
    let maxMatches = 0;

    for (const rule of RULES) {
      let matches = 0;
      for (const kw of rule.keywords) {
        if (text.includes(kw)) {
          matches += kw.split(' ').length;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        matchedRule = rule;
      }
    }

    let category: IssueCategory = matchedRule ? matchedRule.category : 'other';
    let priority: IssuePriority = matchedRule ? matchedRule.priority : 'medium';
    let safetyConcern = matchedRule ? matchedRule.safety : false;

    // Critical keyword overrides
    if (['spark', 'sparks', 'shock', 'fire', 'smoke', 'gas leak', 'structural failure'].some(w => text.includes(w))) {
      priority = 'critical';
      safetyConcern = true;
    } else if (['urgent', 'immediately', 'flooding', 'burst', 'cannot conduct', 'cannot continue'].some(w => text.includes(w))) {
      if (priority === 'low' || priority === 'medium') priority = 'high';
    }

    // Deterministic backend routing: category -> department
    const departmentId = departmentIdForCategory(category);

    const classification: AIClassification = {
      category,
      categoryLabel: CATEGORY_CONFIG[category]?.label || 'General Issue',
      priority,
      department: departmentName(departmentId),
      departmentId,
      summary: cleanSummary(description),
      safetyConcern,
      confidence: maxMatches > 2 ? 0.96 : maxMatches > 0 ? 0.88 : 0.65,
    };

    return NextResponse.json(classification);
  } catch (error: any) {
    console.error('AI Classification API error:', error);
    // Graceful fallback: Never break issue reporting even if AI completely fails
    const fallbackCategory: IssueCategory = 'other';
    const fallbackDeptId = 'dept_admin';
    return NextResponse.json({
      category: fallbackCategory,
      categoryLabel: 'Other / Needs Review',
      priority: 'medium',
      department: 'Administration / General Maintenance',
      departmentId: fallbackDeptId,
      summary: 'Report submitted for administrative review',
      safetyConcern: false,
      confidence: 0.5,
      isFallback: true,
    });
  }
}

function cleanSummary(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 80) return cleaned;
  const firstPeriod = cleaned.indexOf('.');
  if (firstPeriod > 20 && firstPeriod < 100) {
    return cleaned.slice(0, firstPeriod + 1);
  }
  return cleaned.slice(0, 80).trim() + '...';
}

function getDepartmentName(id: string): string {
  const map: Record<string, string> = {
    dept_maintenance: 'Maintenance',
    dept_electrical: 'Electrical',
    dept_it: 'IT / AV Support',
    dept_housekeeping: 'Housekeeping',
    dept_security: 'Security',
    dept_transport: 'Transport',
    dept_admin: 'Administration',
  };
  return map[id] || 'General Maintenance';
}
