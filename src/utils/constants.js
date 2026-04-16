export const DOCUMENT_CATEGORIES = [
  { value: "resolution", label: "Resolution" },
  { value: "ordinance", label: "Ordinance" },
  { value: "report", label: "Report" },
  { value: "minutes", label: "Minutes of Meeting" },
  { value: "budget", label: "Budget Proposal" },
  { value: "certificate", label: "Certificate" },
  { value: "letter", label: "Letter / Correspondence" },
  { value: "barangay_plan", label: "Barangay Development Plan" },
  { value: "financial", label: "Financial Statement" },
  { value: "other", label: "Other" },
];

export const DOCUMENT_STATUS = {
  PENDING: "Pending",
  REVIEWED: "Reviewed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  FOR_REVISION: "For Revision",
};

export const STATUS_COLORS = {
  Pending:        { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  Reviewed:       { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  Approved:       { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  Rejected:       { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  "For Revision": { bg: "#EDE9FE", text: "#5B21B6", dot: "#8B5CF6" },
};

export const CUENCA_BARANGAYS = [
  "Balagbag",
  "Barangay 1 (Pob.)",
  "Barangay 2 (Pob.)",
  "Barangay 3 (Pob.)",
  "Barangay 4 (Pob.)",
  "Barangay 5 (Pob.)",
  "Barangay 6 (Pob.)",
  "Barangay 7 (Pob.)",
  "Barangay 8 (Pob.)",
  "Bungahan",
  "Calumayin",
  "Dalipit East",
  "Dalipit West",
  "Dita",
  "Don Juan",
  "Emmanuel",
  "Ibabao",
  "Labac",
  "Pinagkaisahan",
  "San Felipe",
  "San Isidro",
];

export const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

export const MAX_FILE_SIZE_MB = 50;