// services/factureService.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function genererFacturePDF(vente, lignes, boutique, client) {
  const doc = new jsPDF();
  const numero = vente.referenceId || vente.id.slice(0, 8).toUpperCase();

  // Logo réel de la boutique (base64 stocké dans boutique.photoBoutique).
  // jsPDF a besoin de connaître le format (PNG/JPEG) à partir du préfixe data:
  if (boutique?.photoBoutique) {
    const format = boutique.photoBoutique.includes('image/png') ? 'PNG' : 'JPEG';
    try {
      doc.addImage(boutique.photoBoutique, format, 14, 12, 20, 20);
    } catch {
      // image corrompue ou format non supporté : on continue sans bloquer la facture
    }
  }

  const decalageTexte = boutique?.photoBoutique ? 40 : 14;
  doc.setFontSize(16);
  doc.text(boutique?.nom || 'Boutigest', decalageTexte, 20);
  doc.setFontSize(10);
  doc.text(boutique?.adresse || '', decalageTexte, 26);
  doc.text(boutique?.telephone || '', decalageTexte, 31);

  doc.setFontSize(12);
  doc.text(`Facture ${numero}`, 196, 20, { align: 'right' });
  doc.setFontSize(10);
  doc.text(new Date(vente.createdAt).toLocaleDateString('fr-FR'), 196, 26, { align: 'right' });
  doc.text(`Client : ${client?.nom || 'Vente comptoir'}`, 196, 31, { align: 'right' });

  autoTable(doc, {
    startY: 42,
    head: [['Produit', 'Qté', 'Prix unitaire', 'Total']],
    body: lignes.map((l) => [
      l.nomProduit,
      l.quantite,
      `${l.prixUnitaire.toLocaleString('fr-FR')} FCFA`,
      `${(l.quantite * l.prixUnitaire).toLocaleString('fr-FR')} FCFA`,
    ]),
  });

  const finTableau = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Total : ${vente.total.toLocaleString('fr-FR')} FCFA`, 196, finTableau, { align: 'right' });

  doc.save(`facture-${numero}.pdf`);
}