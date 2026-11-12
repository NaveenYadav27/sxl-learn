import type { Lesson } from "../../types";
import { PRIV_ESC } from "../scenarios";

const mappingContent: Record<string, { title: string; instruction: string; hints: string[]; why: string }> = {
  "T1059": {
    "title": "Recognize shell execution",
    "instruction": "Map the web-shell evidence to a [[technique]] for command execution. Read the linked shell event as well as the HTTP request.",
    "hints": [
      "A web request alone does not prove command execution.",
      "Follow the request into the process activity.",
      "Inspect parent_process and CommandLine in the linked events.",
      "For example, a web worker launching an interpreter supports execution behavior.",
      "Map this event to T1059 (Command and Scripting Interpreter)."
    ],
    "why": "A behavior mapping needs process evidence, not merely a suspicious URL."
  },
  "T1548": {
    "title": "Recognize elevation-control abuse",
    "instruction": "Map the SUID search and root-shell evidence to a [[privilege-escalation]] technique.",
    "hints": [
      "A failed permission check is not proof of successful elevation.",
      "Follow the search through to the resulting shell.",
      "Compare uid, auid, parent_process, and CommandLine.",
      "For example, an elevated effective identity with an unprivileged audit origin can reveal abuse.",
      "Map this event to T1548 (Abuse Elevation Control Mechanism)."
    ],
    "why": "The linked root shell confirms what the SUID search alone cannot."
  },
  "T1136.001": {
    "title": "Recognize local-account persistence",
    "instruction": "Map the sysbackup creation event using its [[raw-event]] evidence.",
    "hints": [
      "Persistence can change identity configuration rather than drop a program.",
      "Look for creation rather than subsequent use of an identity.",
      "Inspect process, new_user, and CommandLine.",
      "For example, a new privileged local identity can provide a return path.",
      "Map this event to T1136.001 (Local Account)."
    ],
    "why": "Account creation and account use are different behaviors."
  },
  "T1078": {
    "title": "Recognize use of a valid account",
    "instruction": "Map the external sysbackup SSH login using the [[authentication-log]] evidence.",
    "hints": [
      "An attacker may authenticate successfully instead of exploiting software.",
      "Distinguish the return login from the earlier account creation.",
      "Inspect user, action, src_ip, and process in the authentication record.",
      "For example, a success message proves account use, not how its password was obtained.",
      "Map this event to T1078 (Valid Accounts)."
    ],
    "why": "Successful authentication can be malicious when the identity is attacker-controlled."
  }
};

