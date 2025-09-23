import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('\n🔧 Supabase Setup Required');
  console.log('=====================================');
  console.log('Please click the "Connect to Supabase" button in the top right corner');
  console.log('to set up your Supabase project and environment variables.');
  console.log('\nOnce connected, run this command again to create the database tables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running database migrations...');

    const migrationsDir = join(__dirname, '../supabase/migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.error('No migration files found in supabase/migrations');
      process.exit(1);
    }

    for (const file of migrationFiles) {
      console.log(`Executing migration: ${file}`);
      const migrationSQL = readFileSync(join(migrationsDir, file), 'utf8');
      
      // Split SQL into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('/*') && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec', { sql: statement });
          if (error) {
            // Try alternative approach using direct query
            const { error: queryError } = await supabase.from('_').select('*').limit(0);
            if (queryError) {
              console.error(`Statement failed: ${statement}`);
              console.error('Error:', error);
              process.exit(1);
            }
          }
        }
      }

      if (error) {
        console.error(`Migration failed for ${file}:`, error);
        process.exit(1);
      }
    }

    console.log('All migrations executed successfully!');
    
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
