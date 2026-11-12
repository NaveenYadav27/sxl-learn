import type { Lesson } from "../../types";
import { LATERAL_MOVE } from "../scenarios";
const scenarioId = LATERAL_MOVE.id;

export const LESSON_07: Lesson = {
  "id": "l07",
  "number": 7,
  "title": "Risk-Based Alerting (RBA)",
  "tagline": "Combine weak signals without losing the evidence.",
  "durationMin": 55,
  "scenarioId": scenarioId,
  "heroTermIds": [
    "rba",
    "risk-score",
    "risk-object",
    "risk-notable",
    "threshold",
    "alert-fatigue"
  ],
  "objectives": [
    "Compare alert-centric and entity-centric views.",
    "Explain weighted risk aggregation.",
    "Promote an eligible risk object.",
    "Explain the operational effect of lowering a threshold."
  ],
  "concept": [
    {
      "kind": "heading",
      "text": "Move from alerts to entities"
    },
    {
      "kind": "p",
      "text": "[[rba]] groups weighted signals around a [[risk-object]]. It helps reduce repetitive queue entries while preserving the supporting events."
    },
    {
      "kind": "p",
      "text": "adm.jdoe and j.doe are different accounts. Do not merge their scores because their names look similar."
    },
    {
      "kind": "p",
      "text": "The scenario totals are adm.jdoe 120, ws-fin-12 80, fs01 60, and j.doe 20. A [[risk-score]] is an assigned weight, not a probability."
    },
    {
      "kind": "p",
      "text": "At the initial threshold of 100, adm.jdoe qualifies for a [[risk-notable]]. At 80, ws-fin-12 also qualifies. Neither threshold proves compromise."
    },
    {
      "kind": "p",
      "text": "Credential dumping, privileged logons, and remote execution deserve more attention together than a routine isolated signal. Inspect the event trail before promoting an object."
    },
    {
      "kind": "p",
      "text": "Lowering a [[threshold]] increases eligible objects and review workload. Raising it may hide meaningful activity; validate against known cases and [[alert-fatigue]]."
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
        "Move from alerts to entities",
        "Keep entity identity intact",
        "Read the totals",
        "Apply a threshold"
      ]
    },
    {
      "kind": "layers",
      "title": "Three reasoning layers",
      "lanes": [
        {
          "label": "Telemetry",
          "items": [
            "adm.jdoe and j.doe are different accounts. Do not merge their scores because their names look similar."
          ]
        },
        {
          "label": "Interpretation",
          "items": [
            "The scenario totals are adm.jdoe 120, ws-fin-12 80, fs01 60, and j.doe 20. A [[risk-score]] is an assigned weight, not a probability."
          ]
        },
        {
          "label": "Decision",
          "items": [
            "Lowering a [[threshold]] increases eligible objects and review workload. Raising it may hide meaningful activity; validate against known cases and [[alert-fatigue]]."
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
    },
    {
      "kind": "stats",
      "title": "Scenario totals",
      "items": [
        {
          "label": "adm.jdoe",
          "value": "120"
        },
        {
          "label": "ws-fin-12",
          "value": "80"
        },
        {
          "label": "fs01",
          "value": "60"
        },
        {
          "label": "j.doe",
          "value": "20"
        }
      ]
    }
  ],
  "demo": [
    {
      "id": "l07-d1",
      "title": "Move from alerts to entities",
      "narration": "[[rba]] groups weighted signals around a [[risk-object]]. It helps reduce repetitive queue entries while preserving the supporting events.",
      "screen": {
        "area": "Risk Analysis",
        "focus": "Move from alerts to entities",
        "detail": [
          "[[rba]] groups weighted signals around a [[risk-object]]. It helps reduce repetitive queue entries while preserving the supporting events.",
          "Explain the observation before changing the case."
        ]
      }
    },
    {
      "id": "l07-d2",
      "title": "Keep entity identity intact",
      "narration": "adm.jdoe and j.doe are different accounts. Do not merge their scores because their names look similar.",
      "screen": {
        "area": "Risk Analysis",
        "focus": "Keep entity identity intact",
        "detail": [
          "adm.jdoe and j.doe are different accounts. Do not merge their scores because their names look similar.",
          "Explain the observation before changing the case."
        ]
      }
    },
    {
      "id": "l07-d3",
      "title": "Read the totals",
      "narration": "The scenario totals are adm.jdoe 120, ws-fin-12 80, fs01 60, and j.doe 20. A [[risk-score]] is an assigned weight, not a probability.",
      "screen": {
        "area": "Risk Analysis",
        "focus": "Read the totals",
        "detail": [
          "The scenario totals are adm.jdoe 120, ws-fin-12 80, fs01 60, and j.doe 20. A [[risk-score]] is an assigned weight, not a probability.",
          "Explain the observation before changing the case."
        ]
      }
    },
    {
      "id": "l07-d4",
      "title": "Apply a threshold",
      "narration": "At the initial threshold of 100, adm.jdoe qualifies for a [[risk-notable]]. At 80, ws-fin-12 also qualifies. Neither threshold proves compromise.",
      "screen": {
        "area": "Risk Analysis",
        "focus": "Apply a threshold",
        "detail": [
          "At the initial threshold of 100, adm.jdoe qualifies for a [[risk-notable]]. At 80, ws-fin-12 also qualifies. Neither threshold proves compromise.",
          "Explain the observation before changing the case."
        ]
      }
    }
  ],
  "lab": {
    "kind": "risk",
    "scenarioId": scenarioId,
    "intro": "Use this educational simulator to practice [[rba]]. Explain each decision using the supplied scenario evidence.",
    "objectives": [
      {
        "id": "l07-o1",
        "title": "See individual alert noise",
        "instruction": "Switch to alerts mode and consider [[alert-fatigue]].",
        "action": {
          "type": "click",
          "target": "toggle-mode:alerts"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Switch to alerts mode and consider [[alert-fatigue]]."
        ],
        "why": "Entity-level review prioritizes related signals while preserving the original event trail.",
        "skill": "risk"
      },
      {
        "id": "l07-o2",
        "title": "Group by object",
        "instruction": "Switch to [[rba]] mode.",
        "action": {
          "type": "click",
          "target": "toggle-mode:rba"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Switch to [[rba]] mode."
        ],
        "why": "Entity-level review prioritizes related signals while preserving the original event trail.",
        "skill": "risk"
      },
      {
        "id": "l07-o3",
        "title": "Replay the signals",
        "instruction": "Play the replay and watch each [[risk-score]] accumulate.",
        "action": {
          "type": "click",
          "target": "play-replay"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Play the replay and watch each [[risk-score]] accumulate."
        ],
        "why": "Entity-level review prioritizes related signals while preserving the original event trail.",
        "skill": "risk"
      },
      {
        "id": "l07-o4",
        "title": "Inspect the privileged identity",
        "instruction": "Open [[risk-object]] adm.jdoe and review its supporting events.",
        "action": {
          "type": "click",
          "target": "open-risk-object:adm.jdoe"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Open [[risk-object]] adm.jdoe and review its supporting events."
        ],
        "why": "Entity-level review prioritizes related signals while preserving the original event trail.",
        "skill": "risk"
      },
      {
        "id": "l07-o5",
        "title": "Promote the eligible identity",
        "instruction": "Create a [[risk-notable]] for adm.jdoe at threshold 100.",
        "action": {
          "type": "click",
          "target": "create-risk-notable:adm.jdoe"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Create a [[risk-notable]] for adm.jdoe at threshold 100."
        ],
        "why": "Entity-level review prioritizes related signals while preserving the original event trail.",
        "skill": "risk"
      },
      {
        "id": "l07-o6",
        "title": "Test a lower threshold",
        "instruction": "Select [[threshold]] 80, then create a risk notable for ws-fin-12.",
        "action": {
          "type": "click",
          "target": "create-risk-notable:ws-fin-12"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Select [[threshold]] 80, then create a risk notable for ws-fin-12."
        ],
        "why": "Entity-level review prioritizes related signals while preserving the original event trail.",
        "skill": "risk"
      }
    ],
    "riskThreshold": 100
  },
  "assessment": [
    {
      "id": "l07-q1",
      "prompt": "What is a risk object?",
      "options": [
        "An entity receiving weighted signals",
        "A probability",
        "A saved password",
        "A firewall rule"
      ],
      "answer": 0,
      "explain": "Risk aggregates around identified entities.",
      "skill": "risk"
    },
    {
      "id": "l07-q2",
      "prompt": "Who qualifies at 100?",
      "options": [
        "adm.jdoe",
        "ws-fin-12",
        "fs01",
        "j.doe"
      ],
      "answer": 0,
      "explain": "120 meets the initial threshold.",
      "skill": "risk"
    },
    {
      "id": "l07-q3",
      "prompt": "Who newly qualifies at 80?",
      "options": [
        "ws-fin-12",
        "j.doe",
        "Every object",
        "No object"
      ],
      "answer": 0,
      "explain": "ws-fin-12 totals exactly 80.",
      "skill": "risk"
    },
    {
      "id": "l07-q4",
      "prompt": "Does score 120 mean 120 percent malicious?",
      "options": [
        "No; it is a weighted total",
        "Yes",
        "Only for users",
        "Only for hosts"
      ],
      "answer": 0,
      "explain": "Risk scores are not probabilities.",
      "skill": "risk"
    },
    {
      "id": "l07-q5",
      "prompt": "Why keep j.doe separate from adm.jdoe?",
      "options": [
        "They are different identities",
        "Names never matter",
        "Their scores are equal",
        "Both are hosts"
      ],
      "answer": 0,
      "explain": "Accurate identity grouping prevents misleading aggregation.",
      "skill": "risk"
    },
    {
      "id": "l07-q6",
      "prompt": "What follows a lower threshold?",
      "options": [
        "More eligible objects to review",
        "Guaranteed fewer alerts",
        "Automatic eradication",
        "No possible false positives"
      ],
      "answer": 0,
      "explain": "Sensitivity and workload generally increase.",
      "skill": "risk"
    }
  ],
  "reflection": [
    {
      "id": "l07-r1",
      "prompt": "Which observation most changed your conclusion, and why?",
      "placeholder": "Name the event or field and explain its significance."
    },
    {
      "id": "l07-r2",
      "prompt": "What uncertainty would you investigate next?",
      "placeholder": "State a competing explanation and the telemetry needed."
    }
  ],
  "mentorBriefing": "Begin with [[rba]] as a reasoning task, not a button sequence. Read the supplied events and distinguish facts from assumptions. Explain what would change your conclusion. Use the simulator to practice a concise, evidence-based handoff.",
  "challenges": [
    "What benign explanation could fit the first signal?",
    "Which missing event would change your decision?",
    "How does the search or scoring window affect the conclusion?",
    "What evidence would you include in a handoff, and why?"
  ]
};
