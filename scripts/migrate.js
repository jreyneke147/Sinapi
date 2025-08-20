import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Please connect to Supabase first.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running database migration...');
    
    // Read the migration file
    const migrationPath = join(__dirname, '../supabase/migrations/create_resources_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    
    console.log('Migration completed successfully!');
    
    // Insert sample data
    console.log('Inserting sample data...');
    const { error: insertError } = await supabase
      .from('resources')
      .insert([
        {
          title: 'User Manual - Model X100',
          description: 'Complete user guide for the X100 medical device',
          category: 'Medical Devices',
          type: 'manual',
          file_url: 'https://example.com/manual-x100.pdf',
          file_name: 'manual-x100.pdf'
        },
        {
          title: 'Product Brochure - X100 Series',
          description: 'Overview of the X100 series features and specifications',
          category: 'Medical Devices',
          type: 'brochure',
          file_url: 'https://example.com/brochure-x100.pdf',
          file_name: 'brochure-x100.pdf'
        }
      ]);
    
    if (insertError) {
      console.error('Sample data insertion failed:', insertError);
    } else {
      console.log('Sample data inserted successfully!');
    }
    
  } catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
  }
}

runMigration();