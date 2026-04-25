// Deep, exam-aligned, self-contained explanations for every SC-900 module.
// The goal: a student should never need to ask the trainer — every term, every
// "why", every "how", every common confusion is answered inline.

export type ExplanationSection = {
  heading: string;
  body: string;        // 1–3 short paragraphs
  bullets?: string[];  // optional supporting points
};

export type RealExample = {
  title: string;
  scenario: string;
  outcome: string;
};

export type KeyTerm = {
  term: string;
  definition: string;       // plain-language definition (1–2 sentences)
  alsoKnownAs?: string[];   // synonyms / acronyms
  example?: string;         // one-line concrete example
};

// A deep dive on a single concept inside the module.
// Each one is structured so a student can read it cold and need NO clarification.
export type ConceptDeepDive = {
  id: string;
  name: string;
  oneLine: string;          // 1-sentence definition (the "tweet" version)
  formal: string;           // textbook-style definition
  plainEnglish: string;     // how you'd explain it to a non-technical friend
  analogy: string;          // a real-world analogy
  howItWorks: string;       // mechanism / flow
  microsoftMapping: string; // exactly which Microsoft product/feature implements it
  whenToUse: string;        // "use this when…"
  whenNotToUse?: string;    // "don't use this when…"
  commonMistake: string;    // the #1 thing learners get wrong
  examAngle: string;        // how the exam phrases it
};

// Side-by-side comparison of two/three things students confuse.
export type Comparison = {
  title: string;
  columns: string[];        // first column is the criterion, rest are the things compared
  rows: string[][];         // each row matches columns length
  bottomLine: string;       // the one-sentence takeaway
};

// Pre-empted student question.
export type FAQ = { q: string; a: string };

// A self-check question to prove understanding before moving on.
export type SelfCheck = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;       // why the right answer is right AND why the others are wrong
};

export type ModuleExplanation = {
  moduleSlug: string;
  tagline: string;
  overview: string;
  whyItMatters: string;

  // 5W1H
  what: ExplanationSection;
  why: ExplanationSection;
  who: ExplanationSection;
  when: ExplanationSection;
  where: ExplanationSection;
  how: ExplanationSection;

  // Self-contained learning aids
  conceptDeepDives: ConceptDeepDive[];
  comparisons: Comparison[];
  realExamples: RealExample[];
  keyTerms: KeyTerm[];
  commonPitfalls: string[];
  faqs: FAQ[];
  selfCheck: SelfCheck[];
  examTips: string[];
  furtherReading: { label: string; url: string }[];
};

