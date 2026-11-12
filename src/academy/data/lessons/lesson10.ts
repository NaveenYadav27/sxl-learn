import type { Lesson } from "../../types";
import { CAPSTONE_APT } from "../scenarios";

export const LESSON_10: Lesson = {
  "id": "l10",
  "number": 10,
  "title": "Capstone: Operation Helios",
  "tagline": "Turn a noisy intrusion into a defensible incident report.",
  "durationMin": 65,
  "scenarioId": "capstone-apt",
  "heroTermIds": [
    "phishing",
    "credential-dumping",
    "lateral-movement",
    "exfiltration",
    "evidence",
    "severity",
    "containment"
  ],
  "objectives": [
    "Reconstruct a multi-stage intrusion using linked evidence.",
    "Distinguish an authorised scanner from compromised assets.",
    "Identify patient zero and attacker infrastructure.",
    "Map credential access and exfiltration behaviors.",
    "Submit an evidence-backed severity and response report."
  ],
  "concept": [
    {
      "kind": "heading",
      "text": "One intrusion, several evidence sources"
    },
    {
      "kind": "p",
      "text": "Operation Helios combines [[phishing]], execution, persistence, [[c2]], credential access, lateral movement, and [[exfiltration]]. Build one defensible story rather than a list of alerts."
    },
    {
      "kind": "flow",
      "title": "Investigate before reporting",
      "steps": [
        "Reconstruct time",
        "Verify raw evidence",
        "Classify entities",
        "Map techniques",
        "Assess impact",
        "Recommend response"
      ]
    },
    {
      "kind": "table",
      "title": "Anchor observations",
      "cols": [
        "Stage",
        "Evidence"
      ],
      "rows": [
        [
          "Entry",
          "Recruiter email and LNK download"
        ],
        [
          "Execution",
          "Hidden PowerShell on ws-rnd-02"
        ],
        [
          "Credential access",
          "rundll32 accesses lsass.exe"
        ],
        [
          "Movement",
          "adm.tnguyen reaches srv-rnd-01"
        ],
        [
          "Data loss",
          "Project-Helios staging and ~2.5 GB upload"
        ]
      ]
    },
    {
      "kind": "p",
      "text": "The first email is not the first compromised endpoint. Patient zero is the host where attacker code first executed: support that conclusion with [[process-tree]] and timing evidence."
    },
    {
      "kind": "callout",
      "tone": "warn",
      "title": "A decoy tests context",
      "text": "nessus01 is an authorised scanner in this scenario. Its activity is benign here; do not globally allowlist all scanning behavior."
    },
    {
      "kind": "grid",
      "items": [
        {
          "title": "Intel",
          "text": "[[threat-intel]] supports the infrastructure assessment; local payload and beacon events still matter."
        },
        {
          "title": "Behavior",
          "text": "[[mitre-attack]] mappings explain observed methods, not actor identity."
        },
        {
          "title": "Impact",
          "text": "[[severity]] reflects confirmed compromise, scope, and data loss."
        }
      ]
    },
    {
      "kind": "code",
      "title": "Evidence to verify",
      "code": "process=rundll32.exe TargetImage=lsass.exe GrantedAccess=0x1010",
      "explain": [
        "Read the full event and chain. Process access is evidence supporting credential-dumping assessment, not a list of passwords actually stolen."
      ]
    },
    {
      "kind": "p",
      "text": "Recommend [[containment]] for affected endpoints, exposed identities, and confirmed malicious destinations. Coordinate service impact and preserve [[evidence]]; do not treat the scanner as an intrusion source."
    },
    {
      "kind": "callout",
      "tone": "info",
      "title": "Write a reproducible handoff",
      "text": "Separate facts from inference. Include patient zero, impact, event references, key times, proposed actions, and remaining gaps. Submitting a report is not the same as eradicating the incident."
    }
  ],
  "visual": [
    {
      "kind": "flow",
      "title": "Helios chain",
      "steps": [
        "Recruiter lure",
        "PowerShell",
        "Task and beacon",
        "LSASS access",
        "R&D server",
        "Cloud upload"
      ]
    },
    {
      "kind": "layers",
      "title": "Corroborate across sources",
      "lanes": [
        {
          "label": "Identity",
          "items": [
            "l.chen",
            "adm.tnguyen"
          ]
        },
        {
          "label": "Endpoint",
          "items": [
            "ws-rnd-02",
            "srv-rnd-01"
          ]
        },
        {
          "label": "Network",
          "items": [
            "203.0.113.200",
            "storage.mega-sync-share.io"
          ]
        }
      ]
    },
    {
      "kind": "compare",
      "title": "Separate decoy from intrusion",
      "left": {
        "title": "nessus01",
        "points": [
          "Authorised scanning",
          "No linked attacker chain"
        ]
      },
      "right": {
        "title": "ws-rnd-02",
        "points": [
          "Payload execution",
          "Beacon and LSASS access"
        ]
      }
    },
    {
      "kind": "stats",
      "title": "Scenario anchors",
      "items": [
        {
          "label": "Beacon spacing",
          "value": "~120 s"
        },
        {
          "label": "Uploaded data",
          "value": "~2.5 GB"
        },
        {
          "label": "Initial endpoint",
          "value": "ws-rnd-02"
        }
      ]
    }
  ],
  "demo": [
    {
      "id": "l10-d1",
      "title": "Start with sequence",
      "narration": "Follow [[evidence]] across the chain.",
      "screen": {
        "area": "Investigation Workspace",
        "focus": "Timeline",
        "detail": [
          "Recruiter mail precedes execution",
          "ws-rnd-02 executes payload",
          "srv-rnd-01 is reached later"
        ]
      }
    },
    {
      "id": "l10-d2",
      "title": "Check entities",
      "narration": "Use [[baseline]] context to challenge the scanner decoy.",
      "screen": {
        "area": "Investigation Workspace",
        "focus": "Entities",
        "detail": [
          "nessus01: authorised scanner",
          "ws-rnd-02: execution and beacon evidence"
        ]
      }
    },
    {
      "id": "l10-d3",
      "title": "Map what happened",
      "narration": "Link [[credential-dumping]] and [[exfiltration]] to their records.",
      "screen": {
        "area": "Investigation Workspace",
        "focus": "MITRE",
        "detail": [
          "LSASS access: T1003.001",
          "Cloud upload: T1567.002"
        ]
      }
    },
    {
      "id": "l10-d4",
      "title": "Write the handoff",
      "narration": "State impact and proposed [[containment]] without pretending response is complete.",
      "screen": {
        "area": "Investigation Workspace",
        "focus": "Report",
        "detail": [
          "Patient zero and critical severity",
          "Evidence-linked timeline",
          "Host and identity containment recommendations",
          "Known gaps and next checks"
        ]
      }
    }
  ],
  "lab": {
    "kind": "capstone",
    "scenarioId": "capstone-apt",
    "intro": "Investigate the full chain, resolve the scanner decoy, and submit a report with evidence and proportionate response recommendations.",
    "objectives": [
      {
        "id": "l10-o1",
        "title": "Reconstruct the timeline",
        "instruction": "Use the timeline to connect [[phishing]] with later execution.",
        "action": {
          "type": "navigate",
          "to": "timeline"
        },
        "hints": [
          "Separate observed behavior from assumptions.",
          "Review the relevant evidence before choosing an action.",
          "Compare the available labels with the host, user, and behavior fields.",
          "For example, a trusted tool can still be abused; its name alone is not a verdict.",
          "Navigate to Timeline."
        ],
        "why": "Record an evidence-based decision that another analyst can review.",
        "skill": "investigation"
      },
      {
        "id": "l10-o2",
        "title": "Inspect the initiating evidence",
        "instruction": "Open the first mapped [[evidence]] record and inspect its linked follow-on activity.",
        "action": {
          "type": "click",
          "target": `open-event:${CAPSTONE_APT.mitreMap[0].eventIds[0]}`
        },
        "hints": [
          "Separate observed behavior from assumptions.",
          "Review the relevant evidence before choosing an action.",
          "Compare the available labels with the host, user, and behavior fields.",
          "For example, a trusted tool can still be abused; its name alone is not a verdict.",
          "Open the first event in the first capstone ATT&CK mapping."
        ],
        "why": "Record an evidence-based decision that another analyst can review.",
        "skill": "investigation"
      },
      {
        "id": "l10-o3",
        "title": "Classify the workstation",
        "instruction": "Use process and network [[evidence]] to tag the initial workstation.",
        "action": {
          "type": "select",
          "target": "tag-entity",
          "value": "ws-rnd-02=compromised"
        },
        "hints": [
          "Separate observed behavior from assumptions.",
          "Review the relevant evidence before choosing an action.",
          "Compare the available labels with the host, user, and behavior fields.",
          "For example, a trusted tool can still be abused; its name alone is not a verdict.",
          "Tag ws-rnd-02 as compromised."
        ],
        "why": "Record an evidence-based decision that another analyst can review.",
        "skill": "triage"
      },
      {
        "id": "l10-o4",
        "title": "Resolve the scanner decoy",
        "instruction": "Compare scanner activity with the authorised [[baseline]] before tagging it.",
        "action": {
          "type": "select",
          "target": "tag-entity",
          "value": "nessus01=benign"
        },
        "hints": [
          "Separate observed behavior from assumptions.",
          "Review the relevant evidence before choosing an action.",
          "Compare the available labels with the host, user, and behavior fields.",
          "For example, a trusted tool can still be abused; its name alone is not a verdict.",
          "Tag nessus01 as benign."
        ],
        "why": "Record an evidence-based decision that another analyst can review.",
        "skill": "triage"
      },
      {
        "id": "l10-o5",
        "title": "Classify infrastructure",
        "instruction": "Use the payload and [[c2]] observations plus intelligence to classify the external address.",
        "action": {
          "type": "select",
          "target": "tag-entity",
          "value": "203.0.113.200=attacker"
        },
        "hints": [
          "Separate observed behavior from assumptions.",
          "Review the relevant evidence before choosing an action.",
          "Compare the available labels with the host, user, and behavior fields.",
          "For example, a trusted tool can still be abused; its name alone is not a verdict.",
          "Tag 203.0.113.200 as attacker."
        ],
        "why": "Record an evidence-based decision that another analyst can review.",
        "skill": "intel"
      },
      {
        "id": "l10-o6",
        "title": "Choose patient zero",
        "instruction": "Identify the first endpoint to execute attacker code, not merely the earliest [[log]] source.",
        "action": {
          "type": "select",
          "target": "patient-zero",
          "value": "ws-rnd-02"
        },
        "hints": [
          "Separate observed behavior from assumptions.",
          "Review the relevant evidence before choosing an action.",
          "Compare the available labels with the host, user, and behavior fields.",
          "For example, a trusted tool can still be abused; its name alone is not a verdict.",
          "Set patient zero to ws-rnd-02."
        ],
        "why": "Record an evidence-based decision that another analyst can review.",
        "skill": "investigation"
      },
      {
        "id": "l10-o7",
        "title": "Map credential access",
        "instruction": "Map rundll32 access to LSASS memory using [[credential-dumping]] evidence.",
        "action": {
          "type": "select",
          "target": "map-technique",
          "value": "T1003.001"
        },
        "hints": [
          "Separate observed behavior from assumptions.",
          "Review the relevant evidence before choosing an action.",
          "Compare the available labels with the host, user, and behavior fields.",
          "For example, a trusted tool can still be abused; its name alone is not a verdict.",
          "Map T1003.001."
        ],
        "why": "Record an evidence-based decision that another analyst can review.",
        "skill": "mitre"
      },
      {
        "id": "l10-o8",
        "title": "Map data loss",
        "instruction": "Map the cloud-storage upload using [[exfiltration]] evidence.",
        "action": {
          "type": "select",
          "target": "map-technique",
          "value": "T1567.002"
        },
        "hints": [
          "Separate observed behavior from assumptions.",
          "Review the relevant evidence before choosing an action.",
          "Compare the available labels with the host, user, and behavior fields.",
          "For example, a trusted tool can still be abused; its name alone is not a verdict.",
          "Map T1567.002."
        ],
        "why": "Record an evidence-based decision that another analyst can review.",
        "skill": "mitre"
      },
      {
        "id": "l10-o9",
        "title": "Set incident severity",
        "instruction": "Use confirmed compromise and R&D data loss to set [[severity]].",
        "action": {
          "type": "select",
          "target": "severity",
          "value": "critical"
        },
        "hints": [
          "Separate observed behavior from assumptions.",
          "Review the relevant evidence before choosing an action.",
          "Compare the available labels with the host, user, and behavior fields.",
          "For example, a trusted tool can still be abused; its name alone is not a verdict.",
          "Set severity to critical."
        ],
        "why": "Record an evidence-based decision that another analyst can review.",
        "skill": "response"
      },
      {
        "id": "l10-o10",
        "title": "Submit an evidence-backed report",
        "instruction": "Record the timeline, scope, [[containment]] recommendations, and uncertainties before submission.",
        "action": {
          "type": "click",
          "target": "submit-report"
        },
        "hints": [
          "Separate observed behavior from assumptions.",
          "Review the relevant evidence before choosing an action.",
          "Compare the available labels with the host, user, and behavior fields.",
          "For example, a trusted tool can still be abused; its name alone is not a verdict.",
          "Click Submit report after reviewing the report fields."
        ],
        "why": "Record an evidence-based decision that another analyst can review.",
        "skill": "response"
      }
    ]
  },
  "assessment": [
    {
      "id": "l10-q1",
      "prompt": "Which endpoint is patient zero?",
      "options": [
        "nessus01",
        "srv-rnd-01",
        "o365",
        "ws-rnd-02"
      ],
      "answer": 3,
      "explain": "Attacker code first executes on ws-rnd-02, preceding movement to the server.",
      "skill": "investigation"
    },
    {
      "id": "l10-q2",
      "prompt": "Why is nessus01 benign in this case?",
      "options": [
        "Every scanner is always safe",
        "The scenario identifies authorised scanning, not a linked intrusion chain",
        "It has no IP",
        "Its name is familiar"
      ],
      "answer": 1,
      "explain": "The verdict uses case-specific authorisation and context.",
      "skill": "triage"
    },
    {
      "id": "l10-q3",
      "prompt": "Which mapping fits LSASS memory access?",
      "options": [
        "T1003.001",
        "T1567.002",
        "T1136.001",
        "T1548"
      ],
      "answer": 0,
      "explain": "LSASS memory access supports the credential-dumping sub-technique.",
      "skill": "mitre"
    },
    {
      "id": "l10-q4",
      "prompt": "What strengthens the attacker-infrastructure judgment?",
      "options": [
        "A feed hit alone",
        "The IP address appearance",
        "Payload retrieval and periodic beacons corroborating the feed",
        "A scanner alert on another host"
      ],
      "answer": 2,
      "explain": "Independent local observations strengthen the intelligence assessment.",
      "skill": "intel"
    },
    {
      "id": "l10-q5",
      "prompt": "What supports critical severity?",
      "options": [
        "The number of dashboard tabs",
        "Confirmed multi-host compromise and R&D data exfiltration",
        "One new domain alone",
        "An authorised scan"
      ],
      "answer": 1,
      "explain": "Severity should reflect demonstrated scope and impact.",
      "skill": "response"
    },
    {
      "id": "l10-q6",
      "prompt": "What belongs in the report?",
      "options": [
        "Only ATT&CK IDs",
        "Only a conclusion",
        "An assertion that all systems are safe",
        "Evidence-linked timeline, scope, impact, response recommendations, and gaps"
      ],
      "answer": 3,
      "explain": "A useful handoff is reproducible and clear about uncertainty.",
      "skill": "investigation"
    }
  ],
  "reflection": [
    {
      "id": "l10-r1",
      "prompt": "Which observation most changed your judgment, and why?",
      "placeholder": "Name the observation and the decision it supported."
    },
    {
      "id": "l10-r2",
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
