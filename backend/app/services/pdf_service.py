import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


def generate_challan_pdf(challan) -> bytes:
    """Generate a PDF receipt for the challan."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    story = []

    # Header
    header_style = ParagraphStyle(
        "Header",
        parent=styles["Normal"],
        fontSize=22,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#1e3a5f"),
        spaceAfter=4,
        alignment=TA_CENTER,
    )
    sub_style = ParagraphStyle(
        "Sub",
        parent=styles["Normal"],
        fontSize=12,
        textColor=colors.HexColor("#4a5568"),
        spaceAfter=2,
        alignment=TA_CENTER,
    )

    story.append(Paragraph("🚦 FineSnap", header_style))
    story.append(Paragraph("Smart Digital E-Challan Management System", sub_style))
    story.append(Paragraph("Government of India — Traffic Police Department", sub_style))
    story.append(Spacer(1, 0.3 * cm))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1e3a5f")))
    story.append(Spacer(1, 0.3 * cm))

    # Challan Number
    challan_style = ParagraphStyle(
        "ChallanNum",
        parent=styles["Normal"],
        fontSize=14,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#e53e3e"),
        alignment=TA_CENTER,
        spaceAfter=10,
    )
    story.append(Paragraph(f"CHALLAN NO: {challan.challan_number}", challan_style))

    status_color = "#38a169" if str(challan.payment_status.value) == "paid" else "#e53e3e"
    status_style = ParagraphStyle(
        "Status",
        parent=styles["Normal"],
        fontSize=11,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor(status_color),
        alignment=TA_CENTER,
        spaceAfter=10,
    )
    story.append(Paragraph(f"STATUS: {str(challan.payment_status.value).upper()}", status_style))

    # Challan Details Table
    veh = challan.vehicle
    viol = challan.violation
    officer = challan.police_officer

    data = [
        ["FIELD", "DETAILS"],
        ["Challan Number", challan.challan_number],
        ["Vehicle Registration", veh.registration_number if veh else "N/A"],
        ["Vehicle Type", str(veh.vehicle_type.value).replace("_", " ").title() if veh else "N/A"],
        ["Owner Name", veh.owner_name if veh else "N/A"],
        ["Violation Type", viol.name if viol else "N/A"],
        ["Fine Amount", f"₹ {challan.fine_amount:,.2f}"],
        ["Location", challan.location],
        ["Violation Date/Time", challan.violation_datetime.strftime("%d %B %Y, %I:%M %p")],
        ["Issuing Officer", officer.name if officer else "N/A"],
        ["Officer Badge", officer.badge_number if officer and officer.badge_number else "N/A"],
        ["Challan Date", challan.created_at.strftime("%d %B %Y")],
        ["Remarks", challan.remarks or "None"],
    ]

    if challan.payment and challan.payment.payment_status == "paid":
        data.append(["Transaction ID", challan.payment.transaction_id or "N/A"])
        data.append(["Payment Date", challan.payment.paid_at.strftime("%d %B %Y") if challan.payment.paid_at else "N/A"])

    table = Table(data, colWidths=[6 * cm, 11 * cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a5f")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 11),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 1), (-1, -1), 10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7fafc")]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(table)
    story.append(Spacer(1, 0.5 * cm))

    # Footer
    footer_style = ParagraphStyle(
        "Footer",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#718096"),
        alignment=TA_CENTER,
    )
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0")))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph(
        f"Generated on {datetime.utcnow().strftime('%d %B %Y at %I:%M %p UTC')} | FineSnap Digital Challan System",
        footer_style
    ))
    story.append(Paragraph(
        "This is a digitally generated document. No signature required.",
        footer_style
    ))

    doc.build(story)
    return buffer.getvalue()
