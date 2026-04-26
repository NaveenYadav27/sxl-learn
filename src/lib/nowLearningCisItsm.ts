// Mirror of the official ServiceNow Now Learning achievement page for CIS-ITSM:
// https://learning.servicenow.com/lxp/en/pages/now-learning-get-certified?id=amap_detail&achievement_id=6c8e1d77dbc27f40de3cdb85ca961970
// Informational only — links out to the official resources.

export type JourneyResource = {
  title: string;
  url: string;
  kind: "course" | "credential" | "simulator" | "exam" | "collection" | "quiz";
  durationLabel?: string;
  language?: string;
};

export type JourneyStep = {
  number: number;
  title: string;
  description: string;
  rule: "complete-all" | "earn-credential" | "any";
  resources: JourneyResource[];
};

export const NOW_LEARNING_URL =
  "https://learning.servicenow.com/lxp/en/pages/now-learning-get-certified?id=amap_detail&achievement_id=6c8e1d77dbc27f40de3cdb85ca961970";

export const EXAM_REGISTRATION_URL =
  "https://learning.servicenow.com/lxp/en/it-service-management/certified-implementation-specialist-it-service?id=learning_content_prev&course_id=3e531eb947b47210850ec705f16d434b";

export const CREDENTIALING_GUIDE_URL =
  "https://www.servicenow.com/services/training-and-certification/journey/#/";

export const CREDLY_BADGE_INFO_URL =
  "https://learning.servicenow.com/lxp/en/credentials/showcase-your-expertise-with-servicenow-digital-badges-powered?id=kb_article_view&sysparm_article=KB0012880";

export const cisItsmJourney: JourneyStep[] = [
  {
    number: 1,
    title: "Suggested pre-requisites",
    description: "Build foundational ServiceNow knowledge before specialising in ITSM.",
    rule: "complete-all",
    resources: [
      {
        title: "Welcome to ServiceNow",
        kind: "course",
        url: "https://learning.servicenow.com/lxp",
      },
      {
        title: "ServiceNow Administration Fundamentals / CSA",
        kind: "course",
        url: "https://learning.servicenow.com/lxp",
      },
      {
        title: "Get Started with the Now Create Methodology",
        kind: "course",
        url: "https://learning.servicenow.com/lxp?id=learning_course_prev&course_id=f13a1e8ddb6890503e73166e139619a7",
        durationLabel: "48m",
        language: "EN",
      },
      {
        title: "ServiceNow Platform Implementation",
        kind: "course",
        url: "https://learning.servicenow.com/lxp",
      },
    ],
  },
  {
    number: 2,
    title: "Earn the Data Foundations credential",
    description: "Complete the recommended Data Foundations training and earn the required certification.",
    rule: "earn-credential",
    resources: [
      {
        title: "Certified Implementation Specialist – Data Foundations (CMDB and CSDM) — CIS-DF",
        kind: "credential",
        url: "https://learning.servicenow.com/lxp",
      },
    ],
  },
  {
    number: 3,
    title: "Specialisation courses",
    description: "Proceed with the recommended ITSM specialisation courses.",
    rule: "complete-all",
    resources: [
      {
        title: "IT Service Management (ITSM) Fundamentals",
        kind: "course",
        url: "https://learning.servicenow.com/lxp",
      },
      {
        title: "IT Service Management (ITSM) Implementation",
        kind: "course",
        url: "https://learning.servicenow.com/lxp",
      },
    ],
  },
  {
    number: 4,
    title: "Optional simulator practice",
    description: "Take the official ITSM Implementation Simulator for extra hands-on reps before the exam.",
    rule: "any",
    resources: [
      {
        title: "IT Service Management (ITSM) Implementation Simulator",
        kind: "simulator",
        url: "https://learning.servicenow.com/lxp?id=learning_course_prev&course_id=50cc03df970ea554524eb3cf9153af43",
        durationLabel: "4h 25m",
        language: "EN",
      },
    ],
  },
  {
    number: 5,
    title: "Sit the certification exam",
    description: "Take the proctored Pearson VUE exam to earn the CIS-ITSM credential and Credly badge.",
    rule: "any",
    resources: [
      {
        title: "Certified Implementation Specialist – IT Service Management (CIS-ITSM)",
        kind: "exam",
        url: EXAM_REGISTRATION_URL,
        durationLabel: "1h 30m",
        language: "EN",
      },
    ],
  },
  {
    number: 6,
    title: "Continue your ITSM journey",
    description: "Keep learning after the exam with the recommended follow-on path.",
    rule: "any",
    resources: [
      {
        title: "Additional Recommended Courses for IT Service Management Implementers",
        kind: "collection",
        url: "https://learning.servicenow.com/lxp?id=learning_path_prev&path_id=d040b418dbc5a0107aa13df339961984",
        durationLabel: "4d 22h 53m",
        language: "EN",
      },
    ],
  },
];

