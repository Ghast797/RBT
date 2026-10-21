// xAPI Statement Helper & Mock LRS Emitter

export interface XApiActor {
  name: string;
  mbox: string;
}

export interface XApiStatement {
  actor: XApiActor;
  verb: {
    id: string;
    display: { [lang: string]: string };
  };
  object: {
    id: string;
    definition: {
      name: { [lang: string]: string };
      description: { [lang: string]: string };
      type: string;
    };
  };
  result: {
    score: {
      scaled: number;
      raw: number;
      min: number;
      max: number;
    };
    success: boolean;
    completion: boolean;
    response?: string;
    extensions?: { [key: string]: any };
  };
  timestamp: string;
}

export function createMissionCompletionStatement(
  actor: XApiActor = { name: "Agent Trainee", mbox: "mailto:trainee@hackers.os" },
  scoreRaw: number = 100,
  decisionsSummary: string = "All 8 tactical choices executed successfully",
  missionMeta?: { id?: string; title?: string; description?: string }
): XApiStatement {
  const isPassed = scoreRaw >= 80;
  const activityId = missionMeta?.id 
    ? `https://cybersec-training.internal/activities/${missionMeta.id}`
    : "https://cybersec-training.internal/activities/mission-3-ol-company";
  const missionTitle = missionMeta?.title || "Mission 3: O&L Company Social Engineering Infiltration";
  const missionDesc = missionMeta?.description || "Spear phishing, Baiting, Trojan RAT payload & Reconnaissance training simulation";

  return {
    actor,
    verb: isPassed
      ? {
          id: "http://adlnet.gov/expapi/verbs/passed",
          display: { "en-US": "passed", "pl-PL": "zdał" }
        }
      : {
          id: "http://adlnet.gov/expapi/verbs/failed",
          display: { "en-US": "failed", "pl-PL": "nie zdał" }
        },
    object: {
      id: activityId,
      definition: {
        name: {
          "en-US": missionTitle,
          "pl-PL": missionTitle
        },
        description: {
          "en-US": missionDesc,
          "pl-PL": missionDesc
        },
        type: "http://adlnet.gov/expapi/activities/simulation"
      }
    },
    result: {
      score: {
        scaled: scoreRaw / 100,
        raw: scoreRaw,
        min: 0,
        max: 100
      },
      success: isPassed,
      completion: true,
      response: decisionsSummary,
      extensions: {
        "https://cybersec-training.internal/extensions/status": "terminated"
      }
    },
    timestamp: new Date().toISOString()
  };
}

// In-memory mock LRS endpoint for testing & local development
export class MockLRS {
  private static statements: XApiStatement[] = [];

  public static async sendStatement(statement: XApiStatement): Promise<{ status: number; message: string }> {
    this.statements.push(statement);
    console.log("[MockLRS] Statement stored successfully:", statement);
    return { status: 200, message: "Statement accepted by mock LRS" };
  }

  public static getStatements(): XApiStatement[] {
    return [...this.statements];
  }

  public static clear(): void {
    this.statements = [];
  }
}
