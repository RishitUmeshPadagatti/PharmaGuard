import "express-session";

declare module "express-session" {
  interface SessionData {
    patient_id?: string;
  }
}
