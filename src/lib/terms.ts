// Public Terms & Conditions content shared by /terms page and (optionally) export pipelines.
// Keep wording in sync with /mnt/documents/ShadowXLab-Terms-and-Conditions.pdf

export const TERMS_BRAND = "ShadowXLab Academy";
export const TERMS_SITE = "shadowxlab.academy";
export const TERMS_EFFECTIVE = "Effective Date: 27 April 2026";

export type Tier = {
  code: string;
  name: string;
  purpose: string;
  deliverables: string[];
  accessWindow: string;
  completion: string;
  eligibility: string;
};

export const TIERS: Tier[] = [
  {
    code: "1H",
    name: "1-Hour Course",
    purpose: "Introductory micro-session covering a single concept or tool walkthrough.",
    deliverables: [
      "1 live or recorded session of up to 60 minutes",
      "Access to one reference handout",
      "No graded labs or certification",
    ],
    accessWindow: "7 days from the date access is granted by the administrator.",
    completion: "Marked complete upon attendance or full playback of the session.",
    eligibility: "No certificate of completion is issued for this tier.",
  },
  {
    code: "2H",
    name: "2-Hour Course",
    purpose: "Focused topic deep-dive with one guided exercise.",
    deliverables: [
      "Up to 120 minutes of instruction",
      "1 guided lab walkthrough",
      "Topic cheat-sheet (PDF)",
    ],
    accessWindow: "14 days from the date access is granted by the administrator.",
    completion: "Marked complete upon finishing the guided exercise and short post-check.",
    eligibility: "Digital participation acknowledgement issued on completion.",
  },
  {
    code: "4H",
    name: "4-Hour Course",
    purpose: "Half-day workshop combining theory, hands-on labs, and a knowledge check.",
    deliverables: [
      "Up to 240 minutes of instruction",
      "2 hands-on labs in the simulated environment",
      "End-of-course quiz with review",
    ],
    accessWindow: "30 days from the date access is granted by the administrator.",
    completion: "Marked complete upon achieving a minimum quiz score of 60%.",
    eligibility: "Digital certificate of participation issued on successful completion.",
  },
  {
    code: "8H",
    name: "8-Hour Course",
    purpose: "Full-day intensive covering an end-to-end scenario with assessed labs.",
    deliverables: [
      "Up to 480 minutes of instruction across modules",
      "4 hands-on labs and 1 capstone scenario",
      "Final assessment with proctored review",
    ],
    accessWindow: "60 days from the date access is granted by the administrator.",
    completion: "Marked complete upon achieving a minimum final assessment score of 70%.",
    eligibility: "Digital certificate of completion with verifiable ID issued on success.",
  },
];

