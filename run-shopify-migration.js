import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
  console.log('Required variables:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Reading migration file...');
    const migrationSql = readFileSync(join(__dirname, 'shopify-products-migration.sql'), 'utf8');
    
    console.log('Running Shopify products migration...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSql
    });
    
    if (error) {
      console.error('Migration failed:', error);
      
      // Try alternative method using direct query
      console.log('Trying alternative migration method...');
      const { error: altError } = await supabase
        .from('information_schema.tables')
        .select('*')
        .limit(1);
      
      if (!altError) {
        // Split SQL into individual statements and execute them
        const statements = migrationSql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);
        
        for (const statement of statements) {
          if (statement.includes('--') && !statement.includes('CREATE') && !statement.includes('DROP')) {
            continue; // Skip comment-only lines
          }
          
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          const { error: stmtError } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          });
          
          if (stmtError) {
            console.warn(`Statement failed (this might be expected):`, stmtError.message);
          }
        }
      }
    } else {
      console.log('Migration completed successfully!');
      console.log('Data:', data);
    }
    
    // Verify the table was created
    console.log('Verifying table creation...');
    const { data: tableData, error: tableError } = await supabase
      .from('shopify_products')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Table verification failed:', tableError);
      console.log('\nYou may need to run the migration manually in your Supabase SQL editor.');
      console.log('Copy the contents of shopify-products-migration.sql and run it directly.');
    } else {
      console.log('✅ Table created successfully! You can now import your CSV.');
      console.log('Go to your Supabase dashboard > Table Editor > shopify_products > Import data');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    console.log('\n📋 Manual Migration Instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of shopify-products-migration.sql');
    console.log('4. Run the SQL');
    console.log('5. Then go to Table Editor > shopify_products > Import data');
  }
}

runMigration();