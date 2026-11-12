import type { Lesson } from "../../types";

export const LESSON_09: Lesson = {
  "id": "l09",
  "number": 9,
  "title": "Incident Response: Ransomware",
  "tagline": "Make six decisions that stop harm and support recovery.",
  "durationMin": 60,
  "scenarioId": "ransomware",
  "heroTermIds": [
    "ransomware",
    "ir-lifecycle",
    "containment",
    "eradication",
    "recovery",
    "chain-of-custody",
    "evidence"
  ],
  "objectives": [
    "Identify a ransomware incident from linked evidence.",
    "Choose proportionate host and identity containment.",
    "Distinguish eradication from recovery.",
    "Define safe restore gates and measurable improvements."
  ],
  "concept": [
    {
      "kind": "heading",
      "text": "Stop harm, preserve context"
    },
    {
      "kind": "p",
      "text": "[[ransomware]] response is coordinated work across incident leadership, endpoint, identity, network, backup, and business teams. Follow your authority and [[playbook]]."
    },
    {
      "kind": "flow",
      "title": "Response sequence",
      "steps": [
        "Identify",
        "Contain hosts",
        "Contain identities and spread",
        "Eradicate",
        "Recover",
        "Learn"
      ]
    },
    {
      "kind": "table",
      "title": "Observed chain",
      "cols": [
        "Host",
        "Evidence"
      ],
      "rows": [
        [
          "jump01",
          "External svc-backup RDP; Defender disabled"
        ],
        [
          "fs01",
          "PSEXESVC; vssadmin deletion"
        ],
        [
          "fs01",
          "lockx.exe; .lockx files; README_LOCKX.txt"
        ],
        [
          "Network",
          "SMB from fs01 to a neighbour"
        ]
      ]
    },
    {
      "kind": "p",
      "text": "A [[chain-of-custody]] record states who collected evidence, when, how, and where it was stored. Preserve originals and document response changes."
    },
    {
      "kind": "callout",
      "tone": "warn",
      "title": "Do not let collection prolong encryption",
      "text": "Preserve volatile [[evidence]] when feasible, but coordinate urgent isolation while active damage continues."
    },
    {
      "kind": "grid",
      "items": [
        {
          "title": "Containment",
          "text": "[[containment]] limits current access and spread."
        },
        {
          "title": "Eradication",
          "text": "[[eradication]] removes footholds and closes entry paths."
        },
        {
          "title": "Recovery",
          "text": "[[recovery]] validates trusted services and data before reconnection."
        }
      ]
    },
    {
      "kind": "p",
      "text": "Blocking the external address alone does not revoke svc-backup sessions or stop internal SMB. Investigate neighbours rather than assuming they are compromised or clean."
    },
    {
      "kind": "code",
      "title": "Recognize destructive intent",
      "code": "vssadmin.exe delete shadows /all /quiet",
      "explain": [
        "This removes a local recovery path. It does not prove that offline backups are affected."
      ]
    },
    {
      "kind": "callout",
      "tone": "info",
      "title": "Make improvement measurable",
      "text": "Assign an owner, deadline, and validation exercise to each lessons-learned action."
    }
  ],
  "visual": [
    {
      "kind": "flow",
      "title": "Containment has two fronts",
      "steps": [
        "Isolate affected hosts",
        "Restrict exposed identity",
        "Check SMB neighbours"
      ]
    },
    {
      "kind": "timeline",
      "title": "Observed escalation",
      "items": [
        {
          "time": "01:41",
          "label": "RDP to jump01",
          "tone": "warn"
        },
        {
          "time": "01:49",
          "label": "PsExec to fs01",
          "tone": "danger"
        },
        {
          "time": "01:52",
          "label": "Shadow copies deleted",
          "tone": "danger"
        },
        {
          "time": "01:53",
          "label": "Encryption begins",
          "tone": "danger"
        }
      ]
    },
    {
      "kind": "compare",
      "title": "Different response goals",
      "left": {
        "title": "Contain",
        "points": [
          "Stop current spread",
          "Preserve responder access"
        ]
      },
      "right": {
        "title": "Recover",
        "points": [
          "Validate clean backups",
          "Restore and monitor in stages"
        ]
      }
    }
  ],
  "demo": [
    {
      "id": "l09-d1",
      "title": "Identify the chain",
      "narration": "Use [[triage]] to link access and destructive activity.",
      "screen": {
        "area": "IR decisions",
        "focus": "Identification",
        "detail": [
          "svc-backup → jump01",
          "Defender disabled",
          "PsExec → fs01"
        ]
      }
    },
    {
      "id": "l09-d2",
      "title": "Stop spread",
      "narration": "Coordinate [[containment]] with response owners.",
      "screen": {
        "area": "IR decisions",
        "focus": "Containment",
        "detail": [
          "Isolate affected hosts",
          "Restrict exposed identity",
          "Check SMB neighbours"
        ]
      }
    },
    {
      "id": "l09-d3",
      "title": "Restore trust",
      "narration": "Do not confuse [[eradication]] with a quick reboot.",
      "screen": {
        "area": "IR decisions",
        "focus": "Eradication and recovery",
        "detail": [
          "Preserve evidence",
          "Rebuild and close entry paths",
          "Test offline backups"
        ]
      }
    },
    {
      "id": "l09-d4",
      "title": "Close with improvements",
      "narration": "Use the [[playbook]] review to assign follow-up work.",
      "screen": {
        "area": "IR decisions",
        "focus": "Lessons learned",
        "detail": [
          "Timeline and decision rationale",
          "Named owners and deadlines",
          "Restore and detection validation"
        ]
      }
    }
  ],
  "lab": {
    "kind": "ir",
    "scenarioId": "ransomware",
    "intro": "Choose the safest next action at each phase. These decisions simulate response planning; they do not change real hosts.",
    "objectives": [
      {
        "id": "l09-o1",
        "title": "Identify and escalate",
        "instruction": "Use the [[ir-lifecycle]] decision for identification; weigh evidence preservation and immediate harm.",
        "action": {
          "type": "select",
          "target": "ir-decision",
          "value": "identify=act"
        },
        "hints": [
          "Response should reduce harm while retaining useful evidence.",
          "Identify what this phase must achieve before comparing options.",
          "Review the host, identity, and access-path details in the situation.",
          "For example, stopping one process does not revoke stolen credentials.",
          "Choose: Declare and escalate the incident with the linked records."
        ],
        "why": "The incident team gets scope, ownership, and evidence for urgent decisions.",
        "skill": "triage"
      },
      {
        "id": "l09-o2",
        "title": "Contain active hosts",
        "instruction": "Use the [[ir-lifecycle]] decision for containment; weigh evidence preservation and immediate harm.",
        "action": {
          "type": "select",
          "target": "ir-decision",
          "value": "isolate=act"
        },
        "hints": [
          "Response should reduce harm while retaining useful evidence.",
          "Identify what this phase must achieve before comparing options.",
          "Review the host, identity, and access-path details in the situation.",
          "For example, stopping one process does not revoke stolen credentials.",
          "Choose: Coordinate network isolation of jump01 and fs01 while retaining responder access and available evidence."
        ],
        "why": "Isolation interrupts spread; responders preserve volatile evidence when feasible without delaying urgent containment.",
        "skill": "response"
      },
      {
        "id": "l09-o3",
        "title": "Contain identity and spread",
        "instruction": "Use the [[ir-lifecycle]] decision for containment; weigh evidence preservation and immediate harm.",
        "action": {
          "type": "select",
          "target": "ir-decision",
          "value": "scope=act"
        },
        "hints": [
          "Response should reduce harm while retaining useful evidence.",
          "Identify what this phase must achieve before comparing options.",
          "Review the host, identity, and access-path details in the situation.",
          "For example, stopping one process does not revoke stolen credentials.",
          "Choose: Disable exposed svc-backup access, revoke sessions where supported, restrict SMB paths, and investigate contacted hosts."
        ],
        "why": "Identity and network controls reduce reinfection paths while the team checks neighbours.",
        "skill": "response"
      },
      {
        "id": "l09-o4",
        "title": "Remove footholds",
        "instruction": "Use the [[ir-lifecycle]] decision for eradication; weigh evidence preservation and immediate harm.",
        "action": {
          "type": "select",
          "target": "ir-decision",
          "value": "eradicate=act"
        },
        "hints": [
          "Response should reduce harm while retaining useful evidence.",
          "Identify what this phase must achieve before comparing options.",
          "Review the host, identity, and access-path details in the situation.",
          "For example, stopping one process does not revoke stolen credentials.",
          "Choose: After preserving evidence, rebuild compromised hosts from trusted images, remove persistence, remediate exposed RDP, and rotate affected secrets."
        ],
        "why": "The team removes footholds and closes entry paths before restoration.",
        "skill": "response"
      },
      {
        "id": "l09-o5",
        "title": "Validate recovery",
        "instruction": "Use the [[ir-lifecycle]] decision for recovery; weigh evidence preservation and immediate harm.",
        "action": {
          "type": "select",
          "target": "ir-decision",
          "value": "restore=act"
        },
        "hints": [
          "Response should reduce harm while retaining useful evidence.",
          "Identify what this phase must achieve before comparing options.",
          "Review the host, identity, and access-path details in the situation.",
          "For example, stopping one process does not revoke stolen credentials.",
          "Choose: Validate offline backups, test restoration on clean isolated systems, then reconnect in stages with monitoring."
        ],
        "why": "Business owners can verify data and functionality before exposure increases.",
        "skill": "response"
      },
      {
        "id": "l09-o6",
        "title": "Improve the playbook",
        "instruction": "Use the [[ir-lifecycle]] decision for lessons-learned; weigh evidence preservation and immediate harm.",
        "action": {
          "type": "select",
          "target": "ir-decision",
          "value": "learn=act"
        },
        "hints": [
          "Response should reduce harm while retaining useful evidence.",
          "Identify what this phase must achieve before comparing options.",
          "Review the host, identity, and access-path details in the situation.",
          "For example, stopping one process does not revoke stolen credentials.",
          "Choose: Assign owners and deadlines for RDP hardening, identity controls, tamper alerts, segmentation, and restore drills."
        ],
        "why": "Specific improvements can be tested and tracked without blaming individuals.",
        "skill": "response"
      },
      {
        "id": "l09-o7",
        "title": "Complete the response review",
        "instruction": "Finish all decisions and complete the [[ir-lifecycle]] exercise.",
        "action": {
          "type": "click",
          "target": "ir-complete"
        },
        "hints": [
          "Separate observed behavior from assumptions.",
          "Review the relevant evidence before choosing an action.",
          "Compare the available labels with the host, user, and behavior fields.",
          "For example, a trusted tool can still be abused; its name alone is not a verdict.",
          "Click Complete after the final decision."
        ],
        "why": "Record an evidence-based decision that another analyst can review.",
        "skill": "response"
      }
    ],
    "irNodes": [
      {
        "id": "identify",
        "phase": "identification",
        "situation": "svc-backup used RDP from 91.240.118.33 into jump01. Defender was disabled; PsExec installed PSEXESVC on fs01. These linked [[evidence]] records suggest a growing [[incident]].",
        "question": "What should the analyst do first?",
        "options": [
          {
            "id": "verify",
            "label": "Dismiss it because svc-backup is a service account.",
            "correct": false,
            "consequence": "A familiar account name does not explain the external interactive logon."
          },
          {
            "id": "act",
            "label": "Declare and escalate the incident with the linked records.",
            "correct": true,
            "consequence": "The incident team gets scope, ownership, and evidence for urgent decisions."
          },
          {
            "id": "defer",
            "label": "Wait for every host to fail.",
            "correct": false,
            "consequence": "Delay gives the attacker time to expand."
          }
        ]
      },
      {
        "id": "isolate",
        "phase": "containment",
        "situation": "fs01 shows vssadmin delete shadows, .lockx encryption, and README_LOCKX.txt. Active [[ransomware]] makes rapid [[containment]] urgent.",
        "question": "What is the safest immediate host action?",
        "options": [
          {
            "id": "verify",
            "label": "Delete all logs and reboot both hosts.",
            "correct": false,
            "consequence": "Logs and volatile evidence may be lost without stopping the access path."
          },
          {
            "id": "act",
            "label": "Coordinate network isolation of jump01 and fs01 while retaining responder access and available evidence.",
            "correct": true,
            "consequence": "Isolation interrupts spread; responders preserve volatile evidence when feasible without delaying urgent containment."
          },
          {
            "id": "defer",
            "label": "Restore files while both hosts remain connected.",
            "correct": false,
            "consequence": "The attacker may encrypt the restored data."
          }
        ]
      },
      {
        "id": "scope",
        "phase": "containment",
        "situation": "fs01 is attempting SMB to neighbours. The svc-backup identity remains exposed; [[lateral-movement]] may extend beyond the known hosts.",
        "question": "How should containment expand?",
        "options": [
          {
            "id": "verify",
            "label": "Block only 91.240.118.33.",
            "correct": false,
            "consequence": "Existing sessions and internal SMB movement can continue."
          },
          {
            "id": "act",
            "label": "Disable exposed svc-backup access, revoke sessions where supported, restrict SMB paths, and investigate contacted hosts.",
            "correct": true,
            "consequence": "Identity and network controls reduce reinfection paths while the team checks neighbours."
          },
          {
            "id": "defer",
            "label": "Mark every neighbour clean without checking.",
            "correct": false,
            "consequence": "Unexamined neighbours can retain attacker access."
          }
        ]
      },
      {
        "id": "eradicate",
        "phase": "eradication",
        "situation": "The malicious chain includes PsExec, Defender tampering, and vssadmin deletion. [[eradication]] must address access paths, not just README_LOCKX.txt.",
        "question": "What best removes the attacker foothold?",
        "options": [
          {
            "id": "verify",
            "label": "Delete the ransom note only.",
            "correct": false,
            "consequence": "Removing the note does not remove malware or stolen access."
          },
          {
            "id": "act",
            "label": "After preserving evidence, rebuild compromised hosts from trusted images, remove persistence, remediate exposed RDP, and rotate affected secrets.",
            "correct": true,
            "consequence": "The team removes footholds and closes entry paths before restoration."
          },
          {
            "id": "defer",
            "label": "Re-enable Defender and declare success.",
            "correct": false,
            "consequence": "A single control change cannot establish a trustworthy host."
          }
        ]
      },
      {
        "id": "restore",
        "phase": "recovery",
        "situation": "Shadow copies were deleted; finance files have .lockx extensions. External backup integrity is not established by the scenario. [[recovery]] requires validation.",
        "question": "What is the right recovery gate?",
        "options": [
          {
            "id": "verify",
            "label": "Assume all backups are clean.",
            "correct": false,
            "consequence": "Compromised or incomplete backups can reintroduce harm."
          },
          {
            "id": "act",
            "label": "Validate offline backups, test restoration on clean isolated systems, then reconnect in stages with monitoring.",
            "correct": true,
            "consequence": "Business owners can verify data and functionality before exposure increases."
          },
          {
            "id": "defer",
            "label": "Reconnect first and test later.",
            "correct": false,
            "consequence": "Reconnection before validation risks further encryption."
          }
        ]
      },
      {
        "id": "learn",
        "phase": "lessons-learned",
        "situation": "After approved [[recovery]], the team reviews svc-backup RDP, Defender tampering, PsExec, shadow deletion, encryption, and SMB spread using a [[playbook]].",
        "question": "What makes the review actionable?",
        "options": [
          {
            "id": "verify",
            "label": "Blame the on-call analyst and close the case.",
            "correct": false,
            "consequence": "Blame discourages reporting and leaves systemic weaknesses unresolved."
          },
          {
            "id": "act",
            "label": "Assign owners and deadlines for RDP hardening, identity controls, tamper alerts, segmentation, and restore drills.",
            "correct": true,
            "consequence": "Specific improvements can be tested and tracked without blaming individuals."
          },
          {
            "id": "defer",
            "label": "Store only the ransom note as the final report.",
            "correct": false,
            "consequence": "A note alone cannot explain the intrusion or validate response improvements."
          }
        ]
      }
    ]
  },
  "assessment": [
    {
      "id": "l09-q1",
      "prompt": "What most strongly supports urgent response?",
      "options": [
        "A service-account name alone",
        "An approved scan",
        "Linked tampering, shadow deletion, and encryption",
        "A single successful login with no context"
      ],
      "answer": 2,
      "explain": "The linked destructive behaviors establish immediate harm.",
      "skill": "triage"
    },
    {
      "id": "l09-q2",
      "prompt": "Why is an IP block alone insufficient?",
      "options": [
        "It restores files",
        "Internal access and sessions can remain",
        "It rotates credentials",
        "It isolates all endpoints"
      ],
      "answer": 1,
      "explain": "Containment must address identities and internal movement.",
      "skill": "response"
    },
    {
      "id": "l09-q3",
      "prompt": "What does vssadmin delete shadows indicate?",
      "options": [
        "A clean backup test",
        "Normal account creation",
        "Successful eradication",
        "Removal of local recovery copies"
      ],
      "answer": 3,
      "explain": "Deleting shadow copies inhibits local recovery.",
      "skill": "response"
    },
    {
      "id": "l09-q4",
      "prompt": "What should precede reconnection?",
      "options": [
        "Clean rebuild and validated restore testing",
        "Deleting the note only",
        "Disabling logs",
        "Assuming backups are clean"
      ],
      "answer": 0,
      "explain": "Recovery depends on a trusted environment and verified data.",
      "skill": "response"
    },
    {
      "id": "l09-q5",
      "prompt": "How should evidence collection affect urgent isolation?",
      "options": [
        "Always postpone isolation for a day",
        "Coordinate preservation without prolonging active harm",
        "Skip documenting actions",
        "Publish raw evidence publicly"
      ],
      "answer": 1,
      "explain": "Collection and containment should be coordinated according to risk and authority.",
      "skill": "response"
    },
    {
      "id": "l09-q6",
      "prompt": "Which review output is most useful?",
      "options": [
        "A blame list",
        "An unowned recommendation",
        "An assigned control improvement with a test and deadline",
        "A declaration that ransomware is impossible now"
      ],
      "answer": 2,
      "explain": "Owned, testable actions turn lessons into improvements.",
      "skill": "response"
    }
  ],
  "reflection": [
    {
      "id": "l09-r1",
      "prompt": "Which observation most changed your judgment, and why?",
      "placeholder": "Name the observation and the decision it supported."
    },
    {
      "id": "l09-r2",
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
