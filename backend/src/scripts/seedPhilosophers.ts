import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { Philosopher } from '../models/Philosopher';
import { philosophersData } from '../data/philosophers';

// Load environment variables
dotenv.config();

async function seedPhilosophers() {
  try {
    console.log('🌱 Starting philosopher seeding...');
    
    // Connect to database
    await connectDatabase();
    
    // Clear existing philosophers
    await Philosopher.deleteMany({});
    console.log('🗑️  Cleared existing philosophers');
    
    // Insert new philosophers
    const philosophers = await Philosopher.insertMany(philosophersData);
    console.log(`✅ Inserted ${philosophers.length} philosophers`);
    
    // Log inserted philosophers
    philosophers.forEach(philosopher => {
      console.log(`   - ${philosopher.name} (${philosopher.era})`);
    });
    
    console.log('🎉 Philosopher seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding philosophers:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

// Run the seeder
if (require.main === module) {
  seedPhilosophers();
}

export { seedPhilosophers };