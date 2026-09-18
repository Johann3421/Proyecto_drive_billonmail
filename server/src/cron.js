import cron from 'node-cron';
import path from 'path';
import { config } from './config.js';
import { db } from './db.js';
import { deleteFileSafe } from './storage.js';

export function startCleanupCron() {
  // Ejecuta cada hora en el minuto 0 ('0 * * * *')
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🧹 [Cron] Iniciando revisión de archivos temporales caducados...');
      const expiredList = await db.getExpiredTransfers();
      
      if (expiredList.length === 0) {
        console.log('✓ [Cron] No hay archivos caducados para eliminar.');
        return;
      }

      let deletedCount = 0;
      for (const item of expiredList) {
        const filePath = path.join(config.paths.uploadsFiles, item.stored_name);
        deleteFileSafe(filePath);
        await db.deleteTransfer(item.id);
        deletedCount++;
      }

      console.log(`✓ [Cron] Se eliminaron ${deletedCount} archivos expirados correctamente.`);
    } catch (err) {
      console.error('❌ [Cron] Error en la tarea de limpieza:', err);
    }
  });

  console.log('✓ Tarea programada de limpieza TTL activa (cada hora).');
}