/* ============================================================== */
/* MODULE 1 — SECURITY CONCEPTS                                   */
/* ============================================================== */
const m1: ModuleExplanation = {
  moduleSlug: "concepts",
  tagline: "The mental model behind every Microsoft security product.",
  overview:
    "Module 1 establishes the vocabulary used across the entire SC-900 exam: Zero Trust, Defense in Depth, the CIA triad, threats vs. vulnerabilities, and the cloud shared responsibility model. Master these and the remaining four modules become much easier — every Defender, Entra, and Purview feature is just an implementation of one of these ideas.",
  whyItMatters:
    "Modern attacks bypass the network perimeter entirely (phishing, token theft, supply-chain). Organisations that still rely on a 'castle-and-moat' design are the ones in the headlines. Microsoft's entire security stack assumes Zero Trust, so understanding the principle is non-negotiable for any cloud role.",

  what: {
    heading: "What are security concepts?",
    body:
      "They are the strategic principles that determine how you design controls, where you put them, and how you measure them. Concepts are technology-agnostic: they apply equally to on-prem AD, Microsoft 365, AWS, or a hospital's medical devices.",
    bullets: [
      "Zero Trust — never trust, always verify; assume breach.",
      "Defense in Depth — overlapping layers (physical → identity → data).",
      "CIA triad — Confidentiality, Integrity, Availability.",
      "Threat / Vulnerability / Risk / Mitigation vocabulary.",
      "Shared responsibility model in IaaS / PaaS / SaaS.",
    ],
  },
  why: {
    heading: "Why do we need them?",
    body:
      "Without a model, security becomes a random pile of products. Concepts let architects justify spend ('this control covers integrity'), let auditors map evidence to a framework, and let engineers know which layer is failing when an incident happens.",
  },
  who: {
    heading: "Who is involved?",
    body:
      "Concepts are owned by security architects and CISOs but apply to everyone. Developers must understand CIA when designing APIs; helpdesk staff implement Zero Trust every time they verify a caller's identity; end users are the first layer of defence against phishing.",
    bullets: [
      "CISO / Security Architect — sets strategy.",
      "Cloud Engineer — implements controls.",
      "Compliance Officer — maps controls to regulation.",
      "End user — the human firewall.",
    ],
  },
  when: {
    heading: "When are they applied?",
    body:
      "Continuously. Zero Trust is evaluated on every sign-in, every API call, every file access. Defense in Depth is reviewed on every architecture decision. The CIA triad guides every backup, every encryption choice, every access policy — from design to decommissioning.",
  },
  where: {
    heading: "Where do they apply?",
    body:
      "Everywhere data flows: identity providers, devices, networks, applications, and the data itself. The shared responsibility model is the map — it tells you which layer the cloud provider secures and which layer is yours, so you don't leave gaps.",
  },
  how: {
    heading: "How are they implemented in Microsoft?",
    body:
      "Microsoft maps every product to one or more concepts: Entra ID enforces 'verify explicitly', Conditional Access enforces 'least privilege', Defender enforces 'assume breach', Purview enforces 'protect data wherever it lives'. SC-900 expects you to recognise this mapping.",
    bullets: [
      "Verify explicitly → MFA, Conditional Access, Identity Protection.",
      "Least privilege → RBAC, PIM, just-in-time access.",
      "Assume breach → Defender XDR, Sentinel, micro-segmentation.",
    ],
  },

  conceptDeepDives: [
    {
      id: "zero-trust",
      name: "Zero Trust",
      oneLine: "A security model that never trusts a request based on network location alone — every request is verified explicitly.",
      formal:
        "Zero Trust is a strategic security model built on three principles: verify explicitly (using all available signals), use least-privilege access (just-in-time and just-enough), and assume breach (segment, encrypt, and continuously monitor).",
      plainEnglish:
        "Don't assume someone is safe just because they're inside the office network. Every time they try to open something, prove again that they are who they say they are, and only let them touch what they need right now.",
      analogy:
        "Think of an airport. Even after you pass the front door, you still need a boarding pass to enter security, an ID at the gate, and the right ticket to enter the plane. Each checkpoint re-verifies you.",
      howItWorks:
        "A request (e.g. opening an email) carries signals: who you are, what device, where you are, what app, what risk score. A policy engine evaluates them in real time and either allows, requires step-up (MFA), or blocks.",
      microsoftMapping:
        "Conditional Access is the Microsoft policy engine. Entra ID supplies the identity signal, Intune supplies the device signal, Defender supplies the risk signal, and the engine decides.",
      whenToUse:
        "Always — Zero Trust is the default posture for any new design at Microsoft. It is especially critical for remote work, BYOD, and SaaS adoption.",
      whenNotToUse:
        "There's no 'don't use' case, but isolated air-gapped systems may rely on physical controls instead of network-aware Zero Trust.",
      commonMistake:
        "Thinking Zero Trust = no VPN. It's not about removing the VPN; it's about not granting access just because someone is on the VPN.",
      examAngle:
        "If a question contains 'verify explicitly', 'least privilege', or 'assume breach' — the correct answer is Zero Trust.",
    },
    {
      id: "defense-in-depth",
      name: "Defense in Depth",
      oneLine: "Layered security so that if one control fails, another catches the attack.",
      formal:
        "Defense in Depth is a strategy of placing multiple, independent security controls across physical, perimeter, network, compute, application, identity, and data layers, so that compromise of one layer does not equal compromise of the whole system.",
      plainEnglish:
        "Don't rely on one lock — use a fence, a door, a safe, and a guard. If a thief picks the lock, the safe still stops them.",
      analogy:
        "A medieval castle: moat, outer wall, inner wall, keep, and a locked treasury. Even if the moat is bridged, four more layers stand in the way.",
      howItWorks:
        "Each layer has its own controls: physical (locks, cameras), perimeter (firewalls), network (NSGs, segmentation), compute (host hardening), application (input validation), identity (MFA), data (encryption + DLP).",
      microsoftMapping:
        "Azure DDoS Protection (perimeter) + NSGs (network) + Defender for Endpoint (compute) + Entra MFA (identity) + Purview labels (data) — all stacked.",
      whenToUse:
        "Always — every control has a non-zero failure rate, so layered controls reduce the probability of a successful end-to-end attack.",
      commonMistake:
        "Treating Defense in Depth as 'buy more products'. It is about COMPLEMENTARY layers — adding two firewalls is not Defense in Depth.",
      examAngle:
        "Look for keywords 'multiple layers', 'overlapping controls', or 'if one control fails'.",
    },
    {
      id: "cia-triad",
      name: "CIA Triad",
      oneLine: "The three goals of every security control: Confidentiality, Integrity, and Availability.",
      formal:
        "Confidentiality ensures data is only accessible to authorized parties; Integrity ensures data is accurate and unaltered; Availability ensures data and services are accessible when needed.",
      plainEnglish:
        "Keep secrets secret (C), make sure nobody messes with the data (I), and make sure the system is up when you need it (A).",
      analogy:
        "A bank vault keeps money safe (C), audits prove the count is correct (I), and the bank opens during business hours (A).",
      howItWorks:
        "Each control maps to one or more letters: encryption ↔ Confidentiality; hashing/digital signatures ↔ Integrity; backups/redundancy/DDoS protection ↔ Availability.",
      microsoftMapping:
        "BitLocker & Storage Encryption (C), digital signatures & Azure Backup checksums (I), Azure Site Recovery & Front Door (A).",
      whenToUse:
        "Use the triad as a checklist when designing any system — every requirement should map to at least one letter.",
      commonMistake:
        "Forgetting Availability is a security goal. Ransomware that encrypts your only copy attacks Availability, not just Confidentiality.",
      examAngle:
        "Match the scenario to a letter: 'data was modified in transit' = Integrity; 'data was leaked' = Confidentiality; 'site went down due to DDoS' = Availability.",
    },
    {
      id: "threat-vuln-risk",
      name: "Threat vs Vulnerability vs Risk",
      oneLine: "A threat exploits a vulnerability to create risk; mitigations reduce that risk.",
      formal:
        "A threat is a potential cause of harm. A vulnerability is a weakness a threat can exploit. Risk = Likelihood × Impact of a threat exploiting a vulnerability. A mitigation is any control that reduces likelihood or impact.",
      plainEnglish:
        "A burglar is the threat. An unlocked door is the vulnerability. The chance of getting robbed and how bad it would be is the risk. Locking the door is the mitigation.",
      analogy:
        "Rain (threat) + a hole in the roof (vulnerability) = your living room gets wet (risk). Patching the hole is mitigation.",
      howItWorks:
        "Risk management cycle: identify assets → identify threats and vulnerabilities → assess risk → apply mitigations → monitor → repeat.",
      microsoftMapping:
        "Microsoft Defender Vulnerability Management identifies vulns; Defender XDR identifies threats; Microsoft Secure Score quantifies risk improvement.",
      whenToUse: "Use this vocabulary in every security conversation — leadership, audits, design reviews.",
      commonMistake:
        "Using 'threat' and 'risk' interchangeably. They are different: a threat exists in the world; risk exists for YOU.",
      examAngle:
        "If the question asks 'what is the chance of the unpatched server being exploited?' — that's risk, not vulnerability.",
    },
    {
      id: "shared-responsibility",
      name: "Shared Responsibility Model",
      oneLine: "Cloud security is a partnership: the provider secures the cloud, you secure what's IN the cloud.",
      formal:
        "In cloud computing, security responsibilities are divided between the cloud provider and the customer. The split changes by service model: in IaaS the customer owns more; in SaaS the provider owns more. Some responsibilities — data, accounts, devices — are ALWAYS the customer's.",
      plainEnglish:
        "Renting an apartment vs renting a furnished room vs staying in a hotel — the more managed it is, the less you have to worry about, but you still own your luggage.",
      analogy:
        "Hotel = SaaS: room, plumbing, breakfast included. You only manage your suitcase (your data). Furnished apartment = PaaS. Empty house = IaaS — you bring everything.",
      howItWorks:
        "Customer always owns: information & data, devices, accounts & identities. Provider always owns: physical hosts, network, datacenter. The middle layers (OS, network controls, apps) shift based on service model.",
      microsoftMapping:
        "Microsoft publishes a shared-responsibility chart for Azure that SC-900 questions are based on. Memorise: data + identity + endpoints = always yours.",
      whenToUse:
        "Every cloud adoption project — clarifies what you must build vs what you inherit.",
      commonMistake:
        "Assuming SaaS means 'no security work for me'. You still own users, identities, configurations, and data classification.",
      examAngle:
        "Questions list a control (e.g. 'OS patching') and ask who is responsible in IaaS vs PaaS vs SaaS. Memorise the chart.",
    },
    {
      id: "encryption-types",
      name: "Encryption (at rest, in transit, in use)",
      oneLine: "Scrambling data so only authorised parties can read it — three states matter: stored, moving, processing.",
      formal:
        "Symmetric encryption uses one shared key for both encrypt and decrypt (fast, e.g. AES). Asymmetric uses a key pair, public + private (slow, e.g. RSA). At rest = stored on disk. In transit = on the wire. In use = while CPU is processing it (confidential computing).",
      plainEnglish:
        "Lock the box when it sits in storage (at rest), keep it locked while a courier moves it (in transit), and even keep it locked while you're using its contents (in use).",
      analogy:
        "Symmetric = a single house key shared between roommates. Asymmetric = a mailbox: anyone can drop letters in (public key), only you can take them out (private key).",
      howItWorks:
        "Storage Service Encryption (Azure) and BitLocker (Windows) handle 'at rest'. TLS 1.2/1.3 handles 'in transit'. Azure Confidential Computing (SGX/AMD SEV) handles 'in use'.",
      microsoftMapping:
        "Azure Storage SSE, BitLocker, TLS, Always Encrypted (SQL), Azure Confidential VMs.",
      whenToUse:
        "All three should be enabled by default for sensitive workloads. 'In use' is needed when third parties run code over your data.",
      commonMistake:
        "Confusing hashing (one-way, integrity) with encryption (two-way, confidentiality).",
      examAngle:
        "If the question is about proving data wasn't tampered → hashing. If it's about keeping data secret → encryption.",
    },
  ],

  comparisons: [
    {
      title: "Symmetric vs Asymmetric encryption",
      columns: ["Aspect", "Symmetric", "Asymmetric"],
      rows: [
        ["Keys", "1 shared key", "Public + private key pair"],
        ["Speed", "Fast", "Slow (100–1000× slower)"],
        ["Used for", "Bulk data encryption", "Key exchange, signatures"],
        ["Example", "AES-256 (BitLocker)", "RSA, ECDSA (TLS handshake)"],
      ],
      bottomLine: "TLS uses BOTH: asymmetric to exchange a session key, symmetric to actually move the data.",
    },
    {
      title: "Encryption vs Hashing",
      columns: ["Aspect", "Encryption", "Hashing"],
      rows: [
        ["Direction", "Two-way (decrypt)", "One-way (no decrypt)"],
        ["Goal", "Confidentiality", "Integrity"],
        ["Output size", "≈ input", "Fixed (e.g. 256-bit)"],
        ["Examples", "AES, RSA, TLS", "SHA-256, MD5"],
      ],
      bottomLine: "Use encryption to hide data; use hashing to detect tampering.",
    },
    {
      title: "Threat vs Vulnerability vs Risk",
      columns: ["Term", "Definition", "Example"],
      rows: [
        ["Threat", "Potential cause of harm", "Phishing actor"],
        ["Vulnerability", "Weakness to exploit", "User without MFA"],
        ["Risk", "Likelihood × impact", "Account takeover causing data loss"],
        ["Mitigation", "Reduces risk", "Enable MFA"],
      ],
      bottomLine: "Threats live in the world. Vulnerabilities live in YOUR system. Risk is what they create together.",
    },
  ],

  realExamples: [
    {
      title: "Contoso ransomware blocked at layer 2",
      scenario:
        "A finance user clicks a malicious link. Defender for Office 365 detonates the URL in a sandbox (layer 1). The user still types credentials on the lookalike page. Conditional Access blocks the sign-in because the device is non-compliant (layer 2).",
      outcome: "Defense in Depth turned a near-miss into a non-event.",
    },
    {
      title: "Healthcare CIA tradeoff",
      scenario:
        "A hospital must balance Confidentiality (patient privacy) with Availability (a doctor needs records during a code blue). They implement break-glass accounts that bypass MFA but trigger a high-severity alert and a mandatory post-event review.",
      outcome: "Availability wins in the moment, Confidentiality is restored after — both legs of CIA honoured.",
    },
  ],

  keyTerms: [
    { term: "Threat", definition: "A potential cause of an unwanted incident.", example: "A ransomware actor." },
    { term: "Vulnerability", definition: "A weakness a threat can exploit.", example: "An unpatched Windows server." },
    { term: "Risk", definition: "Likelihood × impact of a threat exploiting a vulnerability.", example: "60% chance of a $1M breach." },
    { term: "Mitigation", definition: "A control that reduces risk.", example: "Patching, MFA, EDR." },
    { term: "Encryption at rest", definition: "Protects data on disk.", example: "BitLocker, Azure SSE." },
    { term: "Encryption in transit", definition: "Protects data on the wire.", example: "TLS 1.3, IPSec." },
    { term: "Hashing", definition: "One-way function used to verify integrity.", example: "SHA-256 of a downloaded ISO." },
    { term: "Symmetric key", definition: "Single key for both encrypt and decrypt.", example: "AES-256." },
    { term: "Asymmetric key", definition: "Public + private key pair.", example: "RSA used in TLS handshake." },
    { term: "Defense in Depth", definition: "Multiple, independent overlapping controls." },
    { term: "Zero Trust", definition: "Never trust by location; verify every request explicitly." },
    { term: "Shared Responsibility", definition: "Split of security duties between cloud provider and customer." },
  ],

  commonPitfalls: [
    "Saying Zero Trust means 'no firewall'. Firewalls still exist; they're just not the only line of defence.",
    "Mixing up hashing and encryption — hashing is one-way and used for integrity, not confidentiality.",
    "Treating Availability as an IT-ops concern, not a security goal. Ransomware proves it's both.",
    "Assuming SaaS providers handle 'all security'. Identity, data, and devices are always your job.",
    "Calling a vulnerability a 'threat'. They're different ideas — get the vocabulary right.",
  ],

  faqs: [
    {
      q: "Do I need to memorise all three Zero Trust principles?",
      a: "Yes. 'Verify explicitly', 'least privilege access', and 'assume breach' show up verbatim on SC-900 questions.",
    },
    {
      q: "Is Defense in Depth the same as Zero Trust?",
      a: "No. Defense in Depth is a layering tactic; Zero Trust is a strategic model. Zero Trust uses Defense in Depth, but you can do Defense in Depth without Zero Trust (e.g. a perimeter-trusting LAN with multiple firewalls).",
    },
    {
      q: "Where exactly does 'Availability' fit on the exam?",
      a: "Any question mentioning DDoS, backups, redundancy, RTO, RPO, or service uptime is testing Availability.",
    },
    {
      q: "What's the difference between 'in transit' and 'in use' encryption?",
      a: "'In transit' protects data while it moves over a network (TLS). 'In use' protects data while a CPU is actively processing it (Confidential Computing). 'At rest' is when it's stored.",
    },
    {
      q: "Who owns identity security in SaaS?",
      a: "The customer — always. The SaaS provider runs the platform, but you decide who has accounts, what MFA they use, and what they can access.",
    },
  ],

  selfCheck: [
    {
      question: "An attacker steals a session token from a coffee-shop laptop and tries to access SharePoint. Conditional Access requires a compliant device and blocks the sign-in. Which Zero Trust principle is being applied?",
      options: ["Verify explicitly", "Assume breach", "Least privilege", "Defense in Depth"],
      correctIndex: 0,
      explanation:
        "The system is verifying explicitly using a device-compliance signal — the core of 'verify explicitly'. 'Assume breach' would be reactive (e.g. isolating after compromise). 'Least privilege' is about role scope. Defense in Depth is a tactic, not a Zero Trust principle.",
    },
    {
      question: "Ransomware encrypts your only file backup. Which leg of the CIA triad has been attacked most directly?",
      options: ["Confidentiality", "Integrity", "Availability", "Authentication"],
      correctIndex: 2,
      explanation:
        "The data still exists and isn't leaked, but you can't USE it — that's Availability. Authentication isn't part of CIA.",
    },
    {
      question: "In a SaaS service, who is responsible for managing user accounts and access reviews?",
      options: ["The cloud provider", "The customer", "Shared 50/50", "Microsoft Azure"],
      correctIndex: 1,
      explanation:
        "Customer-owned items in any service model are: data, devices, identities. The provider runs the SaaS platform but never your account list.",
    },
  ],

  examTips: [
    "Zero Trust verbs: 'verify explicitly', 'least privilege', 'assume breach' — match them to the principle name.",
    "CIA triad mapping: encryption→C, hashing/signing→I, backups/DDoS→A.",
    "Shared responsibility: SaaS provider does almost everything except DATA, IDENTITY, DEVICES.",
    "Encryption is two-way; hashing is one-way — never mix them.",
  ],

  furtherReading: [
    { label: "Microsoft Zero Trust guidance", url: "https://learn.microsoft.com/security/zero-trust/" },
    { label: "Shared responsibility in the cloud", url: "https://learn.microsoft.com/azure/security/fundamentals/shared-responsibility" },
    { label: "Microsoft Secure Score", url: "https://learn.microsoft.com/microsoft-365/security/defender/microsoft-secure-score" },
  ],
};

