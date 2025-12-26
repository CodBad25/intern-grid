import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

export function useRapportPDF() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async (rapport: any, type: 'intermediaire' | 'final') => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 20;

      // Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Rapport ${type === 'intermediaire' ? 'Intermédiaire' : 'Final'} ${rapport.annee_scolaire || '2025-2026'}`,
        pageWidth / 2,
        y,
        { align: 'center' }
      );

      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('DU TUTEUR ÉTABLISSEMENT D\'UN PROFESSEUR STAGIAIRE', pageWidth / 2, y, { align: 'center' });

      y += 10;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `À transmettre à l'inspection pédagogique avant le ${type === 'intermediaire' ? '17 janvier 2026' : 'juin 2026'}`,
        pageWidth / 2,
        y,
        { align: 'center' }
      );
      doc.setTextColor(0);

      // Stagiaire info
      y += 15;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('STAGIAIRE', margin, y);

      y += 5;
      autoTable(doc, {
        startY: y,
        head: [],
        body: [
          ['Nom', rapport.stagiaire_nom || ''],
          ['Prénom', rapport.stagiaire_prenom || ''],
          ['Corps', rapport.stagiaire_corps || 'Certifié'],
          ['Établissement', rapport.stagiaire_etablissement || ''],
          ['Discipline', rapport.stagiaire_discipline || 'Mathématiques'],
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 } },
        margin: { left: margin, right: margin },
      });

      y = (doc as any).lastAutoTable.finalY + 10;

      // Tuteurs info
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('TUTEUR 1', margin, y);
      doc.text('TUTEUR 2', pageWidth / 2 + 5, y);

      y += 5;
      const tuteur1Data = [
        ['Nom', rapport.tuteur1_nom || ''],
        ['Prénom', rapport.tuteur1_prenom || ''],
        ['Établissement', rapport.tuteur1_etablissement || ''],
        ['Discipline', rapport.tuteur1_discipline || 'Mathématiques'],
      ];

      const tuteur2Data = [
        ['Nom', rapport.tuteur2_nom || ''],
        ['Prénom', rapport.tuteur2_prenom || ''],
        ['Établissement', rapport.tuteur2_etablissement || ''],
        ['Discipline', rapport.tuteur2_discipline || 'Mathématiques'],
      ];

      autoTable(doc, {
        startY: y,
        head: [],
        body: tuteur1Data,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 } },
        margin: { left: margin, right: pageWidth / 2 + 5 },
        tableWidth: pageWidth / 2 - margin - 5,
      });

      autoTable(doc, {
        startY: y,
        head: [],
        body: tuteur2Data,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 } },
        margin: { left: pageWidth / 2 + 5, right: margin },
        tableWidth: pageWidth / 2 - margin - 5,
      });

      y = (doc as any).lastAutoTable.finalY + 10;

      // Modalités (intermédiaire uniquement)
      if (type === 'intermediaire') {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('MODALITÉS D\'ACCOMPAGNEMENT', margin, y);

        y += 5;
        const modalites = rapport.modalites || {};
        autoTable(doc, {
          startY: y,
          head: [],
          body: [
            ['Visites effectuées par les tuteurs', modalites.visites_tuteur || ''],
            ['Visites effectuées par le stagiaire', modalites.visites_stagiaire || ''],
            ['Classes observées par les tuteurs', modalites.classes_observees_tuteur || ''],
            ['Classes observées par le stagiaire', modalites.classes_observees_stagiaire || ''],
            ['Organisation des concertations', modalites.concertations || ''],
          ],
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
          margin: { left: margin, right: margin },
        });

        // New page for axes
        doc.addPage();
        y = 20;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('AXES THÉMATIQUES DE FORMATION', margin, y);

        y += 8;
        const axes = rapport.axes || [];
        const axeTypes = ['Transversal', 'Transversal', 'Disciplinaire', 'Disciplinaire'];

        axes.forEach((axe: any, index: number) => {
          if (!axe?.titre) return;

          // Check if we need a new page
          if (y > 250) {
            doc.addPage();
            y = 20;
          }

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`Axe ${index + 1} (${axeTypes[index]}) : ${axe.titre}`, margin, y);

          y += 5;
          autoTable(doc, {
            startY: y,
            head: [['Constat de départ', 'Évolution constatée', 'État des lieux']],
            body: [[
              axe.constat_depart || '',
              axe.evolution || '',
              axe.etat_actuel || '',
            ]],
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [66, 139, 202], fontStyle: 'bold' },
            margin: { left: margin, right: margin },
          });

          y = (doc as any).lastAutoTable.finalY + 3;

          if (axe.competences) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text(`Compétences associées : ${axe.competences}`, margin, y);
            y += 8;
          } else {
            y += 5;
          }
        });

        // Axes fin d'année (intermédiaire uniquement)
        if (y > 220) {
          doc.addPage();
          y = 20;
        }

        y += 5;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('AXES DE TRAVAIL POUR LA FIN DE L\'ANNÉE', margin, y);

        y += 5;
        const axesFinAnnee = rapport.axes_fin_annee || {};
        autoTable(doc, {
          startY: y,
          head: [['Compétences à conforter', 'Nouvelles compétences à travailler']],
          body: [[
            axesFinAnnee.a_conforter || '',
            axesFinAnnee.a_travailler || '',
          ]],
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [66, 139, 202], fontStyle: 'bold' },
          margin: { left: margin, right: margin },
        });

        y = (doc as any).lastAutoTable.finalY + 15;
      } else {
        // Rapport final: Synthèse uniquement (pas de modalités ni d'axes)
        doc.addPage();
        y = 20;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('SYNTHÈSE DU PARCOURS DE FORMATION', margin, y);

        y += 8;
        const synthese = rapport.synthese?.contenu || '';

        // Split text into lines for proper wrapping
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const textLines = doc.splitTextToSize(synthese, pageWidth - 2 * margin);

        textLines.forEach((line: string) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, margin, y);
          y += 5;
        });

        y += 10;
      }

      // Signatures
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('SIGNATURES', margin, y);

      y += 5;
      const formatDate = (date: string | null) => {
        if (!date) return 'Non signé';
        return `Signé le ${new Date(date).toLocaleDateString('fr-FR')}`;
      };

      autoTable(doc, {
        startY: y,
        head: [['Tuteur 1', 'Tuteur 2', 'Stagiaire']],
        body: [[
          `${rapport.tuteur1_prenom || ''} ${rapport.tuteur1_nom || ''}\n\n${formatDate(rapport.signature_tuteur1_date)}`,
          `${rapport.tuteur2_prenom || ''} ${rapport.tuteur2_nom || ''}\n\n${formatDate(rapport.signature_tuteur2_date)}`,
          `${rapport.stagiaire_prenom || ''} ${rapport.stagiaire_nom || ''}\n\n${formatDate(rapport.signature_stagiaire_date)}`,
        ]],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 5, halign: 'center' },
        headStyles: { fillColor: [66, 139, 202], fontStyle: 'bold' },
        margin: { left: margin, right: margin },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Page ${i}/${pageCount} - Référentiel : BO n°30 du 25 juillet 2013`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save
      const fileName = `Rapport_${type}_${rapport.stagiaire_nom || 'stagiaire'}_${rapport.annee_scolaire || '2025-2026'}.pdf`;
      doc.save(fileName);

      toast.success('PDF généré avec succès');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return { generatePDF, isGenerating };
}
