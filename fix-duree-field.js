// Script pour corriger le champ durée dans Supabase
import { supabase } from './src/integrations/supabase/client.js';

async function fixDureeField() {
  console.log('🔧 Correction du champ durée en cours...');
  
  try {
    // Exécuter la requête SQL pour changer le type de colonne
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Change duree from INTEGER to NUMERIC(4,2)
        ALTER TABLE public.seances 
        ALTER COLUMN duree TYPE NUMERIC(4,2);
        
        -- Add comment
        COMMENT ON COLUMN public.seances.duree IS 'Duration in hours, supports decimal values (e.g., 1.5 for 1 hour 30 minutes)';
      `
    });

    if (error) {
      console.error('❌ Erreur:', error);
      
      // Essayons une approche différente avec une fonction SQL personnalisée
      console.log('🔄 Tentative avec une approche alternative...');
      
      const { data: result, error: altError } = await supabase
        .from('seances')
        .select('id, duree')
        .limit(1);
        
      if (altError) {
        console.error('❌ Impossible de se connecter à la base:', altError);
      } else {
        console.log('✅ Connexion à la base OK');
        console.log('📋 Pour corriger le problème, exécutez cette requête SQL dans l\'éditeur Supabase:');
        console.log(`
ALTER TABLE public.seances 
ALTER COLUMN duree TYPE NUMERIC(4,2);

COMMENT ON COLUMN public.seances.duree IS 'Duration in hours, supports decimal values';
        `);
      }
    } else {
      console.log('✅ Champ durée corrigé avec succès !');
    }
    
  } catch (err) {
    console.error('❌ Erreur lors de l\'exécution:', err);
    console.log('📋 Exécutez manuellement cette requête dans Supabase SQL Editor:');
    console.log(`
ALTER TABLE public.seances 
ALTER COLUMN duree TYPE NUMERIC(4,2);
    `);
  }
}

fixDureeField();