/** Per-release delta practice quizzes from the same Now Learning page. */
export const cisItsmDeltaQuizzes: JourneyResource[] = [
  { title: "Vancouver", kind: "quiz", durationLabel: "1h", language: "EN", url: "https://learning.servicenow.com/lxp?id=learning_content_prev&course_id=36d6b1738722b154f40fc95d0ebb3511" },
  { title: "Washington", kind: "quiz", durationLabel: "1h 30m", language: "EN", url: "https://learning.servicenow.com/lxp?id=learning_content_prev&course_id=4cb2e36e87ae429c6a0bedbd0ebb35ca" },
  { title: "Xanadu", kind: "quiz", durationLabel: "1h 30m", language: "EN", url: "https://learning.servicenow.com/lxp?id=learning_content_prev&course_id=d4c190674765de90c00af235126d4390" },
  { title: "Yokohama", kind: "quiz", durationLabel: "1m", language: "EN", url: "https://learning.servicenow.com/lxp?id=learning_content_prev&course_id=666d88da839622d00593bcffeeaad3bb" },
  { title: "San Diego", kind: "quiz", durationLabel: "1h", language: "EN", url: "https://learning.servicenow.com/lxp?id=learning_content_prev&course_id=44a687ef1b9f4110998555fa234bcbd9" },
  { title: "Tokyo", kind: "quiz", durationLabel: "1h", language: "EN", url: "https://learning.servicenow.com/lxp?id=learning_content_prev&course_id=993e2ab787879d1024e0bb39dabb35fd" },
  { title: "Rome", kind: "quiz", durationLabel: "1h", language: "EN", url: "https://learning.servicenow.com/lxp?id=learning_content_prev&course_id=d753e1991b9ff0d008e4dce4bd4bcb62" },
  { title: "Paris", kind: "quiz", durationLabel: "1h", language: "EN", url: "https://learning.servicenow.com/lxp?id=learning_content_prev&course_id=d346bc171bdc3c50c93aece03d4bcb3a" },
  { title: "Orlando", kind: "quiz", durationLabel: "1h", language: "EN", url: "https://learning.servicenow.com/lxp?id=learning_content_prev&course_id=fbdbe5251b243c10c93aece03d4bcbd4" },
  { title: "New York", kind: "quiz", durationLabel: "1h", language: "EN", url: "https://learning.servicenow.com/lxp?id=learning_content_prev&course_id=93abede11b243c10c93aece03d4bcbda" },
  { title: "Madrid", kind: "quiz", durationLabel: "1h", language: "EN", url: "https://learning.servicenow.com/lxp?id=learning_content_prev&course_id=cb4beda11b243c10c93aece03d4bcbd8" },
  { title: "London", kind: "quiz", durationLabel: "1h", language: "EN", url: "https://learning.servicenow.com/lxp?id=learning_content_prev&course_id=4f7be5e11b243c10c93aece03d4bcb56" },
  { title: "Quebec", kind: "quiz", durationLabel: "1h", language: "EN", url: "https://learning.servicenow.com/lxp?id=learning_content_prev&course_id=1f1b29a11b243c10c93aece03d4bcbbd" },
  { title: "Generic", kind: "quiz", durationLabel: "1h", language: "EN", url: "https://learning.servicenow.com/lxp?id=learning_content_prev&course_id=341bd3d297d229587f7070871153afe4" },
];
