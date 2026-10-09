// services/factureService.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Intl.NumberFormat('fr-FR') insère une espace fine insécable (U+202F) entre
// les groupes de milliers. Les polices standard de jsPDF ne savent pas
// l'afficher et la remplacent par un caractère parasite (le "/" que tu vois).
// On la remplace par une espace normale, parfaitement rendue.
function formaterMontant(valeur) {
  const nombre = Math.round(Number(valeur) || 0);
  return `${nombre.toLocaleString('fr-FR').replace(/[\u202F\u00A0]/g, ' ')} FCFA`;
}

export function genererFacturePDF(vente, lignes, boutique, client) {
  const doc = new jsPDF();
  const numero = vente.referenceId || vente.id.slice(0, 8).toUpperCase();

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

  // vente.date, pas vente.createdAt (ce champ n'existe pas sur l'objet stocké par useVente)
  const dateVente = vente.date ? new Date(vente.date) : null;
doc.text(
  dateVente && !isNaN(dateVente)
    ? `${dateVente.toLocaleDateString('fr-FR')} ${dateVente.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
    : '',
  196, 26, { align: 'right' }
);
  doc.text(`Client : ${client?.nom || 'Vente comptoir'}`, 196, 31, { align: 'right' });

  autoTable(doc, {
    startY: 42,
    head: [['Produit', 'Qté', 'Prix unitaire', 'Total']],
    body: lignes.map((l) => [
      l.nomProduit,
      l.quantite,
      formaterMontant(l.prixUnitaire),
      formaterMontant(l.quantite * l.prixUnitaire),
    ]),
  });

  // jspdf-autotable laisse parfois un espacement de caractères actif après
  // avoir dessiné le tableau ; on le remet à zéro avant d'écrire le total,
  // sinon le texte suivant s'affiche avec des lettres anormalement espacées
  // et déborde de la zone attendue.
  doc.setCharSpace(0);
  doc.setFont('helvetica', 'normal');

  const finTableau = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Total : ${formaterMontant(vente.total)}`, 196, finTableau, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text('Merci pour votre confiance !', 105, finTableau + 15, { align: 'center' });

  doc.save(`facture-${numero}.pdf`);
}