/* ============================================================== */
/* MODULE 2 — IDENTITY & ACCESS MANAGEMENT                        */
/* ============================================================== */
const m2: ModuleExplanation = {
  moduleSlug: "iam",
  tagline: "Identity is the new perimeter.",
  overview:
    "Module 2 covers how Microsoft proves who a user is (authentication) and what they're allowed to do (authorization). It introduces MFA, RBAC, Conditional Access, and Privileged Identity Management — the building blocks that gate every Microsoft 365 and Azure resource.",
  whyItMatters:
    "Over 99% of identity attacks are stopped by MFA, yet only a fraction of accounts have it enabled by default in legacy environments. IAM is the single highest-leverage control set on the exam and in the real world.",

  what: {
    heading: "What is Identity & Access Management?",
    body:
      "IAM ensures the right people have the right access to the right resources at the right time — and nothing more. It combines authentication (proof of identity), authorization (permission to act), administration (lifecycle), and audit (who did what).",
    bullets: [
      "Authentication — passwords, MFA, passwordless, certificates.",
      "Authorization — RBAC, ABAC, Conditional Access.",
      "Administration — joiner/mover/leaver, access reviews.",
      "Audit — sign-in logs, audit logs, PIM history.",
    ],
  },
  why: {
    heading: "Why is IAM critical?",
    body:
      "Every breach starts with an identity — either stolen, over-privileged, or forgotten. Strong IAM stops attackers from moving laterally and gives auditors the trail they need.",
  },
  who: {
    heading: "Who manages IAM?",
    body:
      "Identity admins design policies. HR triggers joiner/leaver events. Resource owners approve access. End users complete MFA challenges. Mature orgs automate this through Entra ID Governance.",
  },
  when: {
    heading: "When does IAM run?",
    body:
      "On every authentication request and every authorization check — within milliseconds. Conditional Access evaluates dozens of signals on every sign-in. Access reviews run on a schedule.",
  },
  where: {
    heading: "Where does IAM apply?",
    body:
      "Microsoft 365, Azure, third-party SaaS via SSO, on-prem apps via Application Proxy, and even non-Microsoft clouds federated to Entra.",
  },
  how: {
    heading: "How does Microsoft implement IAM?",
    body:
      "Entra ID is the identity provider. RBAC governs Azure resources. Conditional Access is the policy engine. PIM provides time-bound elevation. Microsoft Authenticator handles MFA and passwordless. Together they form a unified control plane.",
    bullets: [
      "Sign-in → Conditional Access evaluates risk → MFA prompt if needed.",
      "Resource access → RBAC role assignment → least-privilege check.",
      "Privileged action → PIM activation with approval + justification.",
    ],
  },

  conceptDeepDives: [
    {
      id: "authn-vs-authz",
      name: "Authentication vs Authorization",
      oneLine: "Authentication = WHO you are. Authorization = WHAT you can do.",
      formal:
        "Authentication (AuthN) verifies identity using one or more factors. Authorization (AuthZ) determines whether the verified identity has permission to perform a specific action on a specific resource.",
      plainEnglish:
        "First the bouncer checks your ID (AuthN). Then he checks if you're on the VIP list to enter the lounge (AuthZ).",
      analogy:
        "AuthN is showing your passport at immigration. AuthZ is the visa stamp inside it telling you which countries you can enter.",
      howItWorks:
        "User submits credentials → IdP verifies → issues a token → application reads claims in the token → enforces RBAC/policy.",
      microsoftMapping:
        "Entra ID issues the token (AuthN). The resource (Azure RM, M365, SaaS) enforces RBAC/Conditional Access (AuthZ).",
      whenToUse:
        "Always — you need both. Strong AuthN with weak AuthZ = correctly identified user with too much power. Weak AuthN with strong AuthZ = wrong user with limited but real damage.",
      commonMistake:
        "Calling MFA 'authorization'. MFA is an AUTHENTICATION factor; it proves who you are, not what you can do.",
      examAngle:
        "Watch for trick questions where 'MFA' and 'RBAC' are listed as alternatives — MFA = AuthN, RBAC = AuthZ.",
    },
    {
      id: "mfa",
      name: "Multi-Factor Authentication (MFA)",
      oneLine: "Requiring two or more independent factors to prove identity.",
      formal:
        "MFA combines factors from at least two of: something you KNOW (password/PIN), something you HAVE (phone, security key), something you ARE (fingerprint, face). It defeats password-only attacks like phishing and credential stuffing.",
      plainEnglish:
        "Even if a thief steals your password, they still need your phone or your face — and they probably don't have either.",
      analogy:
        "An ATM: card (have) + PIN (know). Take away either one and the cash stays in the machine.",
      howItWorks:
        "After password is accepted, the IdP triggers a second-factor challenge (push, OTP, FIDO2). The user approves on a separate channel before the token is issued.",
      microsoftMapping:
        "Microsoft Authenticator app (push/passwordless), SMS/voice (legacy), FIDO2 security key, Windows Hello for Business, hardware OTP token.",
      whenToUse:
        "For ALL users — Microsoft now enables MFA defaults automatically. Required for any administrative role.",
      whenNotToUse:
        "Service accounts and emergency break-glass accounts use different controls (managed identity, hardware token in a vault).",
      commonMistake:
        "Treating 'two passwords' as MFA. Two of the same factor type is NOT MFA. The factors must be different categories.",
      examAngle:
        "If a question lists 'password + PIN' as MFA, the answer is NO — both are 'something you know'.",
    },
    {
      id: "rbac",
      name: "Role-Based Access Control (RBAC)",
      oneLine: "Assigning permissions through roles, not directly to people.",
      formal:
        "RBAC defines roles (collections of permissions) and assigns users/groups to roles at a specific scope. In Azure, scope flows: management group → subscription → resource group → resource.",
      plainEnglish:
        "Instead of giving each employee their own custom keychain, you give them a job title; the title comes with a standard set of keys.",
      analogy:
        "Hospital badges. A 'Nurse' badge opens patient rooms. A 'Doctor' badge opens patient rooms AND the medication cabinet. You don't program each badge by hand.",
      howItWorks:
        "Assignment = security principal (user/group/SP) + role definition (set of actions) + scope. The most permissive assignment in the chain wins.",
      microsoftMapping:
        "Azure RBAC (for resources), Entra roles (for directory operations like creating users), Microsoft 365 roles (for Exchange/SharePoint).",
      whenToUse:
        "Default for almost every Azure permission decision. Use built-in roles first; create custom roles only when needed.",
      commonMistake:
        "Assigning the 'Owner' role at subscription scope when 'Contributor' at resource group would do. Always pick least privilege.",
      examAngle:
        "Know the four scope levels and that role assignments INHERIT downward.",
    },
    {
      id: "conditional-access",
      name: "Conditional Access",
      oneLine: "If-then policies that gate sign-ins based on signals.",
      formal:
        "Conditional Access is the Entra policy engine. Each policy: ASSIGNMENTS (users, apps, conditions like risk/device/location/platform) → ACCESS CONTROLS (block, grant with MFA/compliant device/terms of use, session controls).",
      plainEnglish:
        "Smart bouncer rules: 'If a user from outside the country tries to open SharePoint, force MFA AND a compliant laptop.'",
      analogy:
        "An airport: depending on your origin (signal), you go through different security lanes (controls).",
      howItWorks:
        "On every sign-in, Entra evaluates all enabled CA policies. The most restrictive applicable controls combine. Policies can run in 'report-only' before enforcement.",
      microsoftMapping:
        "Built into Entra ID P1+. Combines with Identity Protection (risk signals), Intune (device signals), and Defender (session signals).",
      whenToUse:
        "Always — start with Microsoft's recommended baseline policies (block legacy auth, MFA for admins, MFA for risky sign-ins).",
      commonMistake:
        "Locking yourself out by enforcing a policy on ALL users, ALL apps, with no break-glass exclusion.",
      examAngle:
        "MFA is a GRANT control inside Conditional Access — not a separate product.",
    },
    {
      id: "pim",
      name: "Privileged Identity Management (PIM)",
      oneLine: "Time-bound, approval-gated, just-in-time elevation for admin roles.",
      formal:
        "PIM lets users be ELIGIBLE for a role rather than permanently assigned. To use it, they ACTIVATE the role for a limited time, optionally with approval, MFA, and justification. All activations are audited.",
      plainEnglish:
        "Instead of giving every admin a permanent crown, lock the crown in a glass box. They can grab it for 4 hours when needed, and the alarm rings every time.",
      analogy:
        "A safe-deposit box at a bank: you have a key, but the manager has to open the gate too, and there's a log of every visit.",
      howItWorks:
        "Eligible assignment → user requests activation → optional approver MFA + reason → role active for X hours → auto-deactivates → entry in audit log.",
      microsoftMapping:
        "Entra ID Governance / PIM, requires Entra ID P2 or Microsoft Entra ID Governance licence.",
      whenToUse:
        "Every privileged role (Global Admin, Security Admin, Billing Admin, etc.). Standing privileged access is the #1 attack target.",
      commonMistake:
        "Confusing PIM 'eligible' with 'active'. Eligible means CAN activate; only active grants the permissions.",
      examAngle:
        "If you see 'time-bound', 'just-in-time', or 'approval workflow for admin roles' — answer is PIM.",
    },
  ],

  comparisons: [
    {
      title: "AuthN vs AuthZ",
      columns: ["Aspect", "Authentication", "Authorization"],
      rows: [
        ["Question answered", "Who are you?", "What can you do?"],
        ["Microsoft tool", "Entra ID, MFA, FIDO2", "RBAC, Conditional Access"],
        ["Happens", "First", "After AuthN succeeds"],
        ["Failure looks like", "Wrong password", "Access denied to a resource"],
      ],
      bottomLine: "AuthN is the gate. AuthZ is the room key.",
    },
    {
      title: "RBAC vs Conditional Access",
      columns: ["Aspect", "RBAC", "Conditional Access"],
      rows: [
        ["Decides", "What actions on a resource", "Whether sign-in is allowed at all"],
        ["Evaluated", "On each API/resource call", "On each sign-in"],
        ["Signals used", "Role assignment + scope", "User, device, location, risk, app"],
        ["Example", "Reader on resource group", "Block sign-in from China without MFA"],
      ],
      bottomLine: "Conditional Access controls the FRONT DOOR. RBAC controls the ROOMS inside.",
    },
    {
      title: "MFA factors",
      columns: ["Category", "Examples", "Phishing-resistant?"],
      rows: [
        ["Something you know", "Password, PIN, security questions", "No"],
        ["Something you have", "Authenticator app, FIDO2 key, smart card", "FIDO2 = yes"],
        ["Something you are", "Fingerprint, face (Windows Hello)", "Yes"],
      ],
      bottomLine: "True MFA mixes categories. Passwordless + FIDO2 is the gold standard.",
    },
  ],

  realExamples: [
    {
      title: "Travelling sales rep blocked from impossible location",
      scenario:
        "A rep signs in from London at 09:00, then a sign-in from Lagos appears at 09:15. Identity Protection flags 'atypical travel'. Conditional Access requires MFA + compliant device — Lagos session fails because the attacker had a token but no device.",
      outcome: "Token replay attack neutralised without IT intervention.",
    },
    {
      title: "PIM stops a standing-admin breach",
      scenario:
        "A Global Admin's laptop is compromised. The role is PIM-eligible, not active. The attacker can read mail but cannot reset another admin's password without raising a JIT request — which requires MFA + manager approval.",
      outcome: "Blast radius reduced from tenant-wide to a single mailbox.",
    },
  ],

  keyTerms: [
    { term: "Authentication (AuthN)", definition: "Proves identity — 'who are you?'." },
    { term: "Authorization (AuthZ)", definition: "Grants permission — 'what can you do?'." },
    { term: "MFA", definition: "Two or more factors from different categories." },
    { term: "RBAC", definition: "Role-Based Access Control — permissions bundled into roles." },
    { term: "Conditional Access", definition: "If-then policies that gate access based on signals." },
    { term: "PIM", definition: "Privileged Identity Management — JIT, time-bound admin roles." },
    { term: "SSO", definition: "Single Sign-On — one login, many apps.", example: "Sign in once, access M365 + Salesforce." },
    { term: "Federation", definition: "Trust between two identity systems so tokens are accepted across them." },
    { term: "OAuth 2.0", definition: "Industry standard for delegated authorization (access tokens)." },
    { term: "OIDC", definition: "OpenID Connect — auth layer on top of OAuth 2.0; provides ID tokens." },
    { term: "SAML", definition: "XML-based federation protocol used by many SaaS apps." },
    { term: "Identity Provider (IdP)", definition: "Service that authenticates users and issues tokens (e.g. Entra ID)." },
  ],

  commonPitfalls: [
    "Using 'password + security questions' and calling it MFA — both are 'something you know'.",
    "Granting permanent Owner role at subscription scope. Use PIM-eligible Contributor at resource-group scope instead.",
    "Forgetting to exclude break-glass accounts from Conditional Access — you'll lock yourself out.",
    "Confusing Conditional Access (sign-in) with RBAC (resource action). They run at different stages.",
    "Letting legacy authentication (POP/IMAP) bypass MFA. Block it explicitly.",
  ],

  faqs: [
    {
      q: "Is MFA the same as 2FA?",
      a: "2FA is MFA with exactly two factors. All 2FA is MFA, but MFA can be 3+.",
    },
    {
      q: "Why is SMS-based MFA discouraged?",
      a: "SMS can be intercepted (SIM-swap, SS7 attacks). Microsoft Authenticator push or FIDO2 keys are stronger and phishing-resistant.",
    },
    {
      q: "Can I use Conditional Access without Entra ID P1?",
      a: "No. Conditional Access requires Entra ID P1 or higher. Security Defaults (free) is a simpler alternative.",
    },
    {
      q: "What's the difference between Entra roles and Azure RBAC roles?",
      a: "Entra roles control directory operations (create users, manage apps). Azure RBAC roles control Azure resources (start a VM, read a storage account). Different scopes, different role catalogues.",
    },
    {
      q: "Is PIM only for Entra roles?",
      a: "No — PIM works for Entra roles, Azure RBAC roles, AND privileged access groups.",
    },
  ],

  selfCheck: [
    {
      question: "A user enters a password and then approves a push on Microsoft Authenticator. Which TWO factor categories did they use?",
      options: ["Know + know", "Know + have", "Have + are", "Know + are"],
      correctIndex: 1,
      explanation:
        "Password = something you KNOW. The Authenticator approval comes from a phone you HAVE. That's a valid two-category MFA combo.",
    },
    {
      question: "A help-desk user needs to reset passwords twice a week. How should you assign the role?",
      options: ["Permanent Global Admin", "Permanent Helpdesk Admin", "PIM-eligible Helpdesk Admin", "PIM-eligible Global Admin"],
      correctIndex: 2,
      explanation:
        "Least privilege says Helpdesk Admin (not Global). PIM-eligible means the role activates only when needed, with MFA and audit. Eligible Global Admin would be over-privileged.",
    },
    {
      question: "Which Microsoft service blocks a sign-in from a non-compliant device?",
      options: ["Microsoft Defender for Endpoint", "Conditional Access", "Microsoft Sentinel", "Azure RBAC"],
      correctIndex: 1,
      explanation:
        "Conditional Access enforces device-compliance signals at sign-in. Defender provides the COMPLIANCE signal but doesn't block sign-ins itself; Sentinel monitors; RBAC governs resource actions, not sign-ins.",
    },
  ],

  examTips: [
    "AuthN = WHO. AuthZ = WHAT. Different question.",
    "MFA is a Conditional Access GRANT control, not its own product.",
    "PIM is for ELIGIBLE roles activated just-in-time — not standing access.",
    "RBAC scope hierarchy: management group → subscription → resource group → resource. Inheritance flows DOWN.",
  ],

  furtherReading: [
    { label: "What is Microsoft Entra ID?", url: "https://learn.microsoft.com/entra/fundamentals/whatis" },
    { label: "Conditional Access overview", url: "https://learn.microsoft.com/entra/identity/conditional-access/overview" },
    { label: "Privileged Identity Management", url: "https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-configure" },
  ],
};

