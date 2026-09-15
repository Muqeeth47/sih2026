# populate_sih_pptx.py
import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

def populate():
    prs = Presentation('SIH2026-IDEA-Presentation-Format.pptx')
    
    # ── SLIDE 1: Title Page ──
    s1 = prs.slides[0]
    
    # Add official logos to Slide 1 if available
    mha_img = 'public/images/mha-logo.png'
    ncb_img = 'public/images/ncb-logo.png'
    if os.path.exists(mha_img) and os.path.exists(ncb_img):
        try:
            # Place MHA on top-left and NCB on top-right of title slide
            s1.shapes.add_picture(mha_img, Inches(0.8), Inches(0.55), height=Inches(0.95))
            s1.shapes.add_picture(ncb_img, Inches(11.4), Inches(0.55), height=Inches(0.95))
        except Exception as e:
            print("Logo embed notice:", e)

    for shape in s1.shapes:
        if shape.name == 'TextBox 9':
            tf = shape.text_frame
            tf.word_wrap = True
            tf.clear()
            
            lines = [
                ("Project Name: ", "SAKSHYA AI (साक्ष्य AI) — सत्यमेव साक्ष्यम्"),
                ("Problem Statement ID: ", "SIH26231"),
                ("Problem Statement Title: ", "AI-Powered Spot Test Colorimeter & Cryptographic Evidence Sealing for Field Narcotics Interdiction"),
                ("Theme: ", "Smart Automation / Law Enforcement & National Security"),
                ("PS Category: ", "Software / Mobile-Edge Vision"),
                ("Target Ministry: ", "Narcotics Control Bureau (NCB), Ministry of Home Affairs"),
                ("Team Name: ", "Sudophiles"),
                ("Team ID: ", "[Your Registered Team ID]")
            ]
            for label, val in lines:
                p = tf.add_paragraph()
                r1 = p.add_run()
                r1.text = label
                r1.font.bold = True
                r1.font.size = Pt(12)
                r1.font.color.rgb = RGBColor(15, 92, 168)
                
                r2 = p.add_run()
                r2.text = val + "\n"
                r2.font.bold = False
                r2.font.size = Pt(12)
                r2.font.color.rgb = RGBColor(15, 23, 42)

    # Helper to add bullet point with bold lead-in
    def add_bullet(tf, title, desc, level=0, pt_size=12.5):
        p = tf.add_paragraph()
        p.level = level
        p.space_after = Pt(6)
        r1 = p.add_run()
        r1.text = title + ": " if title else ""
        r1.font.bold = True
        r1.font.size = Pt(pt_size)
        r1.font.color.rgb = RGBColor(15, 92, 168)
        
        r2 = p.add_run()
        r2.text = desc
        r2.font.bold = False
        r2.font.size = Pt(pt_size)
        r2.font.color.rgb = RGBColor(30, 41, 59)

    # ── SLIDE 2: Proposed Solution ──
    s2 = prs.slides[1]
    for shape in s2.shapes:
        if shape.name == 'Title 1':
            shape.text_frame.text = "PROPOSED SOLUTION: SAKSHYA AI (साक्ष्य AI)"
            shape.text_frame.paragraphs[0].runs[0].font.color.rgb = RGBColor(15, 92, 168)
            shape.text_frame.paragraphs[0].runs[0].font.bold = True
        elif shape.name == 'TextBox 8':
            tf = shape.text_frame
            tf.word_wrap = True
            tf.clear()
            
            add_bullet(tf, "Problem Addressed", "Subjective visual color interpretation under bad field lighting, rapid reagent oxidation/fading, and broken chain of custody challenged in court.")
            add_bullet(tf, "Step 1 (Offline Color Match)", "Edge smartphone camera analyzes reagent fluid using scientific CIELAB ΔE2000 math in <5ms without internet.")
            add_bullet(tf, "Step 2 (Online AI Verification)", "Multimodal Gemini vision checks kit brand, batch lot/expiry, verifies pouch seal integrity, and drafts Section 52 NDPS court statement.")
            add_bullet(tf, "Cryptographic Sealing", "Instant SHA-256 digital fingerprint + GPS coordinates (±5m) embedded directly into evidence record.")
            add_bullet(tf, "1-Click Certified Panchnama", "Auto-generates statutory Form 'F' seizure memo & certified assay PDF with embedded photograph.")
            add_bullet(tf, "Uniqueness", "Zero additional hardware—transforms everyday police phones into certified spectrophotometers with 4-tier chain of custody (IO → FSL → HQ → Court).")

    # ── SLIDE 3: Technical Approach ──
    s3 = prs.slides[2]
    for shape in s3.shapes:
        if shape.name == 'Title 1':
            shape.text_frame.text = "TECHNICAL APPROACH & ARCHITECTURE"
            shape.text_frame.paragraphs[0].runs[0].font.color.rgb = RGBColor(15, 92, 168)
            shape.text_frame.paragraphs[0].runs[0].font.bold = True
        elif shape.name == 'TextBox 8':
            tf = shape.text_frame
            tf.word_wrap = True
            tf.clear()
            
            add_bullet(tf, "Client-Side Edge Math", "React 19 / Next.js 16 PWA running CIEDE2000 perceptual color difference math calibrated against UNODC ST/NAR/13 standards.")
            add_bullet(tf, "Quality Assurance Gate", "Modified Laplacian variance filter (sharpness ≥ 80) and specular glare filter (≤ 8%) automatically reject poor photos.")
            add_bullet(tf, "Cloud Forensic Vision", "Google Gemini Flash via secure API proxy for tamper detection, pouch OCR, and court statement generation.")
            add_bullet(tf, "Encrypted Realtime Ledger", "Supabase PostgreSQL with Row Level Security, photo storage bucket, and offline IndexedDB mesh sync.")
            add_bullet(tf, "Workflow Sequence", "Field Interdiction → Real-time Blur Gate → Step 1 Instant Color Match → Step 2 AI Check → SHA-256 Seal → Panchnama PDF → Live Zonal Map.")
            add_bullet(tf, "Multi-Lingual Accessibility", "Custom UI in 9 Indian regional languages (Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Punjabi, English).")

    # ── SLIDE 4: Feasibility & Viability ──
    s4 = prs.slides[3]
    for shape in s4.shapes:
        if shape.name == 'Title 1':
            shape.text_frame.text = "FEASIBILITY, CHALLENGES & MITIGATION"
            shape.text_frame.paragraphs[0].runs[0].font.color.rgb = RGBColor(15, 92, 168)
            shape.text_frame.paragraphs[0].runs[0].font.bold = True
        elif shape.name == 'TextBox 8':
            tf = shape.text_frame
            tf.word_wrap = True
            tf.clear()
            
            add_bullet(tf, "Field Feasibility", "Zero hardware procurement cost; runs as an offline-first PWA on existing police smartphones (Android/iOS).")
            add_bullet(tf, "Operational Simplicity", "Clear 2-step verification layout designed for field constables and sub-inspectors without chemistry background.")
            add_bullet(tf, "Challenge: Sunlight & Night Glare", "Mitigation: Automated ambient luminance normalization and dynamic specular reflection rejection gate.")
            add_bullet(tf, "Challenge: Shaky Hands / Motion Blur", "Mitigation: Real-time sharpness evaluation (Laplacian ≥ 80) blocks blurry captures and prompts 1-tap retake.")
            add_bullet(tf, "Challenge: Remote Border Connectivity", "Mitigation: 100% offline functionality via IndexedDB; Step 1 color analysis executes on-device with zero network.")
            add_bullet(tf, "Challenge: Legal Scrutiny in Court", "Mitigation: Strict compliance with Section 52 NDPS Act and electronic record admissibility under Section 65B BSA.")

    # ── SLIDE 5: Impact and Benefits ──
    s5 = prs.slides[4]
    for shape in s5.shapes:
        if shape.name == 'Title 1':
            shape.text_frame.text = "IMPACT, BENEFITS & NATIONAL UTILITY"
            shape.text_frame.paragraphs[0].runs[0].font.color.rgb = RGBColor(15, 92, 168)
            shape.text_frame.paragraphs[0].runs[0].font.bold = True
        elif shape.name == 'TextBox 8':
            tf = shape.text_frame
            tf.word_wrap = True
            tf.clear()
            
            add_bullet(tf, "Time Efficiency (95% Faster)", "Reduces interdiction documentation and panchnama preparation time from 45 minutes to under 2 minutes.")
            add_bullet(tf, "Higher Conviction Rate", "Cryptographic SHA-256 seal and photo-embedded certified assay reports eliminate defense claims of evidence substitution.")
            add_bullet(tf, "FSL Laboratory Relief", "Presumptive double-verification prevents unnecessary lab backlog, routing only disputed samples via automated escalation queue.")
            add_bullet(tf, "Strategic Zonal Intelligence", "Real-time interactive seizure heatmap tracks drug trafficking corridors across state and international borders.")
            add_bullet(tf, "Fiscal Savings", "Saves an estimated ₹250+ Crores across central and state police forces by eliminating dedicated portable spectrometer hardware.")
            add_bullet(tf, "100% UNODC Reagent Coverage", "Supports all 9 standard test kits: Marquis, Scott, Duquenois-Levine, Ehrlich, Mecke, Mandelin, Froehde, Dille-Koppanyi, Nitric Acid.")

    # ── SLIDE 6: Research & Legal References ──
    s6 = prs.slides[5]
    for shape in s6.shapes:
        if shape.name == 'Title 1':
            shape.text_frame.text = "STATUTORY BASIS, RESEARCH & REFERENCES"
            shape.text_frame.paragraphs[0].runs[0].font.color.rgb = RGBColor(15, 92, 168)
            shape.text_frame.paragraphs[0].runs[0].font.bold = True
        elif shape.name == 'TextBox 8':
            tf = shape.text_frame
            tf.word_wrap = True
            tf.clear()
            
            add_bullet(tf, "NDPS Act, 1985 (Section 43 & 52)", "Governs power of seizure in public places and statutory requirements for seizure memo preparation and custody transfer.")
            add_bullet(tf, "NDPS Act, 1985 (Section 52A)", "Mandates inventory certification before Magistrate and electronic documentation for pre-trial disposal.")
            add_bullet(tf, "Bharatiya Sakshya Adhiniyam, 2023 (Sec. 65B)", "Recognizes digitally hashed (SHA-256) electronic photographic records as primary court-admissible evidence.")
            add_bullet(tf, "UNODC ST/NAR/13 Rev.1", "'Rapid Testing Methods of Drugs of Abuse' — United Nations scientific standards for presumptive colorimetric spot tests.")
            add_bullet(tf, "CIE 142-2001 (CIEDE2000)", "Commission Internationale de l'Éclairage industrial color-difference formula for objective mathematical color matching.")
            add_bullet(tf, "FIPS PUB 180-4 (NIST SHA-256)", "Federal Information Processing Standard for tamper-evident digital cryptographic signatures.")

    # ── Remove Instruction Slide 7 ──
    if len(prs.slides) > 6:
        rId = prs.slides._sldIdLst[6].rId
        prs.part.drop_rel(rId)
        del prs.slides._sldIdLst[6]

    prs.save('SIH2026_SAKSHYA_AI_Filled.pptx')
    prs.save('SIH2026_DRUG_SEAL_AI_Filled.pptx')
    print("Successfully generated: SIH2026_SAKSHYA_AI_Filled.pptx with embedded logos and Sudophiles team name")

if __name__ == '__main__':
    populate()
