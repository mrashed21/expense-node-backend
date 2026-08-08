import mongoose from "mongoose";
import os from "os";
import { Server } from "socket.io";
import app from "./app";
import { envConfig } from "./config/env-config";
import { initRecurringCron } from "./modules/recurring/recurring.cron";
import { initReminderCron } from "./modules/reminder/reminder.cron";

const banner = (port: number | string) => {
  const url = `http://localhost:${port}`;
  const mode = envConfig.env;
  const started = new Date().toLocaleTimeString();

  const INNER = 52;

  const row = (label: string, value: string) => {
    const content = `${label}${value}`;
    const pad = " ".repeat(Math.max(0, INNER - content.length));
    return `║  ${content}${pad}║`;
  };

  const lines = [
    ``,
    `╔══════════════════════════════════════════════════════╗`,
    `║          EXPENSE TRACKER BACKEND SERVER              ║`,
    `╠══════════════════════════════════════════════════════╣`,
    row(" Status   : ", "Online"),
    row(" URL      : ", url),
    row(" Mode     : ", mode),
    row(" Started  : ", started),
    `╚══════════════════════════════════════════════════════╝`,
    ``,
  ];

  console.log(lines.join("\n"));
};

const divider = (char = "─", length = 55) =>
  console.log("  " + char.repeat(length));

export const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅  ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`),
  error: (msg: string) => console.error(`❌  ${msg}`),
  event: (msg: string) => console.log(`⚡  ${msg}`),
};

async function main() {
  try {
    if (!envConfig.database_url) {
      throw new Error("DATABASE_URL environment variable is missing.");
    }

    log.info("Connecting to MongoDB Atlas...");
    await mongoose.connect(envConfig.database_url, {
      maxPoolSize: 50,
      minPoolSize: 10,
    });
    log.success("Successfully connected to MongoDB database.");

    // Sync indexes to clean up obsolete ones (e.g. duplicate or renamed schema indexes)
    try {
      const { Category } = await import("./modules/category/category.model.js");
      await Category.syncIndexes();
      const { Admin } = await import("./modules/admin/admin.model.js");
      await Admin.syncIndexes();
      log.success("Successfully synced database indexes.");
    } catch (err) {
      log.warn("Failed to sync indexes: " + err);
    }

    // Seed Super Admin
    const { seedSuperAdmin } = await import("./utils/seed-super-admin.js");
    await seedSuperAdmin();

    // Initialize Background Workers
    initRecurringCron();
    // Reminder cron requires 'io' which is initialized later.

    const server = app.listen(envConfig.port, () => {
      banner(envConfig.port);
      divider();
      log.success("Server started successfully");
      log.event(`Listening on port ${envConfig.port}`);
      log.info(`Environment : ${envConfig.env}`);
      log.info(`Base URL    : http://localhost:${envConfig.port}/api/v1`);
      log.info(`Server Health: http://localhost:${envConfig.port}/health`);
      divider();
      console.log("");
    });

    const io = new Server(server, {
      cors: {
        origin: [envConfig.frontend_url, "http://localhost:3000"],
        credentials: true,
      },
    });

    app.set("io", io);

    // Initialize reminder cron with socket io instance
    initReminderCron(io);

    io.on("connection", (socket) => {
      const userId = socket.handshake.auth?.userId as string | undefined;

      if (userId) {
        // Place the client in their private room for targeted notifications
        socket.join(userId);
        log.event(`Socket ${socket.id} joined room: ${userId}`);

        // If user is an admin, join the admin_room for system health updates
        import("./modules/admin/admin.model.js").then(({ Admin }) => {
          Admin.exists({ _id: userId }).then((isAdmin) => {
            if (isAdmin) {
              socket.join("admin_room");
              log.event(`Socket ${socket.id} joined admin_room`);
            }
          }).catch(() => {}); // Ignore invalid ID casts
        });
      } else {
        console.warn(`[Socket] Client connected without userId: ${socket.id}`);
      }

      socket.on("disconnect", () => {
        log.event(`Socket disconnected: ${socket.id}`);
      });
    });

    // Real-time system health emitter (admin panel)
    setInterval(() => {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memUsagePercent = (usedMem / totalMem) * 100;
      const loadAvg = os.loadavg();
      const cpuUsagePercent = (loadAvg[0] / os.cpus().length) * 100;

      const systemHealth = {
        time: new Date().toISOString(),
        memoryUsage: memUsagePercent.toFixed(2),
        cpuUsage: cpuUsagePercent.toFixed(2),
        uptime: os.uptime(),
      };

      io.to("admin_room").emit("system_health_update", systemHealth);
    }, 2000);

    const exitHandler = () => {
      if (server) {
        server.close(() => {
          log.info("Server closed.");
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    };

    const unexpectedErrorHandler = (error: unknown) => {
      log.error(`Unhandled Error: ${error}`);
      exitHandler();
    };

    process.on("uncaughtException", unexpectedErrorHandler);
    process.on("unhandledRejection", unexpectedErrorHandler);

    process.on("SIGTERM", () => {
      console.log("SIGTERM received");
      if (server) {
        server.close();
      }
    });
  } catch (error) {
    divider("═");
    log.error("Failed to start server!");
    log.error(`Reason: ${(error as Error).message}`);
    divider("═");
    process.exit(1);
  }
}

main();