/* ============================================================== */
/* MODULE 3 — MICROSOFT ENTRA CAPABILITIES                        */
/* ============================================================== */
const m3: ModuleExplanation = {
  moduleSlug: "entra",
  tagline: "Microsoft's cloud-first identity platform.",
  overview:
    "Module 3 dives into the specific capabilities of Microsoft Entra: cloud-only vs hybrid identity, Identity Protection's risk engine, passwordless options (Windows Hello, FIDO2, Authenticator), and external identities (B2B for partners, B2C for customers).",
  whyItMatters:
    "Entra ID has 700M+ monthly active users and is the front door to Microsoft 365 and most enterprise SaaS. Knowing its capability boundaries is essential for licensing decisions, migrations, and architecture interviews.",

  what: {
    heading: "What is Microsoft Entra?",
    body:
      "Entra is Microsoft's family of identity & access products. The flagship is Entra ID (formerly Azure AD), a cloud directory and identity provider. The family also includes Entra Permissions Management (CIEM), Entra Verified ID, and Entra Internet/Private Access (SSE).",
    bullets: [
      "Entra ID — directory and IdP.",
      "Entra ID Protection — risk-based detection.",
      "Entra ID Governance — access reviews, lifecycle workflows, entitlement management.",
      "Entra External ID — B2B & B2C scenarios.",
    ],
  },
  why: {
    heading: "Why Entra over on-prem AD?",
    body:
      "On-prem Active Directory was built for the LAN. Entra is built for SaaS, mobile, and zero-trust. It scales globally, ingests trillions of signals daily for risk detection, and integrates natively with every Microsoft cloud service.",
  },
  who: {
    heading: "Who uses Entra?",
    body:
      "Employees (members), guests (B2B partners), customers (B2C consumers), and workloads (managed identities and service principals). Each persona has a different licence and policy story.",
  },
  when: {
    heading: "When do you use which capability?",
    body:
      "Cloud-only when there's no legacy AD. Hybrid when you must keep on-prem AD. B2B when partners need access to YOUR tenant. B2C when you're building a consumer-facing app and want users to bring their own social identity.",
  },
  where: {
    heading: "Where does Entra reach?",
    body:
      "Microsoft 365, Azure, thousands of pre-integrated SaaS apps in the Entra Gallery, on-prem apps via Application Proxy, custom apps via OIDC/SAML, and even AWS/GCP via federation.",
  },
  how: {
    heading: "How do users actually sign in?",
    body:
      "Cloud auth uses password hash sync (PHS), pass-through authentication (PTA), or federation (AD FS). Modern environments prefer passwordless: Windows Hello for Business, FIDO2 keys, or Microsoft Authenticator phone sign-in. Identity Protection scores every sign-in for risk.",
  },

  conceptDeepDives: [
    {
      id: "entra-id",
      name: "Entra ID (formerly Azure AD)",
      oneLine: "Microsoft's cloud directory and identity provider.",
      formal:
        "Entra ID is a multi-tenant, cloud-based directory and identity service that combines core directory services, application access management, and identity protection into a single solution.",
      plainEnglish:
        "It's the digital phonebook AND the bouncer for your company's cloud apps.",
      analogy:
        "If on-prem Active Directory is a small-town town hall, Entra ID is a global passport agency — issues credentials usable anywhere.",
      howItWorks:
        "Users live in a TENANT. The tenant has applications (M365, custom, SaaS gallery). Sign-ins generate tokens (OIDC/OAuth/SAML). Conditional Access decides if the sign-in proceeds.",
      microsoftMapping:
        "Three editions: Free (basic directory), P1 (Conditional Access, hybrid), P2 (Identity Protection, PIM, access reviews).",
      whenToUse:
        "Whenever you have Microsoft 365 — you already have Entra ID. Use it for any new SaaS to centralise identity.",
      commonMistake:
        "Calling it 'Azure AD' on the exam — Microsoft renamed it to Entra ID in 2023. Both names may appear; treat them as identical.",
      examAngle:
        "Match feature → minimum licence: Conditional Access = P1, Identity Protection / PIM = P2.",
    },
    {
      id: "hybrid-identity",
      name: "Hybrid Identity",
      oneLine: "Synchronising on-prem Active Directory users to Entra ID so they have ONE identity for both worlds.",
      formal:
        "Hybrid identity uses Microsoft Entra Connect Sync (full-featured) or Entra Cloud Sync (lightweight, multi-forest) to replicate user objects from on-prem AD into the Entra ID tenant. Authentication can be PHS, PTA, or Federation.",
      plainEnglish:
        "Your office staff keep their familiar username/password and use it for both the file server AND Microsoft 365.",
      analogy:
        "A dual-passport citizen — one identity that works in two countries.",
      howItWorks:
        "Connect Sync runs on-prem, reads AD, writes to Entra ID over HTTPS. PHS = the password hash is synced (default). PTA = no hash leaves; on-prem agent validates. Federation = on-prem IdP (AD FS) issues tokens.",
      microsoftMapping:
        "Microsoft Entra Connect (legacy name AAD Connect) and Entra Cloud Sync.",
      whenToUse:
        "When you can't or won't decommission on-prem AD (legacy apps, GPOs, Kerberos).",
      commonMistake:
        "Thinking PHS sends plaintext passwords. It sends a HASH OF A HASH — Microsoft never sees the cleartext password.",
      examAngle:
        "Three sign-in methods: PHS (default, simplest), PTA (hash never leaves), Federation (third-party IdP).",
    },
    {
      id: "identity-protection",
      name: "Entra ID Protection",
      oneLine: "ML-based risk engine that scores every user and every sign-in.",
      formal:
        "Identity Protection ingests trillions of signals to detect compromised credentials and risky sign-ins. It outputs a USER risk score (the account is compromised) and a SIGN-IN risk score (this specific attempt is suspicious).",
      plainEnglish:
        "A bank's fraud-detection system, but for identities — flags weird patterns and lets you respond automatically.",
      analogy:
        "Credit-card fraud detection: 'Are you really buying a TV in Tokyo at 3am?'",
      howItWorks:
        "Detections (atypical travel, leaked credentials, anonymous IP, etc.) feed into risk scores. Risk-based Conditional Access policies use those scores to require MFA, force password change, or block.",
      microsoftMapping:
        "Entra ID P2 licence required. Risk reports + risky users dashboard in Entra portal.",
      whenToUse:
        "Always when you have P2 — even baseline risk-based MFA for medium+ risk catches most attacks.",
      commonMistake:
        "Confusing user risk (the IDENTITY is compromised) with sign-in risk (this SESSION looks suspicious). They drive different policies.",
      examAngle:
        "Identity Protection requires Entra ID P2. Detection types include 'leaked credentials', 'atypical travel', 'anonymous IP'.",
    },
    {
      id: "passwordless",
      name: "Passwordless Authentication",
      oneLine: "Replacing the password with phishing-resistant factors only.",
      formal:
        "Passwordless removes the 'something you know' factor entirely, leaving 'have' (Authenticator phone sign-in, FIDO2 key) and/or 'are' (Windows Hello biometric). Eliminates phishing, password spray, and brute force.",
      plainEnglish:
        "Use your face or a USB key instead of typing a password — there's nothing to phish.",
      analogy:
        "Tapping your office badge instead of typing a code into the door pad.",
      howItWorks:
        "User signs in with Windows Hello biometric (TPM-protected key), FIDO2 hardware key (WebAuthn), or Authenticator phone sign-in (asymmetric key + biometric on phone).",
      microsoftMapping:
        "Three Microsoft passwordless options: Windows Hello for Business, FIDO2 security keys, Microsoft Authenticator app.",
      whenToUse:
        "Roll out to admin accounts first, then high-risk users, then everyone. Leaves no password for attackers to steal.",
      commonMistake:
        "Calling SMS OTP 'passwordless'. SMS is still a 'something you have' second factor used WITH a password.",
      examAngle:
        "Memorise the three Microsoft passwordless options.",
    },
    {
      id: "b2b-vs-b2c",
      name: "B2B vs B2C",
      oneLine: "B2B invites partners INTO your tenant; B2C is a separate tenant for your CUSTOMER-facing app.",
      formal:
        "B2B (business-to-business) collaboration adds external user accounts as guests in your existing Entra tenant. B2C (business-to-consumer) is a dedicated Entra External ID tenant for your consumer app, where users self-register and can bring social identities (Google, Facebook).",
      plainEnglish:
        "B2B = inviting a contractor to share your office Wi-Fi. B2C = setting up a separate guest Wi-Fi for cafe customers.",
      analogy:
        "B2B is like a hotel keycard for a visiting business partner. B2C is the hotel's own loyalty-club app for guests.",
      howItWorks:
        "B2B: send invite → guest accepts → guest user appears in your tenant → CA policies apply. B2C: customers self-register on your app → identities live in the B2C tenant; your app reads them via OIDC.",
      microsoftMapping:
        "B2B = Entra External ID for partners. B2C is being modernised under Entra External ID for customers.",
      whenToUse:
        "B2B when partners need to access YOUR existing apps. B2C when you're building a customer-facing app from scratch.",
      commonMistake:
        "Trying to do consumer signup in your main tenant instead of using B2C — you mix employees and millions of consumers in one directory. Disaster.",
      examAngle:
        "B2B = guests in your tenant. B2C = separate consumer tenant for your app.",
    },
  ],

  comparisons: [
    {
      title: "Cloud-only vs Hybrid identity",
      columns: ["Aspect", "Cloud-only", "Hybrid (Connect/Cloud Sync)"],
      rows: [
        ["Where users live", "Entra ID only", "On-prem AD synced to Entra"],
        ["Best for", "Greenfield, no legacy apps", "Existing AD, Kerberos, GPOs"],
        ["Sign-in methods", "Cloud auth", "PHS / PTA / Federation"],
        ["Resilience", "Microsoft cloud", "Depends on on-prem AD"],
      ],
      bottomLine: "If you don't NEED on-prem AD, go cloud-only. Hybrid exists to bridge the past, not for new builds.",
    },
    {
      title: "Entra ID licence tiers",
      columns: ["Feature", "Free", "P1", "P2"],
      rows: [
        ["Basic directory + SSO", "✓", "✓", "✓"],
        ["Conditional Access", "—", "✓", "✓"],
        ["Self-service password reset (cloud + on-prem)", "Cloud only", "Both", "Both"],
        ["Identity Protection (risk-based)", "—", "—", "✓"],
        ["PIM", "—", "—", "✓"],
        ["Access reviews", "—", "—", "✓"],
      ],
      bottomLine: "P1 = enforce policies. P2 = detect & manage risk + privileged access.",
    },
    {
      title: "B2B vs B2C",
      columns: ["Aspect", "B2B", "B2C"],
      rows: [
        ["Who", "Business partners (guests)", "Consumers (your customers)"],
        ["Tenant", "Your existing tenant", "Separate Entra External ID tenant"],
        ["Sign-in identity", "Their work account", "Email or social (Google, Facebook)"],
        ["Scale", "Hundreds–thousands", "Millions"],
      ],
      bottomLine: "B2B for partners IN your house. B2C for customers in their OWN house with your branding.",
    },
  ],

  realExamples: [
    {
      title: "Acquisition: 5,000 partner accounts in 24 hours",
      scenario:
        "Contoso acquires Northwind. Instead of duplicating accounts, Northwind is added as a B2B partner. Their users sign in with existing creds and accept Contoso terms of use. Conditional Access requires MFA for guests.",
      outcome: "Day-one access without lifting a single password — and revocation is one click when integration ends.",
    },
    {
      title: "Passwordless rollout halves helpdesk calls",
      scenario:
        "A retailer enrols staff in Microsoft Authenticator phone sign-in and Windows Hello. Within a quarter, password-reset tickets drop 52% and AiTM phishing attempts fail because there's no password to steal.",
      outcome: "Lower cost, lower risk, better UX.",
    },
  ],

  keyTerms: [
    { term: "Entra ID", definition: "Cloud directory + IdP (formerly Azure AD)." },
    { term: "Tenant", definition: "Dedicated instance of Entra ID for an organization." },
    { term: "Hybrid identity", definition: "On-prem AD synced to Entra via Connect/Cloud Sync." },
    { term: "PHS", definition: "Password Hash Sync — hash of hash is replicated to cloud." },
    { term: "PTA", definition: "Pass-Through Authentication — on-prem agent validates; no hash leaves." },
    { term: "Federation", definition: "On-prem IdP (e.g. AD FS) issues tokens; Entra trusts them." },
    { term: "B2B", definition: "Invite external partners as guests in your tenant." },
    { term: "B2C", definition: "Separate consumer-identity tenant for your customer-facing app." },
    { term: "Identity Protection", definition: "ML-based user-risk and sign-in-risk detection (P2)." },
    { term: "FIDO2", definition: "Phishing-resistant passwordless standard using hardware keys." },
    { term: "Windows Hello for Business", definition: "Biometric / PIN-based passwordless sign-in tied to TPM." },
    { term: "Self-Service Password Reset (SSPR)", definition: "Lets users reset their own passwords using verified methods." },
  ],

  commonPitfalls: [
    "Mixing employees and millions of consumers in the same tenant — always use B2C for consumers.",
    "Assuming Identity Protection is included in P1 — it requires P2.",
    "Calling SMS OTP 'passwordless' — it isn't.",
    "Forgetting to license guests appropriately for the apps they access.",
    "Federating to AD FS when cloud auth (PHS) would be simpler and more resilient.",
  ],

  faqs: [
    { q: "Is Azure AD gone?", a: "Renamed only. Same product, now called Microsoft Entra ID." },
    { q: "Can I do MFA on the free tier?", a: "Yes, with Security Defaults (all-or-nothing). Granular per-policy MFA needs Conditional Access (P1)." },
    { q: "Do guests need a licence in my tenant?", a: "Most basic guest collaboration is free; some premium features (e.g. CA policies on guests) consume an Entra ID P1/P2 licence per X guests." },
    { q: "What's the difference between Connect Sync and Cloud Sync?", a: "Connect Sync is the older, on-prem, full-featured tool. Cloud Sync is a lightweight cloud-managed agent that supports multi-forest scenarios." },
    { q: "Are managed identities the same as service principals?", a: "Managed identities ARE service principals — Azure manages their credentials so you don't store secrets." },
  ],

  selfCheck: [
    {
      question: "You want to give partner organisations access to a SharePoint site in your tenant. Which capability fits?",
      options: ["Entra B2C", "Entra B2B", "Hybrid identity", "Federation with AD FS"],
      correctIndex: 1,
      explanation: "B2B invites external partners as guests in YOUR tenant — perfect for SharePoint sharing. B2C is for consumer apps in a SEPARATE tenant.",
    },
    {
      question: "Which Entra ID tier is required for risk-based Conditional Access using Identity Protection?",
      options: ["Free", "Office 365 E3", "Entra ID P1", "Entra ID P2"],
      correctIndex: 3,
      explanation: "Identity Protection (and the user/sign-in risk signals it produces) requires Entra ID P2.",
    },
    {
      question: "Which option is TRULY passwordless?",
      options: ["Password + SMS OTP", "Password + Authenticator push", "FIDO2 security key", "Password + security questions"],
      correctIndex: 2,
      explanation: "Passwordless means NO password at all. FIDO2 uses 'have' + (often) 'are'. Anything starting with a password is MFA, not passwordless.",
    },
  ],

  examTips: [
    "B2B = partners in YOUR tenant. B2C = customers in a SEPARATE tenant for your app.",
    "Identity Protection requires Entra ID P2.",
    "Three passwordless options: Windows Hello for Business, Microsoft Authenticator, FIDO2 key.",
    "Three hybrid sign-in methods: PHS (default), PTA (no hash leaves), Federation.",
  ],

  furtherReading: [
    { label: "Entra ID overview", url: "https://learn.microsoft.com/entra/fundamentals/whatis" },
    { label: "Identity Protection", url: "https://learn.microsoft.com/entra/id-protection/overview-identity-protection" },
    { label: "Passwordless authentication", url: "https://learn.microsoft.com/entra/identity/authentication/concept-authentication-passwordless" },
  ],
};

