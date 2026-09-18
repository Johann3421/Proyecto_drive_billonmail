# Cambio: Creación de 3 plantillas HTML de diseño frontend anti-IA

- **Fecha:** 2026-09-18
- **Tipo:** Feature / UX Design / Prototipo
- **Estado:** En Progreso
- **Contexto / Objetivo:** Definir la interfaz de usuario para los dos módulos críticos:
  1. Transferencia de archivos grandes (>10MB) para evitar límite SMTP de BillonMail.
  2. Alojador de imágenes y GIFs para Footers/Firmas (estilo Postimages interno corporativo) con generación de enlaces directos, código HTML y Markdown para insertar en clientes de correo sin adjuntar peso.
- **Opción Elegida:** Plantilla 1 (Swiss Transfer).

---

## Decisiones de Arquitectura y Requerimientos
1. **Módulo Footers / Firmas (Clarificación):** Los usuarios ya diseñan sus firmas o banners en imágenes/GIFs animados. Necesitan un servidor de alojamiento corporativo donde suban el `.gif`/`.png` y obtengan:
   - Enlace directo a la imagen (`https://.../firma.gif`).
   - Código HTML para correos (`<img src="...">`).
   - Código HTML con enlace.
   - Código Markdown / BBCode.
   - Previsualización en vivo y copia en 1 clic.
2. **Estética Anti-IA:** Paleta Slate/Zinc sobria, sin gradientes cliché, feedback instantáneo "¡Copiado!".

---

## Próximos Pasos
- Selección por parte del usuario de la plantilla preferida.
- Inicialización del proyecto Vite + React/Vue y backend Node.js en base al diseño aprobado.
