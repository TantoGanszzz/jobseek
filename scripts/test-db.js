const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName) {
  const { data, error } = await supabase.from(tableName).select('*').limit(1);
  if (error) {
    console.error(`[ERROR] Table ${tableName}:`, error.message, error.code);
  } else {
    console.log(`[SUCCESS] Table ${tableName} exists.`);
  }
}

async function main() {
  console.log("Testing Supabase connection to:", supabaseUrl);
  await checkTable('profiles');
  await checkTable('companies');
  await checkTable('jobs');
  await checkTable('applications');
  await checkTable('saved_jobs');
  
  // also check the others to be safe
  await checkTable('portfolio_projects');
  await checkTable('courses');
  await checkTable('learning_progress');
  await checkTable('activities');
}

main();
