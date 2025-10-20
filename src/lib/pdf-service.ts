import { ClaimDocument } from '@/types';

export async function generatePDFClaim(claimDocument: ClaimDocument): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>PMB Compliance Report - SaluLink</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #1e40af;
            border-bottom: 2px solid #ddd;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .condition-badge {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            padding: 5px 15px;
            border-radius: 20px;
            margin-right: 10px;
            margin-bottom: 10px;
          }
          .icd-code {
            background: #f3f4f6;
            padding: 10px;
            margin-bottom: 10px;
            border-left: 4px solid #2563eb;
          }
          .treatment-item, .medicine-item {
            background: #f9fafb;
            padding: 15px;
            margin-bottom: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
          }
          .treatment-item h4, .medicine-item h4 {
            margin: 0 0 10px 0;
            color: #374151;
          }
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
          }
          .badge-diagnostic {
            background: #dbeafe;
            color: #1e40af;
          }
          .badge-management {
            background: #d1fae5;
            color: #065f46;
          }
          .evidence-list {
            margin-top: 10px;
            padding-left: 20px;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PMB Compliance Report</h1>
          <p>SaluLink Chronic Treatment App - Authi 1.0</p>
          <p>Generated: ${new Date().toLocaleString()}</p>
        </div>

        <div class="section">
          <h2>Original Clinical Notes</h2>
          <p>${claimDocument.originalNote}</p>
        </div>

        <div class="section">
          <h2>Detected Chronic Conditions</h2>
          ${claimDocument.confirmedConditions.map(condition =>
            `<span class="condition-badge">${condition}</span>`
          ).join('')}
        </div>

        <div class="section">
          <h2>ICD-10 Codes</h2>
          ${claimDocument.selectedIcdCodes.map(icd => `
            <div class="icd-code">
              <strong>${icd.code}</strong> - ${icd.description}
              <br><small>Condition: ${icd.condition}</small>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <h2>Diagnostic Basket</h2>
          ${claimDocument.diagnosticTreatments.length === 0
            ? '<p>No diagnostic treatments selected.</p>'
            : claimDocument.diagnosticTreatments.map(treatment => `
              <div class="treatment-item">
                <h4>${treatment.procedureName} <span class="badge badge-diagnostic">${treatment.procedureCode}</span></h4>
                <p><strong>Quantity:</strong> ${treatment.quantity} / ${treatment.coverageLimit} (Coverage Limit)</p>
                ${treatment.evidence && treatment.evidence.length > 0 ? `
                  <div class="evidence-list">
                    <strong>Evidence:</strong>
                    <ul>
                      ${treatment.evidence.map((e: any) => `
                        <li>${e.type === 'note' ? 'Clinical Note' : e.fileName}</li>
                      `).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            `).join('')}
        </div>

        <div class="section">
          <h2>Ongoing Management Basket</h2>
          ${claimDocument.managementTreatments.length === 0
            ? '<p>No ongoing management treatments selected.</p>'
            : claimDocument.managementTreatments.map(treatment => `
              <div class="treatment-item">
                <h4>${treatment.procedureName} <span class="badge badge-management">${treatment.procedureCode}</span></h4>
                <p><strong>Quantity:</strong> ${treatment.quantity} / ${treatment.coverageLimit} (Coverage Limit)</p>
                ${treatment.evidence && treatment.evidence.length > 0 ? `
                  <div class="evidence-list">
                    <strong>Evidence:</strong>
                    <ul>
                      ${treatment.evidence.map((e: any) => `
                        <li>${e.type === 'note' ? 'Clinical Note' : e.fileName}</li>
                      `).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            `).join('')}
        </div>

        <div class="section">
          <h2>Medicine List</h2>
          ${claimDocument.medicineSelections.length === 0
            ? '<p>No medicines selected.</p>'
            : claimDocument.medicineSelections.map(medicine => `
              <div class="medicine-item">
                <h4>${medicine.medicineName}</h4>
                <p><strong>Active Ingredient:</strong> ${medicine.activeIngredient}</p>
                <p><strong>Medicine Class:</strong> ${medicine.medicineClass}</p>
                <p><strong>CDA:</strong> Core: R${medicine.cdaCore.toFixed(2)} | Executive: R${medicine.cdaExecutive.toFixed(2)}</p>
                ${medicine.planType ? `<p><strong>Plan Type:</strong> ${medicine.planType.name}</p>` : ''}
                ${medicine.motivation ? `
                  <div style="margin-top: 10px; padding: 10px; background: #fef3c7; border-left: 4px solid #f59e0b;">
                    <strong>Motivation:</strong> ${medicine.motivation}
                  </div>
                ` : ''}
              </div>
            `).join('')}
        </div>

        <div class="footer">
          <p>This report is generated for PMB compliance documentation purposes.</p>
          <p>&copy; ${new Date().getFullYear()} SaluLink Chronic Treatment App</p>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `PMB-Report-${new Date().getTime()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