/* ============================================================== */
/* MODULE 4 — SECURITY SOLUTIONS IN MICROSOFT                     */
/* ============================================================== */
const m4: ModuleExplanation = {
  moduleSlug: "security",
  tagline: "Detect, investigate, and respond — across the whole estate.",
  overview:
    "Module 4 introduces Microsoft's two security platforms: Defender XDR (extended detection and response across endpoints, email, identity, and apps) and Microsoft Sentinel (cloud-native SIEM/SOAR for the entire enterprise, including non-Microsoft sources).",
  whyItMatters:
    "Average attacker dwell time is still measured in days. XDR + SIEM compress this to minutes by correlating signals that siloed tools would miss, and by automating the boring 80% of triage so analysts focus on the 20% that matters.",

  what: {
    heading: "What are XDR and SIEM?",
    body:
      "XDR (Extended Detection & Response) correlates alerts across multiple vectors into a single incident. SIEM (Security Information & Event Management) ingests logs from anything — Microsoft, AWS, network gear, custom apps — and runs analytics on top. SOAR adds the automation layer.",
    bullets: [
      "Defender for Endpoint (MDE) — EDR for Windows/Mac/Linux/iOS/Android.",
      "Defender for Office 365 (MDO) — anti-phishing, safe links/attachments.",
      "Defender for Identity (MDI) — on-prem AD attack detection.",
      "Defender for Cloud Apps (MDCA) — CASB for SaaS.",
      "Microsoft Sentinel — cloud-native SIEM + SOAR built on Log Analytics.",
    ],
  },
  why: {
    heading: "Why XDR and SIEM together?",
    body:
      "XDR is best-in-class for the Microsoft estate. Sentinel covers everything else. Together they form a single pane of glass: incidents from Defender flow into Sentinel automatically, and Sentinel's playbooks can act back on Defender (isolate device, disable user, block IP).",
  },
  who: {
    heading: "Who operates them?",
    body:
      "Tier-1 SOC analysts triage alerts in Defender XDR. Tier-2/3 analysts and threat hunters write KQL in Sentinel. Incident responders use both to scope and contain. CISOs use the dashboards for posture reporting.",
  },
  when: {
    heading: "When do they fire?",
    body:
      "Continuously. Defender's cloud detonation happens within seconds of an email arriving. EDR sensors stream telemetry every few seconds. Sentinel analytics rules run every 5 minutes by default. Automated playbooks trigger the moment an incident is created.",
  },
  where: {
    heading: "Where do they look?",
    body:
      "Endpoints (any OS), mailboxes, identity systems (cloud + on-prem), SaaS apps, Azure & multi-cloud workloads, network firewalls — anywhere a log can be produced or a sensor installed.",
  },
  how: {
    heading: "How does an investigation flow?",
    body:
      "An MDE alert and an MDO alert correlate into one Defender XDR incident. The analyst sees the full attack story in a graph, runs guided response actions (isolate, collect investigation package), and the incident is mirrored into Sentinel where a SOAR playbook opens a ticket, notifies the user's manager, and revokes Entra sessions.",
  },

  conceptDeepDives: [
    {
      id: "xdr",
      name: "Extended Detection & Response (XDR)",
      oneLine: "Cross-domain incident correlation that turns dozens of alerts into one attack story.",
      formal:
        "XDR ingests telemetry from multiple security domains (endpoint, email, identity, cloud apps, cloud workloads) and uses correlation rules + ML to group related alerts into a single incident with a unified timeline.",
      plainEnglish:
        "Instead of 50 separate alerts that an analyst has to manually connect, XDR shows one incident: 'phishing email → click → credential theft → lateral move'.",
      analogy:
        "A detective board with red string already drawn between suspects, instead of 50 unconnected mugshots.",
      howItWorks:
        "Each Defender product (MDE, MDO, MDI, MDCA) emits alerts. The XDR engine correlates by user, device, file hash, IP, and time. The result appears in the unified Defender portal as an INCIDENT graph.",
      microsoftMapping:
        "Microsoft Defender XDR (formerly Microsoft 365 Defender) is the unified portal at security.microsoft.com.",
      whenToUse:
        "For any Microsoft 365 customer — XDR is included in most M365 E5 / Defender plans.",
      commonMistake:
        "Confusing XDR (cross-domain correlation) with EDR (endpoint only) or SIEM (log aggregation).",
      examAngle:
        "Look for 'correlate alerts across email, endpoint, identity'.",
    },
    {
      id: "siem-soar",
      name: "SIEM + SOAR (Microsoft Sentinel)",
      oneLine: "SIEM ingests logs from EVERYTHING; SOAR automates the response.",
      formal:
        "SIEM (Security Information and Event Management) collects, normalises, and analyses logs from any source. SOAR (Security Orchestration, Automation and Response) executes playbooks (Logic Apps) to respond automatically. Microsoft Sentinel provides both in a cloud-native package.",
      plainEnglish:
        "A giant log warehouse with smart queries on top, plus robots that act on what the queries find.",
      analogy:
        "SIEM is a control room with screens monitoring every camera in the city. SOAR is the dispatch system that automatically sends a unit when something is detected.",
      howItWorks:
        "Connectors pull logs into a Log Analytics workspace. Analytic rules (KQL queries) detect patterns and create incidents. Playbooks (Logic Apps) run automated response actions (notify, block, contain).",
      microsoftMapping:
        "Microsoft Sentinel — cloud-native, pay-per-GB ingestion. Built-in connectors for 100+ sources including AWS, GCP, Cisco, Palo Alto.",
      whenToUse:
        "When you need to monitor non-Microsoft sources OR when you want one SOC pane of glass across the entire estate.",
      commonMistake:
        "Trying to replace XDR with Sentinel. They're complementary — Defender XDR runs Microsoft-deep; Sentinel runs everything-wide.",
      examAngle:
        "Sentinel is the only Microsoft tool on SC-900 described as a SIEM + SOAR.",
    },
    {
      id: "edr",
      name: "Endpoint Detection & Response (EDR)",
      oneLine: "Continuous behavioural monitoring on the endpoint, with the ability to respond.",
      formal:
        "EDR agents collect process, file, network, and registry telemetry from each endpoint, send it to a cloud analytics engine, and expose detection + response capabilities (isolate device, run script, collect forensic package).",
      plainEnglish:
        "Antivirus that doesn't just block known malware — it watches everything the device does and lets you fight back.",
      analogy:
        "A traditional alarm rings when the door opens. EDR is a security camera + the ability to lock the doors remotely.",
      howItWorks:
        "Sensor installed on each device → telemetry streamed to the cloud → behavioural ML and rules raise alerts → analyst (or auto-response) isolates the device and runs investigation actions.",
      microsoftMapping:
        "Microsoft Defender for Endpoint (MDE) — Plan 1 (next-gen AV + attack-surface reduction) vs Plan 2 (full EDR + auto-investigation + threat-hunting).",
      whenToUse:
        "Every modern endpoint. AV alone is insufficient against living-off-the-land attacks.",
      commonMistake:
        "Treating EDR as 'better antivirus'. EDR's value is the BEHAVIOUR + RESPONSE, not just signatures.",
      examAngle:
        "If a question mentions 'isolate device', 'collect investigation package', or 'live response shell' — that's MDE / EDR.",
    },
    {
      id: "cspm-cwpp",
      name: "Defender for Cloud (CSPM + CWPP)",
      oneLine: "Continuously assesses cloud configuration and protects cloud workloads at runtime.",
      formal:
        "CSPM (Cloud Security Posture Management) continuously evaluates cloud resources against best-practice and regulatory baselines, producing a Secure Score and recommendations. CWPP (Cloud Workload Protection Platform) protects running resources (VMs, containers, databases) with EDR-like capabilities.",
      plainEnglish:
        "CSPM is a continuous health-check on your cloud. CWPP is the bodyguard for each running server.",
      analogy:
        "CSPM is the safety inspector who tours the building monthly. CWPP is the guard who stands inside each room 24×7.",
      howItWorks:
        "CSPM scans Azure (free) and optionally AWS/GCP (paid). CWPP plans (Servers, SQL, Storage, Containers, etc.) add runtime sensors and recommendations.",
      microsoftMapping:
        "Microsoft Defender for Cloud (Foundational CSPM = free; Defender CSPM and Defender for Servers/SQL/etc. = paid).",
      whenToUse:
        "Every Azure subscription should have at least the foundational CSPM enabled to track Secure Score.",
      commonMistake:
        "Confusing Defender for Cloud (Azure resources) with Defender for Cloud APPS (SaaS / CASB). Different products.",
      examAngle:
        "CSPM keyword: 'misconfiguration', 'posture', 'recommendations'. CASB keyword: 'shadow IT', 'SaaS discovery'.",
    },
    {
      id: "kql",
      name: "Kusto Query Language (KQL)",
      oneLine: "The query language used to ask questions of Sentinel and Defender data.",
      formal:
        "KQL is a read-only query language inspired by SQL, used to query Azure Data Explorer, Log Analytics, Sentinel, and Defender XDR Advanced Hunting. It uses pipes and a verb-based syntax: TableName | where ... | project ... | summarize ....",
      plainEnglish:
        "Like SQL, but designed for log data and built around 'pipes': start with a table, then chain filters and aggregations.",
      analogy:
        "Think of it as Excel formulas for security logs — start with a sheet, filter rows, summarise columns.",
      howItWorks:
        "SigninLogs | where ResultType != 0 | summarize count() by IPAddress | top 10 by count_",
      microsoftMapping:
        "KQL is the language of Sentinel analytic rules, Defender XDR Advanced Hunting, Azure Monitor, and Log Analytics.",
      whenToUse:
        "Every time you want to detect, hunt, or report inside Microsoft's security stack.",
      commonMistake:
        "Trying to use SQL syntax (SELECT … FROM …). KQL flips it: TABLE | where … | project … .",
      examAngle:
        "SC-900 doesn't ask you to WRITE KQL, but it does expect you to know it's the query language for Sentinel and Advanced Hunting.",
    },
  ],

  comparisons: [
    {
      title: "XDR vs SIEM",
      columns: ["Aspect", "Defender XDR", "Microsoft Sentinel (SIEM/SOAR)"],
      rows: [
        ["Scope", "Microsoft estate (deep)", "Entire enterprise (wide)"],
        ["Primary user", "Tier-1 SOC", "Tier-2/3 SOC, threat hunter"],
        ["Data source", "Defender products", "Any log source via connectors"],
        ["Pricing", "Per-user (Defender plans)", "Per-GB ingested"],
        ["Strength", "Auto-correlation across MS signals", "Custom analytics, multi-vendor coverage"],
      ],
      bottomLine: "XDR for Microsoft-deep, Sentinel for everything-wide. Most enterprises run BOTH.",
    },
    {
      title: "Defender for Cloud vs Defender for Cloud Apps",
      columns: ["Aspect", "Defender for Cloud", "Defender for Cloud Apps"],
      rows: [
        ["Protects", "Azure / AWS / GCP RESOURCES", "SaaS APPLICATIONS"],
        ["Capabilities", "CSPM + CWPP", "CASB (discovery, control, governance)"],
        ["Score", "Secure Score (cloud)", "App risk score per SaaS"],
        ["Example use", "Find unencrypted storage", "Detect shadow IT (Dropbox uploads)"],
      ],
      bottomLine: "Same brand, very different jobs. Don't mix them up on the exam.",
    },
    {
      title: "Microsoft Defender family map",
      columns: ["Product", "Protects", "Domain"],
      rows: [
        ["Defender for Endpoint", "Devices (Win/Mac/Linux/Mobile)", "Endpoint"],
        ["Defender for Office 365", "Email, Teams, SharePoint links", "Email/Collaboration"],
        ["Defender for Identity", "On-prem AD attack signals", "Identity"],
        ["Defender for Cloud Apps", "SaaS apps (CASB)", "SaaS"],
        ["Defender for Cloud", "Azure / multi-cloud workloads", "Cloud Posture"],
        ["Defender XDR", "All of the above (correlated)", "Unified portal"],
      ],
      bottomLine: "Each Defender protects ONE surface. XDR is the umbrella that joins them.",
    },
  ],

  realExamples: [
    {
      title: "Phishing-to-ransomware stopped in 3 minutes",
      scenario:
        "MDO blocks the initial URL but a user forwards the email externally and re-clicks from a phone. MDE detects encrypted outbound to a known C2. Defender XDR auto-isolates the device, disables the user, and rolls back encrypted files using OneDrive version history.",
      outcome: "Zero data lost, full forensic timeline captured.",
    },
    {
      title: "Sentinel detects credential stuffing across cloud and on-prem",
      scenario:
        "An analytic rule joins Entra sign-in logs with Okta logs from a partner SaaS. A spike of failed sign-ins from one ASN triggers an incident. A playbook adds the ASN to a named-location block list and opens a ServiceNow ticket.",
      outcome: "A campaign that would have gone unnoticed is shut down before any account is compromised.",
    },
  ],

  keyTerms: [
    { term: "XDR", definition: "Extended Detection & Response — cross-domain incident correlation." },
    { term: "SIEM", definition: "Security Information & Event Management — log aggregation + analytics." },
    { term: "SOAR", definition: "Security Orchestration, Automation & Response — playbook-driven response." },
    { term: "EDR", definition: "Endpoint Detection & Response — telemetry + response on devices." },
    { term: "CASB", definition: "Cloud Access Security Broker — controls SaaS usage." },
    { term: "CSPM", definition: "Cloud Security Posture Management — find and fix cloud misconfigs." },
    { term: "CWPP", definition: "Cloud Workload Protection Platform — runtime protection for cloud workloads." },
    { term: "KQL", definition: "Kusto Query Language — query logs in Sentinel and Defender." },
    { term: "Incident", definition: "A correlated set of alerts representing one investigation." },
    { term: "Playbook", definition: "An automated response workflow built on Logic Apps." },
    { term: "Secure Score", definition: "A measure of your security posture; higher = better." },
    { term: "MDE / MDO / MDI / MDCA", definition: "Defender for Endpoint / Office 365 / Identity / Cloud Apps." },
  ],

  commonPitfalls: [
    "Confusing Defender for Cloud (Azure resources) with Defender for Cloud Apps (SaaS).",
    "Treating EDR as just antivirus — its real value is the response actions.",
    "Buying Sentinel as a Defender XDR replacement; they complement each other.",
    "Forgetting Sentinel charges per GB ingested — scope your data sources.",
    "Assuming KQL is SQL. Same family, different syntax.",
  ],

  faqs: [
    { q: "Is Defender XDR included in Microsoft 365 E5?", a: "Yes — E5 Security includes the unified Defender XDR portal and all Defender Plan 2 components." },
    { q: "Is Sentinel included in any M365 SKU?", a: "No. Sentinel is a separate Azure service billed per GB of data ingested." },
    { q: "Do I need agents on every device for MDE?", a: "Yes for Plan 2 EDR. Onboarding is built into Windows 10/11 enterprise; for older OSes you install the sensor." },
    { q: "Can Sentinel replace my current SIEM?", a: "Yes for most use-cases — many enterprises migrate from Splunk/QRadar to Sentinel for cost and Microsoft integration." },
    { q: "Is KQL hard to learn?", a: "Microsoft provides a free 'KQL from scratch' course; analysts pick up the basics in an afternoon." },
  ],

  selfCheck: [
    {
      question: "Which Microsoft service correlates alerts from email, endpoints, identities, and SaaS into a single incident?",
      options: ["Microsoft Sentinel", "Microsoft Defender XDR", "Defender for Cloud", "Azure Monitor"],
      correctIndex: 1,
      explanation: "Cross-domain correlation across the Microsoft estate is the defining feature of Defender XDR. Sentinel ingests logs from anywhere but doesn't itself do this Microsoft-deep correlation.",
    },
    {
      question: "Your SOC needs to ingest logs from Cisco firewalls and AWS CloudTrail. Which Microsoft product?",
      options: ["Defender XDR", "Defender for Endpoint", "Microsoft Sentinel", "Microsoft Purview"],
      correctIndex: 2,
      explanation: "Sentinel is the cloud-native SIEM with connectors for non-Microsoft sources like Cisco and AWS.",
    },
    {
      question: "Which Defender product is a CASB for SaaS apps like Dropbox and Salesforce?",
      options: ["Defender for Cloud", "Defender for Cloud Apps", "Defender for Identity", "Defender for Office 365"],
      correctIndex: 1,
      explanation: "Defender for Cloud APPS is the CASB. Defender for Cloud (no apps) is for Azure/AWS/GCP workloads.",
    },
  ],

  examTips: [
    "Defender XDR = Microsoft estate. Sentinel = everything (incl. non-Microsoft).",
    "Sentinel is the only Microsoft offering on the exam that's a true SIEM + SOAR.",
    "Defender for Cloud = Azure workloads (CSPM/CWPP). Defender for Cloud Apps = SaaS (CASB). Different products.",
    "Microsoft Secure Score (M365) ≠ Secure Score for Cloud (Azure).",
  ],

  furtherReading: [
    { label: "Microsoft Defender XDR", url: "https://learn.microsoft.com/defender-xdr/microsoft-365-defender" },
    { label: "Microsoft Sentinel overview", url: "https://learn.microsoft.com/azure/sentinel/overview" },
    { label: "Defender for Cloud overview", url: "https://learn.microsoft.com/azure/defender-for-cloud/defender-for-cloud-introduction" },
  ],
};