export type TermsSection = {
  id: string;
  title: string;
  body: string[];
  hasTierTable?: boolean;
};

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    body: [
      `These Terms and Conditions ("Terms") govern your enrollment in and use of the short-format paid courses ("Courses") offered by ${TERMS_BRAND} ("we", "us", "our") through ${TERMS_SITE} and related platforms.`,
      `By submitting an enrollment request, accepting an admin-granted access invitation, or accessing any Course content, you ("Learner", "you") agree to be bound by these Terms in full. If you do not agree, you must not access or use the Courses.`,
    ],
  },
  {
    id: "definitions",
    title: "2. Definitions",
    body: [
      `"Course" means any of the 1-Hour, 2-Hour, 4-Hour, or 8-Hour learning offerings described in Section 4.`,
      `"Access Window" means the period during which a Learner may consume a specific Course after access has been granted.`,
      `"Platform" means the websites, applications, simulators, and labs operated by us.`,
      `"Content" means all videos, text, labs, simulations, assessments, datasets, and materials made available through a Course.`,
    ],
  },
  {
    id: "enrollment",
    title: "3. Enrollment & Access",
    body: [
      "Enrollment is completed in two steps: (a) you submit an enrollment request through the Platform, and (b) an authorized administrator reviews and grants access to the selected Course.",
      "Access is personal, non-transferable, and limited to a single Learner account. You may not share credentials, recordings, or lab environments with any third party.",
      "We reserve the right to refuse, suspend, or revoke access at any time for breach of these Terms, suspected fraud, abusive behaviour, or operational reasons, with or without prior notice.",
    ],
  },
  {
    id: "tiers",
    title: "4. Course Tiers",
    body: [
      "We offer four short-format Course tiers. The duration, deliverables, Access Window, and completion criteria for each are described in the table below. Specific module names and schedules for any cohort are provided at the time of enrollment.",
    ],
    hasTierTable: true,
  },
  {
    id: "fees",
    title: "5. Fees & Payment",
    body: [
      "Course fees are communicated to you at the time of enrollment and are payable in full before access is granted, unless an alternative arrangement is agreed in writing.",
      "All fees are exclusive of applicable taxes, transaction charges, and currency conversion fees, which are payable by the Learner.",
      "We may revise pricing for future enrollments at any time without notice. Revised pricing does not affect Learners who have already been granted access for a given Course.",
    ],
  },
  {
    id: "refunds",
    title: "6. Refunds & Cancellations",
    body: [
      "All fees are non-refundable by default. Refund requests are evaluated on a case-by-case basis at our sole and absolute discretion, and approval of one request does not create any obligation to approve future requests.",
      "Where considered, refund requests must be submitted in writing within 7 days of access being granted, and only Courses with no consumed labs, assessments, or live sessions will be eligible for review.",
      "Cancellations initiated by us due to insufficient enrollment, instructor unavailability, or force majeure events will result in either rescheduling or, at our discretion, a full or partial credit toward another Course.",
    ],
  },
  {
    id: "conduct",
    title: "7. Learner Conduct",
    body: [
      "You agree to use the Platform and Content only for lawful, personal, educational purposes. You will not attempt to reverse engineer, scrape, resell, or republish any Content.",
      "Disruptive behaviour during live sessions, harassment of instructors or peers, or misuse of lab environments may result in immediate access revocation without refund.",
      "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.",
    ],
  },
  {
    id: "ip",
    title: "8. Intellectual Property",
    body: [
      `All Content is the intellectual property of ${TERMS_BRAND} or its licensors and is protected by applicable copyright, trademark, and other laws.`,
      "On payment and grant of access, you receive a limited, revocable, non-exclusive, non-transferable licence to access the Content solely for personal learning during the applicable Access Window.",
      "You may not record, copy, distribute, publicly display, or create derivative works from any Content without our prior written consent.",
    ],
  },
  {
    id: "labs",
    title: "9. Labs, Simulators & Third-Party Tools",
    body: [
      "Some Courses provide access to simulated environments and references to third-party tools or platforms. Such third-party services are governed by their own terms, and we are not responsible for their availability, accuracy, or actions.",
      "Lab environments are provided for educational use only. You must not use them to test, attack, or interact with any system, network, or account that you do not own or are not explicitly authorised to test.",
    ],
  },
  {
    id: "certificates",
    title: "10. Certificates & Outcomes",
    body: [
      "Where a tier includes a certificate, it acknowledges participation or completion of the relevant criteria only. It is not equivalent to, and does not substitute for, any vendor or industry certification.",
      "We make no guarantee of employment, interview opportunities, salary outcomes, or examination success arising from your participation in any Course.",
    ],
  },
  {
    id: "privacy",
    title: "11. Privacy & Data",
    body: [
      "Personal information collected during enrollment and use of the Platform is processed in accordance with our Privacy Policy, available on the Platform.",
      "By enrolling, you consent to the processing of your information for the purposes of delivering the Course, communicating with you, and improving our services.",
    ],
  },
  {
    id: "warranty",
    title: "12. Disclaimers",
    body: [
      `The Platform and Content are provided on an "as is" and "as available" basis. We do not warrant uninterrupted or error-free access, nor that the Content will meet your specific requirements.`,
      "To the maximum extent permitted by applicable law, we disclaim all implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.",
    ],
  },
  {
    id: "liability",
    title: "13. Limitation of Liability",
    body: [
      `To the maximum extent permitted by law, the aggregate liability of ${TERMS_BRAND}, its affiliates, officers, employees, and contractors arising out of or relating to your use of the Courses shall not exceed the fees actually paid by you for the specific Course giving rise to the claim.`,
      "We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill, or business opportunity.",
    ],
  },
  {
    id: "suspension",
    title: "14. Suspension & Termination",
    body: [
      "We may suspend or terminate your access to any Course or the Platform at any time for breach of these Terms, non-payment, abuse of resources, or where required by law. Termination for cause does not entitle you to any refund.",
      "Sections relating to Intellectual Property, Disclaimers, Limitation of Liability, Governing Law, and any clause that by its nature should survive will survive termination of these Terms.",
    ],
  },
  {
    id: "changes",
    title: "15. Changes to These Terms",
    body: [
      "We may update these Terms from time to time. The updated version will be posted on the Platform with a revised effective date. Continued use of the Platform or Courses after the effective date constitutes acceptance of the revised Terms.",
    ],
  },
  {
    id: "law",
    title: "16. Governing Law & Disputes",
    body: [
      "These Terms shall be governed by and construed in accordance with the laws applicable at the principal place of business of the operating entity, without regard to conflict-of-laws principles.",
      "The parties shall first attempt to resolve any dispute through good-faith negotiation. If unresolved within 30 days, the dispute shall be referred to binding arbitration or to the competent courts at the principal place of business of the operating entity, at our election.",
    ],
  },
  {
    id: "contact",
    title: "17. Contact",
    body: [
      `For any questions regarding these Terms, please contact us through the support channel listed on ${TERMS_SITE}.`,
    ],
  },
];
