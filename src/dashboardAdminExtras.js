// dashboardAdminExtras.js
export async function syncOwnerToWorker(ownerStatus) {
  try {
    const res = await fetch("https://YOUR_WORKER_URL/api/owners", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ownerStatus),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Worker responded with ${res.status}: ${text}`);
    }

    console.log("✅ Owner synced to Worker:", ownerStatus.ownerId);
  } catch (err) {
    console.error("❌ Failed to sync Owner:", err);
  }
}