import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/manoscreadoras';
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'superadmin@manoscreadoras.com';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin2024!';
const SUPERADMIN_NAME = process.env.SUPERADMIN_NAME || 'Super Administrador';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  documentType: String,
  documentNumber: String,
  mustChangePassword: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

async function seed() {
  console.log('Conectando a MongoDB...');
  await mongoose.connect(MONGO_URI);

  const User = mongoose.model('User', UserSchema);

  // Eliminar superadmins existentes
  const deleted = await User.deleteMany({ role: 'superadmin' });
  console.log(`Superadmins eliminados: ${deleted.deletedCount}`);

  // Crear nuevo superadmin
  const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);
  const superadmin = await User.create({
    name: SUPERADMIN_NAME,
    email: SUPERADMIN_EMAIL,
    password: hashedPassword,
    role: 'superadmin',
    mustChangePassword: false,
    isActive: true,
  });

  console.log('\n=== SuperAdmin creado exitosamente ===');
  console.log(`Nombre: ${SUPERADMIN_NAME}`);
  console.log(`Email:  ${SUPERADMIN_EMAIL}`);
  console.log(`Password: ${SUPERADMIN_PASSWORD}`);
  console.log(`ID: ${superadmin._id}`);
  console.log('=====================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error al crear superadmin:', err);
  process.exit(1);
});
