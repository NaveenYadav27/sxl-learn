import type { Lesson } from "../../types";
import { PHISH_POWERSHELL } from "../scenarios";
const firstNotable = PHISH_POWERSHELL.notables[0].id;
const secondNotable = PHISH_POWERSHELL.notables[1].id;

export const LESSON_05: Lesson = {
  "id": "l05",
  "number": 5,
  "title": "Alert Triage in Incident Review",
  "tagline": "Own the alert, verify the story, explain the verdict.",
  "durationMin": 60,
  "scenarioId": "phish-powershell",
  "heroTermIds": [
    "triage",
    "incident-review",
    "disposition",
    "urgency",
    "process-tree",
    "threat-intel"
  ],
  "objectives": [
    "Take ownership of a notable.",
    "Distinguish status from disposition.",
    "Correlate related alerts and intelligence.",
    "Classify alerts using evidence and impact."
  ],
  "concept": [
    {
      "kind": "heading",
      "text": "Work the queue deliberately"
    },
    {
      "kind": "p",
      "text": "[[triage]] establishes what happened, who owns the case, and what should happen next. A title is a lead, not proof."
    },
    {
      "kind": "p",
      "text": "Word launched hidden encoded PowerShell on ws-hr-07, followed by a script download and a scheduled task. The [[process-tree]] connects these observations."
    },
    {
      "kind": "p",
      "text": "Status tracks work progress. [[disposition]] records the analyst’s conclusion. In progress does not mean true positive."
    },
    {
      "kind": "p",
      "text": "Record the host, user, execution chain, network destination, and next step. A comment should explain the decision rather than merely repeat the title."
    },
    {
      "kind": "p",
      "text": "A [[threat-intel]] hit supports investigation but does not independently prove compromise. Check confidence and matching local telemetry."
    },
    {
      "kind": "p",
      "text": "[[urgency]] reflects evidence, exposure, and impact. A quarantined attachment without execution is not equivalent to active endpoint compromise."
    },
    {
      "kind": "flow",
      "title": "Analyst reasoning",
      "steps": [
        "Observe the signal",
        "Group related evidence",
        "Test an alternative explanation",
        "Record a justified decision"
      ]
    },
    {
      "kind": "grid",
      "items": [
        {
          "title": "Evidence",
          "text": "What did the recorded event actually show?"
        },
        {
          "title": "Uncertainty",
          "text": "What additional telemetry could disprove your conclusion?"
        }
      ]
    },
    {
      "kind": "table",
      "cols": [
        "Decision",
        "Check"
      ],
      "rows": [
        [
          "Act",
          "Supporting local telemetry"
        ],
        [
          "Wait",
          "Missing scope or timing"
        ]
      ]
    },
    {
      "kind": "callout",
      "tone": "warn",
      "title": "Training environment",
      "text": "This educational simulator is not real Splunk. Practice the reasoning as well as the controls."
    }
  ],
  "visual": [
    {
      "kind": "flow",
      "title": "Evidence to decision",
      "steps": [
        "Work the queue deliberately",
        "Read the execution chain",
        "Separate workflow from judgment",
        "Document the reason"
      ]
    },
    {
      "kind": "layers",
      "title": "Three reasoning layers",
      "lanes": [
        {
          "label": "Telemetry",
          "items": [
            "Word launched hidden encoded PowerShell on ws-hr-07, followed by a script download and a scheduled task. The [[process-tree]] connects these observations."
          ]
        },
        {
          "label": "Interpretation",
          "items": [
            "Status tracks work progress. [[disposition]] records the analyst’s conclusion. In progress does not mean true positive."
          ]
        },
        {
          "label": "Decision",
          "items": [
            "[[urgency]] reflects evidence, exposure, and impact. A quarantined attachment without execution is not equivalent to active endpoint compromise."
          ]
        }
      ]
    },
    {
      "kind": "compare",
      "left": {
        "title": "Weak conclusion",
        "points": [
          "Trust the title",
          "Ignore timing and scope"
        ]
      },
      "right": {
        "title": "Defensible conclusion",
        "points": [
          "Inspect the event trail",
          "State uncertainty and next action"
        ]
      }
    }
  ],
  "demo": [
    {
      "id": "l05-d1",
      "title": "Work the queue deliberately",
      "narration": "[[triage]] establishes what happened, who owns the case, and what should happen next. A title is a lead, not proof.",
      "screen": {
        "area": "Incident Review",
        "focus": "Work the queue deliberately",
        "detail": [
          "[[triage]] establishes what happened, who owns the case, and what should happen next. A title is a lead, not proof.",
          "Explain the observation before changing the case."
        ]
      }
    },
    {
      "id": "l05-d2",
      "title": "Read the execution chain",
      "narration": "Word launched hidden encoded PowerShell on ws-hr-07, followed by a script download and a scheduled task. The [[process-tree]] connects these observations.",
      "screen": {
        "area": "Incident Review",
        "focus": "Read the execution chain",
        "detail": [
          "Word launched hidden encoded PowerShell on ws-hr-07, followed by a script download and a scheduled task. The [[process-tree]] connects these observations.",
          "Explain the observation before changing the case."
        ]
      }
    },
    {
      "id": "l05-d3",
      "title": "Separate workflow from judgment",
      "narration": "Status tracks work progress. [[disposition]] records the analyst’s conclusion. In progress does not mean true positive.",
      "screen": {
        "area": "Incident Review",
        "focus": "Separate workflow from judgment",
        "detail": [
          "Add a comment citing ws-hr-07, a.kumar, Word → PowerShell, download, and the proposed response.",
          "Open the related notable before navigating to Threat Intelligence."
        ]
      }
    },
    {
      "id": "l05-d4",
      "title": "Document the reason",
      "narration": "Record the host, user, execution chain, network destination, and next step. A comment should explain the decision rather than merely repeat the title.",
      "screen": {
        "area": "Incident Review",
        "focus": "Document the reason",
        "detail": [
          "Record the host, user, execution chain, network destination, and next step. A comment should explain the decision rather than merely repeat the title.",
          "Explain the observation before changing the case."
        ]
      }
    }
  ],
  "lab": {
    "kind": "console",
    "scenarioId": "phish-powershell",
    "intro": "Use this educational simulator to practice [[triage]]. Explain each decision using the supplied scenario evidence.",
    "objectives": [
      {
        "id": "l05-o1",
        "title": "Open the queue",
        "instruction": "Navigate to [[incident-review]], then open the first notable.",
        "action": {
          "type": "navigate",
          "to": "incident-review"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Navigate to [[incident-review]], then open the first notable."
        ],
        "why": "A defensible triage decision connects case ownership, local evidence, and a clear next step.",
        "skill": "triage"
      },
      {
        "id": "l05-o2",
        "title": "Review execution",
        "instruction": "Open the first [[notable]] and inspect its event chain.",
        "action": {
          "type": "click",
          "target": `open-notable:${firstNotable}`
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Open the first [[notable]] and inspect its event chain."
        ],
        "why": "A defensible triage decision connects case ownership, local evidence, and a clear next step.",
        "skill": "triage"
      },
      {
        "id": "l05-o3",
        "title": "Own the case",
        "instruction": "Assign the [[notable]] to yourself.",
        "action": {
          "type": "click",
          "target": "assign-to-me"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Assign the [[notable]] to yourself."
        ],
        "why": "A defensible triage decision connects case ownership, local evidence, and a clear next step.",
        "skill": "triage"
      },
      {
        "id": "l05-o4",
        "title": "Record the verdict",
        "instruction": "Set [[disposition]] to true positive after checking the execution evidence.",
        "action": {
          "type": "click",
          "target": "set-disposition:true-positive"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Set [[disposition]] to true positive after checking the execution evidence."
        ],
        "why": "A defensible triage decision connects case ownership, local evidence, and a clear next step.",
        "skill": "triage"
      },
      {
        "id": "l05-o5",
        "title": "Track active work",
        "instruction": "Change the [[triage]] status to in progress.",
        "action": {
          "type": "click",
          "target": "change-status:in-progress"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Change the [[triage]] status to in progress."
        ],
        "why": "A defensible triage decision connects case ownership, local evidence, and a clear next step.",
        "skill": "triage"
      },
      {
        "id": "l05-o6",
        "title": "Document and corroborate",
        "instruction": `Click add-comment with an evidence-based summary; open [[notable]] ${secondNotable}, navigate to threat-intel, and look up 185.220.101.4.`,
        "action": {
          "type": "click",
          "target": "lookup-intel:185.220.101.4"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          `Click add-comment with an evidence-based summary; open [[notable]] ${secondNotable}, navigate to threat-intel, and look up 185.220.101.4.`
        ],
        "why": "A defensible triage decision connects case ownership, local evidence, and a clear next step.",
        "skill": "intel"
      },
      {
        "id": "l05-o7",
        "title": "Prioritize the board",
        "instruction": "Classify all five [[triage]] alerts correctly.",
        "action": {
          "type": "click",
          "target": "triage-all-correct"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Classify all five [[triage]] alerts correctly."
        ],
        "why": "A defensible triage decision connects case ownership, local evidence, and a clear next step.",
        "skill": "triage"
      }
    ],
    "triageAlerts": [
      {
        "id": "l05-ta1",
        "title": "Active endpoint compromise",
        "source": "EDR + proxy",
        "detail": "Word launched hidden encoded PowerShell; a download, persistence, and defense tampering followed on ws-hr-07.",
        "answer": "critical",
        "why": "Execution plus persistence and defense tampering warrants immediate response."
      },
      {
        "id": "l05-ta2",
        "title": "Office launched PowerShell",
        "source": "Sysmon",
        "detail": "An Office child process runs hidden encoded PowerShell; download scope is not yet known.",
        "answer": "high",
        "why": "Suspicious execution requires prompt investigation, even before full impact is known."
      },
      {
        "id": "l05-ta3",
        "title": "Delivered macro attachment",
        "source": "Email",
        "detail": "New sender, failed SPF, macro attachment delivered; no endpoint execution evidence yet.",
        "answer": "medium",
        "why": "Exposure exists, but compromise is not established."
      },
      {
        "id": "l05-ta4",
        "title": "Quarantined copy",
        "source": "Email",
        "detail": "The same attachment to r.patel was quarantined; no execution evidence.",
        "answer": "low",
        "why": "Prevented delivery with no observed execution is lower priority; verify scope."
      },
      {
        "id": "l05-ta5",
        "title": "Approved administration",
        "source": "Sysmon",
        "detail": "m.lee runs a signed local inventory script from an approved management parent during an authorized change.",
        "answer": "low",
        "why": "Authorization and expected process context support routine activity."
      }
    ]
  },
  "assessment": [
    {
      "id": "l05-q1",
      "prompt": "What does assignment establish?",
      "options": [
        "Case ownership",
        "Malware removal",
        "False-positive status",
        "Network isolation"
      ],
      "answer": 0,
      "explain": "Ownership prevents duplicate or neglected work.",
      "skill": "triage"
    },
    {
      "id": "l05-q2",
      "prompt": "Which is a workflow state?",
      "options": [
        "In progress",
        "True positive",
        "Benign",
        "False positive"
      ],
      "answer": 0,
      "explain": "Status describes workflow, not the verdict.",
      "skill": "triage"
    },
    {
      "id": "l05-q3",
      "prompt": "What makes the Word chain suspicious?",
      "options": [
        "Hidden encoded PowerShell and a download",
        "Word opening any file",
        "A user signing in",
        "A quarantined email alone"
      ],
      "answer": 0,
      "explain": "The related execution and network events support concern.",
      "skill": "triage"
    },
    {
      "id": "l05-q4",
      "prompt": "What should a comment contain?",
      "options": [
        "Evidence and next action",
        "Only the title",
        "Only a priority word",
        "An unsupported accusation"
      ],
      "answer": 0,
      "explain": "A useful handoff explains why and what next.",
      "skill": "triage"
    },
    {
      "id": "l05-q5",
      "prompt": "How should an intel hit be used?",
      "options": [
        "Corroborate with local events",
        "Treat it as proof alone",
        "Ignore confidence",
        "Automatically close the case"
      ],
      "answer": 0,
      "explain": "Intelligence is context, not a standalone verdict.",
      "skill": "triage"
    },
    {
      "id": "l05-q6",
      "prompt": "Which needs fastest attention?",
      "options": [
        "Active malicious execution",
        "Blocked mail without execution",
        "Approved maintenance",
        "Three normal retries"
      ],
      "answer": 0,
      "explain": "Active execution creates immediate exposure.",
      "skill": "triage"
    }
  ],
  "reflection": [
    {
      "id": "l05-r1",
      "prompt": "Which observation most changed your conclusion, and why?",
      "placeholder": "Name the event or field and explain its significance."
    },
    {
      "id": "l05-r2",
      "prompt": "What uncertainty would you investigate next?",
      "placeholder": "State a competing explanation and the telemetry needed."
    }
  ],
  "mentorBriefing": "Begin with [[triage]] as a reasoning task, not a button sequence. Read the supplied events and distinguish facts from assumptions. Explain what would change your conclusion. Use the simulator to practice a concise, evidence-based handoff.",
  "challenges": [
    "What benign explanation could fit the first signal?",
    "Which missing event would change your decision?",
    "How does the search or scoring window affect the conclusion?",
    "What evidence would you include in a handoff, and why?"
  ]
};

