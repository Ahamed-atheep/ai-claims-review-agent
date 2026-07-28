import fitz  # PyMuPDF

def generate_sample_pdf(filename="Sample_Auto_Claim_CLM_2026_9901.pdf"):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842) # A4 size

    # Colors
    navy = (0.1, 0.2, 0.4)
    dark_gray = (0.2, 0.2, 0.2)
    red = (0.8, 0.1, 0.1)

    # Title Header
    page.insert_text(fitz.Point(50, 50), "APEX INSURANCE CLAIMS REVIEW DEPARTMENT", fontsize=16, color=navy)
    page.insert_text(fitz.Point(50, 70), "OFFICIAL CLAIM DOSSIER & REPAIR ESTIMATE", fontsize=12, color=dark_gray)
    
    # Divider line
    page.draw_line(fitz.Point(50, 80), fitz.Point(545, 80), color=navy, width=1.5)

    # Claim Metadata Table
    page.insert_text(fitz.Point(50, 110), "CLAIM METADATA:", fontsize=11, color=navy)
    page.insert_text(fitz.Point(60, 130), "Claim ID:          CLM-2026-9901", fontsize=10, color=dark_gray)
    page.insert_text(fitz.Point(60, 145), "Policy Number:     POL-88321", fontsize=10, color=dark_gray)
    page.insert_text(fitz.Point(60, 160), "Claimant Name:     John Doe", fontsize=10, color=dark_gray)
    page.insert_text(fitz.Point(60, 175), "Reported Incident: March 15, 2026 (I-5 South Guardrail Impact)", fontsize=10, color=dark_gray)
    page.insert_text(fitz.Point(60, 190), "Claimed Amount:    $15,500.00", fontsize=10, color=dark_gray)
    page.insert_text(fitz.Point(60, 205), "Claim Type:        Auto Collision & Personal Injury", fontsize=10, color=dark_gray)

    # Incident Summary
    page.insert_text(fitz.Point(50, 235), "INCIDENT SUMMARY & STATEMENT:", fontsize=11, color=navy)
    summary_text = (
        "Claimant John Doe reports that on March 15, 2026 at approximately 11:30 PM, "
        "his 2024 sedan struck a highway guardrail following heavy rain on Interstate 5. "
        "The vehicle sustained front-end structural damage and suspension misalignment. "
        "Claimant declined police dispatch at scene. No third-party vehicles involved."
    )
    rect = fitz.Rect(60, 245, 535, 300)
    page.insert_textbox(rect, summary_text, fontsize=9.5, color=dark_gray)

    # Repair Facility Estimate
    page.insert_text(fitz.Point(50, 315), "REPAIR FACILITY ESTIMATE (APEX COLLISION CENTER):", fontsize=11, color=navy)
    page.insert_text(fitz.Point(60, 335), "Facility Name:     Apex Collision Repair Center (License #GAR-9941)", fontsize=10, color=dark_gray)
    page.insert_text(fitz.Point(60, 350), "Estimate Date:     March 13, 2026 [FLAGGED: Pre-dates incident date]", fontsize=10, color=red)

    # Itemized Breakdown Box
    page.draw_rect(fitz.Rect(50, 370, 545, 520), color=(0.8, 0.8, 0.8), fill=(0.96, 0.96, 0.98))
    page.insert_text(fitz.Point(65, 390), "ITEMIZED BILLING BREAKDOWN", fontsize=10, color=navy)
    page.insert_text(fitz.Point(65, 410), "1. Front Bumper & Grill Assembly Replacement ......... $2,400.00", fontsize=9, color=dark_gray)
    page.insert_text(fitz.Point(65, 430), "2. Front Suspension Control Arm & Alignment .......... $1,800.00", fontsize=9, color=dark_gray)
    page.insert_text(fitz.Point(65, 450), "3. Body Shop Labor: 48 hrs @ $125/hr ................. $6,000.00", fontsize=9, color=dark_gray)
    page.insert_text(fitz.Point(65, 470), "4. Emergency Room & Chiropractic Intake (03/04/2026) .. $5,300.00", fontsize=9, color=dark_gray)
    page.insert_text(fitz.Point(65, 500), "TOTAL CLAIM AMOUNT: $15,500.00", fontsize=11, color=navy)

    # Flags Summary for SIU
    page.insert_text(fitz.Point(50, 545), "DOCUMENT AUDIT FLAGS & OBSERVATIONS:", fontsize=11, color=red)
    flags_text = (
        "- TIMELINE DISCREPANCY: Repair estimate timestamp (03/13/2026) precedes accident date (03/15/2026) by 2 days.\n"
        "- MEDICAL DISCREPANCY: ER intake date (03/04/2026) is 11 days prior to reported vehicle accident date.\n"
        "- LABOR BENCHMARK: Billed labor rate ($125/hr for 48 hrs) exceeds regional average benchmark ($85/hr for 14 hrs).\n"
        "- MISSING POLICE REPORT: Official police incident report missing for claim exceeding $3,000 policy threshold."
    )
    rect_flags = fitz.Rect(60, 560, 535, 650)
    page.insert_textbox(rect_flags, flags_text, fontsize=9, color=dark_gray)

    # Footer
    page.draw_line(fitz.Point(50, 780), fitz.Point(545, 780), color=(0.8, 0.8, 0.8), width=1)
    page.insert_text(fitz.Point(50, 795), "CONFIDENTIAL - FOR INSURANCE SPECIAL INVESTIGATION UNIT (SIU) USE ONLY", fontsize=8, color=(0.5, 0.5, 0.5))

    doc.save(filename)
    doc.close()
    print(f"Generated real sample PDF document: {filename}")

if __name__ == "__main__":
    generate_sample_pdf()
