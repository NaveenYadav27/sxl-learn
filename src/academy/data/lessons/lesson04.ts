import type { Lesson } from "../../types";
import { BRUTE_FORCE } from "../scenarios";
const scenarioId = BRUTE_FORCE.id;

export const LESSON_04: Lesson = {
  "id": "l04",
  "number": 4,
  "title": "Detection Engineering: Correlation Searches & Thresholds",
  "tagline": "Turn a login burst into a testable rule.",
  "durationMin": 60,
  "scenarioId": scenarioId,
  "heroTermIds": [
    "correlation-search",
    "threshold",
    "baseline",
    "tuning",
    "stats",
    "where"
  ],
  "objectives": [
    "Build a failure-count search.",
    "Explain grouping keys and threshold trade-offs.",
    "Separate benign retries from a suspicious burst.",
    "Correlate failure and success without assuming order."
  ],
  "concept": [
    {
      "kind": "heading",
      "text": "Start with a hypothesis"
    },
    {
      "kind": "p",
      "text": "A [[correlation-search]] turns an observable pattern into a repeatable search. Here the hypothesis is repeated failed authentication followed by a success."
    },
    {
      "kind": "p",
      "text": "Search index=auth. EventCode 4625 means failure; 4624 means success. Group by user and src_ip so unrelated people are not combined."
    },
    {
      "kind": "p",
      "text": "A [[threshold]] of more than 20 failures separates the 42-guess burst from a.kumar’s three typo failures in this dataset."
    },
    {
      "kind": "p",
      "text": "Failure and success counts in the same group show co-occurrence, not temporal order. Inspect event times before claiming a success happened after failures."
    },
    {
      "kind": "p",
      "text": "A [[baseline]] is expected behavior over a stated interval. This lab uses a fixed scenario window; production rules need explicit time windows and testing."
    },
    {
      "kind": "p",
      "text": "A low-and-slow attacker can remain under the threshold. [[tuning]] must consider missed attacks as well as noisy alerts."
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
        "Start with a hypothesis",
        "Understand the fields",
        "Choose a threshold",
        "Do not confuse a count with a sequence"
      ]
    },
    {
      "kind": "layers",
      "title": "Three reasoning layers",
      "lanes": [
        {
          "label": "Telemetry",
          "items": [
            "Search index=auth. EventCode 4625 means failure; 4624 means success. Group by user and src_ip so unrelated people are not combined."
          ]
        },
        {
          "label": "Interpretation",
          "items": [
            "A [[threshold]] of more than 20 failures separates the 42-guess burst from a.kumar’s three typo failures in this dataset."
          ]
        },
        {
          "label": "Decision",
          "items": [
            "A low-and-slow attacker can remain under the threshold. [[tuning]] must consider missed attacks as well as noisy alerts."
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
      "id": "l04-d1",
      "title": "Start with a hypothesis",
      "narration": "A [[correlation-search]] turns an observable pattern into a repeatable search. Here the hypothesis is repeated failed authentication followed by a success.",
      "screen": {
        "area": "Search & Reporting",
        "focus": "Start with a hypothesis",
        "detail": [
          "A [[correlation-search]] turns an observable pattern into a repeatable search. Here the hypothesis is repeated failed authentication followed by a success.",
          "Explain the observation before changing the case."
        ],
        "spl": "index=auth EventCode=4625 | table user src_ip dest Logon_Type action"
      }
    },
    {
      "id": "l04-d2",
      "title": "Understand the fields",
      "narration": "Search index=auth. EventCode 4625 means failure; 4624 means success. Group by user and src_ip so unrelated people are not combined.",
      "screen": {
        "area": "Search & Reporting",
        "focus": "Understand the fields",
        "detail": [
          "Search index=auth. EventCode 4625 means failure; 4624 means success. Group by user and src_ip so unrelated people are not combined.",
          "Explain the observation before changing the case."
        ],
        "spl": "index=auth action=failure | stats count by user, src_ip | where count > 20"
      }
    },
    {
      "id": "l04-d3",
      "title": "Choose a threshold",
      "narration": "A [[threshold]] of more than 20 failures separates the 42-guess burst from a.kumar’s three typo failures in this dataset.",
      "screen": {
        "area": "Search & Reporting",
        "focus": "Choose a threshold",
        "detail": [
          "A [[threshold]] of more than 20 failures separates the 42-guess burst from a.kumar’s three typo failures in this dataset.",
          "Explain the observation before changing the case."
        ]
      }
    },
    {
      "id": "l04-d4",
      "title": "Do not confuse a count with a sequence",
      "narration": "Failure and success counts in the same group show co-occurrence, not temporal order. Inspect event times before claiming a success happened after failures.",
      "screen": {
        "area": "Search & Reporting",
        "focus": "Do not confuse a count with a sequence",
        "detail": [
          "Failure and success counts in the same group show co-occurrence, not temporal order. Inspect event times before claiming a success happened after failures.",
          "Explain the observation before changing the case."
        ]
      }
    }
  ],
  "lab": {
    "kind": "spl",
    "scenarioId": scenarioId,
    "intro": "Use this educational simulator to practice [[correlation-search]]. Explain each decision using the supplied scenario evidence.",
    "objectives": [
      {
        "id": "l04-o1",
        "title": "Inspect failures",
        "instruction": "Complete the [[correlation-search]] exercise: Inspect failures.",
        "action": {
          "type": "click",
          "target": "spl-exercise-pass:l04-x1"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Complete the [[correlation-search]] exercise: Inspect failures."
        ],
        "why": "A detection needs reproducible tests and an explanation of its limits.",
        "skill": "detection"
      },
      {
        "id": "l04-o2",
        "title": "Count by identity and source",
        "instruction": "Complete the [[correlation-search]] exercise: Count by identity and source.",
        "action": {
          "type": "click",
          "target": "spl-exercise-pass:l04-x2"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Complete the [[correlation-search]] exercise: Count by identity and source."
        ],
        "why": "A detection needs reproducible tests and an explanation of its limits.",
        "skill": "detection"
      },
      {
        "id": "l04-o3",
        "title": "Keep the burst",
        "instruction": "Complete the [[correlation-search]] exercise: Keep the burst.",
        "action": {
          "type": "click",
          "target": "spl-exercise-pass:l04-x3"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Complete the [[correlation-search]] exercise: Keep the burst."
        ],
        "why": "A detection needs reproducible tests and an explanation of its limits.",
        "skill": "detection"
      },
      {
        "id": "l04-o4",
        "title": "Check the benign contrast",
        "instruction": "Complete the [[correlation-search]] exercise: Check the benign contrast.",
        "action": {
          "type": "click",
          "target": "spl-exercise-pass:l04-x4"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Complete the [[correlation-search]] exercise: Check the benign contrast."
        ],
        "why": "A detection needs reproducible tests and an explanation of its limits.",
        "skill": "detection"
      },
      {
        "id": "l04-o5",
        "title": "Find failure and success co-occurrence",
        "instruction": "Complete the [[correlation-search]] exercise: Find failure and success co-occurrence.",
        "action": {
          "type": "click",
          "target": "spl-exercise-pass:l04-x5"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Complete the [[correlation-search]] exercise: Find failure and success co-occurrence."
        ],
        "why": "A detection needs reproducible tests and an explanation of its limits.",
        "skill": "detection"
      },
      {
        "id": "l04-o6",
        "title": "Verify time order",
        "instruction": "Complete the [[correlation-search]] exercise: Verify time order.",
        "action": {
          "type": "click",
          "target": "spl-exercise-pass:l04-x6"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Complete the [[correlation-search]] exercise: Verify time order."
        ],
        "why": "A detection needs reproducible tests and an explanation of its limits.",
        "skill": "detection"
      }
    ],
    "splExercises": [
      {
        "id": "l04-x1",
        "title": "Inspect failures",
        "task": "List failed authentication fields.",
        "starter": "index=auth",
        "solution": "index=auth EventCode=4625 | table user src_ip dest Logon_Type action",
        "hints": [
          "Decide which observation the hypothesis needs.",
          "Separate raw events from aggregated groups.",
          "Check the grouping fields and output columns.",
          "For example, stats count by dest groups observations by destination.",
          "index=auth EventCode=4625 | table user src_ip dest Logon_Type action"
        ],
        "explanation": "The output preserves authentication context.",
        "validate": {
          "mustContain": [
            "eventcode=4625",
            "table"
          ],
          "minRows": 1,
          "mustProduceCols": [
            "user",
            "src_ip",
            "dest",
            "Logon_Type",
            "action"
          ]
        }
      },
      {
        "id": "l04-x2",
        "title": "Count by identity and source",
        "task": "Count failures for each user and source.",
        "starter": "index=auth",
        "solution": "index=auth action=failure | stats count by user, src_ip",
        "hints": [
          "Decide which observation the hypothesis needs.",
          "Separate raw events from aggregated groups.",
          "Check the grouping fields and output columns.",
          "For example, stats count by dest groups observations by destination.",
          "index=auth action=failure | stats count by user, src_ip"
        ],
        "explanation": "The attack contributes 42 failures for j.doe from one source.",
        "validate": {
          "mustContain": [
            "stats count",
            "by user",
            "src_ip"
          ],
          "minRows": 1,
          "mustProduceCols": [
            "user",
            "src_ip",
            "count"
          ]
        }
      },
      {
        "id": "l04-x3",
        "title": "Keep the burst",
        "task": "Keep groups with more than 20 failures.",
        "starter": "index=auth",
        "solution": "index=auth action=failure | stats count by user, src_ip | where count > 20",
        "hints": [
          "Decide which observation the hypothesis needs.",
          "Separate raw events from aggregated groups.",
          "Check the grouping fields and output columns.",
          "For example, stats count by dest groups observations by destination.",
          "index=auth action=failure | stats count by user, src_ip | where count > 20"
        ],
        "explanation": "Only the attack burst exceeds this scenario threshold.",
        "validate": {
          "mustContain": [
            "stats count",
            "where count > 20"
          ],
          "minRows": 1,
          "maxRows": 1,
          "mustProduceCols": [
            "user",
            "src_ip",
            "count"
          ]
        }
      },
      {
        "id": "l04-x4",
        "title": "Check the benign contrast",
        "task": "Confirm a.kumar has three failures; retain that row for comparison.",
        "starter": "index=auth",
        "solution": "index=auth action=failure user=a.kumar | stats count by user, src_ip",
        "hints": [
          "Decide which observation the hypothesis needs.",
          "Separate raw events from aggregated groups.",
          "Check the grouping fields and output columns.",
          "For example, stats count by dest groups observations by destination.",
          "index=auth action=failure user=a.kumar | stats count by user, src_ip"
        ],
        "explanation": "Three typo failures remain below the threshold; low counts alone are not proof of safety.",
        "validate": {
          "mustContain": [
            "user=a.kumar",
            "stats count"
          ],
          "minRows": 1,
          "maxRows": 1,
          "mustProduceCols": [
            "user",
            "src_ip",
            "count"
          ]
        }
      },
      {
        "id": "l04-x5",
        "title": "Find failure and success co-occurrence",
        "task": "Count failures and successes by source, then retain sources with more than 20 failures and at least one success.",
        "starter": "index=auth",
        "solution": "index=auth | eval failed=if(action=\"failure\",1,0) | eval succeeded=if(action=\"success\",1,0) | stats sum(failed) as failures sum(succeeded) as successes by src_ip | where failures > 20 AND successes > 0",
        "hints": [
          "Decide which observation the hypothesis needs.",
          "Separate raw events from aggregated groups.",
          "Check the grouping fields and output columns.",
          "For example, stats count by dest groups observations by destination.",
          "index=auth | eval failed=if(action=\"failure\",1,0) | eval succeeded=if(action=\"success\",1,0) | stats sum(failed) as failures sum(succeeded) as successes by src_ip | where failures > 20 AND successes > 0"
        ],
        "explanation": "This identifies co-occurrence, not order. The next exercise checks time.",
        "validate": {
          "mustContain": [
            "eval failed=",
            "sum(failed) as failures",
            "sum(succeeded) as successes",
            "by src_ip",
            "where failures > 20"
          ],
          "minRows": 1,
          "maxRows": 1,
          "mustProduceCols": [
            "src_ip",
            "failures",
            "successes"
          ]
        }
      },
      {
        "id": "l04-x6",
        "title": "Verify time order",
        "task": "Inspect the suspicious source in chronological order to verify the success follows the burst.",
        "starter": "index=auth",
        "solution": "index=auth src_ip=203.0.113.5 | sort _time | table _time user src_ip action EventCode",
        "hints": [
          "Decide which observation the hypothesis needs.",
          "Separate raw events from aggregated groups.",
          "Check the grouping fields and output columns.",
          "For example, stats count by dest groups observations by destination.",
          "index=auth src_ip=203.0.113.5 | sort _time | table _time user src_ip action EventCode"
        ],
        "explanation": "The failures precede the success; inspect times rather than inferring order from counts.",
        "validate": {
          "mustContain": [
            "src_ip=203.0.113.5",
            "sort _time",
            "table"
          ],
          "minRows": 1,
          "mustProduceCols": [
            "_time",
            "user",
            "src_ip",
            "action",
            "EventCode"
          ]
        }
      }
    ]
  },
  "assessment": [
    {
      "id": "l04-q1",
      "prompt": "Which grouping separates people and sources?",
      "options": [
        "user, src_ip",
        "action only",
        "EventCode only",
        "count only"
      ],
      "answer": 0,
      "explain": "Group by the entities relevant to the hypothesis.",
      "skill": "detection"
    },
    {
      "id": "l04-q2",
      "prompt": "What does count > 20 exclude here?",
      "options": [
        "a.kumar’s three failures",
        "The 42 failures",
        "Every success forever",
        "All external traffic"
      ],
      "answer": 0,
      "explain": "Three is below the threshold.",
      "skill": "detection"
    },
    {
      "id": "l04-q3",
      "prompt": "What does a shared failure/success group prove?",
      "options": [
        "Co-occurrence in the searched data",
        "Exact temporal order",
        "Malware execution",
        "A password reset"
      ],
      "answer": 0,
      "explain": "Inspect event times to verify sequence.",
      "skill": "detection"
    },
    {
      "id": "l04-q4",
      "prompt": "Why test a baseline?",
      "options": [
        "To understand normal behavior",
        "To eliminate every miss",
        "To guarantee maliciousness",
        "To remove all successes"
      ],
      "answer": 0,
      "explain": "Normal behavior informs threshold tuning.",
      "skill": "detection"
    },
    {
      "id": "l04-q5",
      "prompt": "Which EventCode is a successful logon?",
      "options": [
        "4624",
        "4625",
        "4698",
        "1"
      ],
      "answer": 0,
      "explain": "4624 represents successful Windows authentication.",
      "skill": "detection"
    },
    {
      "id": "l04-q6",
      "prompt": "What could evade this rule?",
      "options": [
        "Slow guesses under the threshold",
        "A 42-failure burst",
        "A matching count above 20",
        "A table column"
      ],
      "answer": 0,
      "explain": "A count threshold can miss low-and-slow attempts.",
      "skill": "detection"
    }
  ],
  "reflection": [
    {
      "id": "l04-r1",
      "prompt": "Which observation most changed your conclusion, and why?",
      "placeholder": "Name the event or field and explain its significance."
    },
    {
      "id": "l04-r2",
      "prompt": "What uncertainty would you investigate next?",
      "placeholder": "State a competing explanation and the telemetry needed."
    }
  ],
  "mentorBriefing": "Begin with [[correlation-search]] as a reasoning task, not a button sequence. Read the supplied events and distinguish facts from assumptions. Explain what would change your conclusion. Use the simulator to practice a concise, evidence-based handoff.",
  "challenges": [
    "What benign explanation could fit the first signal?",
    "Which missing event would change your decision?",
    "How does the search or scoring window affect the conclusion?",
    "What evidence would you include in a handoff, and why?"
  ]
};
