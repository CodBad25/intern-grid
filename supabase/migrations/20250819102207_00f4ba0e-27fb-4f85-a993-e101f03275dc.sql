-- Recréer les données pour le compte de Mohamed Belhaj
INSERT INTO public.seances (tuteur_id, date, duree, type, horaire_mode, heure, creneau, notes, shared_with_peers)
VALUES
  ('e194d19e-c673-4f41-baca-162d39284b7e', current_date - 7, 2, 'formation', 'ordinaire', '09:00', NULL, 'Session de formation sur la sécurité informatique avec les stagiaires.', true),
  ('e194d19e-c673-4f41-baca-162d39284b7e', current_date - 3, 1, 'visite', 'ordinaire', '14:00', NULL, 'Visite de suivi pour évaluer les progrès.', true),
  ('e194d19e-c673-4f41-baca-162d39284b7e', current_date - 1, 3, 'evaluation', 'ordinaire', '10:00', NULL, 'Évaluation hebdomadaire des compétences acquises.', true),
  ('e194d19e-c673-4f41-baca-162d39284b7e', current_date, 2, 'suivi', 'ordinaire', '16:00', NULL, 'Suivi individuel pour ajustements.', true);

-- Recréer les documents pour Mohamed Belhaj
INSERT INTO public.documents (tuteur_id, titre, type, url, description, shared_with_peers)
VALUES
  ('e194d19e-c673-4f41-baca-162d39284b7e', 'Guide de bonnes pratiques', 'document', NULL, 'Procédures standard et bonnes pratiques pour les stagiaires.', true),
  ('e194d19e-c673-4f41-baca-162d39284b7e', 'Ressource Supabase', 'lien', 'https://supabase.com/docs', 'Documentation officielle Supabase pour le développement.', true),
  ('e194d19e-c673-4f41-baca-162d39284b7e', 'Formation Sécurité', 'document', NULL, 'Module de formation sur la sécurité des applications.', true);

-- Recréer les commentaires pour Mohamed Belhaj
INSERT INTO public.commentaires (tuteur_id, type, content)
VALUES
  ('e194d19e-c673-4f41-baca-162d39284b7e', 'remarque', 'Très bon progrès constaté cette semaine sur les compétences techniques.'),
  ('e194d19e-c673-4f41-baca-162d39284b7e', 'question', 'Comment peut-on mieux intégrer les stagiaires dans les projets en cours ?'),
  ('e194d19e-c673-4f41-baca-162d39284b7e', 'remarque', 'Les stagiaires montrent une bonne adaptation aux outils de développement.');

-- Ajouter quelques réponses aux commentaires
INSERT INTO public.reponses (tuteur_id, commentaire_id, content, shared_with_peers)
SELECT 
  'e194d19e-c673-4f41-baca-162d39284b7e',
  c.id,
  CASE c.type
    WHEN 'question' THEN 'Une approche progressive avec mentorat personnalisé pourrait être efficace.'
    ELSE 'Merci pour ce retour positif.'
  END,
  true
FROM public.commentaires c 
WHERE c.tuteur_id = 'e194d19e-c673-4f41-baca-162d39284b7e' AND c.type = 'question';