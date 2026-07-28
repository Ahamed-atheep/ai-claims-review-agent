import fitz  # PyMuPDF

def generate_new_sample_pdf(filename="Sample_Commercial_Property_Claim_CLM_2026_7749.pdf"):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)  # A4 size

    # Colors
    navy = (0.05, 0.25, 0.45)
    dark_gray = (0.2, 0.2, 0.2)
    red = (0.8, 0.1, 0.1)

    # Title Header
    page.insert_text(fitz.Point(50, 50), "GLOBAL GUARDIAN COMMERCIAL PROPERTY INSURANCE", fontsize=15, color=navy)
    page.insert_text(fitz.Point(50, 70), "COMMERCIAL WATER LOSS CLAIM & APPRAISAL DOSSIER", fontsize=11, color=dark_gray)
    
    # Divider line
    page.draw_line(fitz.Point(50, 80), fitz.Point(545, 80), color=navy, width=1.5)

    # Claim Metadata Table
    page.insert_text(fitz.Point(50, 110), "NEW CLAIM METADATA (UNSEEN DATA):", fontsize=11, color=navy)
    page.insert_text(fitz.Point(60, 130), "Claim ID:          CLM-2026-7749", fontsize=10, color=dark_gray)
    page.insert_text(fitz.Point(60, 145), "Policy Number:     POL-55209", fontsize=10, color=dark_gray)
    page.insert_text(fitz.Point(60, 160), "Claimant Name:     Elena Rostova", fontsize=10, color=dark_gray)
    page.insert_text(fitz.Point(60, 175), "Reported Incident: July 12, 2026 (Commercial Pipe Burst & Flood)", fontsize=10, color=dark_gray)
    page.insert_text(fitz.Point(60, 190), "Claimed Amount:    $34,750.00", fontsize=10, color=dark_gray)
    page.insert_text(fitz.Point(60, 205), "Claim Type:        Property Damage & Inventory Loss", fontsize=10, color=dark_gray)

    # Incident Summary
    page.insert_text(fitz.Point(50, 235), "PROPERTY INCIDENT SUMMARY & STATEMENT:", fontsize=11, color=navy)
    summary_text = (
        "Claimant Elena Rostova reports a main supply pipe rupture at 'Rostova Fine Jewelry' "
        "located at 742 Grand Avenue on July 12, 2026 at 03:00 AM. Water exposure caused structural "
        "subfloor degradation and total damage to custom luxury showcase inventory."
    )
    rect = fitz.Rect(60, 245, 535, 300)
    page.insert_textbox(rect, summary_text, fontsize=9.5, color=dark_gray)

    # Appraisal & Contractor Estimate
    page.insert_text(fitz.Point(50, 315), "RESTORATION & APPRAISAL ESTIMATE (VANGUARD RESTORATION):", fontsize=11, color=navy)
    page.insert_text(fitz.Point(60, 335), "Restoration Firm:   Vanguard Commercial Remediation (License #FL-3301)", fontsize=10, color=dark_gray)
    page.insert_text(fitz.Point(60, 350), "Appraisal Date:     June 28, 2026 [FLAGGED: Pre-dates incident date by 14 days]", fontsize=10, color=red)

    # Itemized Breakdown Box
    page.draw_rect(fitz.Rect(50, 370, 545, 520), color=(0.8, 0.8, 0.8), fill=(0.96, 0.96, 0.98))
    page.insert_text(fitz.Point(65, 390), "ITEMIZED LOSS BREAKDOWN", fontsize=10, color=navy)
    page.insert_text(fitz.Point(65, 410), "1. Diamond Ring Assembly (Item #DIAM-7721) ............ $10,450.00", fontsize=9, color=dark_gray)
    page.insert_text(fitz.Point(65, 430), "2. Custom Mahogany Display Cases & Subflooring ........ $4,500.00", fontsize=9, color=dark_gray)
    page.insert_text(fitz.Point(65, 450), "3. High-Capacity Dehumidification: 72 hrs @ $275/hr .. $19,800.00", fontsize=9, color=dark_gray)
    page.insert_text(fitz.Point(65, 500), "TOTAL CLAIMED LOSS AMOUNT: $34,750.00", fontsize=11, color=navy)

    # Flags Summary for SIU
    page.insert_text(fitz.Point(50, 545), "AUDIT DISCREPANCIES & RISK FLAGS:", fontsize=11, color=red)
    flags_text = (
        "- APPRAISAL TIMELINE: Appraisal timestamp (06/28/2026) precedes pipe rupture (07/12/2026) by 14 days.\n"
        "- DUPLICATE SERIAL NUMBER: Item #DIAM-7721 matches settled claim CLM-2025-1104.\n"
        "- RATE INFLATION: Water extraction rate ($275/hr for 72 hrs) exceeds regional average ($95/hr for 16 hrs).\n"
        "- MISSING INSPECTION: Municipal plumbing inspection certificate omitted for commercial loss > $10,000."
    )
    rect_flags = fitz.Rect(60, 560, 535, 650)
    page.insert_textbox(rect_flags, flags_text, fontsize=9, color=dark_gray)

    # Footer
    page.draw_line(fitz.Point(50, 780), fitz.Point(545, 780), color=(0.8, 0.8, 0.8), width=1)
    page.insert_text(fitz.Point(50, 795), "CONFIDENTIAL - PROPERTY & CASUALTY SIU AUDIT FILE", fontsize=8, color=(0.5, 0.5, 0.5))

    doc.save(filename)
    doc.close()
    print(f"Generated new sample PDF document: {filename}")

if __name__ == "__main__":
    generate_new_sample_pdf()
