import type { Lesson } from "../../types";
import { C2_BEACON } from "../scenarios";
const beaconId = C2_BEACON.mitreMap.find((m) => m.techniqueId === "T1071.001")!.eventIds[0];

export const LESSON_06: Lesson = {
  "id": "l06",
  "number": 6,
  "title": "Investigation & Threat Hunting",
  "tagline": "Follow a beacon from hypothesis to handoff.",
  "durationMin": 70,
  "scenarioId": "c2-beacon",
  "heroTermIds": [
    "threat-hunting",
    "beaconing",
    "c2",
    "evidence",
    "technique",
    "threat-intel"
  ],
  "objectives": [
    "Test a hypothesis with network events.",
    "Distinguish collection hosts from affected endpoints.",
    "Preserve evidence and map a supported technique.",
    "Escalate a scoped investigation with justified severity."
  ],
  "concept": [
    {
      "kind": "heading",
      "text": "Ask a testable question"
    },
    {
      "kind": "p",
      "text": "[[threat-hunting]] starts with a hypothesis: is a workstation repeatedly contacting suspicious infrastructure after executing a fake update?"
    },
    {
      "kind": "p",
      "text": "Download, execution, DNS resolution, repeated HTTPS sessions, and discovery form the observed sequence. A timeline can support a causal hypothesis, not prove every link."
    },
    {
      "kind": "p",
      "text": "Twenty sessions to 198.51.100.77 occur roughly 60 seconds apart with small, similar byte counts. [[beaconing]] can also occur in benign software."
    },
    {
      "kind": "p",
      "text": "The source host is ws-eng-04; the firewall host is only the collector. Link src_host and source IP to endpoint process telemetry."
    },
    {
      "kind": "p",
      "text": "Attach the relevant [[evidence]] and map HTTPS command-and-control behavior to T1071.001. Port 443 alone is not enough to establish malicious intent."
    },
    {
      "kind": "p",
      "text": "State what is known, what remains uncertain, and why critical severity is justified by execution, sustained [[c2]], and follow-on discovery."
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
        "Ask a testable question",
        "Build the timeline",
        "Measure the pattern",
        "Connect endpoint and network"
      ]
    },
    {
      "kind": "layers",
      "title": "Three reasoning layers",
      "lanes": [
        {
          "label": "Telemetry",
          "items": [
            "Download, execution, DNS resolution, repeated HTTPS sessions, and discovery form the observed sequence. A timeline can support a causal hypothesis, not prove every link."
          ]
        },
        {
          "label": "Interpretation",
          "items": [
            "Twenty sessions to 198.51.100.77 occur roughly 60 seconds apart with small, similar byte counts. [[beaconing]] can also occur in benign software."
          ]
        },
        {
          "label": "Decision",
          "items": [
            "State what is known, what remains uncertain, and why critical severity is justified by execution, sustained [[c2]], and follow-on discovery."
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
      "id": "l06-d1",
      "title": "Ask a testable question",
      "narration": "[[threat-hunting]] starts with a hypothesis: is a workstation repeatedly contacting suspicious infrastructure after executing a fake update?",
      "screen": {
        "area": "Investigation Workspace",
        "focus": "Ask a testable question",
        "detail": [
          "[[threat-hunting]] starts with a hypothesis: is a workstation repeatedly contacting suspicious infrastructure after executing a fake update?",
          "Explain the observation before changing the case."
        ]
      }
    },
    {
      "id": "l06-d2",
      "title": "Build the timeline",
      "narration": "Download, execution, DNS resolution, repeated HTTPS sessions, and discovery form the observed sequence. A timeline can support a causal hypothesis, not prove every link.",
      "screen": {
        "area": "Investigation Workspace",
        "focus": "Build the timeline",
        "detail": [
          "Download, execution, DNS resolution, repeated HTTPS sessions, and discovery form the observed sequence. A timeline can support a causal hypothesis, not prove every link.",
          "Explain the observation before changing the case."
        ],
        "spl": "index=firewall dest_ip=198.51.100.77 | sort _time | table _time src_host src_ip dest_ip bytes process"
      }
    },
    {
      "id": "l06-d3",
      "title": "Measure the pattern",
      "narration": "Twenty sessions to 198.51.100.77 occur roughly 60 seconds apart with small, similar byte counts. [[beaconing]] can also occur in benign software.",
      "screen": {
        "area": "Investigation Workspace",
        "focus": "Measure the pattern",
        "detail": [
          "Twenty sessions to 198.51.100.77 occur roughly 60 seconds apart with small, similar byte counts. [[beaconing]] can also occur in benign software.",
          "Explain the observation before changing the case."
        ]
      }
    },
    {
      "id": "l06-d4",
      "title": "Connect endpoint and network",
      "narration": "The source host is ws-eng-04; the firewall host is only the collector. Link src_host and source IP to endpoint process telemetry.",
      "screen": {
        "area": "Investigation Workspace",
        "focus": "Connect endpoint and network",
        "detail": [
          "The source host is ws-eng-04; the firewall host is only the collector. Link src_host and source IP to endpoint process telemetry.",
          "Explain the observation before changing the case."
        ]
      }
    }
  ],
  "lab": {
    "kind": "investigation",
    "scenarioId": "c2-beacon",
    "intro": "Use this educational simulator to practice [[threat-hunting]]. Explain each decision using the supplied scenario evidence.",
    "objectives": [
      {
        "id": "l06-o1",
        "title": "Establish chronology",
        "instruction": "Navigate to the [[evidence]] timeline.",
        "action": {
          "type": "navigate",
          "to": "timeline"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Navigate to the [[evidence]] timeline."
        ],
        "why": "A scoped investigation connects local execution to network behavior and preserves a reviewable handoff.",
        "skill": "investigation"
      },
      {
        "id": "l06-o2",
        "title": "Test the destination",
        "instruction": "In Events, run [[spl]] containing dest_ip=198.51.100.77.",
        "action": {
          "type": "run-spl",
          "contains": "198.51.100.77"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "In Events, run [[spl]] containing dest_ip=198.51.100.77."
        ],
        "why": "A scoped investigation connects local execution to network behavior and preserves a reviewable handoff.",
        "skill": "investigation"
      },
      {
        "id": "l06-o3",
        "title": "Inspect and preserve",
        "instruction": "Open a [[beaconing]] event, inspect it, and add it to evidence.",
        "action": {
          "type": "click",
          "target": `add-evidence:${beaconId}`
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Open a [[beaconing]] event, inspect it, and add it to evidence."
        ],
        "why": "A scoped investigation connects local execution to network behavior and preserves a reviewable handoff.",
        "skill": "investigation"
      },
      {
        "id": "l06-o4",
        "title": "Tag the affected host",
        "instruction": "Tag ws-eng-04 as compromised; tag 198.51.100.77 as attacker after reviewing [[evidence]].",
        "action": {
          "type": "select",
          "target": "tag-entity",
          "value": "ws-eng-04=compromised"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Tag ws-eng-04 as compromised; tag 198.51.100.77 as attacker after reviewing [[evidence]]."
        ],
        "why": "A scoped investigation connects local execution to network behavior and preserves a reviewable handoff.",
        "skill": "investigation"
      },
      {
        "id": "l06-o5",
        "title": "Enrich the destination",
        "instruction": "Look up 198.51.100.77 in [[threat-intel]].",
        "action": {
          "type": "click",
          "target": "lookup-intel:198.51.100.77"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Look up 198.51.100.77 in [[threat-intel]]."
        ],
        "why": "A scoped investigation connects local execution to network behavior and preserves a reviewable handoff.",
        "skill": "intel"
      },
      {
        "id": "l06-o6",
        "title": "Map the behavior",
        "instruction": "Map [[technique]] T1071.001 to the observed HTTPS C2 behavior.",
        "action": {
          "type": "select",
          "target": "map-technique",
          "value": "T1071.001"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Map [[technique]] T1071.001 to the observed HTTPS C2 behavior."
        ],
        "why": "A scoped investigation connects local execution to network behavior and preserves a reviewable handoff.",
        "skill": "mitre"
      },
      {
        "id": "l06-o7",
        "title": "Identify the first affected system",
        "instruction": "Select ws-eng-04 as patient zero from the [[evidence]] timeline.",
        "action": {
          "type": "select",
          "target": "patient-zero",
          "value": "ws-eng-04"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Select ws-eng-04 as patient zero from the [[evidence]] timeline."
        ],
        "why": "A scoped investigation connects local execution to network behavior and preserves a reviewable handoff.",
        "skill": "investigation"
      },
      {
        "id": "l06-o8",
        "title": "Set severity and escalate",
        "instruction": "Set [[severity]] to critical, summarize execution, C2, and discovery, then escalate.",
        "action": {
          "type": "click",
          "target": "escalate"
        },
        "hints": [
          "Start with the evidence, not the alert label.",
          "Follow the current case through the relevant workspace.",
          "Check the control label and the entity before applying a change.",
          "For example, a workstation role describes the device; an IP role describes infrastructure.",
          "Set [[severity]] to critical, summarize execution, C2, and discovery, then escalate."
        ],
        "why": "A scoped investigation connects local execution to network behavior and preserves a reviewable handoff.",
        "skill": "investigation"
      }
    ]
  },
  "assessment": [
    {
      "id": "l06-q1",
      "prompt": "What best supports beaconing?",
      "options": [
        "Regular intervals and similar small payloads",
        "Port 443 alone",
        "One DNS answer",
        "Any browser process"
      ],
      "answer": 0,
      "explain": "Periodicity and size patterns support the hypothesis.",
      "skill": "investigation"
    },
    {
      "id": "l06-q2",
      "prompt": "Which is the affected endpoint?",
      "options": [
        "ws-eng-04",
        "fw-edge-01",
        "dns01",
        "The intel feed"
      ],
      "answer": 0,
      "explain": "src_host identifies the source endpoint, not the firewall collector.",
      "skill": "investigation"
    },
    {
      "id": "l06-q3",
      "prompt": "What does a saved event provide?",
      "options": [
        "Traceable evidence",
        "Automatic containment",
        "Guaranteed attribution",
        "A complete disk image"
      ],
      "answer": 0,
      "explain": "Preserved event context supports review.",
      "skill": "investigation"
    },
    {
      "id": "l06-q4",
      "prompt": "What maps to T1071.001 here?",
      "options": [
        "Observed HTTPS C2 pattern",
        "Every login",
        "Any local file",
        "A failed password"
      ],
      "answer": 0,
      "explain": "The mapping is tied to observed web-protocol C2 behavior.",
      "skill": "investigation"
    },
    {
      "id": "l06-q5",
      "prompt": "What is patient zero in this scenario?",
      "options": [
        "ws-eng-04",
        "The firewall",
        "Every workstation",
        "The external IP"
      ],
      "answer": 0,
      "explain": "The fake update first compromises ws-eng-04.",
      "skill": "investigation"
    },
    {
      "id": "l06-q6",
      "prompt": "What makes escalation useful?",
      "options": [
        "Scope, evidence, severity and next actions",
        "Only an IP",
        "Only a technique number",
        "Unqualified certainty"
      ],
      "answer": 0,
      "explain": "A responder needs a defensible handoff.",
      "skill": "investigation"
    }
  ],
  "reflection": [
    {
      "id": "l06-r1",
      "prompt": "Which observation most changed your conclusion, and why?",
      "placeholder": "Name the event or field and explain its significance."
    },
    {
      "id": "l06-r2",
      "prompt": "What uncertainty would you investigate next?",
      "placeholder": "State a competing explanation and the telemetry needed."
    }
  ],
  "mentorBriefing": "Begin with [[threat-hunting]] as a reasoning task, not a button sequence. Read the supplied events and distinguish facts from assumptions. Explain what would change your conclusion. Use the simulator to practice a concise, evidence-based handoff.",
  "challenges": [
    "What benign explanation could fit the first signal?",
    "Which missing event would change your decision?",
    "How does the search or scoring window affect the conclusion?",
    "What evidence would you include in a handoff, and why?"
  ]
};
