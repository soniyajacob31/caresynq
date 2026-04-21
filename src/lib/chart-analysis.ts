export type FindingSeverity = "missing" | "incomplete" | "issue";

export interface ChartFinding {
  id: string;
  label: string;
  severity: FindingSeverity;
  note?: string;
}

export interface ChartAnalysisReport {
  title: string;
  subtitle: string;
  sections: {
    id: string;
    title: string;
    description?: string;
    findings: ChartFinding[];
  }[];
}

/**
 * Analyzes an uploaded chart image. The current build returns a structured
 * reference review; swap in OCR or a model when you need extraction from the image bytes.
 */
export async function analyzeUploadedChart(file: File): Promise<ChartAnalysisReport> {
  void file.name;
  await new Promise((r) => setTimeout(r, 350));
  return SAMPLE_CHART_ANALYSIS;
}

/** Structured review payload (replace with model output when integrated). */
export const SAMPLE_CHART_ANALYSIS: ChartAnalysisReport = {
  title: "Documentation Review Complete",
  subtitle:
    "Summary of gaps and inconsistencies identified for this chart relative to common CMS-oriented documentation and prior-authorization expectations.",
  sections: [
    {
      id: "demographics",
      title: "Patient demographics & clinical baseline",
      description: "Age, name, comorbidities",
      findings: [
        {
          id: "name",
          label: "Patient full name",
          severity: "missing",
          note: "No patient name appears on the form.",
        },
        {
          id: "age",
          label: "Age in demographics header",
          severity: "incomplete",
          note: 'Age appears only in free text as "1 yr old" — not captured in structured demographics.',
        },
        {
          id: "comorbidities",
          label: "Comorbidities",
          severity: "incomplete",
          note: "No explicit comorbidity list; clinical concern noted as thin appearance / low weight without coded diagnoses.",
        },
        {
          id: "insurance",
          label: "Insurance member ID / plan",
          severity: "missing",
        },
        {
          id: "address",
          label: "Patient address",
          severity: "missing",
        },
      ],
    },
    {
      id: "vitals",
      title: "Vitals & objective data",
      findings: [
        {
          id: "height",
          label: "Height (HT)",
          severity: "missing",
        },
        {
          id: "bp",
          label: "Blood pressure (B/P)",
          severity: "missing",
        },
        {
          id: "labs",
          label: "Lab results (Hb, glucose, malaria screen, urinalysis)",
          severity: "missing",
          note: "All lab fields blank — limits medical necessity support.",
        },
      ],
    },
    {
      id: "cms",
      title: "CMS-oriented documentation & denial risk",
      description: "Common prior-authorization and Medicare documentation themes",
      findings: [
        {
          id: "med-necessity",
          label: "Medical necessity documentation",
          severity: "missing",
          note: "No detailed clinical notes, labs, imaging, or tests tying treatment to diagnosis per CMS expectations.",
        },
        {
          id: "provider-npi",
          label: "Prescriber NPI & identifiable provider block",
          severity: "missing",
          note: "Signature present but no printed name, NPI, or clinic address.",
        },
        {
          id: "patient-provider-block",
          label: "Patient & payer identifiers in one auditable block",
          severity: "incomplete",
        },
        {
          id: "cpt-hcpcs",
          label: "CPT procedure codes / HCPCS supply codes",
          severity: "missing",
          note: "No coded procedures or supplies for services or DME.",
        },
        {
          id: "tx-details",
          label: "Treatment details (frequency, duration, place of service)",
          severity: "incomplete",
          note: "Mebendazole and formula noted narratively without coded frequency, duration, or outpatient vs clinic setting.",
        },
        {
          id: "step-therapy",
          label: "Step therapy / prior alternatives tried",
          severity: "missing",
          note: "No proof less costly alternatives were attempted and failed (Medicare step therapy).",
        },
        {
          id: "expected-outcomes",
          label: "Expected outcomes",
          severity: "missing",
          note: "No documentation of how the requested care will improve or maintain the patient’s condition.",
        },
        {
          id: "prior-auth-context",
          label: "High-cost / specialty service context",
          severity: "incomplete",
          note: "If imaging, DME, Part B drugs, or out-of-network specialty care were involved, none are documented with the supporting codes and auth context.",
        },
      ],
    },
    {
      id: "allergies-meds",
      title: "Allergies & medications",
      findings: [
        {
          id: "allergies",
          label: "Allergies",
          severity: "missing",
        },
        {
          id: "meds",
          label: "Current medications",
          severity: "missing",
        },
      ],
    },
    {
      id: "exam",
      title: "Structured exam & impression consistency",
      findings: [
        {
          id: "exam-systems",
          label: "Organ-system exam checkboxes (EENT, CV, lungs, etc.)",
          severity: "incomplete",
          note: "Normal/abnormal boxes left blank despite narrative notes.",
        },
        {
          id: "impression-consistency",
          label: "Impression wording vs documented data",
          severity: "issue",
          note: 'Impression reads like "Low body weight" / similar; ensure it matches measured vitals and age — avoid ambiguous "low birth weight" phrasing for a 1-year-old if that appears.',
        },
      ],
    },
  ],
};