/* ============================================================== */
/* MODULE 5 — COMPLIANCE & GOVERNANCE                             */
/* ============================================================== */
const m5: ModuleExplanation = {
  moduleSlug: "compliance",
  tagline: "Know your data, protect it, prove it.",
  overview:
    "Module 5 covers Microsoft Purview — the unified governance, risk, and compliance platform. It includes data classification, sensitivity labels, Data Loss Prevention (DLP), insider risk management, eDiscovery, and the Compliance Manager scoring engine.",
  whyItMatters:
    "GDPR, HIPAA, PCI-DSS, and now AI regulations all demand the same three things: know what data you have, protect it according to its sensitivity, and prove on demand that you did. Purview is Microsoft's answer across Microsoft 365, Azure, and (increasingly) multi-cloud.",

  what: {
    heading: "What is Microsoft Purview?",
    body:
      "Purview is a portfolio: Information Protection (labels, encryption), Data Loss Prevention (policies that block oversharing), Insider Risk Management (behavioural analytics on users), eDiscovery (legal hold and review), Compliance Manager (control scoring), and Audit (unified log).",
    bullets: [
      "Sensitivity labels — classify and protect (encrypt, watermark, restrict).",
      "DLP — block or warn when sensitive data leaves trusted boundaries.",
      "Records management — retain or delete on schedule.",
      "eDiscovery (Standard / Premium) — legal hold + collection + review.",
      "Compliance Manager — track controls against regulatory templates.",
    ],
  },
  why: {
    heading: "Why Purview, why now?",
    body:
      "Data has exploded across SharePoint, Teams, OneDrive, endpoints, and SaaS. Spreadsheet-based governance no longer scales. Purview applies labels and policies that travel WITH the data — even outside the tenant — so protection survives sharing.",
  },
  who: {
    heading: "Who uses Purview?",
    body:
      "Compliance officers design labels and policies. Legal teams run eDiscovery. Privacy officers handle subject-rights requests. Insider risk analysts review case alerts. End users see labels in Word/Outlook and DLP tooltips when they overshare.",
  },
  when: {
    heading: "When does Purview act?",
    body:
      "At creation (auto-labelling), at edit (label inheritance), at share (DLP evaluation), at retention age (records disposal), and at investigation (eDiscovery hold). Compliance Manager continuously rescores controls.",
  },
  where: {
    heading: "Where does Purview reach?",
    body:
      "Microsoft 365 (Exchange, SharePoint, Teams, OneDrive), Windows endpoints, Azure data services (via Purview Data Map), and increasingly AWS S3, Google Drive, and on-prem file shares via connectors.",
  },
  how: {
    heading: "How do labels and DLP work together?",
    body:
      "A sensitivity label tags content and can apply encryption + visual markings. A DLP policy uses that label as a condition: 'if Confidential and shared with external user, block and notify'. The classification follows the file even when downloaded.",
  },

  conceptDeepDives: [
    {
      id: "sensitivity-labels",
      name: "Sensitivity Labels",
      oneLine: "A persistent tag that classifies content and optionally enforces encryption + visual markings.",
      formal:
        "A sensitivity label is metadata applied to a file, email, container, or schematized data asset that travels with the content. It can apply encryption (Microsoft Purview Information Protection / Azure Rights Management), content marking (header, footer, watermark), and access restrictions.",
      plainEnglish:
        "A sticker on a file that says 'Confidential' AND locks it so only the right people can open it.",
      analogy:
        "Like the 'TOP SECRET' stamp on a paper file plus a tamper-evident envelope that only certain people can open.",
      howItWorks:
        "Admin defines the label taxonomy (Public → Confidential → Highly Confidential). Users apply manually or auto-classification applies it based on content match. Encryption uses Azure RMS; access policy is enforced wherever the file goes.",
      microsoftMapping:
        "Microsoft Purview Information Protection. Available in M365 E3 (basic) and E5 (auto-labelling, advanced classifiers).",
      whenToUse:
        "Always — start with 3–5 labels. Even unencrypted labels enable DLP, retention, and audit.",
      commonMistake:
        "Confusing sensitivity labels (CLASSIFY + PROTECT) with retention labels (KEEP / DELETE on schedule). Different jobs.",
      examAngle:
        "If the question mentions 'encryption that follows the file' or 'classification + protection in one step', the answer is sensitivity labels.",
    },
    {
      id: "dlp",
      name: "Data Loss Prevention (DLP)",
      oneLine: "Policies that detect and block risky sharing of sensitive data.",
      formal:
        "DLP scans content (using sensitive-info types, trainable classifiers, and labels) at the point of action (send, share, download) and applies controls — block, warn, audit, encrypt — based on policy.",
      plainEnglish:
        "Software that watches over your shoulder and politely stops you from emailing the customer database to your personal Gmail.",
      analogy:
        "An airport bag scanner: every item passes through; banned items are flagged or confiscated; everything else moves on.",
      howItWorks:
        "DLP policy: LOCATIONS (Exchange, SharePoint, OneDrive, Teams, Devices, third-party via MDCA) + RULES (sensitive info types, label, classifier match) + ACTIONS (block, warn, audit, encrypt, notify).",
      microsoftMapping:
        "Microsoft Purview DLP. Endpoint DLP requires Microsoft 365 E5 / Compliance E5.",
      whenToUse:
        "Wherever sensitive data lives. Start in audit-only mode to tune false positives, then enforce.",
      commonMistake:
        "Setting DLP to BLOCK on day one — flood of false positives breaks workflows. Always start in audit + tooltip mode.",
      examAngle:
        "DLP locations include Devices (endpoint DLP) and third-party via MDCA, not just Exchange/SharePoint.",
    },
    {
      id: "retention",
      name: "Retention Labels & Policies",
      oneLine: "Decide how long content is KEPT and what happens after.",
      formal:
        "Retention policies apply to LOCATIONS (e.g. all SharePoint sites). Retention labels apply to CONTENT (a file or email). Both control: retain for X years, then delete (or trigger review). Records management adds immutability and disposition workflows.",
      plainEnglish:
        "Rules that automatically keep emails for 7 years and then bin them — or lock them so they can't be deleted early.",
      analogy:
        "Like a self-emptying filing cabinet: contracts stay for 7 years, then auto-shred; receipts vanish after 1.",
      howItWorks:
        "Define label → set retention period → define final action (delete / start disposition review / do nothing). Apply via policy (location-wide), default-label on libraries, or auto-apply via classifiers.",
      microsoftMapping:
        "Microsoft Purview Data Lifecycle Management + Records Management.",
      whenToUse:
        "Any data with regulatory retention (tax: 7 years; medical: longer; HR: varies).",
      commonMistake:
        "Confusing retention with backup. Retention is a policy on LIVE data; backup is a separate copy for recovery.",
      examAngle:
        "Sensitivity = CLASSIFY + PROTECT. Retention = KEEP + DELETE. Don't merge them.",
    },
    {
      id: "ediscovery",
      name: "eDiscovery",
      oneLine: "The legal process of finding, preserving, collecting, and reviewing electronic evidence.",
      formal:
        "Microsoft Purview eDiscovery (Standard) covers search, hold, and export. eDiscovery (Premium) adds custodian management, legal hold notifications, review sets with redaction, and advanced analytics (near-duplicates, themes, predictive coding).",
      plainEnglish:
        "When lawyers say 'find every email about the Acme deal and freeze them so nobody can delete them' — eDiscovery is the tool.",
      analogy:
        "A police evidence room with chain-of-custody. Premium adds a forensic lab that groups, redacts, and analyses the evidence.",
      howItWorks:
        "Create a case → identify custodians → place legal hold → search across mailboxes/SharePoint/Teams → review in a review set → export with chain-of-custody manifest.",
      microsoftMapping:
        "Microsoft Purview eDiscovery (Standard) included with M365 E3; (Premium) requires E5 / Compliance E5.",
      whenToUse:
        "Any legal hold, GDPR subject-rights request, regulatory inquiry, or internal investigation.",
      commonMistake:
        "Using regular search & purge for legal matters. Without legal hold, custodians can delete evidence.",
      examAngle:
        "Standard vs Premium: Premium adds CUSTODIAN management and REVIEW SET analytics.",
    },
    {
      id: "compliance-manager",
      name: "Compliance Manager",
      oneLine: "Quantifies your compliance posture against regulatory templates and gives a Compliance Score.",
      formal:
        "Compliance Manager maps your tenant configuration to controls in regulatory frameworks (ISO 27001, NIST 800-53, GDPR, etc.). Microsoft-managed controls are scored automatically; customer controls require evidence (uploaded or attested).",
      plainEnglish:
        "A live audit dashboard that says 'you're 72% compliant with GDPR — here are the next 5 things to fix'.",
      analogy:
        "A fitness tracker for your compliance program — daily score, trend lines, suggested workouts.",
      howItWorks:
        "Choose assessments (templates) → Microsoft pre-fills its controls → you complete customer-action controls and upload evidence → score updates.",
      microsoftMapping:
        "Microsoft Purview Compliance Manager.",
      whenToUse:
        "Any regulated industry. Use assessments aligned to your auditors' framework.",
      commonMistake:
        "Treating the score as the goal. The score is a PROXY — auditors still want evidence, not just a number.",
      examAngle:
        "Compliance Manager is the SCORE engine; Compliance Portal is the host site at compliance.microsoft.com.",
    },
    {
      id: "insider-risk",
      name: "Insider Risk Management",
      oneLine: "Behavioural analytics on your own users to detect risky activity (data theft, leaks, harassment).",
      formal:
        "Insider Risk Management (IRM) uses ML and HR signals to detect risky patterns (mass downloads, anomalous file access, departing-employee behaviour). Cases pseudonymise the user until an analyst escalates, balancing detection with privacy.",
      plainEnglish:
        "Watches employees for warning signs of data theft or leaks WITHOUT exposing names until needed.",
      analogy:
        "An office security camera that initially blurs faces; only escalated incidents reveal who.",
      howItWorks:
        "Connect HR data (terminations, performance) → enable policies (departing-user, data theft, security) → IRM raises alerts → analyst triages cases → escalate to investigation/legal as needed.",
      microsoftMapping:
        "Microsoft Purview Insider Risk Management — requires Microsoft 365 E5 / Compliance E5.",
      whenToUse:
        "Industries with high IP value (engineering, finance, pharma) and during workforce reductions.",
      commonMistake:
        "Skipping the privacy-by-design pseudonymisation step — turns the tool into surveillance.",
      examAngle:
        "Distinguish IRM (insider users) from Defender XDR (external attackers) — different problem space.",
    },
  ],

  comparisons: [
    {
      title: "Sensitivity vs Retention labels",
      columns: ["Aspect", "Sensitivity label", "Retention label"],
      rows: [
        ["Purpose", "Classify + protect", "Keep or delete on schedule"],
        ["Applies to", "Files, emails, containers", "Files, emails, records"],
        ["Enforces", "Encryption, marking, access", "Retention period, disposition"],
        ["Visible to user", "Yes (header/footer/banner)", "Sometimes (records label)"],
      ],
      bottomLine: "Sensitivity = WHO can see it. Retention = HOW LONG it lives.",
    },
    {
      title: "eDiscovery Standard vs Premium",
      columns: ["Capability", "Standard", "Premium"],
      rows: [
        ["Search & hold", "✓", "✓"],
        ["Export", "✓", "✓"],
        ["Custodian management", "—", "✓"],
        ["Legal hold notifications", "—", "✓"],
        ["Review sets with redaction", "—", "✓"],
        ["Advanced analytics (near-dup, themes)", "—", "✓"],
      ],
      bottomLine: "Premium = full legal workflow. Standard = search, hold, export only.",
    },
    {
      title: "Defender for Cloud Apps vs Purview DLP",
      columns: ["Aspect", "Defender for Cloud Apps (CASB)", "Purview DLP"],
      rows: [
        ["Focus", "SaaS app usage governance", "Data-leak prevention by content"],
        ["Discovers", "Shadow IT / risky apps", "Sensitive content inside apps"],
        ["Action", "Block apps, sanction, control sessions", "Block/warn on share of sensitive data"],
        ["Surface", "Browser + sanctioned APIs", "Exchange, SPO, OneDrive, Teams, Endpoint"],
      ],
      bottomLine: "MDCA controls APP USE. Purview DLP controls DATA MOVEMENT. Often used together.",
    },
  ],

  realExamples: [
    {
      title: "M&A leak prevented at the click",
      scenario:
        "An analyst tries to email a deal model labelled 'Confidential / M&A' to a Gmail address. DLP shows a policy tip, blocks the send, and logs the attempt. The user clicks 'Report — false positive', which routes to compliance for review.",
      outcome: "Sensitive deal data stays inside; the user learns the policy in context.",
    },
    {
      title: "Subject Access Request closed in 5 days, not 5 weeks",
      scenario:
        "A customer requests all their personal data under GDPR. Purview eDiscovery (Premium) searches mailboxes, Teams chats, and SharePoint sites in one query, places a hold, and exports a defensible package.",
      outcome: "Compliance with the 30-day legal deadline — and a repeatable workflow for the next request.",
    },
  ],

  keyTerms: [
    { term: "Sensitivity label", definition: "Persistent tag that classifies and optionally encrypts content." },
    { term: "Retention label / policy", definition: "Controls how long content is kept and what happens after." },
    { term: "DLP", definition: "Data Loss Prevention — detects and blocks risky sharing." },
    { term: "eDiscovery", definition: "Identify, hold, collect, review, export ESI for legal." },
    { term: "Insider Risk Management", definition: "Detects risky behaviour by internal users." },
    { term: "Compliance Manager", definition: "Tenant-wide compliance score against regulatory templates." },
    { term: "Records Management", definition: "Immutable retention with disposition review for declared records." },
    { term: "Sensitive Info Type (SIT)", definition: "Pattern (e.g. credit-card number) that DLP and labels match on." },
    { term: "Trainable classifier", definition: "ML model trained on sample documents to classify content (e.g. CV, contract)." },
    { term: "Audit (Standard/Premium)", definition: "Unified audit log across M365 services." },
    { term: "Communication Compliance", definition: "Reviews messages for harassment, sensitive info, or regulatory keywords." },
    { term: "Data Map (Purview)", definition: "Catalog and lineage of data assets across cloud and on-prem." },
  ],

  commonPitfalls: [
    "Confusing sensitivity labels (CLASSIFY + PROTECT) with retention labels (KEEP + DELETE).",
    "Setting DLP to block on day one without an audit phase — generates user backlash.",
    "Forgetting that DLP can scan ENDPOINTS (endpoint DLP), not only cloud locations.",
    "Using the regular search to comply with legal hold instead of eDiscovery.",
    "Treating Compliance Manager's score as the audit deliverable — auditors want evidence, not a number.",
  ],

  faqs: [
    { q: "Do sensitivity labels work outside Microsoft 365?", a: "Yes — protected files (with encryption) honour the policy on any device with the Microsoft Information Protection client; non-Microsoft viewers see encrypted content only." },
    { q: "Can I auto-apply sensitivity labels?", a: "Yes, in M365 E5 / Compliance E5 using sensitive-info types or trainable classifiers." },
    { q: "What's the difference between Communication Compliance and Insider Risk?", a: "Communication Compliance reviews CONTENT of messages; Insider Risk reviews BEHAVIOUR (downloads, file moves)." },
    { q: "Does eDiscovery search Teams chats?", a: "Yes — Teams chats are stored in users' mailboxes (1:1) or group mailboxes (channels) and are eDiscoverable." },
    { q: "Where do I find Purview?", a: "compliance.microsoft.com (Microsoft Purview compliance portal) and purview.microsoft.com (Data Map / governance)." },
  ],

  selfCheck: [
    {
      question: "You need to ensure a confidential file stays encrypted even when downloaded to a partner laptop. Which Microsoft Purview capability?",
      options: ["DLP", "Sensitivity labels with encryption", "Retention labels", "Insider Risk Management"],
      correctIndex: 1,
      explanation: "Sensitivity labels apply persistent encryption that travels with the file. DLP blocks oversharing but doesn't encrypt the file at rest off-tenant.",
    },
    {
      question: "Legal asks you to preserve all mailboxes related to project Apollo. Which capability is correct?",
      options: ["DLP", "Retention policy", "eDiscovery legal hold", "Sensitivity label"],
      correctIndex: 2,
      explanation: "Legal hold via eDiscovery preserves content (preventing deletion) for the duration of a case. A retention policy keeps data on a schedule but isn't tied to a specific legal matter.",
    },
    {
      question: "Which TWO products often combine to control SaaS-app data risk?",
      options: ["Defender for Cloud + Sentinel", "Defender for Cloud Apps + Purview DLP", "Defender for Endpoint + RBAC", "Identity Protection + Conditional Access"],
      correctIndex: 1,
      explanation: "MDCA controls WHICH SaaS apps are used; Purview DLP controls WHICH DATA can leave them. Combined, they govern SaaS-data risk.",
    },
  ],

  examTips: [
    "Sensitivity labels = CLASSIFY + PROTECT. Retention labels = KEEP / DELETE. They're different.",
    "DLP locations: Exchange, SharePoint, OneDrive, Teams chat, Devices, third-party apps via MDCA.",
    "eDiscovery Premium adds CUSTODIAN management, REVIEW SETS, and ANALYTICS over Standard.",
    "Compliance Manager score is improvement-based — completing assessments raises it.",
  ],

  furtherReading: [
    { label: "Microsoft Purview overview", url: "https://learn.microsoft.com/purview/purview" },
    { label: "Sensitivity labels", url: "https://learn.microsoft.com/purview/sensitivity-labels" },
    { label: "Compliance Manager", url: "https://learn.microsoft.com/purview/compliance-manager" },
  ],
};

export const moduleExplanations: ModuleExplanation[] = [m1, m2, m3, m4, m5];

export function getModuleExplanation(slug: string): ModuleExplanation | undefined {
  return moduleExplanations.find((m) => m.moduleSlug === slug);
}