export const LESSON_08: Lesson = {
  "id": "l08",
  "number": 8,
  "title": "Threat Intelligence & MITRE ATT&CK",
  "tagline": "Explain behavior; enrich without overclaiming.",
  "durationMin": 50,
  "scenarioId": "priv-esc",
  "heroTermIds": [
    "mitre-attack",
    "tactic",
    "technique",
    "ioc",
    "threat-intel",
    "intel-confidence",
    "privilege-escalation"
  ],
  "objectives": [
    "Distinguish tactics, techniques, and indicators.",
    "Corroborate intelligence with local evidence.",
    "Map four observed behaviors to ATT&CK.",
    "Explain the limits of a coverage view."
  ],
  "concept": [
    {
      "kind": "heading",
      "text": "Goals, methods, and indicators"
    },
    {
      "kind": "p",
      "text": "[[mitre-attack]] describes behavior. A [[tactic]] is the goal; a [[technique]] is a method used to reach it."
    },
    {
      "kind": "flow",
      "title": "From observation to explanation",
      "steps": [
        "Read linked events",
        "Describe behavior",
        "Choose technique",
        "Record supporting evidence"
      ]
    },
    {
      "kind": "grid",
      "items": [
        {
          "title": "Indicator",
          "text": "An [[ioc]] such as an address helps you find related records."
        },
        {
          "title": "Behavior",
          "text": "A [[ttp]] describes how an attacker acts even if addresses change."
        }
      ]
    },
    {
      "kind": "table",
      "title": "Linux evidence",
      "cols": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "php-fpm → sh",
          "Command execution"
        ],
        [
          "uid 0, auid 33",
          "Elevation from the web identity"
        ],
        [
          "useradd sysbackup",
          "Local-account persistence"
        ],
        [
          "sshd success",
          "Use of an existing identity"
        ]
      ]
    },
    {
      "kind": "p",
      "text": "In this case, www-data searches for SUID files after sudo is denied. The linked root shell supports [[privilege-escalation]]; the search alone is only supporting context."
    },
    {
      "kind": "callout",
      "tone": "warn",
      "title": "Confidence is not a verdict",
      "text": "The scenario feed reports confidence 83 for the source address. [[intel-confidence]] is not an 83% probability that every connection is malicious."
    },
    {
      "kind": "code",
      "title": "Read the identity transition",
      "code": "uid=0 auid=33 parent_process=find",
      "explain": [
        "The effective identity is root; the audit origin remains the web user."
      ]
    },
    {
      "kind": "p",
      "text": "Normal ops.admin activity restarts nginx. Compare intent and process context before calling every privileged command malicious; use a [[baseline]]."
    },
    {
      "kind": "callout",
      "tone": "info",
      "title": "Coverage has boundaries",
      "text": "Mapped observations show what this case contains. They do not prove complete detection coverage or attribute a named threat actor."
    }
  ],
  "visual": [
    {
      "kind": "flow",
      "title": "Observed chain",
      "steps": [
        "Web shell",
        "SUID abuse",
        "Backdoor account",
        "SSH return"
      ]
    },
    {
      "kind": "layers",
      "title": "Three distinct questions",
      "lanes": [
        {
          "label": "Goal",
          "items": [
            "Gain privilege"
          ]
        },
        {
          "label": "Method",
          "items": [
            "Abuse elevation controls"
          ]
        },
        {
          "label": "Evidence",
          "items": [
            "SUID find → root bash"
          ]
        }
      ]
    },
    {
      "kind": "compare",
      "title": "Indicator versus behavior",
      "left": {
        "title": "Address",
        "points": [
          "Useful for matching",
          "Can change quickly"
        ]
      },
      "right": {
        "title": "Technique",
        "points": [
          "Explains method",
          "Requires event context"
        ]
      }
    }
  ],
  "demo": [
    {
      "id": "l08-d1",
      "title": "Read the goal",
      "narration": "Compare a [[tactic]] with a method.",
      "screen": {
        "area": "ATT&CK mapping",
        "focus": "Privilege Escalation",
        "detail": [
          "Goal: higher permissions",
          "Method: elevation-control abuse"
        ]
      }
    },
    {
      "id": "l08-d2",
      "title": "Inspect identity",
      "narration": "Use [[evidence]] from linked records.",
      "screen": {
        "area": "ATT&CK mapping",
        "focus": "SUID chain",
        "detail": [
          "www-data searches SUID files",
          "Root bash retains audit origin 33"
        ]
      }
    },
    {
      "id": "l08-d3",
      "title": "Enrich carefully",
      "narration": "Check [[intel-confidence]] and provenance.",
      "screen": {
        "area": "Threat intelligence",
        "focus": "Source address",
        "detail": [
          "Feed source: AbuseIPDB",
          "Confidence: 83",
          "Local web and SSH observations corroborate"
        ]
      }
    },
    {
      "id": "l08-d4",
      "title": "Review coverage",
      "narration": "Separate observed [[technique]] mappings from guaranteed detection.",
      "screen": {
        "area": "ATT&CK mapping",
        "focus": "Coverage",
        "detail": [
          "Four behavior mappings",
          "No claim of complete protection"
        ]
      }
    }
  ],
  "lab": {
    "kind": "mitre",
    "scenarioId": "priv-esc",
    "intro": "Use the Linux intrusion evidence to separate attacker goals, methods, and indicators.",
    "objectives": [
{
  "id": "l08-o1",
  "title": "Explore the attacker goal",
  "instruction": "Open the [[tactic]] for gaining higher permissions.",
  "action": {
    "type": "click",
    "target": "open-tactic:TA0004"
  },
  "hints": [
    "Separate observed behavior from assumptions.",
    "Review the relevant evidence before choosing an action.",
    "Compare the available labels with the host, user, and behavior fields.",
    "For example, a trusted tool can still be abused; its name alone is not a verdict.",
    "Open TA0004 (Privilege Escalation)."
  ],
  "why": "Record an evidence-based decision that another analyst can review.",
  "skill": "mitre"
},
{
  "id": "l08-o2",
  "title": "Inspect elevation abuse",
  "instruction": "Open the [[technique]] describing abuse of elevation controls.",
  "action": {
    "type": "click",
    "target": "open-technique:T1548"
  },
  "hints": [
    "Separate observed behavior from assumptions.",
    "Review the relevant evidence before choosing an action.",
    "Compare the available labels with the host, user, and behavior fields.",
    "For example, a trusted tool can still be abused; its name alone is not a verdict.",
    "Open T1548."
  ],
  "why": "Record an evidence-based decision that another analyst can review.",
  "skill": "mitre"
},
{
  "id": "l08-o3",
  "title": "Enrich the source address",
  "instruction": "Look up the source address linked to the web request and SSH return using [[threat-intel]].",
  "action": {
    "type": "click",
    "target": "lookup-intel:45.155.205.12"
  },
  "hints": [
    "Separate observed behavior from assumptions.",
    "Review the relevant evidence before choosing an action.",
    "Compare the available labels with the host, user, and behavior fields.",
    "For example, a trusted tool can still be abused; its name alone is not a verdict.",
    "Look up 45.155.205.12."
  ],
  "why": "Record an evidence-based decision that another analyst can review.",
  "skill": "intel"
},
...PRIV_ESC.mitreMap.map((m, i) => ({
 id: `l08-o${i + 4}`,
 ...mappingContent[m.techniqueId],
 action: { type: "select", target: "map-event", value: `${m.eventIds[0]}=${m.techniqueId}` },
 skill: "mitre" as const,
})),
{
  "id": "l08-o8",
  "title": "Review observed coverage",
  "instruction": "Review the [[mitre-attack]] coverage after mapping the evidence.",
  "action": {
    "type": "click",
    "target": "view-coverage"
  },
  "hints": [
    "Separate observed behavior from assumptions.",
    "Review the relevant evidence before choosing an action.",
    "Compare the available labels with the host, user, and behavior fields.",
    "For example, a trusted tool can still be abused; its name alone is not a verdict.",
    "Click View coverage."
  ],
  "why": "Record an evidence-based decision that another analyst can review.",
  "skill": "mitre"
}
]
  },
  "assessment": [
    {
      "id": "l08-q1",
      "prompt": "What does a tactic describe?",
      "options": [
        "A source address",
        "The attacker goal",
        "A file hash",
        "A log format"
      ],
      "answer": 1,
      "explain": "Tactics describe why; techniques describe how.",
      "skill": "mitre"
    },
    {
      "id": "l08-q2",
      "prompt": "Which observation best confirms elevation?",
      "options": [
        "HTTP 200",
        "sudo denied",
        "Root shell with auid 33",
        "An unfamiliar filename"
      ],
      "answer": 2,
      "explain": "The root shell links elevation to the original web identity.",
      "skill": "mitre"
    },
    {
      "id": "l08-q3",
      "prompt": "What should you do with a feed confidence of 83?",
      "options": [
        "Treat it as proof",
        "Ignore local events",
        "Attribute an actor",
        "Corroborate it with local behavior"
      ],
      "answer": 3,
      "explain": "Feed confidence supports investigation; it does not replace evidence.",
      "skill": "intel"
    },
    {
      "id": "l08-q4",
      "prompt": "Which technique fits local account creation?",
      "options": [
        "T1136.001",
        "T1078",
        "T1059",
        "T1548"
      ],
      "answer": 0,
      "explain": "Creation of sysbackup is local-account creation, not its later use.",
      "skill": "mitre"
    },
    {
      "id": "l08-q5",
      "prompt": "Why inspect linked events for a mapping?",
      "options": [
        "To make every event malicious",
        "To verify the behavior behind a summary",
        "To remove uncertainty entirely",
        "To identify the attacker by name"
      ],
      "answer": 1,
      "explain": "The first mapped event can be supporting context rather than complete proof.",
      "skill": "mitre"
    },
    {
      "id": "l08-q6",
      "prompt": "What does a coverage view demonstrate?",
      "options": [
        "All attacks are detected",
        "Every host is secure",
        "Observed mappings and visible gaps",
        "Feed accuracy"
      ],
      "answer": 2,
      "explain": "A case map is not a test of every detection in production.",
      "skill": "mitre"
    }
  ],
  "reflection": [
    {
      "id": "l08-r1",
      "prompt": "Which observation most changed your judgment, and why?",
      "placeholder": "Name the observation and the decision it supported."
    },
    {
      "id": "l08-r2",
      "prompt": "What uncertainty remains, and what evidence would you request next?",
      "placeholder": "State one gap and a specific source to check."
    }
  ],
  "mentorBriefing": "This is an educational simulator, not a live Splunk deployment. Start with the observed facts, then explain your inference. Keep uncertainty visible and choose proportionate actions. Be ready to show another analyst how you reached your decision.",
  "challenges": [
    "What evidence would contradict your current conclusion?",
    "Which observation is a fact, and which is an inference?",
    "What would you investigate if the intelligence lookup returned no match?",
    "How could you reduce harm without destroying useful evidence?"
  ]
};
