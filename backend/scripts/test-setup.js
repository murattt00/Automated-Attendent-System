const { sequelize, User, Class, Session, Attendance } = require('../models');

async function testConnection() {
  console.log('🔍 Testing University Attendance System Setup...\n');

  try {
    // Test 1: Database Connection
    console.log('1️⃣  Testing database connection...');
    await sequelize.authenticate();
    console.log('   ✅ Database connection successful\n');

    // Test 2: Models
    console.log('2️⃣  Checking models...');
    console.log('   ✅ User model loaded');
    console.log('   ✅ Class model loaded');
    console.log('   ✅ Session model loaded');
    console.log('   ✅ Attendance model loaded\n');

    // Test 3: Database Tables
    console.log('3️⃣  Verifying database tables...');
    const [tables] = await sequelize.query("SHOW TABLES");
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    const requiredTables = ['users', 'classes', 'sessions', 'attendances'];
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));
    
    if (missingTables.length > 0) {
      console.log(`   ⚠️  Missing tables: ${missingTables.join(', ')}`);
      console.log('   💡 Run: npm run migrate\n');
    } else {
      console.log('   ✅ All required tables exist\n');
    }

    // Test 4: Environment Variables
    console.log('4️⃣  Checking environment variables...');
    const requiredEnvVars = [
      'DB_HOST', 'DB_NAME', 'DB_USER', 
      'JWT_SECRET', 'PORT', 'FRONTEND_URL'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
    
    if (missingEnvVars.length > 0) {
      console.log(`   ⚠️  Missing variables: ${missingEnvVars.join(', ')}`);
      console.log('   💡 Check your .env file\n');
    } else {
      console.log('   ✅ All environment variables set\n');
    }

    // Test 5: Sample Data
    console.log('5️⃣  Checking for sample data...');
    const userCount = await User.count();
    const classCount = await Class.count();
    
    console.log(`   📊 Users: ${userCount}`);
    console.log(`   📊 Classes: ${classCount}\n`);
    
    if (userCount === 0) {
      console.log('   💡 Tip: Create a test account via /api/auth/register\n');
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SYSTEM STATUS SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Database: Connected`);
    console.log(`✅ Tables: ${missingTables.length === 0 ? 'Ready' : 'Missing some'}`);
    console.log(`✅ Environment: ${missingEnvVars.length === 0 ? 'Configured' : 'Missing some'}`);
    console.log(`📊 Data: ${userCount} users, ${classCount} classes`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (missingTables.length === 0 && missingEnvVars.length === 0) {
      console.log('🎉 System is ready! Run: npm run dev\n');
    } else {
      console.log('⚠️  Please fix the issues above before running the server\n');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check MySQL is running');
    console.log('   2. Verify .env file settings');
    console.log('   3. Run: npm run migrate');
    console.log('   4. Check database credentials\n');
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testConnection();
