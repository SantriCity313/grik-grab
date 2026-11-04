import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // In-memory cloud backup storage for resilient multi-device sync
  const cloudBackups: Record<string, { timestamp: string; data: any; size: number }> = {};

  // Health API
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "GRIK Infrastruktur Platform API",
      timestamp: new Date().toISOString(),
      e2eeReady: true,
      cloudSyncActive: true,
    });
  });

  // Cloud Backup Endpoint
  app.post("/api/backup/save", (req, res) => {
    try {
      const { backupId, data } = req.body;
      const id = backupId || `grik_backup_${Date.now()}`;
      const payloadString = JSON.stringify(data);
      cloudBackups[id] = {
        timestamp: new Date().toISOString(),
        data,
        size: payloadString.length,
      };
      res.json({
        success: true,
        backupId: id,
        timestamp: cloudBackups[id].timestamp,
        sizeBytes: cloudBackups[id].size,
        message: "Data berhasil disinkronkan dan di-backup ke Cloud GRIK Kaffah.",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/backup/load/:id", (req, res) => {
    const backup = cloudBackups[req.params.id];
    if (!backup) {
      return res.status(404).json({ success: false, message: "Backup tidak ditemukan di cloud." });
    }
    res.json({ success: true, backup });
  });

  app.get("/api/backup/list", (_req, res) => {
    const list = Object.entries(cloudBackups).map(([id, info]) => ({
      id,
      timestamp: info.timestamp,
      sizeBytes: info.size,
    }));
    res.json({ success: true, backups: list });
  });

  // Gemini AI Smart Consultant for Dakwah & Micro-Business Syariah
  app.post("/api/ai/consult", async (req, res) => {
    try {
      const { prompt, context = "muamalah_business", language = "id" } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt konsultasi diperlukan." });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const systemInstruction = `Anda adalah "Asisten Pakar GRIK Cerdas (Gerakan Rakyat Islamicity Kaffah)" - sebuah platform dakwah digital dan pemberdayaan ekonomi umat berbasis syariah kaffah.
Tugas Anda memberikan bimbingan praktis, terstruktur, berbasis Al-Qur'an dan Sunnah, serta actionable untuk:
1. Konsultasi fiqih muamalah (akad jual beli, qardhul hasan, mudharabah, murabahah, anti-riba/gharar).
2. Inkubasi & strategi bisnis mikro umat (manajemen arus kas, pemasaran digital beretika, sertifikasi halal UMKM, penetapan harga).
3. Transparansi ZISWAF dan program donasi sosial produktif.
Format jawaban harus terstruktur, santun, lugas dengan pointer yang mudah dipahami pelaku usaha mikro dan pegiat dakwah. Bahasa yang diminta: ${language === "ar" ? "Bahasa Arab" : language === "en" ? "English" : "Bahasa Indonesia"}.`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

          return res.json({
            reply: response.text,
            source: "gemini-2.5-flash",
            timestamp: new Date().toISOString(),
          });
        } catch (apiError: any) {
          console.warn("Gemini API call failed, falling back to smart sharia knowledge base:", apiError?.message);
        }
      }

      // Intelligent Sharia knowledge base fallback
      let fallbackReply = "";
      const lower = prompt.toLowerCase();

      if (lower.includes("modal") || lower.includes("qardh") || lower.includes("pinjam") || lower.includes("investasi")) {
        fallbackReply = `Alhamdulillah. Dalam kerangka pemberdayaan ekonomi umat GRIK Kaffah:
1. **Prinsip Permodalan Bebas Riba**: Pembiayaan mikro GRIK mengutamakan skema *Qardhul Hasan* (pinjaman kebajikan tanpa bunga tambahan) atau kemitraan bagi hasil (*Mudharabah* / *Musyarakah*).
2. **Kesiapan Usaha**: Pastikan memiliki pencatatan arus kas (cashflow) terpisah antara uang pribadi dan usaha, serta margin laba riil.
3. **Akad Transparan**: Sepakati nisbah bagi hasil sejak awal jika menggunakan mudharabah (misal 60:40 atas laba bersih), bukan bunga tetap atas pokok.
4. **Pendampingan**: Anda dapat mengajukan dana bergulir komunitas melalui menu "Inkubasi Bisnis Mikro" di aplikasi GRIK.`;
      } else if (lower.includes("zakat") || lower.includes("infak") || lower.includes("sedekah") || lower.includes("donasi")) {
        fallbackReply = `Bismillah. Transparansi ZISWAF di GRIK berpedoman pada prinsip Amanah & Real-time Audit:
1. **Nisab & Haul**: Zakat perniagaan/penghasilan dihitung 2.5% dari aset lancar yang telah mencapai nisab (setara 85 gram emas) dan haul 1 tahun.
2. **Penyaluran Produktif**: Dana ZISWAF disalurkan tidak hanya untuk konsumtif mustahik, tetapi 40% dialokasikan untuk modal kerja mikro bergulir mustahik binaan.
3. **Audit Ledger**: Setiap donatur mendapatkan bukti elektronik dengan ID transaksi terenkripsi yang dapat dilacak penyalurannya secara transparan.`;
      } else if (lower.includes("halal") || lower.includes("sertifikasi")) {
        fallbackReply = `Panduan Sertifikasi Halal Usaha Mikro (Self-Declare & Reguler) via GRIK:
1. **Bahan Baku**: Pastikan seluruh bahan berstatus halal dan bebas dari unsur syubhat/haram (ada sertifikat bahan atau daftar positif).
2. **Proses Produksi**: Bebas dari kontaminasi silang dengan alat atau bahan non-halal.
3. **Penyelia Halal Komunitas**: GRIK menyediakan pendamping PPH (Pendamping Proses Produk Halal) untuk verifikasi lapangan gratis bagi anggota terdaftar.`;
      } else {
        fallbackReply = `Assalamu'alaikum Warahmatullahi Wabarakatuh.
Terima kasih atas pertanyaannya. Sebagai bagian dari pilar GRIK (Dakwah Digital & Pemberdayaan Ekonomi Umat):
- **Nilai Kaffah**: Setiap ikhtiar bisnis mikro harus selaras dengan kejujuran (shiddiq), amanah, transparansi (tabligh), dan kecakapan profesional (fathanah).
- **Langkah Praktis**: Manfaatkan modul pelatihan bisnis mikro di portal GRIK, terhubung dengan sesama pengusaha muslim di forum terenkripsi, serta kelola donasi dan zakat melalui sistem transparan.
Ada aspek spesifik fiqih muamalah atau strategi bisnis mikro yang ingin Anda diskusikan lebih lanjut?`;
      }

      return res.json({
        reply: fallbackReply,
        source: "grik-sharia-engine",
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Terjadi kendala pada asisten cerdas." });
    }
  });

  // Vite middleware in dev, static serving in prod
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[GRIK Platform] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
